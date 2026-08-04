import { isRelativeUrl } from "@/app/api/cors-utils";
import { draftMode } from "next/headers";
import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();
  const r = request.nextUrl.searchParams.get("redirect") ?? "/";
  const target = isRelativeUrl(r) ? (r.startsWith("/") ? r : `/${r}`) : "/";
  redirect(target);
}
