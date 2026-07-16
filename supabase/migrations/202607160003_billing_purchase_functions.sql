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
  where product.code = p_package_code
    and product.code <> 'free'
    and product.active
    and price.active
    and (product.available_from is null or product.available_from <= now())
    and (product.available_until is null or product.available_until > now())
  limit 1;

  if not found then
    raise exception 'Billing package is unavailable';
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
      'should_create_provider', false
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
    'should_create_provider', true
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

revoke all on function public.reserve_billing_purchase(uuid, text, text, integer)
  from public, anon, authenticated;
revoke all on function public.claim_billing_payment_inquiry(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.supersede_billing_payment(uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.reserve_billing_purchase(uuid, text, text, integer)
  to service_role;
grant execute on function public.claim_billing_payment_inquiry(uuid, uuid)
  to service_role;
grant execute on function public.supersede_billing_payment(uuid, uuid)
  to service_role;
