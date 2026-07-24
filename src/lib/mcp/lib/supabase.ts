import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

export function supabaseForUser(ctx: ToolContext): SupabaseClient {
  const env = (globalThis as any).process?.env ?? {};
  const url = env.SUPABASE_URL as string;
  const key = (env.SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_ANON_KEY) as string;
  if (!url || !key) throw new Error("Supabase env not configured");
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function requireAuth(ctx: ToolContext) {
  if (!ctx.isAuthenticated()) {
    return { content: [{ type: "text" as const, text: "Not authenticated" }], isError: true };
  }
  return null;
}

// Enforce demo read-only mode server-side. The demo account credentials are
// public, so a caller could invoke MCP tools directly to write to the shared
// demo dataset. Block writes when the caller is the demo user and the
// `demo_editable` flag is off.
export async function requireWritable(ctx: ToolContext) {
  const env = (globalThis as any).process?.env ?? {};
  const demoEmail = (env.DEMO_EMAIL || "user@yopmail.com").toLowerCase();
  const callerEmail = (((ctx as any).getUser?.() ?? (ctx as any).user)?.email || "").toLowerCase();
  if (callerEmail !== demoEmail) return null;

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  const url = env.SUPABASE_URL as string | undefined;
  if (url && serviceKey) {
    try {
      const admin = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data } = await admin
        .from("app_settings")
        .select("value")
        .eq("key", "demo_editable")
        .maybeSingle();
      if (data?.value === true) return null;
    } catch {
      // fall through to deny
    }
  }
  return {
    content: [{ type: "text" as const, text: "Demo account is read-only" }],
    isError: true,
  };
}
