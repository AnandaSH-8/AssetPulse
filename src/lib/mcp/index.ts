import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listParticularsTool from "./tools/list_particulars";
import getStatsTool from "./tools/get_stats";
import createParticularTool from "./tools/create_particular";
import updateParticularTool from "./tools/update_particular";
import deleteParticularTool from "./tools/delete_particular";

// The OAuth issuer must be the direct supabase.co host, built from the project ref.
// VITE_SUPABASE_PROJECT_ID is inlined by Vite at build time (import-safe).
const projectRef =
  (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "assetpulse-mcp",
  title: "AssetPulse MCP",
  version: "0.1.0",
  instructions:
    "Tools for AssetPulse — a personal finance / assets tracker. Use `list_particulars` and `get_stats` to read the signed-in user's portfolio. Use `create_particular`, `update_particular`, and `delete_particular` to modify entries. Monetary values are encrypted at rest and returned as decrypted numbers.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listParticularsTool,
    getStatsTool,
    createParticularTool,
    updateParticularTool,
    deleteParticularTool,
  ],
});
