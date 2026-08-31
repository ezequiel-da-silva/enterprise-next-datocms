import { type NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { tagsToRevalidateFromWebhook, type DatoWebhookBody } from "@/lib/datocms/revalidate-tags";
import { isSecretEqual } from "@/lib/security/compare-secret";

export const dynamic = "force-dynamic";

function getExpectedSecret(): string | undefined {
  return process.env.DATOCMS_REVALIDATE_SECRET?.trim();
}

function readProvidedSecret(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (header && /^Bearer\s+/i.test(header)) {
    return header.replace(/^Bearer\s+/i, "").trim();
  }
  return request.nextUrl.searchParams.get("token");
}

/**
 * Webhook DatoCMS → `revalidateTag` das strings já usadas em `datocmsFetch`.
 * Auth: `Authorization: Bearer <DATOCMS_REVALIDATE_SECRET>` ou `?token=`.
 */
export async function POST(request: NextRequest) {
  const expected = getExpectedSecret();
  if (!expected) {
    return NextResponse.json({ error: "Revalidate secret not configured" }, { status: 500 });
  }
  if (!isSecretEqual(readProvidedSecret(request), expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: DatoWebhookBody = {};
  try {
    const text = await request.text();
    if (text.trim()) {
      body = JSON.parse(text) as DatoWebhookBody;
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const tags = tagsToRevalidateFromWebhook(body);
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: true, tags });
}
