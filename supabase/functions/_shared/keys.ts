// Supabase API keys for edge functions.
//
// Supabase is migrating to JWT Signing Keys: the legacy `SUPABASE_ANON_KEY` and
// `SUPABASE_SERVICE_ROLE_KEY` are deprecated in favour of
// `SUPABASE_PUBLISHABLE_KEY` (public, RLS-enforced) and `SUPABASE_SECRET_KEY`
// (server-only, bypasses RLS). Prefer the new names and fall back to the legacy
// ones so functions keep working until the project is fully migrated.

export const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';

export const PUBLISHABLE_KEY =
  Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ??
  Deno.env.get('SUPABASE_ANON_KEY') ??
  '';

export const SECRET_KEY =
  Deno.env.get('SUPABASE_SECRET_KEY') ??
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
  '';
