alter function public.process_lynk_payment_received(
  text, text, text, text, integer, integer, timestamptz, jsonb, text
) rename to process_lynk_payment_received_once;

revoke all on function public.process_lynk_payment_received_once(
  text, text, text, text, integer, integer, timestamptz, jsonb, text
) from public, anon, authenticated, service_role;

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
  v_retry_match public.billing_lynk_webhook_inbox%rowtype;
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
  then
    return public.process_lynk_payment_received_once(
      p_event_key,
      p_provider_reference,
      p_customer_email,
      p_product_code,
      p_product_amount,
      p_grand_total,
      p_occurred_at,
      p_payload,
      p_review_reason
    );
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
    and inbox.event_key = p_event_key
  for update;

  if p_provider_reference is not null then
    select inbox.*
    into v_reference_match
    from public.billing_lynk_webhook_inbox as inbox
    where inbox.provider = 'lynk'
      and inbox.provider_reference = p_provider_reference
    for update;
  end if;

  if v_event_match.id is not null
    and v_reference_match.id is not null
    and v_event_match.id <> v_reference_match.id
  then
    raise exception 'Lynk idempotency keys conflict';
  end if;

  if v_event_match.id is not null then
    v_retry_match := v_event_match;
  elsif v_reference_match.id is not null then
    v_retry_match := v_reference_match;
  end if;

  if v_retry_match.id is not null
    and v_retry_match.status = 'needs_review'
    and v_retry_match.review_reason = 'processing_error'
  then
    if v_retry_match.event_key is distinct from p_event_key
      or v_retry_match.provider_reference is distinct from p_provider_reference
      or v_retry_match.customer_email is distinct from nullif(lower(btrim(p_customer_email)), '')
      or v_retry_match.product_code is distinct from p_product_code
      or v_retry_match.product_amount is distinct from p_product_amount
      or v_retry_match.grand_total is distinct from p_grand_total
      or v_retry_match.occurred_at is distinct from p_occurred_at
      or v_retry_match.payload is distinct from p_payload
    then
      raise exception 'Lynk processing retry payload does not match';
    end if;

    if v_retry_match.purchase_id is not null
      or v_retry_match.payment_id is not null
      or v_retry_match.entitlement_grant_id is not null
    then
      raise exception 'Lynk processing retry contains linked billing records';
    end if;

    delete from public.billing_lynk_webhook_inbox
    where id = v_retry_match.id;
  end if;

  return public.process_lynk_payment_received_once(
    p_event_key,
    p_provider_reference,
    p_customer_email,
    p_product_code,
    p_product_amount,
    p_grand_total,
    p_occurred_at,
    p_payload,
    p_review_reason
  );
end;
$$;

revoke all on function public.process_lynk_payment_received(
  text, text, text, text, integer, integer, timestamptz, jsonb, text
) from public, anon, authenticated;

grant execute on function public.process_lynk_payment_received(
  text, text, text, text, integer, integer, timestamptz, jsonb, text
) to service_role;
