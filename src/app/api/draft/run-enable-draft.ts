import { draftMode } from "next/headers";
import { type NextRequest } from "next/server";
import { isRelativeUrl, makeDraftModeWorkWithinIframes } from "@/app/api/cors-utils";
import { DEFAULT_APP_LOCALE } from "@/constants/i18n";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { isSecretEqual } from "@/lib/security/compare-secret";

function getExpectedSecret(): string | undefined {
  return process.env.DATOCMS_PREVIEW_SECRET?.trim();
}

function isAuthorized(request: NextRequest): boolean {
  const expected = getExpectedSecret();
  if (!expected) {
    return false;
  }
  const token = request.nextUrl.searchParams.get("token");
  const secret = request.nextUrl.searchParams.get("secret");
  return isSecretEqual(token, expected) || isSecretEqual(secret, expected);
}

export type EnableDraftResult =
  | { kind: "redirect"; path: string }
  | { kind: "error"; response: Response };

/**
 * Ativa Draft Mode e devolve o path interno para onde redirecionar.
 * Aceita `redirect` (Web Previews) ou `slug` (links manuais).
 */
export async function runEnableDraft(request: NextRequest): Promise<EnableDraftResult> {
  if (!getExpectedSecret()) {
    return { kind: "error", response: new Response("Preview secret not configured", { status: 500 }) };
  }

  if (!isAuthorized(request)) {
    return { kind: "error", response: new Response("Unauthorized", { status: 401 }) };
  }

  const redirectParam = request.nextUrl.searchParams.get("redirect");
  const slugRaw = request.nextUrl.searchParams.get("slug");

  let path: string | null = null;

  if (redirectParam !== null && redirectParam.trim() !== "") {
    const r = redirectParam.trim();
    if (!isRelativeUrl(r)) {
      return { kind: "error", response: new Response("URL must be relative", { status: 422 }) };
    }
    path = r.startsWith("/") ? r : `/${r}`;
  } else if (slugRaw !== null && slugRaw.trim() !== "") {
    const slug = slugRaw.trim();
    if (slug.startsWith("/")) {
      path = slug;
    } else {
      path = cmsPageCanonicalPath(slug, DEFAULT_APP_LOCALE);
    }
  }

  if (!path) {
    return { kind: "error", response: new Response("Missing redirect or slug", { status: 400 }) };
  }

  const draft = await draftMode();
  draft.enable();
  await makeDraftModeWorkWithinIframes();

  return { kind: "redirect", path };
}
