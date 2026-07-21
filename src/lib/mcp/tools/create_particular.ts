import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, requireAuth } from "../lib/supabase";
import { encryptNumber, decryptRecord } from "../lib/encryption";

const sanitize = (t: string) => t.replace(/[<>"']/g, "");

export default defineTool({
  name: "create_particular",
  title: "Create financial particular",
  description:
    "Insert a new financial particular for the signed-in user. Monetary values are encrypted at rest.",
  inputSchema: {
    category: z.string().trim().min(1).max(50),
    description: z.string().trim().max(500).optional(),
    amount: z.number().positive(),
    cash: z.number().min(0).optional(),
    investment: z.number().min(0).optional(),
    current_value: z.number().min(0).optional(),
    month: z.string().trim().max(20).optional(),
    month_number: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(1900).max(2100).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const guard = requireAuth(ctx);
    if (guard) return guard;
    const { data, error } = await supabaseForUser(ctx)
      .from("financial_particulars")
      .insert({
        user_id: ctx.getUserId(),
        category: sanitize(input.category),
        description: input.description ? sanitize(input.description) : null,
        amount: await encryptNumber(input.amount),
        cash: await encryptNumber(input.cash ?? 0),
        investment: await encryptNumber(input.investment ?? 0),
        current_value: await encryptNumber(input.current_value ?? 0),
        month: input.month ? sanitize(input.month) : null,
        month_number: input.month_number ?? null,
        year: input.year ?? new Date().getFullYear(),
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const row = data ? await decryptRecord(data) : data;
    return {
      content: [{ type: "text", text: JSON.stringify(row, null, 2) }],
      structuredContent: { row },
    };
  },
});
