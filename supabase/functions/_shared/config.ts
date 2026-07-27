// Shared identity config for edge functions.
// Both values come from Supabase secrets only — no literal fallbacks, so nothing
// identifying lives in source. Set `DEMO_EMAIL` and `CREATOR_EMAIL` as
// edge-function secrets for this project.

export const DEMO_EMAIL = (Deno.env.get('DEMO_EMAIL') || '').toLowerCase();

export const CREATOR_EMAIL = (Deno.env.get('CREATOR_EMAIL') || '').toLowerCase();
