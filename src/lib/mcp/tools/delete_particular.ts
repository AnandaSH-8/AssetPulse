import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, requireAuth, requireWritable } from "../lib/supabase";

export default defineTool({
  name: "delete_particular",
  title: "Delete financial particular",
  description: "Delete a financial particular by id for the signed-in user. Irreversible.",
  inputSchema: {
    id: z.string().uuid(),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    const guard = requireAuth(ctx);
    if (guard) return guard;
    const { error } = await supabaseForUser(ctx)
      .from("financial_particulars")
      .delete()
      .eq("id", id)
      .eq("user_id", ctx.getUserId());
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Deleted ${id}` }],
      structuredContent: { id, deleted: true },
    };
  },
});
