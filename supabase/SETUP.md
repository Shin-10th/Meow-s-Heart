# Supabase setup for Meow's Heart

1. Go to https://supabase.com and create a free account, then click "New project".
   - Pick any project name (e.g. `meows-heart`) and a database password (save it somewhere safe).
   - Wait ~2 minutes for the project to finish provisioning.

2. Load the database schema:
   - In the Supabase dashboard, open **SQL Editor** (left sidebar) -> **New query**.
   - Open `supabase/schema.sql` from this project, copy its entire contents, paste into the SQL editor, and click **Run**.
   - This creates all tables (profiles, categories, products, orders, order_items, loyalty_transactions, consultation_bookings, contact_messages), row-level security policies, the auto-profile-creation trigger, the loyalty-paws trigger, and a handful of sample products so the Shop page isn't empty.

3. Get your API keys:
   - Go to **Project Settings** (gear icon) -> **API**.
   - Copy the **Project URL** and the **anon / public** key.

4. Configure the app:
   - In this project folder, copy `.env.example` to `.env`.
   - Paste your Project URL into `VITE_SUPABASE_URL` and the anon key into `VITE_SUPABASE_ANON_KEY`.
   - Restart `npm run dev` if it's already running.

5. Make yourself an admin (optional, needed to use `/admin`):
   - Sign up for an account on the running site first (Login page -> Create account).
   - In Supabase, go to **Table Editor** -> `profiles`, find your row, and set `is_admin` to `true`.

That's it — products, accounts, cart checkout, loyalty paws, consultation bookings, and the contact form will all read/write to your Supabase project.
