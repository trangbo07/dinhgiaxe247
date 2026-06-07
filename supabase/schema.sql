-- Supabase schema for vehicle catalog + valuation leads
-- Import this file in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- =========================
-- 1) Master catalog tables
-- =========================

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.car_models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (brand_id, name)
);

create table if not exists public.car_generations (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.car_models(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (model_id, name)
);

create table if not exists public.car_versions (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.car_generations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (generation_id, name)
);

create table if not exists public.version_years (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.car_versions(id) on delete cascade,
  year int not null check (year >= 1950 and year <= 2100),
  created_at timestamptz not null default now(),
  unique (version_id, year)
);

create table if not exists public.version_colors (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.car_versions(id) on delete cascade,
  color text not null,
  created_at timestamptz not null default now(),
  unique (version_id, color)
);

-- =========================
-- 2) Valuation lead table
-- =========================
-- Save valuation requests:
-- - user full name
-- - phone
-- - buy/sell intent
-- - complete vehicle info
-- - returned valuation result

create table if not exists public.valuation_leads (
  id uuid primary key default gen_random_uuid(),

  full_name text not null,
  phone text not null,
  intent text not null check (intent in ('buy', 'sell')),

  brand text not null,
  model text not null,
  generation text,
  version text,
  year int not null check (year >= 1950 and year <= 2100),
  color text not null,
  mileage int not null check (mileage >= 0),

  price bigint,
  price_low bigint,
  price_high bigint,
  source text,
  explanation text,

  created_at timestamptz not null default now()
);

-- =========================
-- 3) Useful indexes
-- =========================

create index if not exists idx_car_models_brand_id on public.car_models (brand_id);
create index if not exists idx_car_generations_model_id on public.car_generations (model_id);
create index if not exists idx_car_versions_generation_id on public.car_versions (generation_id);
create index if not exists idx_version_years_version_id on public.version_years (version_id);
create index if not exists idx_version_colors_version_id on public.version_colors (version_id);

create index if not exists idx_valuation_leads_created_at on public.valuation_leads (created_at desc);
create index if not exists idx_valuation_leads_phone on public.valuation_leads (phone);
create index if not exists idx_valuation_leads_intent on public.valuation_leads (intent);
create index if not exists idx_valuation_leads_brand_model_year on public.valuation_leads (brand, model, year);

-- =========================
-- 4) Recommended RLS setup
-- =========================
-- NOTE:
-- If you are using SUPABASE_SERVICE_ROLE_KEY from server-side API routes,
-- service role bypasses RLS automatically.
-- You can still keep RLS on for safety.

alter table public.brands enable row level security;
alter table public.car_models enable row level security;
alter table public.car_generations enable row level security;
alter table public.car_versions enable row level security;
alter table public.version_years enable row level security;
alter table public.version_colors enable row level security;
alter table public.valuation_leads enable row level security;

-- Public read policies for catalog (optional, useful for anon browser reads)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'brands' and policyname = 'Allow public read brands'
  ) then
    create policy "Allow public read brands"
      on public.brands
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'car_models' and policyname = 'Allow public read car_models'
  ) then
    create policy "Allow public read car_models"
      on public.car_models
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'car_generations' and policyname = 'Allow public read car_generations'
  ) then
    create policy "Allow public read car_generations"
      on public.car_generations
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'car_versions' and policyname = 'Allow public read car_versions'
  ) then
    create policy "Allow public read car_versions"
      on public.car_versions
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'version_years' and policyname = 'Allow public read version_years'
  ) then
    create policy "Allow public read version_years"
      on public.version_years
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'version_colors' and policyname = 'Allow public read version_colors'
  ) then
    create policy "Allow public read version_colors"
      on public.version_colors
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

-- No public read policy for valuation_leads (sensitive phone data).
-- Keep write/read through server API with service role only.