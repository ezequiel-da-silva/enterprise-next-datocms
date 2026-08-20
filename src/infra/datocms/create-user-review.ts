import { buildClient, type Client } from "@datocms/cma-client-node";
import { toDatoSiteLocale } from "@/constants/i18n";
import type {
  CreateUserReviewPayload,
  CreateUserReviewResult,
  UserReviewCreator,
} from "@/core/ports/user-review-creator";

const USER_REVIEW_API_KEY = "user_review";

let cachedClient: Client | null = null;
let cachedItemTypeId: string | null = null;

function readReviewsCmaToken(): string | undefined {
  const raw = process.env.DATOCMS_USER_REVIEWS_CDA_TOKEN;
  return typeof raw === "string" && raw.trim() !== "" ? raw.trim() : undefined;
}

function getClient(): Client | null {
  const token = readReviewsCmaToken();
  if (!token) return null;
  if (!cachedClient) {
    cachedClient = buildClient({ apiToken: token });
  }
  return cachedClient;
}

async function resolveUserReviewItemTypeId(client: Client): Promise<string> {
  if (cachedItemTypeId) return cachedItemTypeId;

  const itemTypes = await client.itemTypes.list();
  const match = itemTypes.find((t) => t.api_key === USER_REVIEW_API_KEY);
  if (!match?.id) {
    throw new Error(`DatoCMS item type "${USER_REVIEW_API_KEY}" not found`);
  }
  cachedItemTypeId = match.id;
  return match.id;
}

/**
 * Cria um User Review em **draft** via CMA (sem publish) para moderação.
 *
 * Env: `DATOCMS_USER_REVIEWS_CDA_TOKEN` deve ser um **token CMA** com permissão
 * de criar records do model `user_review` (CDA não cria conteúdo).
 */
export async function createPendingUserReview(
  payload: CreateUserReviewPayload,
): Promise<CreateUserReviewResult> {
  const client = getClient();
  if (!client) {
    return { ok: false, reason: "not_configured" };
  }

  const datoLocale = toDatoSiteLocale(payload.locale);

  try {
    const itemTypeId = await resolveUserReviewItemTypeId(client);

    await client.items.create({
      item_type: { type: "item_type", id: itemTypeId },
      author_name: { [datoLocale]: payload.authorName },
      author_email: payload.authorEmail,
      rating: payload.rating,
      comment: { [datoLocale]: payload.comment },
    });

    return { ok: true };
  } catch (err) {
    console.error("[createPendingUserReview] CMA create failed", err);
    return { ok: false, reason: "transport_error" };
  }
}

export const createPendingUserReviewAsCreator: UserReviewCreator = createPendingUserReview;

/** @internal — testes / reinício de cache em hot-reload. */
export function __resetUserReviewCmaCacheForTests(): void {
  cachedClient = null;
  cachedItemTypeId = null;
}
