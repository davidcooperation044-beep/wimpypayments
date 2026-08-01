create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  type text not null check (type in ('fund','charge','refund')),
  amount numeric not null,
  status text not null default 'pending' check (status in ('pending','success','failed')),
  provider_reference text,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions" on public.transactions
  for select using (
    exists (
      select 1 from public.wallets w where w.id = wallet_id and auth.uid() = w.user_id
    )
  );

create policy "Users can insert own transactions" on public.transactions
  for insert with check (
    exists (
      select 1 from public.wallets w where w.id = wallet_id and auth.uid() = w.user_id
    )
  );
