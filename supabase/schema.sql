create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  slug text not null unique,
  job_title text not null,
  industry text not null,
  tasks jsonb not null default '[]'::jsonb,
  report_data jsonb not null,
  risk_score integer not null default 0,
  risk_level text not null default 'MODERATE',
  access_tier text not null default 'free',
  active_pivot_id text,
  roadmap_start_date date,
  created_at timestamptz not null default now()
);

alter table public.reports
  add column if not exists access_tier text not null default 'free';

update public.reports
set access_tier = 'free'
where access_tier is null;

create table if not exists public.week_progress (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  week_number integer not null,
  notes text,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(report_id, week_number)
);

create table if not exists public.reminder_events (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  user_email text not null,
  type text not null,
  current_week integer,
  job_title text not null,
  industry text not null,
  scheduled_for timestamptz not null,
  status text not null default 'pending',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.course_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  provider text not null,
  external_id text,
  title text not null,
  url text not null unique,
  summary text not null default '',
  skills text[] not null default '{}'::text[],
  tags text[] not null default '{}'::text[],
  is_paid boolean not null default true,
  price_label text not null default '',
  level text not null default '',
  duration_label text not null default '',
  resource_type text not null default 'course',
  role_families text[] not null default '{}'::text[],
  pivot_frames text[] not null default '{}'::text[],
  outcome_types text[] not null default '{}'::text[],
  status text not null default 'active',
  verification_status text not null default 'pending',
  verification_http_status integer,
  final_url text,
  verification_error text,
  provider_program_ids text[] not null default '{}'::text[],
  provider_partners text[] not null default '{}'::text[],
  language_code text not null default '',
  source_metadata jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.course_catalog
  add column if not exists external_id text;

alter table public.course_catalog
  add column if not exists role_families text[] not null default '{}'::text[];

alter table public.course_catalog
  add column if not exists pivot_frames text[] not null default '{}'::text[];

alter table public.course_catalog
  add column if not exists outcome_types text[] not null default '{}'::text[];

alter table public.course_catalog
  add column if not exists verification_status text not null default 'pending';

alter table public.course_catalog
  add column if not exists verification_http_status integer;

alter table public.course_catalog
  add column if not exists final_url text;

alter table public.course_catalog
  add column if not exists verification_error text;

alter table public.course_catalog
  add column if not exists provider_program_ids text[] not null default '{}'::text[];

alter table public.course_catalog
  add column if not exists provider_partners text[] not null default '{}'::text[];

alter table public.course_catalog
  add column if not exists language_code text not null default '';

alter table public.course_catalog
  add column if not exists source_metadata jsonb not null default '{}'::jsonb;

alter table public.course_catalog
  add column if not exists last_checked_at timestamptz;

create index if not exists course_catalog_status_idx on public.course_catalog(status);
create index if not exists course_catalog_verification_idx on public.course_catalog(verification_status);
create unique index if not exists course_catalog_provider_external_id_uidx
  on public.course_catalog(provider, external_id)
  where external_id is not null;

create table if not exists public.job_title_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  normalized_title text not null,
  canonical_title text not null,
  onet_soc_code text not null,
  major_group_code text not null,
  major_group_name text not null,
  source_type text not null default 'alternate',
  source_names text[] not null default '{}'::text[],
  is_canonical boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_title_catalog_normalized_idx
  on public.job_title_catalog(normalized_title);

create index if not exists job_title_catalog_soc_idx
  on public.job_title_catalog(onet_soc_code);

create index if not exists job_title_catalog_major_group_idx
  on public.job_title_catalog(major_group_code);

create index if not exists job_title_catalog_normalized_trgm_idx
  on public.job_title_catalog
  using gin (normalized_title gin_trgm_ops);
