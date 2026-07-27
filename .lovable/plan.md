## Decision

Keep the creator identity server-side only. No `VITE_CREATOR_EMAIL` in `.env` or in the bundle.

## Current wiring (already in place — no code changes needed)

- `CREATOR_EMAIL` exists only as a Supabase edge-function secret.
- `supabase/functions/_shared/config.ts` reads it via `Deno.env.get('CREATOR_EMAIL')`.
- `admin-settings` compares the caller's JWT email to that secret and returns `is_creator`.
- `src/lib/demo-user.ts` and `src/pages/Settings.tsx` gate creator-only UI on that returned flag.
- `.env.example` and `src/config/app-config.ts` document why the var is intentionally absent.

## Optional verification step

Call the deployed `admin-settings` function with the current preview session and confirm the response contains `is_creator` and `demo_editable`, proving the gating works without any client-side email.

## Technical notes

Any `VITE_*` value is inlined into the JS bundle at build time, so a client-side creator email is both publicly visible and trivially spoofable. Server-side comparison against the JWT email is the only trustworthy check.
