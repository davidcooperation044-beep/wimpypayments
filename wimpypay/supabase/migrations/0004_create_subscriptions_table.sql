create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null check (status in ('active','cancelled','past_due')),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can insert own subscriptions" on public.subscriptions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own subscriptions" on public.subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
