# Admin Settings — Visitor & Signup Insights

A new creator-only "Admin Settings" page (sidebar entry) showing who has visited the app and who has created an account.

## About visitor identity (important)

The browser cannot read its own IP address. A visit must be recorded by the server, which does see the caller's IP. So:

- Visitors without an account are identified by the IP address the server sees, plus a random "device id" saved in the visitor's browser (stable per browser/device, survives reloads).
- IPs are stored hashed (one-way) so raw addresses are never kept, and a short display form (e.g. `103.21.x.x`) is kept for the table.
- Caveats to expect: mobile networks and offices share IPs, VPNs change them, and clearing browser data resets the device id. So counts are close estimates, not exact people.
- Visitors who signed in are shown by email/username instead.

## What gets built

1. **Visit logging** — every page load calls a small server endpoint that records: device id, hashed IP + masked IP, first seen, last seen, visit count, user agent (browser/OS), and the signed-in user (when there is one).
2. **Admin Settings page** (`/admin-settings`, creator-only, sidebar entry above Settings):
   - Summary cards: total visitors, total accounts created, visitors without an account, visits in the last 7 days.
   - **Top 10 visitors table**: identity (email/username, else masked IP + short device id), visits, first seen, last seen, browser/OS, and whether an account exists.
   - Below the table: "+ N more visitors" with the remaining counts summarised (registered vs anonymous).
   - **Top 10 accounts table**: email/username and signup date, then "+ N more accounts".
   - Non-creator accounts visiting the route see a "not available" message and are sent back to the dashboard.

## Technical details

- Migration: new table `public.visitor_events` (id, device_id text unique, ip_hash text, ip_masked text, user_id uuid null, email text null, user_agent text, visit_count int default 1, first_seen, last_seen). GRANTs: `service_role` only (no anon/authenticated grants) plus RLS enabled with no public policies — all access goes through edge functions.
- New edge function `track-visit`: reads IP from `x-forwarded-for`, hashes it with the existing `AMOUNT_ENCRYPTION_KEY`-style secret (SHA-256 + secret salt), upserts on `device_id`, increments `visit_count`, links `user_id`/`email` when a valid JWT is sent. Uses `SECRET_KEY` from `_shared/keys.ts`. Public (no auth required), rate-limited by only pinging once per session.
- Extend `admin-settings` (or add `admin-stats`) with a creator-gated `GET` returning: summary counts, top 10 visitors by `visit_count`, top 10 accounts by `created_at` (from `profiles` + `auth.users` via service role), and remainder counts. Reuses the existing `CREATOR_EMAIL` check pattern.
- Frontend: `src/lib/visitor.ts` (device id in `localStorage`, one ping per session via `sessionStorage`), called from `App.tsx`; new lazy page `src/pages/AdminSettings.tsx` using existing `GlassCard`/table styling; sidebar item in `AppSidebar.tsx` shown only when `is_creator` (via the existing `demo-user.ts` settings cache); protected route in `App.tsx`.
- Docs page gets a short "Admin Settings" section describing the page and the IP-estimate caveat.
