alter table public.billing_payments
  add column provider_last_checked_at timestamptz,
  add column provider_error_code text,
  add column cancellation_requested_at timestamptz,
  add column cancellation_error_code text;

create function public.reserve_billing_purchase(
  p_user_id uuid,
  p_package_code text,
  p_method text,
  p_channel_fee integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product public.billing_products%rowtype;
  v_catalog record;
  v_existing record;
  v_purchase_id uuid;
  v_payment_id uuid;
  v_total_amount integer;
begin
  if p_user_id is null or nullif(btrim(p_package_code), '') is null then
    raise exception 'Billing purchase requires a user and package';
  end if;

  if p_method not in ('qris', 'va') then
    raise exception 'Billing payment method is not supported';
  end if;

  if p_channel_fee is null or p_channel_fee < 0 then
    raise exception 'Billing channel fee is invalid';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    'billing-purchase:' || p_user_id::text || ':' || p_package_code || ':' || p_method,
    0
  ));

  select product.*
  into v_product
  from public.billing_products as product
  where product.code = p_package_code
    and product.code <> 'free'
    and product.active
    and (product.available_from is null or product.available_from <= now())
    and (product.available_until is null or product.available_until > now())
  limit 1;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'PACKAGE_UNAVAILABLE';
  end if;

  select
    v_product.id as product_id,
    v_product.code,
    v_product.name,
    v_product.duration_kind,
    v_product.duration_value,
    price.id as price_id,
    price.amount,
    price.currency
  into v_catalog
  from public.billing_prices as price
  where price.product_id = v_product.id
    and price.active
  limit 1;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'PRICE_CHANGED';
  end if;

  v_total_amount := v_catalog.amount + p_channel_fee;

  select
    purchase.id as purchase_id,
    payment.id as payment_id
  into v_existing
  from public.billing_payments as payment
  join public.billing_purchases as purchase
    on purchase.id = payment.purchase_id
   and purchase.user_id = payment.user_id
  where payment.user_id = p_user_id
    and purchase.product_id = v_catalog.product_id
    and purchase.price_id = v_catalog.price_id
    and purchase.product_code_snapshot = v_catalog.code
    and purchase.base_amount_snapshot = v_catalog.amount
    and purchase.channel_fee_snapshot = p_channel_fee
    and purchase.total_amount_snapshot = v_total_amount
    and purchase.currency_snapshot = v_catalog.currency
    and payment.state in ('created', 'pending')
    and payment.method = p_method
    and (payment.expires_at is null or payment.expires_at > now())
  order by payment.created_at desc
  limit 1
  for update of payment, purchase;

  if found then
    return jsonb_build_object(
      'purchase_id', v_existing.purchase_id,
      'payment_id', v_existing.payment_id,
      'should_create_provider', false,
      'price_id', v_catalog.price_id,
      'base_amount', v_catalog.amount,
      'channel_fee', p_channel_fee,
      'total_amount', v_total_amount,
      'currency', v_catalog.currency
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
    p_user_id,
    v_catalog.product_id,
    v_catalog.price_id,
    v_catalog.code,
    v_catalog.name,
    v_catalog.duration_kind,
    v_catalog.duration_value,
    v_catalog.amount,
    p_channel_fee,
    v_total_amount,
    v_catalog.currency
  );

  insert into public.billing_payments (
    id,
    purchase_id,
    user_id,
    provider,
    method,
    state,
    base_amount,
    channel_fee,
    total_amount,
    currency,
    safe_reference
  )
  values (
    v_payment_id,
    v_purchase_id,
    p_user_id,
    'ipaymu',
    p_method,
    'created',
    v_catalog.amount,
    p_channel_fee,
    v_total_amount,
    v_catalog.currency,
    'TL-' || upper(substr(replace(v_payment_id::text, '-', ''), 1, 12))
  );

  return jsonb_build_object(
    'purchase_id', v_purchase_id,
    'payment_id', v_payment_id,
    'should_create_provider', true,
    'price_id', v_catalog.price_id,
    'base_amount', v_catalog.amount,
    'channel_fee', p_channel_fee,
    'total_amount', v_total_amount,
    'currency', v_catalog.currency
  );
end;
$$;

create function public.finalize_billing_provider_payment(
  p_user_id uuid,
  p_payment_id uuid,
  p_provider_reference text,
  p_state text,
  p_redirect_url text,
  p_channel_fee integer,
  p_total_amount integer,
  p_expires_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.billing_payments%rowtype;
  v_final_state text;
  v_requires_cancellation boolean;
begin
  if p_user_id is null
    or p_payment_id is null
    or nullif(btrim(p_provider_reference), '') is null
    or p_state not in ('pending', 'failed')
    or p_channel_fee is null
    or p_total_amount is null
  then
    raise exception 'Provider payment finalization input is invalid';
  end if;

  select payment.*
  into v_payment
  from public.billing_payments as payment
  where payment.id = p_payment_id
    and payment.user_id = p_user_id
  for update;

  if not found or v_payment.state not in ('created', 'superseded') then
    return jsonb_build_object('finalized', false);
  end if;

  if p_channel_fee <> v_payment.channel_fee
    or p_total_amount <> v_payment.total_amount
    or p_total_amount <> v_payment.base_amount + p_channel_fee
  then
    raise exception 'Provider payment amount does not match reservation';
  end if;

  v_requires_cancellation := v_payment.state = 'superseded';
  v_final_state := case
    when v_payment.state = 'superseded' then 'superseded'
    else p_state
  end;

  update public.billing_payments
  set provider_reference = p_provider_reference,
      state = v_final_state,
      redirect_url = p_redirect_url,
      expires_at = p_expires_at,
      provider_error_code = case
        when p_state = 'failed' then 'PROVIDER_REPORTED_FAILED'
        else null
      end,
      cancellation_error_code = case
        when v_requires_cancellation then null
        else cancellation_error_code
      end,
      updated_at = now()
  where id = v_payment.id
    and user_id = p_user_id
  returning * into v_payment;

  if not found then
    return jsonb_build_object('finalized', false);
  end if;

  return jsonb_build_object(
    'finalized', true,
    'state', v_payment.state,
    'requires_cancellation', v_requires_cancellation
  );
end;
$$;

create function public.record_billing_provider_failure(
  p_user_id uuid,
  p_payment_id uuid,
  p_error_code text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.billing_payments%rowtype;
begin
  if p_user_id is null
    or p_payment_id is null
    or p_error_code not in (
      'PRICE_CHANGED',
      'PAYMENT_PROVIDER_NOT_READY',
      'PROVIDER_UNAVAILABLE',
      'PROVIDER_RESPONSE_INVALID'
    )
  then
    raise exception 'Provider failure code is invalid';
  end if;

  select payment.*
  into v_payment
  from public.billing_payments as payment
  where payment.id = p_payment_id
    and payment.user_id = p_user_id
    and payment.state in ('created', 'superseded')
  for update;

  if not found then
    return jsonb_build_object('recorded', false);
  end if;

  update public.billing_payments
  set state = case when v_payment.state = 'created' then 'failed' else 'superseded' end,
      provider_error_code = p_error_code,
      updated_at = now()
  where id = v_payment.id
    and user_id = p_user_id
  returning * into v_payment;

  return jsonb_build_object(
    'recorded', found,
    'state', v_payment.state
  );
end;
$$;

create function public.claim_billing_payment_inquiry(
  p_user_id uuid,
  p_purchase_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment record;
begin
  select
    payment.id,
    payment.provider_reference
  into v_payment
  from public.billing_payments as payment
  join public.billing_purchases as purchase
    on purchase.id = payment.purchase_id
   and purchase.user_id = payment.user_id
  where purchase.id = p_purchase_id
    and purchase.user_id = p_user_id
    and payment.state = 'pending'
    and (
      payment.provider_last_checked_at is null
      or payment.provider_last_checked_at <= now() - interval '30 seconds'
    )
  order by payment.created_at desc
  limit 1
  for update of payment;

  if not found then
    return jsonb_build_object('claimed', false);
  end if;

  update public.billing_payments
  set provider_last_checked_at = now(),
      updated_at = now()
  where id = v_payment.id
    and user_id = p_user_id;

  return jsonb_build_object(
    'claimed', true,
    'payment_id', v_payment.id,
    'provider_reference', v_payment.provider_reference
  );
end;
$$;

create function public.supersede_billing_payment(
  p_user_id uuid,
  p_payment_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment record;
begin
  select
    payment.id,
    payment.purchase_id,
    payment.provider_reference
  into v_payment
  from public.billing_payments as payment
  where payment.id = p_payment_id
    and payment.user_id = p_user_id
    and payment.state in ('created', 'pending')
  for update;

  if not found then
    return jsonb_build_object('superseded', false);
  end if;

  update public.billing_payments
  set state = 'superseded',
      cancellation_requested_at = now(),
      cancellation_error_code = null,
      updated_at = now()
  where id = v_payment.id
    and user_id = p_user_id;

  return jsonb_build_object(
    'superseded', true,
    'purchase_id', v_payment.purchase_id,
    'provider_reference', v_payment.provider_reference
  );
end;
$$;

create function public.record_billing_cancellation_failure(
  p_user_id uuid,
  p_payment_id uuid,
  p_error_code text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.billing_payments%rowtype;
begin
  if p_user_id is null
    or p_payment_id is null
    or nullif(btrim(p_error_code), '') is null
  then
    raise exception 'Cancellation failure code is invalid';
  end if;

  select payment.*
  into v_payment
  from public.billing_payments as payment
  where payment.id = p_payment_id
    and payment.user_id = p_user_id
    and payment.state = 'superseded'
  for update;

  if not found then
    return jsonb_build_object('recorded', false);
  end if;

  update public.billing_payments
  set cancellation_error_code = p_error_code,
      updated_at = now()
  where id = v_payment.id
    and user_id = p_user_id
  returning * into v_payment;

  return jsonb_build_object('recorded', found);
end;
$$;

revoke all on function public.reserve_billing_purchase(uuid, text, text, integer)
  from public, anon, authenticated;
revoke all on function public.finalize_billing_provider_payment(uuid, uuid, text, text, text, integer, integer, timestamptz)
  from public, anon, authenticated;
revoke all on function public.record_billing_provider_failure(uuid, uuid, text)
  from public, anon, authenticated;
revoke all on function public.claim_billing_payment_inquiry(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.supersede_billing_payment(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.record_billing_cancellation_failure(uuid, uuid, text)
  from public, anon, authenticated;

grant execute on function public.reserve_billing_purchase(uuid, text, text, integer)
  to service_role;
grant execute on function public.finalize_billing_provider_payment(uuid, uuid, text, text, text, integer, integer, timestamptz)
  to service_role;
grant execute on function public.record_billing_provider_failure(uuid, uuid, text)
  to service_role;
grant execute on function public.claim_billing_payment_inquiry(uuid, uuid)
  to service_role;
grant execute on function public.supersede_billing_payment(uuid, uuid)
  to service_role;
grant execute on function public.record_billing_cancellation_failure(uuid, uuid, text)
  to service_role;
