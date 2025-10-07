-- Users are managed by Supabase Auth
-- Domain tables

create table if not exists public.class_schedules (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Lagree Class',
  start_time timestamptz not null,
  end_time timestamptz not null,
  capacity int not null check (capacity > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credits int not null check (credits >= 0),
  price_cents int not null check (price_cents >= 0),
  duration_days int, -- null for non-expiring bundles
  created_at timestamptz not null default now()
);

create table if not exists public.user_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id uuid references public.packages(id),
  credits_remaining int not null default 0,
  status text not null check (status in ('pending', 'confirmed', 'expired')),
  purchased_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.class_schedules(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('booked', 'cancelled')) default 'booked',
  created_at timestamptz not null default now(),
  unique (schedule_id, user_id)
);

-- Ledger to track credit movements
create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  user_package_id uuid references public.user_packages(id) on delete set null,
  delta int not null, -- negative to deduct, positive to add
  reason text not null,
  created_at timestamptz not null default now()
);

-- Views and helper
create view public.class_availability as
select s.*, coalesce(b.count, 0) as booked_count, (s.capacity - coalesce(b.count, 0)) as slots_left
from public.class_schedules s
left join (
  select schedule_id, count(*) as count
  from public.bookings
  where status = 'booked'
  group by schedule_id
) b on b.schedule_id = s.id;

-- Booking function with overbooking prevention and 24h cancellation logic
create or replace function public.book_class(p_schedule_id uuid, p_user_id uuid)
returns void
language plpgsql
as $$
declare
  v_slots_left int;
  v_user_package_id uuid;
begin
  -- prevent booking if full
  select slots_left into v_slots_left from public.class_availability where id = p_schedule_id for update;
  if v_slots_left is null then
    raise exception 'Class not found';
  end if;
  if v_slots_left <= 0 then
    raise exception 'Class is full';
  end if;

  -- find a confirmed package with credits
  select id into v_user_package_id
  from public.user_packages
  where user_id = p_user_id and status = 'confirmed' and credits_remaining > 0
  order by expires_at nulls last, purchased_at asc
  limit 1;
  if v_user_package_id is null then
    raise exception 'Insufficient credits';
  end if;

  -- create booking
  insert into public.bookings (schedule_id, user_id) values (p_schedule_id, p_user_id);

  -- deduct credit
  update public.user_packages set credits_remaining = credits_remaining - 1 where id = v_user_package_id;
  insert into public.credit_ledger (user_id, user_package_id, delta, reason)
  values (p_user_id, v_user_package_id, -1, 'book');
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid, p_user_id uuid)
returns void
language plpgsql
as $$
declare
  v_schedule record;
  v_user_package_id uuid;
  v_booking record;
begin
  select b.*, s.start_time into v_booking
  from public.bookings b
  join public.class_schedules s on s.id = b.schedule_id
  where b.id = p_booking_id and b.user_id = p_user_id for update;

  if v_booking.id is null then
    raise exception 'Booking not found';
  end if;

  if v_booking.status != 'booked' then
    raise exception 'Already cancelled';
  end if;

  if v_booking.start_time <= now() + interval '24 hours' then
    raise exception 'Cannot cancel within 24 hours';
  end if;

  update public.bookings set status = 'cancelled' where id = v_booking.id;

  -- refund one credit to the oldest package with deficit? simplest: to any active package
  select id into v_user_package_id
  from public.user_packages
  where user_id = p_user_id and status = 'confirmed'
  order by purchased_at asc
  limit 1;

  if v_user_package_id is not null then
    update public.user_packages set credits_remaining = credits_remaining + 1 where id = v_user_package_id;
    insert into public.credit_ledger (user_id, user_package_id, delta, reason)
    values (p_user_id, v_user_package_id, 1, 'cancel_refund');
  end if;
end;
$$;

-- RLS
alter table public.class_schedules enable row level security;
alter table public.packages enable row level security;
alter table public.user_packages enable row level security;
alter table public.bookings enable row level security;
alter table public.credit_ledger enable row level security;

create policy "read schedules" on public.class_schedules for select using (true);
create policy "read availability" on public.class_schedules for select using (true);

create policy "read packages" on public.packages for select using (true);

create policy "user can read own user_packages" on public.user_packages for select using (auth.uid() = user_id);
create policy "user can read own bookings" on public.bookings for select using (auth.uid() = user_id);
create policy "user can read own ledger" on public.credit_ledger for select using (auth.uid() = user_id);

-- Execute functions via RPC with security definer wrappers if needed
