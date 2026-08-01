
# Wimpy ID and Wimpy Pay

This repository now contains two standalone services that can run independently while sharing one Supabase project.

## Shared Supabase decision
Both services use the same Supabase project. That allows Wimpy Pay tables to reference auth.users from Wimpy ID directly through Postgres foreign keys, which is the simplest and most reliable setup for this phase.

## Local run instructions
1. Copy the example environment files for both services and fill in your Supabase values.
2. Install dependencies in each service folder:
   - npm install
3. Start the services:
   - WimpyID: npm run dev (available at http://localhost:3000)
   - WimpyPay: npm run dev (available at http://localhost:3001)

## End-to-end demo
With a test account created in Supabase Auth, the Wimpy ID service can handle signup, login, verification, password reset, and profile management. Wimpy Pay can then create a wallet, fund it through the provider flow, list transactions, and manage a demo subscription plan.
>>>>>>> c334fbe (Initial commit)
