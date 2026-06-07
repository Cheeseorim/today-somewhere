create table if not exists public.postcards (
  id uuid primary key default gen_random_uuid(),
  city text not null check (char_length(city) between 1 and 80),
  region text,
  country text not null check (char_length(country) between 1 and 80),
  country_code text not null default '',
  nickname text check (char_length(nickname) between 1 and 20),
  note text not null check (char_length(note) between 2 and 100),
  temperature smallint not null,
  humidity smallint,
  apparent_temperature smallint,
  wind_speed smallint,
  precipitation numeric(6, 2),
  weather_label text not null,
  weather_kind text not null check (
    weather_kind in ('clear', 'cloudy', 'rain', 'snow', 'night')
  ),
  local_time text not null,
  created_at timestamptz not null default now(),
  status text not null default 'published' check (
    status in ('published', 'hidden')
  )
);

create index if not exists postcards_created_at_idx
  on public.postcards (created_at desc);

alter table public.postcards
  add column if not exists humidity smallint,
  add column if not exists nickname text,
  add column if not exists apparent_temperature smallint,
  add column if not exists wind_speed smallint,
  add column if not exists precipitation numeric(6, 2);

alter table public.postcards enable row level security;

-- API writes with the server-only service role key. No browser writes directly.
