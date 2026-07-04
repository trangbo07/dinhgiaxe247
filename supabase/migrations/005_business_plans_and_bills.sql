-- Gói Doanh nghiệp (subscriptions), bill chuyển khoản (payment_bills) và quota định giá miễn phí theo tháng.
-- Toàn bộ truy cập đi qua API server (service-role client) — không có policy anon/authenticated,
-- giống pattern của public.guest_leads (xem 002_guest_leads.sql).

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_code text not null check (plan_code in ('monthly', 'quarterly', 'yearly')),
  status text not null default 'active' check (status in ('active', 'expired')),
  activated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  activated_by uuid,
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_expires_at_idx on public.subscriptions (expires_at);

alter table public.subscriptions enable row level security;

create table if not exists public.payment_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null check (plan_code in ('monthly', 'quarterly', 'yearly')),
  amount bigint not null,
  transfer_content text not null,
  image_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists payment_bills_user_id_created_at_idx on public.payment_bills (user_id, created_at desc);
create index if not exists payment_bills_status_idx on public.payment_bills (status);

alter table public.payment_bills enable row level security;

-- Counter số lượt định giá miễn phí đã dùng trong tháng (server-side, thay cho localStorage cũ).
create table if not exists public.valuation_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  used integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, month)
);

alter table public.valuation_usage enable row level security;

-- Check-and-increment nguyên tử, tránh race condition khi user gọi định giá liên tục.
create or replace function public.consume_valuation_quota(p_user_id uuid, p_month text, p_limit int)
returns table(allowed boolean, used int) as $$
declare
  v_used int;
begin
  insert into public.valuation_usage (user_id, month, used)
  values (p_user_id, p_month, 0)
  on conflict (user_id, month) do nothing;

  select vu.used into v_used
  from public.valuation_usage vu
  where vu.user_id = p_user_id and vu.month = p_month
  for update;

  if v_used >= p_limit then
    return query select false, v_used;
  else
    update public.valuation_usage
    set used = used + 1, updated_at = now()
    where user_id = p_user_id and month = p_month
    returning valuation_usage.used into v_used;
    return query select true, v_used;
  end if;
end;
$$ language plpgsql security definer;

-- Duyệt bill: upsert subscriptions + đánh dấu bill approved trong 1 transaction.
-- expires_at luôn tính lại từ thời điểm duyệt (không cộng dồn từ hạn cũ).
create or replace function public.approve_payment_bill(p_bill_id uuid, p_admin_id uuid, p_duration_days int)
returns void as $$
declare
  v_user_id uuid;
  v_plan_code text;
  v_status text;
begin
  select user_id, plan_code, status into v_user_id, v_plan_code, v_status
  from public.payment_bills
  where id = p_bill_id
  for update;

  if v_user_id is null then
    raise exception 'payment_bills row % not found', p_bill_id;
  end if;

  if v_status != 'pending' then
    raise exception 'payment_bills row % is not pending (status=%)', p_bill_id, v_status;
  end if;

  insert into public.subscriptions (user_id, plan_code, status, activated_at, expires_at, activated_by, updated_at)
  values (v_user_id, v_plan_code, 'active', now(), now() + make_interval(days => p_duration_days), p_admin_id, now())
  on conflict (user_id) do update set
    plan_code = excluded.plan_code,
    status = 'active',
    activated_at = now(),
    expires_at = now() + make_interval(days => p_duration_days),
    activated_by = p_admin_id,
    updated_at = now();

  update public.payment_bills
  set status = 'approved', reviewed_by = p_admin_id, reviewed_at = now()
  where id = p_bill_id;
end;
$$ language plpgsql security definer;

-- Cần tạo thủ công 1 lần (không phải SQL migration thuần):
-- Supabase Dashboard → Storage → New bucket "payment-bills", Public = false.
-- Hoặc chạy: insert into storage.buckets (id, name, public) values ('payment-bills', 'payment-bills', false)
-- on conflict (id) do nothing;
-- Upload/đọc ảnh bill đều qua API server dùng service-role client + createSignedUrl,
-- nên không cần policy storage cho anon/authenticated.
