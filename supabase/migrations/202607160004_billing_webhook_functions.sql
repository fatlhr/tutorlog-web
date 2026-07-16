create function public.process_billing_provider_event(
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
  if p_provider <> 'ipaymu'
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

revoke all on function public.process_billing_provider_event(
  text, text, text, text, integer, integer, timestamptz, jsonb
) from public, anon, authenticated;

grant execute on function public.process_billing_provider_event(
  text, text, text, text, integer, integer, timestamptz, jsonb
) to service_role;
