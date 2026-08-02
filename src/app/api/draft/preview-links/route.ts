import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { runEnableDraft } from "@/app/api/draft/run-enable-draft";

export const dynamic = "force-dynamic";

/**
 * Alias para quem configurou por engano o campo "Enable draft mode" no Dato
 * com `/api/draft/preview-links` em vez de `/api/draft`.
 */
export async function GET(request: NextRequest) {
  const result = await runEnableDraft(request);
  if (result.kind === "error") {
    return result.response;
  }
  redirect(result.path);
}
