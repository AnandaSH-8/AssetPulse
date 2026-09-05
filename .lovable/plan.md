# Complete the environment variable files

## What's happening now

The example file lists five settings, but the real `.env` only has three — the demo login email and password are missing there. Separately, some server-side settings (used by the backend functions) aren't documented anywhere.

## What I'll do

1. Add the two missing demo entries to `.env` so the sign-in page can pre-fill the demo account again:
   - `VITE_DEMO_EMAIL=user@yopmail.com`
   - `VITE_DEMO_PASSWORD=userAssets@123`

2. Rewrite `.env.example` as the full, documented reference, grouped in two sections:
   - Browser settings (safe to ship): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `VITE_DEMO_EMAIL`, `VITE_DEMO_PASSWORD`
   - Server-only secrets, documented as reference with placeholder values and a note that they are set in Supabase, not in this file: `AMOUNT_ENCRYPTION_KEY`, `CREATOR_EMAIL`, `DEMO_EMAIL`, and the auto-provided `SUPABASE_URL`, `SUPABASE_ANON_KEY` / `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Notes

- No real secret values go into `.env.example` — placeholders only.
- The demo email/password are already printed on the sign-in page, so putting them in `.env` changes nothing about safety.
- No application code changes; only these two files.
