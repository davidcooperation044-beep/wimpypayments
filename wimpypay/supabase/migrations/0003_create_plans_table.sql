create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  name text not null,
  price numeric not null,
  billing_interval text not null check (billing_interval in ('monthly','yearly')),
  created_at timestamptz not null default now()
);

alter table public.plans enable row level security;

create policy "Anyone can view plans" on public.plans for select using (true);
create policy "Service role can manage plans" on public.plans for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
