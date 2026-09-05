# Meow's Heart 🐾💗

A cosmetics e-commerce site — products, cart & checkout, accounts, a "Meow's Paws" loyalty program,
beauty consultation bookings, a contact form, and an admin panel.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Supabase (Postgres database, auth, row-level security)

## Getting started

```bash
npm install
npm run dev
```

The site works and renders without any setup, but data features (products, login/signup, cart
checkout, loyalty points, consultation bookings, contact form, and the admin panel) need a Supabase
project connected first — **see `supabase/SETUP.md` for step-by-step instructions.**

Once you have your Supabase URL and anon key:

```bash
cp .env.example .env
# then edit .env with your values
```

## Project structure

- `src/pages` — one file per route (Home, Shop, Cart, Checkout, About, Consultations, Contact,
  Loyalty, Login, Register, Account, and `admin/` for the admin panel).
- `src/components` — shared UI (header, footer, product card, route guards).
- `src/context` — React context for auth (`AuthContext`) and the shopping cart (`CartContext`,
  persisted to `localStorage`).
- `src/lib/supabase.ts` — the Supabase client.
- `supabase/schema.sql` — the full database schema, RLS policies, and sample product data. Run this
  once in your Supabase project's SQL editor.

## Admin panel

Visit `/admin` after making your account an admin (see step 5 in `supabase/SETUP.md`). From there you
can manage products, view/update orders, view consultation bookings, and read contact messages.

## Working with git branches

This project is a git repo with two branches:

- `main` — the safe, working version (what's described above).
- `pixelmeow-design` — an identical copy of `main`, reserved for trying out a riskier visual
  redesign without touching the working site.

To switch between them (from a terminal in this folder):

```bash
git checkout main              # back to the safe, current design
git checkout pixelmeow-design  # the experimental design branch
```

Whichever branch you have checked out is what `npm run dev` shows. Nothing you do on one branch
affects the other — if a design experiment goes badly, just `git checkout main` and it's like it
never happened. Once you're happy with a design branch, ask to have it merged into `main`.

New feature work (like the language toggle) lands on `main` first so both branches start from the
same up-to-date baseline; `pixelmeow-design` is only for the visual redesign itself.
