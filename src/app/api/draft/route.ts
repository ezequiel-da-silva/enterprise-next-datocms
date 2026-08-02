import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { runEnableDraft } from "@/app/api/draft/run-enable-draft";

export const dynamic = "force-dynamic";

/**
 * Web Previews (Visual Editing): o plugin chama com `redirect` + token/secret na query.
 * Links manuais: `?secret=…&slug=sobre` (slug `home` → `/`).
 */
export async function GET(request: NextRequest) {
  const result = await runEnableDraft(request);
  if (result.kind === "error") {
    return result.response;
  }
  redirect(result.path);
}
