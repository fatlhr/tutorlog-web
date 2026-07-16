create table public.billing_products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  duration_kind text not null
    check (duration_kind in ('free', 'days', 'months', 'lifetime')),
  duration_value integer check (duration_value is null or duration_value > 0),
  featured boolean not null default false,
  active boolean not null default true,
  availability_cap integer check (availability_cap is null or availability_cap > 0),
  available_from timestamptz,
  available_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (duration_kind in ('free', 'lifetime') and duration_value is null)
    or (duration_kind in ('days', 'months') and duration_value is not null)
  ),
  check (available_until is null or available_from is null or available_until > available_from)
);

create table public.billing_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.billing_products(id),
  amount integer not null check (amount >= 0),
  currency text not null default 'IDR' check (currency = 'IDR'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (id, product_id)
);

create unique index billing_prices_one_active_per_product
  on public.billing_prices (product_id)
  where active;

create table public.billing_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.billing_products(id),
  price_id uuid not null,
  product_code_snapshot text not null,
  product_name_snapshot text not null,
  duration_kind_snapshot text not null
    check (duration_kind_snapshot in ('free', 'days', 'months', 'lifetime')),
  duration_value_snapshot integer
    check (duration_value_snapshot is null or duration_value_snapshot > 0),
  base_amount_snapshot integer not null check (base_amount_snapshot >= 0),
  channel_fee_snapshot integer not null default 0 check (channel_fee_snapshot >= 0),
  total_amount_snapshot integer not null check (total_amount_snapshot >= 0),
  currency_snapshot text not null default 'IDR' check (currency_snapshot = 'IDR'),
  state text not null default 'open'
    check (state in ('open', 'completed', 'canceled', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (price_id, product_id) references public.billing_prices(id, product_id),
  check (total_amount_snapshot = base_amount_snapshot + channel_fee_snapshot),
  check (
    (duration_kind_snapshot in ('free', 'lifetime') and duration_value_snapshot is null)
    or (duration_kind_snapshot in ('days', 'months') and duration_value_snapshot is not null)
  )
);

create function public.enforce_billing_purchase_snapshot_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id
    or new.product_id is distinct from old.product_id
    or new.price_id is distinct from old.price_id
    or new.product_code_snapshot is distinct from old.product_code_snapshot
    or new.product_name_snapshot is distinct from old.product_name_snapshot
    or new.duration_kind_snapshot is distinct from old.duration_kind_snapshot
    or new.duration_value_snapshot is distinct from old.duration_value_snapshot
    or new.base_amount_snapshot is distinct from old.base_amount_snapshot
    or new.channel_fee_snapshot is distinct from old.channel_fee_snapshot
    or new.total_amount_snapshot is distinct from old.total_amount_snapshot
    or new.currency_snapshot is distinct from old.currency_snapshot
  then
    raise exception 'Billing purchase snapshots cannot be changed';
  end if;

  return new;
end;
$$;

create trigger billing_purchases_preserve_snapshot
before update on public.billing_purchases
for each row execute function public.enforce_billing_purchase_snapshot_immutable();

create table public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.billing_purchases(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_reference text,
  method text not null check (method in ('qris', 'va')),
  state text not null default 'created'
    check (state in ('created', 'pending', 'superseded', 'paid', 'expired', 'failed', 'canceled', 'refunded')),
  base_amount integer not null check (base_amount >= 0),
  channel_fee integer not null default 0 check (channel_fee >= 0),
  total_amount integer not null check (total_amount >= 0),
  provider_reported_amount integer check (provider_reported_amount is null or provider_reported_amount >= 0),
  currency text not null default 'IDR' check (currency = 'IDR'),
  safe_reference text not null,
  redirect_url text,
  instructions jsonb not null default '[]'::jsonb check (jsonb_typeof(instructions) = 'array'),
  expires_at timestamptz,
  verification_deadline timestamptz,
  duplicate_review boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_reference),
  unique (id, user_id),
  foreign key (purchase_id, user_id) references public.billing_purchases(id, user_id),
  check (total_amount = base_amount + channel_fee)
);

create index billing_payments_pending_lookup
  on public.billing_payments (provider, state, expires_at)
  where state in ('created', 'pending');

create index billing_payments_user_lookup
  on public.billing_payments (user_id, created_at desc);

create table public.billing_provider_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payment_id uuid not null references public.billing_payments(id),
  provider text not null,
  provider_event_key text not null,
  provider_reference text,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  unique (provider, provider_event_key),
  foreign key (payment_id, user_id) references public.billing_payments(id, user_id)
);

create index billing_provider_events_processing_lookup
  on public.billing_provider_events (received_at)
  where processed_at is null;

create table public.billing_entitlement_grants (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null unique references public.billing_purchases(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_code text not null,
  entitlement_type text not null check (entitlement_type in ('term', 'lifetime')),
  active_from timestamptz not null,
  active_until timestamptz,
  granted_at timestamptz not null default now(),
  foreign key (purchase_id, user_id) references public.billing_purchases(id, user_id),
  check ((entitlement_type = 'lifetime' and active_until is null) or entitlement_type = 'term'),
  check (entitlement_type <> 'term' or active_until is not null),
  check (active_until is null or active_until > active_from)
);

create index billing_entitlement_grants_user_access_lookup
  on public.billing_entitlement_grants (user_id, active_until desc);

create table public.billing_analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb check (jsonb_typeof(properties) = 'object'),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index billing_analytics_events_user_lookup
  on public.billing_analytics_events (user_id, occurred_at desc);

create function public.record_billing_analytics_event(
  p_user_id uuid,
  p_event_name text,
  p_properties jsonb default '{}'::jsonb,
  p_occurred_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id uuid;
begin
  if p_user_id is null or nullif(btrim(p_event_name), '') is null then
    raise exception 'Billing analytics requires a user and event name';
  end if;

  if p_properties is null or jsonb_typeof(p_properties) <> 'object' then
    raise exception 'Billing analytics properties must be an object';
  end if;

  insert into public.billing_analytics_events (user_id, event_name, properties, occurred_at)
  values (p_user_id, p_event_name, p_properties, coalesce(p_occurred_at, now()))
  returning id into v_event_id;

  return v_event_id;
end;
$$;

insert into public.billing_products (
  code,
  name,
  description,
  duration_kind,
  duration_value,
  featured,
  active,
  availability_cap,
  available_from,
  available_until
)
values
  ('free', 'TutorLog Free', 'Fitur inti TutorLog dengan batas penggunaan gratis.', 'free', null, false, true, null, null, null),
  ('plus_30d', 'Plus 30 Hari', 'Akses penuh TutorLog Plus selama 30 hari.', 'days', 30, false, true, null, null, null),
  ('plus_12m', 'Plus 12 Bulan', 'Akses penuh TutorLog Plus selama 12 bulan.', 'months', 12, true, true, null, null, null),
  ('plus_lifetime', 'Plus Selamanya', 'Akses penuh TutorLog Plus tanpa batas waktu.', 'lifetime', null, true, true, null, null, null);

insert into public.billing_prices (product_id, amount, currency, active)
select product.id, launch_price.amount, launch_price.currency, launch_price.active
from (
  values
    ('free', 0, 'IDR', true),
    ('plus_30d', 19000, 'IDR', true),
    ('plus_12m', 149000, 'IDR', true),
    ('plus_lifetime', 249000, 'IDR', true)
) as launch_price(product_code, amount, currency, active)
join public.billing_products as product on product.code = launch_price.product_code;

alter table public.billing_products enable row level security;
alter table public.billing_prices enable row level security;
alter table public.billing_purchases enable row level security;
alter table public.billing_payments enable row level security;
alter table public.billing_provider_events enable row level security;
alter table public.billing_entitlement_grants enable row level security;
alter table public.billing_analytics_events enable row level security;

create policy billing_products_read_active
on public.billing_products
for select
to authenticated
using (active);

create policy billing_prices_read_active
on public.billing_prices
for select
to authenticated
using (
  active
  and exists (
    select 1
    from public.billing_products as product
    where product.id = product_id
      and product.active
      and (product.available_from is null or product.available_from <= now())
      and (product.available_until is null or product.available_until > now())
  )
);

create policy billing_purchases_read_own
on public.billing_purchases
for select
to authenticated
using (auth.uid() = user_id);

create policy billing_payments_read_own
on public.billing_payments
for select
to authenticated
using (auth.uid() = user_id);

create policy billing_entitlement_grants_read_own
on public.billing_entitlement_grants
for select
to authenticated
using (auth.uid() = user_id);

revoke all on table public.billing_products from anon, authenticated;
revoke all on table public.billing_prices from anon, authenticated;
revoke all on table public.billing_purchases from anon, authenticated;
revoke all on table public.billing_payments from anon, authenticated;
revoke all on table public.billing_provider_events from anon, authenticated;
revoke all on table public.billing_entitlement_grants from anon, authenticated;
revoke all on table public.billing_analytics_events from anon, authenticated;

grant select on table public.billing_products to authenticated;
grant select on table public.billing_prices to authenticated;
grant select on table public.billing_purchases to authenticated;
grant select (
  id,
  purchase_id,
  method,
  state,
  base_amount,
  channel_fee,
  total_amount,
  currency,
  safe_reference,
  redirect_url,
  instructions,
  expires_at,
  verification_deadline,
  duplicate_review,
  paid_at,
  created_at
) on table public.billing_payments to authenticated;
grant select on table public.billing_entitlement_grants to authenticated;

revoke all on function public.record_billing_analytics_event(uuid, text, jsonb, timestamptz) from public, anon, authenticated;
grant execute on function public.record_billing_analytics_event(uuid, text, jsonb, timestamptz) to service_role;

grant all on table public.billing_products to service_role;
grant all on table public.billing_prices to service_role;
grant all on table public.billing_purchases to service_role;
grant all on table public.billing_payments to service_role;
grant all on table public.billing_provider_events to service_role;
grant select, insert on table public.billing_entitlement_grants to service_role;
grant select on table public.billing_analytics_events to service_role;
