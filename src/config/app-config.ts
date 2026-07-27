/**
 * Single source of truth for the public demo account identity.
 *
 * These are intentionally NOT secrets — the demo credentials are printed on the
 * sign-in page for visitors to use, and any `VITE_*` value is inlined into the
 * browser bundle by Vite anyway. Actual protection comes from Supabase RLS and
 * the server-side `demo_editable` check in the edge functions.
 *
 * No literal fallbacks live here: if the env vars are absent the app simply
 * renders a normal empty sign-in form instead of shipping credentials in source.
 *
 * The creator identity is deliberately NOT exposed to the client. It lives only
 * as the `CREATOR_EMAIL` edge-function secret; the UI relies on the `is_creator`
 * flag returned by the `admin-settings` function.
 */

const env = import.meta.env;

export const DEMO_EMAIL = (env.VITE_DEMO_EMAIL || '').toLowerCase();
export const DEMO_PASSWORD = env.VITE_DEMO_PASSWORD || '';

/** True only when a demo account is configured for this deployment. */
export const HAS_DEMO_CREDENTIALS = !!DEMO_EMAIL && !!DEMO_PASSWORD;
