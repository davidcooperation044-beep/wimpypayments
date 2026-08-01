create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  balance numeric not null default 0,
  currency text not null default 'NGN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wallets enable row level security;

create policy "Users can view own wallet" on public.wallets
  for select using (auth.uid() = user_id);

create policy "Users can insert own wallet" on public.wallets
  for insert with check (auth.uid() = user_id);

create policy "Users can update own wallet" on public.wallets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
