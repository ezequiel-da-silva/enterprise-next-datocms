import { type NextRequest } from "next/server";
import { jsonWithCors, withCors } from "@/app/api/cors-utils";
import { recordToWebsitePath } from "@/lib/datocms/record-to-website-route";
import { isSecretEqual } from "@/lib/security/compare-secret";

export const dynamic = "force-dynamic";

type PreviewLink = {
  label: string;
  url: string;
  reloadPreviewOnRecordUpdate?: boolean | { delayInMs: number };
};

type PluginBody = {
  item?: {
    attributes?: Record<string, unknown>;
    meta?: { status?: string };
  };
  itemType?: {
    attributes?: { api_key?: string };
  };
  locale?: string;
};

function getExpectedSecret(): string | undefined {
  return process.env.DATOCMS_PREVIEW_SECRET?.trim();
}

export async function OPTIONS() {
  return new Response("OK", withCors());
}

/**
 * POST esperado pelo plugin Web Previews.
 * Configurar no Dato: `http://localhost:3000/api/preview-links?token=<DATOCMS_PREVIEW_SECRET>`
 */
export async function POST(request: NextRequest) {
  const expected = getExpectedSecret();
  const token = request.nextUrl.searchParams.get("token");

  if (!expected) {
    return jsonWithCors({ success: false, error: "Preview secret not configured" }, 500);
  }
  if (!isSecretEqual(token, expected)) {
    return jsonWithCors({ success: false, error: "Invalid token" }, 401);
  }

  let body: PluginBody;
  try {
    body = (await request.json()) as PluginBody;
  } catch {
    return jsonWithCors({ success: false, error: "Invalid JSON" }, 400);
  }

  const item = body.item;
  const itemType = body.itemType;
  if (!item || !itemType) {
    return jsonWithCors({ success: false, error: "Missing item or itemType" }, 422);
  }

  const path = recordToWebsitePath(item, itemType, { locale: body.locale });
  const previewLinks: PreviewLink[] = [];

  if (path) {
    const status = item.meta?.status;
    const draftEnable = new URL("/api/draft", request.url);
    draftEnable.searchParams.set("secret", expected);
    draftEnable.searchParams.set("redirect", path);

    if (status !== "published") {
      previewLinks.push({
        label: "Rascunho",
        url: draftEnable.toString(),
        reloadPreviewOnRecordUpdate: { delayInMs: 100 },
      });
    }

    if (status !== "draft") {
      const published = new URL("/api/disable-draft", request.url);
      published.searchParams.set("redirect", path);
      previewLinks.push({
        label: "Publicado",
        url: published.toString(),
      });
    }
  }

  return jsonWithCors({ previewLinks });
}
