// Identity config for MCP tools. This module is bundled into the Deno edge
// function, so it reads from the process env rather than import.meta.env.
// Fallback mirrors src/config/app-config.ts.

const env = (globalThis as any).process?.env ?? {};

export const DEMO_EMAIL = (env.DEMO_EMAIL || 'user@yopmail.com').toLowerCase();
