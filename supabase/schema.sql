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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reports
  add column if not exists access_tier text not null default 'free';

alter table public.reports
  add column if not exists updated_at timestamptz not null default now();

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

alter table public.week_progress
  add column if not exists action_state text not null default 'not_started';

alter table public.week_progress
  add column if not exists proof_asset_status text not null default 'not_started';

alter table public.week_progress
  add column if not exists manager_conversation_status text not null default 'not_started';

alter table public.week_progress
  add column if not exists last_active_step text not null default '';

create table if not exists public.report_outcomes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null,
  built_proof_asset boolean not null default false,
  manager_conversation_done boolean not null default false,
  traction_status text not null default 'no_signal',
  usefulness_rating integer,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(report_id)
);

alter table public.report_outcomes
  add column if not exists user_id uuid;

alter table public.report_outcomes
  add column if not exists built_proof_asset boolean not null default false;

alter table public.report_outcomes
  add column if not exists manager_conversation_done boolean not null default false;

alter table public.report_outcomes
  add column if not exists traction_status text not null default 'no_signal';

alter table public.report_outcomes
  add column if not exists usefulness_rating integer;

alter table public.report_outcomes
  add column if not exists notes text not null default '';

alter table public.report_outcomes
  add column if not exists updated_at timestamptz not null default now();

update public.report_outcomes
set user_id = reports.user_id
from public.reports
where reports.id = report_outcomes.report_id
  and report_outcomes.user_id is null;

alter table public.report_outcomes
  alter column user_id set not null;

create index if not exists report_outcomes_user_idx on public.report_outcomes(user_id);
create index if not exists report_outcomes_traction_idx on public.report_outcomes(traction_status);

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

alter table public.reports enable row level security;
alter table public.week_progress enable row level security;
alter table public.report_outcomes enable row level security;

drop policy if exists reports_select_own on public.reports;
create policy reports_select_own
  on public.reports
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own
  on public.reports
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists reports_update_own on public.reports;
create policy reports_update_own
  on public.reports
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists week_progress_select_own_report on public.week_progress;
create policy week_progress_select_own_report
  on public.week_progress
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.reports
      where reports.id = week_progress.report_id
        and reports.user_id = auth.uid()
    )
  );

drop policy if exists week_progress_insert_own_report on public.week_progress;
create policy week_progress_insert_own_report
  on public.week_progress
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.reports
      where reports.id = week_progress.report_id
        and reports.user_id = auth.uid()
    )
  );

drop policy if exists week_progress_update_own_report on public.week_progress;
create policy week_progress_update_own_report
  on public.week_progress
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.reports
      where reports.id = week_progress.report_id
        and reports.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.reports
      where reports.id = week_progress.report_id
        and reports.user_id = auth.uid()
    )
  );

drop policy if exists report_outcomes_select_own on public.report_outcomes;
create policy report_outcomes_select_own
  on public.report_outcomes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists report_outcomes_insert_own on public.report_outcomes;
create policy report_outcomes_insert_own
  on public.report_outcomes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists report_outcomes_update_own on public.report_outcomes;
create policy report_outcomes_update_own
  on public.report_outcomes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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

create table if not exists public.job_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  company_name text not null,
  provider text not null,
  source_url text,
  external_board_id text,
  status text not null default 'draft',
  sync_frequency text not null default 'daily',
  source_config jsonb not null default '{}'::jsonb,
  notes text not null default '',
  last_synced_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_sources_status_idx on public.job_sources(status);
create index if not exists job_sources_provider_idx on public.job_sources(provider);

create table if not exists public.job_openings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.job_sources(id) on delete cascade,
  source_job_id text not null,
  provider text not null,
  company_name text not null,
  title text not null,
  normalized_title text not null default '',
  slug text not null,
  department text not null default '',
  location_text text not null default '',
  location_type text not null default '',
  employment_type text not null default '',
  seniority text not null default '',
  salary_text text not null default '',
  apply_url text not null default '',
  posting_url text not null default '',
  description_text text not null default '',
  description_html text not null default '',
  domain_focus text not null default '',
  role_family text not null default '',
  required_skills text[] not null default '{}'::text[],
  preferred_skills text[] not null default '{}'::text[],
  tools text[] not null default '{}'::text[],
  job_functions text[] not null default '{}'::text[],
  proof_assets text[] not null default '{}'::text[],
  enrichment_summary text not null default '',
  enrichment_status text not null default 'pending',
  enrichment_model text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  posted_at timestamptz,
  closed_at timestamptz,
  status text not null default 'open',
  fetched_at timestamptz not null default now(),
  enriched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_id, source_job_id)
);

alter table public.job_openings
  add column if not exists proof_assets text[] not null default '{}'::text[];

alter table public.job_openings
  add column if not exists enrichment_summary text not null default '';

alter table public.job_openings
  add column if not exists enrichment_status text not null default 'pending';

alter table public.job_openings
  add column if not exists enrichment_model text not null default '';

alter table public.job_openings
  add column if not exists enriched_at timestamptz;

create index if not exists job_openings_source_status_idx on public.job_openings(source_id, status);
create index if not exists job_openings_provider_idx on public.job_openings(provider);
create index if not exists job_openings_role_family_idx on public.job_openings(role_family);
create index if not exists job_openings_domain_focus_idx on public.job_openings(domain_focus);
create index if not exists job_openings_posted_at_idx on public.job_openings(posted_at desc);
create index if not exists job_openings_enrichment_status_idx on public.job_openings(enrichment_status);
create index if not exists job_openings_required_skills_gin_idx on public.job_openings using gin (required_skills);
create index if not exists job_openings_preferred_skills_gin_idx on public.job_openings using gin (preferred_skills);
create index if not exists job_openings_tools_gin_idx on public.job_openings using gin (tools);
create index if not exists job_openings_proof_assets_gin_idx on public.job_openings using gin (proof_assets);
