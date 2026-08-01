create function public.charge_wallet_for_external_purchase(
  wallet_user_id uuid,
  purchase_amount numeric,
  purchase_currency text,
  purchase_reference text,
  purchase_description text
)
returns table (
  transaction_reference text,
  new_balance numeric,
  currency text
)
language plpgsql
security definer
as $$
declare
  wallet_row public.wallets%rowtype;
  new_balance numeric;
  transaction_id uuid;
begin
  select * into wallet_row
  from public.wallets
  where user_id = wallet_user_id
  limit 1;

  if wallet_row.id is null then
    raise exception 'wallet-not-found';
  end if;

  if wallet_row.balance < purchase_amount then
    raise exception 'insufficient-funds';
  end if;

  new_balance := wallet_row.balance - purchase_amount;

  update public.wallets
  set balance = new_balance,
      currency = coalesce(purchase_currency, currency),
      updated_at = now()
  where id = wallet_row.id;

  insert into public.transactions (
    wallet_id,
    type,
    amount,
    status,
    provider_reference
  ) values (
    wallet_row.id,
    'charge',
    purchase_amount,
    'success',
    purchase_reference
  ) returning id into transaction_id;

  return query
  select
    purchase_reference,
    new_balance,
    coalesce(purchase_currency, wallet_row.currency);
end;
$$;
