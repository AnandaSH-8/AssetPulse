import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, requireAuth } from "../lib/supabase";
import { decryptNumber } from "../lib/encryption";

export default defineTool({
  name: "get_stats",
  title: "Get portfolio statistics",
  description:
    "Aggregate the signed-in user's financial particulars: total amount, cash, investment, entry count, per-category breakdown, and average.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const guard = requireAuth(ctx);
    if (guard) return guard;
    const { data, error } = await supabaseForUser(ctx)
      .from("financial_particulars")
      .select("category, amount, cash, investment")
      .eq("user_id", ctx.getUserId());
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const rows = await Promise.all(
      (data ?? []).map(async (item: any) => ({
        category: item.category as string,
        amount: await decryptNumber(item.amount),
        cash: await decryptNumber(item.cash),
        investment: await decryptNumber(item.investment),
      })),
    );
    const total_amount = rows.reduce((s, r) => s + r.amount, 0);
    const total_cash = rows.reduce((s, r) => s + r.cash, 0);
    const total_investment = rows.reduce((s, r) => s + r.investment, 0);
    const category_breakdown: Record<string, number> = {};
    for (const r of rows) category_breakdown[r.category] = (category_breakdown[r.category] ?? 0) + r.amount;
    const stats = {
      total_amount,
      total_cash,
      total_investment,
      total_entries: rows.length,
      category_breakdown,
      average_amount: rows.length ? total_amount / rows.length : 0,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      structuredContent: stats,
    };
  },
});
