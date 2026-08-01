# Wimpy ID

Authentication and profile management service.

## Supabase project decision
This service uses the same Supabase project as Wimpy Pay so wallet and subscription data can reference auth.users directly through Postgres foreign keys.

## Local setup
1. Copy .env.local to .env.local and fill in the real Supabase project values.
2. In Supabase Auth, enable email/password, email confirmations, password reset, and Google OAuth.
3. Apply the SQL migration in the Supabase SQL editor.
4. Install dependencies with npm install.
5. Run npm run dev.
