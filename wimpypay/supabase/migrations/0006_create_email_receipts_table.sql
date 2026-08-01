create table if not exists public.email_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  transaction_reference text not null,
  sent_at timestamptz not null default now(),
  status text not null,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.email_receipts enable row level security;

create policy "Users can view own email receipts" on public.email_receipts
  for select using (auth.uid() = user_id);

create policy "Service can insert email receipts" on public.email_receipts
  for insert with check (true);
