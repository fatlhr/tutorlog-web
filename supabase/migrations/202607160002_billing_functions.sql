alter table public.user_entitlements
  drop constraint user_entitlements_source_check;

alter table public.user_entitlements
  add constraint user_entitlements_source_check
  check (source in ('voucher', 'manual', 'billing', 'legacy_verified'));

create function public.billing_access_status_for_user(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_grant public.billing_entitlement_grants%rowtype;
  v_legacy public.user_entitlements%rowtype;
  v_usage public.user_feature_usage%rowtype;
  v_recap_usage record;
  v_state text := 'free';
  v_plan text := 'free';
  v_entitlement_type text;
  v_is_lifetime boolean := false;
  v_active_from timestamptz;
  v_active_until timestamptz;
  v_pdf_count integer := 0;
  v_csv_count integer := 0;
begin
  if p_user_id is null then
    return jsonb_build_object(
      'state', 'free',
      'plan', 'free',
      'entitlement_type', null,
      'is_lifetime', false,
      'active_from', null,
      'active_until', null,
      'pdf_export_count', 0,
      'first_pdf_exported_at', null,
      'pdf_export_count_30d', 0,
      'csv_export_count_30d', 0,
      'export_window_days', 30,
      'student_limit', 3,
      'history_days', 30,
      'recap_days', 90,
      'pdf_export_free_limit', 1,
      'pdf_export_unlimited', false,
      'rekap_export_limit', 1,
      'rekap_export_unlimited', false,
      'rekap_pdf_export_count', 0,
      'rekap_csv_export_count', 0
    );
  end if;

  select *
  into v_legacy
  from public.user_entitlements
  where user_id = p_user_id;

  select *
  into v_grant
  from public.billing_entitlement_grants
  where user_id = p_user_id
    and entitlement_type = 'lifetime'
  order by active_from desc, granted_at desc
  limit 1;

  if found then
    v_entitlement_type := 'lifetime';
    v_is_lifetime := true;
    v_active_from := v_grant.active_from;
    v_active_until := null;
  elsif v_legacy.id is not null
    and v_legacy.plan = 'full_access'
    and v_legacy.active_until is null
  then
    -- The verified legacy contract explicitly defines null as unlimited.
    v_entitlement_type := 'lifetime';
    v_is_lifetime := true;
    v_active_from := v_legacy.created_at;
    v_active_until := null;
  else
    select *
    into v_grant
    from public.billing_entitlement_grants
    where user_id = p_user_id
      and entitlement_type = 'term'
    order by active_until desc, granted_at desc
    limit 1;

    if found then
      v_entitlement_type := 'term';
      v_active_from := v_grant.active_from;
      v_active_until := v_grant.active_until;
    end if;

    if v_legacy.id is not null
      and v_legacy.plan = 'full_access'
      and v_legacy.active_until is not null
      and (v_active_until is null or v_legacy.active_until > v_active_until)
    then
      v_entitlement_type := 'term';
      v_active_from := v_legacy.created_at;
      v_active_until := v_legacy.active_until;
    end if;
  end if;

  if v_entitlement_type = 'lifetime' then
    v_state := 'plus_active';
    v_plan := 'full_access';
  elsif v_entitlement_type = 'term' and v_active_until > now() then
    v_state := 'plus_active';
    v_plan := 'full_access';
  elsif v_entitlement_type = 'term' then
    v_state := 'plus_expired';
    v_plan := 'expired';
  end if;

  select *
  into v_usage
  from public.user_feature_usage
  where user_id = p_user_id;

  select *
  into v_recap_usage
  from public.recap_export_usage_30d(p_user_id);

  v_pdf_count := coalesce(v_recap_usage.pdf_export_count_30d, 0);
  v_csv_count := coalesce(v_recap_usage.csv_export_count_30d, 0);

  return jsonb_build_object(
    'state', v_state,
    'plan', v_plan,
    'entitlement_type', v_entitlement_type,
    'is_lifetime', v_is_lifetime,
    'active_from', v_active_from,
    'active_until', v_active_until,
    'pdf_export_count', coalesce(v_usage.pdf_export_count, 0),
    'first_pdf_exported_at', v_usage.first_pdf_exported_at,
    'pdf_export_count_30d', v_pdf_count,
    'csv_export_count_30d', v_csv_count,
    'export_window_days', 30,
    'student_limit', case when v_state = 'plus_active' then null else 3 end,
    'history_days', case when v_state = 'plus_active' then null else 30 end,
    'recap_days', case when v_state = 'plus_active' then null else 90 end,
    'pdf_export_free_limit', 1,
    'pdf_export_unlimited', v_state = 'plus_active',
    'rekap_export_limit', 1,
    'rekap_export_unlimited', v_state = 'plus_active',
    'rekap_pdf_export_count', v_pdf_count,
    'rekap_csv_export_count', v_csv_count
  );
end;
$$;

create function public.get_billing_access_status()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  return public.billing_access_status_for_user(auth.uid());
end;
$$;

create function public.apply_billing_paid_event(
  p_payment_id uuid,
  p_paid_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.billing_payments%rowtype;
  v_purchase public.billing_purchases%rowtype;
  v_legacy public.user_entitlements%rowtype;
  v_entitlement_type text;
  v_active_from timestamptz;
  v_active_until timestamptz;
  v_current_active_until timestamptz;
  v_has_billing_lifetime boolean := false;
  v_has_legacy_unlimited boolean := false;
  v_grant_id uuid;
begin
  if p_paid_at is null then
    raise exception 'Paid timestamp is required';
  end if;

  select *
  into v_payment
  from public.billing_payments
  where id = p_payment_id
  for update;

  if not found then
    raise exception 'Billing payment not found';
  end if;

  select *
  into v_purchase
  from public.billing_purchases
  where id = v_payment.purchase_id
    and user_id = v_payment.user_id
  for update;

  if not found then
    raise exception 'Billing purchase not found';
  end if;

  if v_payment.provider_reported_amount is null
    or v_payment.provider_reported_amount <> v_payment.total_amount
    or v_payment.provider_reported_amount <> v_purchase.total_amount_snapshot
    or v_payment.total_amount <> v_purchase.total_amount_snapshot
  then
    raise exception 'Billing payment amount does not match purchase snapshot';
  end if;

  if v_payment.state = 'refunded' then
    raise exception 'A refunded billing payment cannot become paid';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('billing-entitlement:' || v_payment.user_id::text, 0));

  if v_payment.state = 'paid' then
    return public.billing_access_status_for_user(v_payment.user_id);
  end if;

  if v_payment.state not in ('pending', 'superseded') then
    raise exception 'Billing payment cannot transition to paid from %', v_payment.state;
  end if;

  update public.billing_payments
  set state = 'paid',
      paid_at = coalesce(paid_at, p_paid_at),
      updated_at = now()
  where id = v_payment.id
    and state <> 'refunded';

  select *
  into v_legacy
  from public.user_entitlements
  where user_id = v_payment.user_id
  for update;

  v_has_legacy_unlimited := v_legacy.id is not null
    and v_legacy.plan = 'full_access'
    and v_legacy.active_until is null;

  select max(active_until)
  into v_current_active_until
  from public.billing_entitlement_grants
  where user_id = v_payment.user_id
    and entitlement_type = 'term';

  if v_legacy.id is not null
    and v_legacy.plan = 'full_access'
    and v_legacy.active_until is not null
    and (v_current_active_until is null or v_legacy.active_until > v_current_active_until)
  then
    v_current_active_until := v_legacy.active_until;
  end if;

  v_current_active_until := coalesce(v_current_active_until, p_paid_at);
  v_active_from := greatest(p_paid_at, v_current_active_until);

  case v_purchase.product_code_snapshot
    when 'plus_30d' then
      v_entitlement_type := 'term';
      v_active_until := v_active_from + interval '30 days';
    when 'plus_12m' then
      v_entitlement_type := 'term';
      v_active_until := v_active_from + interval '12 months';
    when 'plus_lifetime' then
      v_entitlement_type := 'lifetime';
      v_active_from := p_paid_at;
      v_active_until := null;
    else
      raise exception 'Purchase product cannot issue Plus access';
  end case;

  insert into public.billing_entitlement_grants (
    purchase_id,
    user_id,
    source,
    evidence_reference,
    product_code,
    entitlement_type,
    active_from,
    active_until
  )
  values (
    v_purchase.id,
    v_purchase.user_id,
    'purchase',
    null,
    v_purchase.product_code_snapshot,
    v_entitlement_type,
    v_active_from,
    v_active_until
  )
  on conflict (purchase_id) do nothing
  returning id into v_grant_id;

  if v_grant_id is null then
    update public.billing_purchases
    set state = 'completed',
        updated_at = now()
    where id = v_purchase.id;

    return public.billing_access_status_for_user(v_payment.user_id);
  end if;

  select exists (
    select 1
    from public.billing_entitlement_grants
    where user_id = v_payment.user_id
      and entitlement_type = 'lifetime'
  )
  into v_has_billing_lifetime;

  if v_has_billing_lifetime then
    insert into public.user_entitlements (
      user_id, plan, source, voucher_id, active_until
    )
    values (
      v_payment.user_id, 'full_access', 'billing', null, null
    )
    on conflict (user_id) do update
    set plan = 'full_access',
        source = 'billing',
        voucher_id = null,
        active_until = null;
  elsif not v_has_legacy_unlimited then
    insert into public.user_entitlements (
      user_id, plan, source, voucher_id, active_until
    )
    values (
      v_payment.user_id, 'full_access', 'billing', null, v_active_until
    )
    on conflict (user_id) do update
    set plan = 'full_access',
        source = 'billing',
        voucher_id = null,
        active_until = greatest(
          excluded.active_until,
          public.user_entitlements.active_until
        );
  end if;

  update public.billing_purchases
  set state = 'completed',
      updated_at = now()
  where id = v_purchase.id;

  return public.billing_access_status_for_user(v_payment.user_id);
end;
$$;

create function public.authorize_feature_export(p_feature text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_access jsonb;
  v_access_state text;
  v_feature_key text;
  v_format text;
  v_used integer := 0;
  v_limit integer;
  v_allowed boolean := false;
  v_reason text;
  v_authorization_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if p_feature not in ('recap_pdf', 'recap_csv', 'invoice_pdf') then
    raise exception 'Export feature is not supported';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('billing-export:' || v_user_id::text || ':' || p_feature, 0));

  v_access := public.billing_access_status_for_user(v_user_id);
  v_access_state := v_access ->> 'state';

  if p_feature in ('recap_pdf', 'recap_csv') then
    v_feature_key := 'recap_export';
    v_format := case when p_feature = 'recap_pdf' then 'pdf' else 'csv' end;
  else
    v_feature_key := 'invoice_export';
    v_format := 'pdf';
  end if;

  select count(*)::integer
  into v_used
  from public.user_feature_usage_events
  where user_id = v_user_id
    and feature_key = v_feature_key
    and event_type = 'success'
    and metadata ->> 'format' = v_format
    and created_at >= now() - interval '30 days';

  if v_access_state = 'plus_active' then
    v_allowed := true;
    v_limit := null;
  elsif p_feature in ('recap_pdf', 'recap_csv') then
    v_limit := 1;
    v_allowed := v_used < v_limit;
    if not v_allowed then
      v_reason := case
        when v_access_state = 'plus_expired' then 'expired'
        else 'free-limit'
      end;
    end if;
  else
    v_limit := null;
    v_allowed := false;
    v_reason := case
      when v_access_state = 'plus_expired' then 'expired'
      else 'invoice-locked'
    end;
  end if;

  if v_allowed then
    insert into public.user_feature_usage_events (
      user_id,
      feature_key,
      event_type,
      metadata
    )
    values (
      v_user_id,
      v_feature_key,
      'success',
      jsonb_build_object('format', v_format)
    )
    returning id into v_authorization_id;

    if v_limit is not null then
      v_used := v_used + 1;
    end if;
  end if;

  return jsonb_build_object(
    'allowed', v_allowed,
    'authorization_id', v_authorization_id,
    'reason', v_reason,
    'used', v_used,
    'limit', v_limit
  );
end;
$$;

create function public.admin_grant_legacy_entitlement(
  p_user_id uuid,
  p_product_code text,
  p_entitlement_type text,
  p_active_from timestamptz,
  p_active_until timestamptz,
  p_evidence_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_legacy public.user_entitlements%rowtype;
  v_has_purchase_lifetime boolean := false;
  v_grant_id uuid;
  v_projection_until timestamptz;
begin
  if p_user_id is null
    or nullif(btrim(p_product_code), '') is null
    or nullif(btrim(p_evidence_reference), '') is null
    or p_active_from is null
  then
    raise exception 'A reviewed user, product, start time, and evidence reference are required';
  end if;

  if p_entitlement_type not in ('term', 'lifetime') then
    raise exception 'Legacy entitlement type is not supported';
  end if;

  if (p_entitlement_type = 'lifetime' and p_active_until is not null)
    or (p_entitlement_type = 'term'
      and (p_active_until is null or p_active_until <= p_active_from))
  then
    raise exception 'Legacy entitlement dates are invalid';
  end if;

  insert into public.billing_entitlement_grants (
    purchase_id,
    user_id,
    source,
    evidence_reference,
    product_code,
    entitlement_type,
    active_from,
    active_until
  )
  values (
    null,
    p_user_id,
    'legacy_verified',
    btrim(p_evidence_reference),
    btrim(p_product_code),
    p_entitlement_type,
    p_active_from,
    p_active_until
  )
  returning id into v_grant_id;

  select *
  into v_legacy
  from public.user_entitlements
  where user_id = p_user_id
  for update;

  select exists (
    select 1
    from public.billing_entitlement_grants
    where user_id = p_user_id
      and source = 'purchase'
      and entitlement_type = 'lifetime'
  )
  into v_has_purchase_lifetime;

  if v_has_purchase_lifetime then
    insert into public.user_entitlements (
      user_id, plan, source, voucher_id, active_until
    )
    values (
      p_user_id, 'full_access', 'billing', null, null
    )
    on conflict (user_id) do update
    set plan = 'full_access',
        source = 'billing',
        voucher_id = null,
        active_until = null;
  elsif p_entitlement_type = 'lifetime' then
    insert into public.user_entitlements (
      user_id, plan, source, voucher_id, active_until
    )
    values (
      p_user_id, 'full_access', 'legacy_verified', null, null
    )
    on conflict (user_id) do update
    set plan = 'full_access',
        source = 'legacy_verified',
        voucher_id = null,
        active_until = null;
  elsif v_legacy.id is null
    or v_legacy.plan <> 'full_access'
    or v_legacy.active_until is not null
  then
    v_projection_until := greatest(
      p_active_until,
      coalesce(v_legacy.active_until, p_active_until)
    );

    insert into public.user_entitlements (
      user_id, plan, source, voucher_id, active_until
    )
    values (
      p_user_id, 'full_access', 'legacy_verified', null, v_projection_until
    )
    on conflict (user_id) do update
    set plan = 'full_access',
        source = 'legacy_verified',
        voucher_id = null,
        active_until = v_projection_until;
  end if;

  return public.billing_access_status_for_user(p_user_id)
    || jsonb_build_object('grant_id', v_grant_id);
end;
$$;

revoke all on function public.billing_access_status_for_user(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.get_billing_access_status()
  from public, anon, authenticated;
revoke all on function public.apply_billing_paid_event(uuid, timestamptz)
  from public, anon, authenticated;
revoke all on function public.authorize_feature_export(text)
  from public, anon;
revoke all on function public.admin_grant_legacy_entitlement(
  uuid, text, text, timestamptz, timestamptz, text
) from public, anon, authenticated;

grant execute on function public.get_billing_access_status()
  to authenticated, service_role;
grant execute on function public.apply_billing_paid_event(uuid, timestamptz)
  to service_role;
grant execute on function public.authorize_feature_export(text)
  to authenticated, service_role;
grant execute on function public.admin_grant_legacy_entitlement(
  uuid, text, text, timestamptz, timestamptz, text
) to service_role;
