create function public.charge_wallet_and_activate_subscription(
  wallet_id uuid,
  subscriber_user_id uuid,
  selected_plan_id uuid,
  amount numeric,
  provider_reference text,
  subscription_period_end timestamptz
)
returns table (
  subscription_id uuid,
  subscription_user_id uuid,
  subscription_plan_id uuid,
  subscription_status text,
  subscription_current_period_end timestamptz,
  subscription_created_at timestamptz
)
language plpgsql security definer
as $$
declare
  updated_wallet public.wallets%rowtype;
begin
  update public.wallets
  set balance = balance - amount
  where id = wallet_id and balance >= amount
  returning * into updated_wallet;

  if updated_wallet.id is null then
    raise exception 'insufficient-funds';
  end if;

  insert into public.transactions (
    wallet_id,
    type,
    amount,
    status,
    provider_reference
  ) values (
    wallet_id,
    'charge',
    amount,
    'success',
    provider_reference
  );

  return query
  insert into public.subscriptions (
    user_id,
    plan_id,
    status,
    current_period_end
  ) values (
    subscriber_user_id,
    selected_plan_id,
    'active',
    subscription_period_end
  ) returning
    id as subscription_id,
    user_id as subscription_user_id,
    plan_id as subscription_plan_id,
    status as subscription_status,
    current_period_end as subscription_current_period_end,
    created_at as subscription_created_at;
end;
$$;
