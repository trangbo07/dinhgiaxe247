-- Chạy trong Supabase SQL Editor
create table if not exists public.valuations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  brand text not null,
  model text not null,
  year integer,
  version text,
  color text,
  mileage integer default 0,
  price bigint,
  price_low bigint,
  price_high bigint,
  explanation text,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists valuations_user_id_created_at_idx
  on public.valuations (user_id, created_at desc);

alter table public.valuations enable row level security;

-- Chỉ đọc được bản ghi của chính mình (khi dùng Supabase client với JWT user)
create policy "Users read own valuations"
  on public.valuations for select
  using (auth.uid() = user_id);

-- Insert qua service role từ API Next.js (khuyến nghị production)
-- Hoặc cho phép user insert own:
create policy "Users insert own valuations"
  on public.valuations for insert
  with check (auth.uid() = user_id);
