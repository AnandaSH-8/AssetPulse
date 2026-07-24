import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, requireAuth, requireWritable } from "../lib/supabase";
import { encryptNumber, decryptRecord } from "../lib/encryption";

const sanitize = (t: string) => t.replace(/[<>"']/g, "");

export default defineTool({
  name: "update_particular",
  title: "Update financial particular",
  description: "Update an existing financial particular by id for the signed-in user.",
  inputSchema: {
    id: z.string().uuid(),
    category: z.string().trim().min(1).max(50).optional(),
    description: z.string().trim().max(500).optional(),
    amount: z.number().positive().optional(),
    cash: z.number().min(0).optional(),
    investment: z.number().min(0).optional(),
    current_value: z.number().min(0).optional(),
    month: z.string().trim().max(20).optional(),
    month_number: z.number().int().min(1).max(12).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ id, ...input }, ctx) => {
    const guard = requireAuth(ctx);
    if (guard) return guard;
    const writeGuard = await requireWritable(ctx);
    if (writeGuard) return writeGuard;
    const updates: Record<string, any> = {};
    if (input.category !== undefined) updates.category = sanitize(input.category);
    if (input.description !== undefined) updates.description = sanitize(input.description);
    if (input.month !== undefined) updates.month = sanitize(input.month);
    if (input.month_number !== undefined) updates.month_number = input.month_number;
    if (typeof input.amount === "number") updates.amount = await encryptNumber(input.amount);
    if (typeof input.cash === "number") updates.cash = await encryptNumber(input.cash);
    if (typeof input.investment === "number") updates.investment = await encryptNumber(input.investment);
    if (typeof input.current_value === "number") updates.current_value = await encryptNumber(input.current_value);
    const { data, error } = await supabaseForUser(ctx)
      .from("financial_particulars")
      .update(updates)
      .eq("id", id)
      .eq("user_id", ctx.getUserId())
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
