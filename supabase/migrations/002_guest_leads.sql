-- Lead khách từ landing (định giá chưa đăng nhập) — doanh nghiệp xem trên dashboard
create table if not exists public.guest_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  intent text not null check (intent in ('mua', 'ban')),
  brand text not null default '',
  model text not null default '',
  year integer,
  version text,
  color text,
  mileage integer default 0,
  price bigint,
  price_low bigint,
  price_high bigint,
  explanation text,
  source text,
  status text not null default 'moi' check (status in ('moi', 'da_lien_he', 'dong')),
  created_at timestamptz not null default now()
);

create index if not exists guest_leads_created_at_idx on public.guest_leads (created_at desc);
create index if not exists guest_leads_intent_idx on public.guest_leads (intent);
create index if not exists guest_leads_status_idx on public.guest_leads (status);

alter table public.guest_leads enable row level security;

-- Nếu bảng đã tạo trước đó, chạy thêm:
-- alter table public.guest_leads add column if not exists status text not null default 'moi';
