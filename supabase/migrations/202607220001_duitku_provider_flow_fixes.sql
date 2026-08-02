create or replace function public.reserve_billing_purchase(
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
    and payment.provider = 'duitku'
    and purchase.product_id = v_catalog.product_id
    and purchase.price_id = v_catalog.price_id
    and purchase.product_code_snapshot = v_catalog.code
    and purchase.base_amount_snapshot = v_catalog.amount
    and purchase.channel_fee_snapshot = p_channel_fee
    and purchase.total_amount_snapshot = v_total_amount
    and purchase.currency_snapshot = v_catalog.currency
    and payment.method = p_method
    and (
      (
        payment.state = 'created'
        and payment.verification_deadline is not null
        and payment.verification_deadline > now()
      )
      or (
        payment.state = 'pending'
        and (payment.expires_at is null or payment.expires_at > now())
      )
    )
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
    safe_reference,
    verification_deadline
  )
  values (
    v_payment_id,
    v_purchase_id,
    p_user_id,
    'duitku',
    p_method,
    'created',
    v_catalog.amount,
    p_channel_fee,
    v_total_amount,
    v_catalog.currency,
    'TL-' || upper(substr(replace(v_payment_id::text, '-', ''), 1, 12)),
    now() + interval '2 minutes'
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

create or replace function public.claim_billing_payment_inquiry(
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
    payment.purchase_id,
    payment.provider,
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
    'purchase_id', v_payment.purchase_id,
    'provider', v_payment.provider,
    'provider_reference', v_payment.provider_reference
  );
end;
$$;

create or replace function public.process_billing_provider_event(
  p_provider text,
  p_event_key text,
  p_provider_reference text,
  p_event_type text,
  p_amount integer,
  p_channel_fee integer,
  p_occurred_at timestamptz,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_seed record;
  v_event public.billing_provider_events%rowtype;
  v_payment public.billing_payments%rowtype;
  v_purchase public.billing_purchases%rowtype;
  v_outcome text := 'processed';
begin
  if p_provider not in ('ipaymu', 'duitku')
    or nullif(btrim(p_event_key), '') is null
    or nullif(btrim(p_provider_reference), '') is null
    or p_event_type not in ('pending', 'paid', 'expired', 'failed', 'canceled')
    or p_amount is null
    or p_amount < 0
    or p_channel_fee is null
    or p_channel_fee < 0
    or p_occurred_at is null
    or p_payload is null
    or jsonb_typeof(p_payload) <> 'object'
  then
    raise exception 'Provider event input is invalid';
  end if;

  select payment.id, payment.user_id
  into v_seed
  from public.billing_payments as payment
  where payment.provider = p_provider
    and payment.provider_reference = p_provider_reference;

  if not found then
    return jsonb_build_object('status', 'unknown_reference');
  end if;

  insert into public.billing_provider_events (
    user_id,
    payment_id,
    provider,
    provider_event_key,
    provider_reference,
    event_type,
    payload
  )
  values (
    v_seed.user_id,
    v_seed.id,
    p_provider,
    p_event_key,
    p_provider_reference,
    p_event_type,
    p_payload
  )
  on conflict (provider, provider_event_key) do nothing;

  select provider_event.*
  into v_event
  from public.billing_provider_events as provider_event
  where provider_event.provider = p_provider
    and provider_event.provider_event_key = p_event_key
  for update;

  if v_event.processed_at is not null then
    return jsonb_build_object('status', 'duplicate');
  end if;

  select payment.*
  into v_payment
  from public.billing_payments as payment
  where payment.id = v_event.payment_id
    and payment.user_id = v_event.user_id
    and payment.provider = v_event.provider
    and payment.provider_reference = v_event.provider_reference
  for update;

  if not found then
    raise exception 'Provider event payment is invalid';
  end if;

  select purchase.*
  into v_purchase
  from public.billing_purchases as purchase
  where purchase.id = v_payment.purchase_id
    and purchase.user_id = v_payment.user_id
  for update;

  if not found then
    raise exception 'Provider event purchase is invalid';
  end if;

  if p_amount <> v_payment.total_amount
    or p_channel_fee <> v_payment.channel_fee
    or v_payment.total_amount <> v_purchase.total_amount_snapshot
  then
    update public.billing_provider_events
    set processed_at = now(),
        processing_error = 'AMOUNT_MISMATCH'
    where id = v_event.id;

    return jsonb_build_object('status', 'amount_mismatch');
  end if;

  update public.billing_payments
  set provider_reported_amount = p_amount,
      updated_at = now()
  where id = v_payment.id;

  if p_event_type = 'pending' and v_payment.state = 'created' then
    update public.billing_payments
    set state = 'pending',
        updated_at = now()
    where id = v_payment.id;
  elsif p_event_type = 'paid'
    and v_payment.state in ('pending', 'superseded', 'paid', 'expired', 'failed', 'canceled')
  then
    perform public.apply_billing_paid_event(v_payment.id, p_occurred_at);

    update public.billing_payments as duplicate_payment
    set duplicate_review = true,
        updated_at = now()
    where duplicate_payment.purchase_id = v_purchase.id
      and duplicate_payment.id <> v_payment.id
      and duplicate_payment.state = 'paid';
  elsif p_event_type = 'expired'
    and v_payment.state in ('pending', 'superseded')
  then
    update public.billing_payments
    set state = 'expired',
        updated_at = now()
    where id = v_payment.id;
  elsif p_event_type = 'failed' and v_payment.state = 'pending' then
    update public.billing_payments
    set state = 'failed',
        updated_at = now()
    where id = v_payment.id;
  elsif p_event_type = 'canceled'
    and v_payment.state in ('created', 'pending', 'superseded')
  then
    update public.billing_payments
    set state = 'canceled',
        updated_at = now()
    where id = v_payment.id;
  else
    v_outcome := 'ignored';
  end if;

  update public.billing_provider_events
  set processed_at = now(),
      processing_error = null
  where id = v_event.id;

  return jsonb_build_object('status', v_outcome);
end;
$$;

revoke all on function public.reserve_billing_purchase(uuid, text, text, integer)
  from public, anon, authenticated;
revoke all on function public.claim_billing_payment_inquiry(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.process_billing_provider_event(
  text, text, text, text, integer, integer, timestamptz, jsonb
) from public, anon, authenticated;

grant execute on function public.reserve_billing_purchase(uuid, text, text, integer)
  to service_role;
grant execute on function public.claim_billing_payment_inquiry(uuid, uuid)
  to service_role;
grant execute on function public.process_billing_provider_event(
  text, text, text, text, integer, integer, timestamptz, jsonb
) to service_role;
