alter table public.billing_payments
  drop constraint if exists billing_payments_method_check;

alter table public.billing_payments
  add constraint billing_payments_method_check
  check (method in ('qris', 'va', 'external'));

create table public.billing_lynk_webhook_inbox (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'lynk' check (provider = 'lynk'),
  event_key text not null,
  provider_reference text,
  event_type text not null default 'payment.received'
    check (event_type = 'payment.received'),
  status text not null default 'received'
    check (status in ('received', 'processed', 'needs_review')),
  review_reason text check (
    review_reason is null
    or review_reason in (
      'customer_email_missing',
      'user_not_found',
      'user_ambiguous',
      'unknown_product',
      'amount_mismatch',
      'unsupported_order',
      'processing_error'
    )
  ),
  customer_email text,
  product_code text,
  product_amount integer check (product_amount is null or product_amount >= 0),
  grand_total integer not null check (grand_total >= 0),
  occurred_at timestamptz not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  user_id uuid references auth.users(id) on delete set null,
  purchase_id uuid references public.billing_purchases(id) on delete set null,
  payment_id uuid references public.billing_payments(id) on delete set null,
  entitlement_grant_id uuid references public.billing_entitlement_grants(id) on delete set null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  check (
    (status = 'needs_review' and review_reason is not null and processed_at is not null)
    or (status = 'processed' and review_reason is null and processed_at is not null)
    or (status = 'received' and review_reason is null and processed_at is null)
  )
);

create unique index billing_lynk_webhook_inbox_event_key_unique
  on public.billing_lynk_webhook_inbox (provider, event_key);

create unique index billing_lynk_webhook_inbox_reference_unique
  on public.billing_lynk_webhook_inbox (provider, provider_reference)
  where provider_reference is not null;

create index billing_lynk_webhook_inbox_review_lookup
  on public.billing_lynk_webhook_inbox (received_at)
  where status = 'needs_review';

alter table public.billing_lynk_webhook_inbox enable row level security;

revoke all on table public.billing_lynk_webhook_inbox from public, anon, authenticated;
grant all on table public.billing_lynk_webhook_inbox to service_role;

create function public.process_lynk_payment_received(
  p_event_key text,
  p_provider_reference text,
  p_customer_email text,
  p_product_code text,
  p_product_amount integer,
  p_grand_total integer,
  p_occurred_at timestamptz,
  p_payload jsonb,
  p_review_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_match public.billing_lynk_webhook_inbox%rowtype;
  v_reference_match public.billing_lynk_webhook_inbox%rowtype;
  v_inbox public.billing_lynk_webhook_inbox%rowtype;
  v_customer_email text;
  v_user_count bigint;
  v_user_id uuid;
  v_catalog record;
  v_purchase_id uuid;
  v_payment_id uuid;
  v_grant_id uuid;
  v_review_reason text;
begin
  if nullif(btrim(p_event_key), '') is null
    or length(p_event_key) > 512
    or (
      p_provider_reference is not null
      and (
        nullif(btrim(p_provider_reference), '') is null
        or length(p_provider_reference) > 512
      )
    )
    or (p_customer_email is not null and length(p_customer_email) > 320)
    or (p_product_code is not null and length(p_product_code) > 100)
    or p_product_amount < 0
    or p_grand_total is null
    or p_grand_total < 0
    or p_occurred_at is null
    or p_payload is null
    or jsonb_typeof(p_payload) <> 'object'
    or (
      p_review_reason is not null
      and p_review_reason not in (
        'customer_email_missing',
        'user_not_found',
        'user_ambiguous',
        'unknown_product',
        'amount_mismatch',
        'unsupported_order',
        'processing_error'
      )
    )
  then
    raise exception 'Lynk payment input is invalid';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    'lynk-event:' || p_event_key,
    0
  ));
  if p_provider_reference is not null then
    perform pg_advisory_xact_lock(hashtextextended(
      'lynk-reference:' || p_provider_reference,
      0
    ));
  end if;

  select inbox.*
  into v_event_match
  from public.billing_lynk_webhook_inbox as inbox
  where inbox.provider = 'lynk'
    and inbox.event_key = p_event_key;

  if p_provider_reference is not null then
    select inbox.*
    into v_reference_match
    from public.billing_lynk_webhook_inbox as inbox
    where inbox.provider = 'lynk'
      and inbox.provider_reference = p_provider_reference;
  end if;

  if v_event_match.id is not null
    and v_reference_match.id is not null
    and v_event_match.id <> v_reference_match.id
  then
    raise exception 'Lynk idempotency keys conflict';
  end if;

  if v_event_match.id is not null or v_reference_match.id is not null then
    if v_event_match.id is not null then
      v_inbox := v_event_match;
    else
      v_inbox := v_reference_match;
    end if;

    return jsonb_build_object(
      'status', 'duplicate',
      'inbox_id', v_inbox.id,
      'original_status', v_inbox.status
    );
  end if;

  v_customer_email := nullif(lower(btrim(p_customer_email)), '');

  insert into public.billing_lynk_webhook_inbox (
    provider,
    event_key,
    provider_reference,
    event_type,
    customer_email,
    product_code,
    product_amount,
    grand_total,
    occurred_at,
    payload
  )
  values (
    'lynk',
    p_event_key,
    p_provider_reference,
    'payment.received',
    v_customer_email,
    p_product_code,
    p_product_amount,
    p_grand_total,
    p_occurred_at,
    p_payload
  )
  returning * into v_inbox;

  begin
    v_review_reason := p_review_reason;
    if v_review_reason is null then
      if v_customer_email is null then
        v_review_reason := 'customer_email_missing';
      elsif p_provider_reference is null then
        v_review_reason := 'unsupported_order';
      end if;
    end if;

    if v_review_reason is not null then
      update public.billing_lynk_webhook_inbox
      set status = 'needs_review',
          review_reason = v_review_reason,
          processed_at = now()
      where id = v_inbox.id;

      return jsonb_build_object(
        'status', 'needs_review',
        'inbox_id', v_inbox.id,
        'review_reason', v_review_reason
      );
    end if;

    select
      count(*),
      (array_agg(users.id order by users.id::text))[1]
    into v_user_count, v_user_id
    from auth.users as users
    where lower(btrim(users.email)) = v_customer_email;

    if v_user_count = 0 then
      v_review_reason := 'user_not_found';
    elsif v_user_count > 1 then
      v_review_reason := 'user_ambiguous';
      v_user_id := null;
    end if;

    if v_review_reason is not null then
      update public.billing_lynk_webhook_inbox
      set status = 'needs_review',
          review_reason = v_review_reason,
          user_id = v_user_id,
          processed_at = now()
      where id = v_inbox.id;

      return jsonb_build_object(
        'status', 'needs_review',
        'inbox_id', v_inbox.id,
        'review_reason', v_review_reason
      );
    end if;

    select
      product.id as product_id,
      product.code,
      product.name,
      product.duration_kind,
      product.duration_value,
      price.id as price_id,
      price.amount,
      price.currency
    into v_catalog
    from public.billing_products as product
    join public.billing_prices as price
      on price.product_id = product.id
     and price.active
    where product.code = p_product_code
      and product.code <> 'free'
      and product.active
      and (product.available_from is null or product.available_from <= now())
      and (product.available_until is null or product.available_until > now())
    limit 1;

    if not found then
      v_review_reason := 'unknown_product';
    elsif p_product_amount is distinct from v_catalog.amount then
      v_review_reason := 'amount_mismatch';
    end if;

    if v_review_reason is not null then
      update public.billing_lynk_webhook_inbox
      set status = 'needs_review',
          review_reason = v_review_reason,
          user_id = v_user_id,
          processed_at = now()
      where id = v_inbox.id;

      return jsonb_build_object(
        'status', 'needs_review',
        'inbox_id', v_inbox.id,
        'review_reason', v_review_reason
      );
    end if;

    v_purchase_id := gen_random_uuid();
    v_payment_id := gen_random_uuid();

    insert into public.billing_purchases (
      id,
      user_id,
      product_id,
      price_id,
      product_code_snapshot,
      product_name_snapshot,
      duration_kind_snapshot,
      duration_value_snapshot,
      base_amount_snapshot,
      channel_fee_snapshot,
      total_amount_snapshot,
      currency_snapshot
    )
    values (
      v_purchase_id,
      v_user_id,
      v_catalog.product_id,
      v_catalog.price_id,
      v_catalog.code,
      v_catalog.name,
      v_catalog.duration_kind,
      v_catalog.duration_value,
      v_catalog.amount,
      0,
      v_catalog.amount,
      v_catalog.currency
    );

    insert into public.billing_payments (
      id,
      purchase_id,
      user_id,
      provider,
      provider_reference,
      method,
      state,
      base_amount,
      channel_fee,
      total_amount,
      provider_reported_amount,
      currency,
      safe_reference,
      instructions
    )
    values (
      v_payment_id,
      v_purchase_id,
      v_user_id,
      'lynk',
      p_provider_reference,
      'external',
      'pending',
      v_catalog.amount,
      0,
      v_catalog.amount,
      v_catalog.amount,
      v_catalog.currency,
      'TL-LYNK-' || upper(substr(replace(v_payment_id::text, '-', ''), 1, 12)),
      '[]'::jsonb
    );

    perform public.apply_billing_paid_event(v_payment_id, p_occurred_at);

    select entitlement.id
    into v_grant_id
    from public.billing_entitlement_grants as entitlement
    where entitlement.purchase_id = v_purchase_id
      and entitlement.user_id = v_user_id;

    if v_grant_id is null then
      raise exception 'Lynk entitlement grant was not created';
    end if;

    update public.billing_lynk_webhook_inbox
    set status = 'processed',
        review_reason = null,
        user_id = v_user_id,
        purchase_id = v_purchase_id,
        payment_id = v_payment_id,
        entitlement_grant_id = v_grant_id,
        processed_at = now()
    where id = v_inbox.id;

    return jsonb_build_object(
      'status', 'processed',
      'inbox_id', v_inbox.id,
      'purchase_id', v_purchase_id,
      'payment_id', v_payment_id,
      'entitlement_grant_id', v_grant_id
    );
  exception
    when others then
      update public.billing_lynk_webhook_inbox
      set status = 'needs_review',
          review_reason = 'processing_error',
          processed_at = now()
      where id = v_inbox.id;

      return jsonb_build_object(
        'status', 'needs_review',
        'inbox_id', v_inbox.id,
        'review_reason', 'processing_error'
      );
  end;
end;
$$;

revoke all on function public.process_lynk_payment_received(
  text, text, text, text, integer, integer, timestamptz, jsonb, text
) from public, anon, authenticated;

grant execute on function public.process_lynk_payment_received(
  text, text, text, text, integer, integer, timestamptz, jsonb, text
) to service_role;
