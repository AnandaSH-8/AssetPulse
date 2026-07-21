import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, requireAuth } from "../lib/supabase";
import { decryptRecord } from "../lib/encryption";

export default defineTool({
  name: "list_particulars",
  title: "List financial particulars",
  description:
    "List the signed-in user's financial particulars (assets/entries). Optionally filter by month and year, and cap the result count.",
  inputSchema: {
    month: z.string().optional().describe("Month name filter, e.g. 'Jan'."),
    year: z.number().int().optional().describe("Year filter, e.g. 2026."),
    limit: z.number().int().min(1).max(500).optional().describe("Max rows (default 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ month, year, limit }, ctx) => {
    const guard = requireAuth(ctx);
    if (guard) return guard;
    let q = supabaseForUser(ctx)
      .from("financial_particulars")
      .select("*")
      .eq("user_id", ctx.getUserId())
      .order("date_added", { ascending: false })
      .limit(limit ?? 100);
    if (month) q = q.eq("month", month);
    if (year) q = q.eq("year", year);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const rows = await Promise.all((data ?? []).map((r) => decryptRecord(r)));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { rows, count: rows.length },
    };
  },
});
