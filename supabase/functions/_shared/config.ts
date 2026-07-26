// Shared identity config for edge functions.
// Values are overridable via secrets; fallbacks match the frontend config in
// src/config/app-config.ts so both runtimes agree on who the demo user is.

export const DEMO_EMAIL = (Deno.env.get('DEMO_EMAIL') || 'user@yopmail.com').toLowerCase();

export const CREATOR_EMAIL = (Deno.env.get('CREATOR_EMAIL') || '').toLowerCase();
