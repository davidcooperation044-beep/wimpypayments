# Wimpy Pay

Wallet and subscription management service.

## Supabase project decision
This service uses the same Supabase project as Wimpy ID so wallet and subscription rows can reference auth.users directly.

## Local setup
1. Copy .env.local to .env.local and fill in the real Supabase and provider values.
2. Apply the SQL migrations in the Supabase SQL editor.
3. Create a test payment provider webhook endpoint and configure the provider credentials.
4. Install dependencies with npm install.
5. Run npm run dev.
