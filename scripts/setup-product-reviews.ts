/**
 * Creates the `product_review` model and a `reviews` links field on `product_page`.
 *
 * Idempotent: model/fields are created only when missing.
 *
 *   npx datocms cma:script scripts/setup-product-reviews.ts --profile=staging
 *   npx datocms cma:script scripts/setup-product-reviews.ts --profile=default
 *
 * With `PRODUCT_REVIEWS_SEED=1`, creates sample reviews and links them on
 * hydrogen / liquid product pages that have an empty `reviews` list.
 */
import { ApiError, type ApiTypes } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";
import { asLocalized, field, publishIfDraftModel } from "./lib/dato-script-helpers";

const REVIEW_MODEL = "product_review";
const PRODUCT_MODEL = "product_page";

type SeedReview = {
  match: string;
  author: string;
  rating: number;
  title: Record<string, string>;
  comment: Record<string, string>;
  verified: boolean;
  date: string;
};

const SEEDS: SeedReview[] = [
  {
    match: "hydrogen",
    author: "Ana R.",
    rating: 5,
    title: {
      en: "All-mountain favourite",
      "pt-BR": "Favorita all-mountain",
      es: "Favorita all-mountain",
    },
    comment: {
      en: "Stable at speed and still playful in the park. True to size.",
      "pt-BR": "Estável em velocidade e divertida no park. Tamanho fiel.",
      es: "Estable a velocidad y divertida en el park. Talla fiel.",
    },
    verified: true,
    date: "2025-12-01",
  },
  {
    match: "liquid",
    author: "Marco S.",
    rating: 4,
    title: {
      en: "Floats when it matters",
      "pt-BR": "Flutua quando importa",
      es: "Flota cuando importa",
    },
    comment: {
      en: "Great in powder; a bit soft on hardpack for aggressive carving.",
      "pt-BR": "Óptima em powder; um pouco mole em pista dura para carving agressivo.",
      es: "Genial en powder; un poco blanda en pista dura para carving agresivo.",
    },
    verified: true,
    date: "2026-01-15",
  },
];

async function findItemType(client: Client, apiKey: string) {
  try {
    return await client.itemTypes.find(apiKey);
  } catch (error) {
    if (error instanceof ApiError && (error.response.status === 404 || error.response.status === 422)) {
      return null;
    }
    throw error;
  }
}

async function fieldExists(client: Client, pointer: string): Promise<boolean> {
  try {
    await client.fields.find(pointer);
    return true;
  } catch (error) {
    if (error instanceof ApiError && (error.response.status === 404 || error.response.status === 422)) {
      return false;
    }
    throw error;
  }
}

async function ensureField(
  client: Client,
  itemTypeId: string,
  pointer: string,
  body: ApiTypes.FieldCreateSchema,
): Promise<ApiTypes.Field | null> {
  if (await fieldExists(client, pointer)) {
    console.log(`  campo já existe: ${pointer}`);
    try {
      return await client.fields.find(pointer);
    } catch {
      return null;
    }
  }
  try {
    const created = await client.fields.create(itemTypeId, body);
    console.log(`  campo criado: ${pointer}`);
    return created;
  } catch (error) {
    if (error instanceof ApiError && error.response.status === 422) {
      console.log(`  campo já existe (422): ${pointer}`);
      try {
        return await client.fields.find(pointer);
      } catch {
        return null;
      }
    }
    throw error;
  }
}

function readHandle(item: object): string {
  const raw = field(item, "shopify_handle");
  if (typeof raw === "string") return raw.trim();
  for (const value of Object.values(asLocalized<string>(raw))) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function localizedMap(locales: string[], copy: Record<string, string>): Record<string, string> {
  const fallback = copy.en ?? Object.values(copy)[0] ?? "";
  return Object.fromEntries(locales.map((locale) => [locale, copy[locale] ?? fallback]));
}

async function ensureReviewModel(client: Client): Promise<{ id: string; authorFieldId: string | null }> {
  let model = await findItemType(client, REVIEW_MODEL);
  if (!model) {
    model = await client.itemTypes.create({
      name: "Product review",
      api_key: REVIEW_MODEL,
      modular_block: false,
      draft_mode_active: true,
      collection_appearance: "table",
      hint: "Curated rider reviews linked from product pages. Draft until published.",
    });
    console.log(`  modelo criado: ${REVIEW_MODEL}`);
  } else {
    console.log(`  modelo já existe: ${REVIEW_MODEL}`);
  }

  const author = await ensureField(client, model.id, `${REVIEW_MODEL}::author_name`, {
    label: "Author name",
    api_key: "author_name",
    field_type: "string",
    localized: false,
    validators: { required: {}, length: { max: 80 } },
    appearance: { editor: "single_line", parameters: { heading: false, placeholder: null }, addons: [] },
  });

  await ensureField(client, model.id, `${REVIEW_MODEL}::rating`, {
    label: "Rating",
    api_key: "rating",
    field_type: "integer",
    localized: false,
    validators: { required: {}, number_range: { min: 1, max: 5 } },
    appearance: { editor: "integer", parameters: {}, addons: [] },
  });

  await ensureField(client, model.id, `${REVIEW_MODEL}::title`, {
    label: "Title",
    api_key: "title",
    field_type: "string",
    localized: true,
    validators: { length: { max: 120 } },
    appearance: { editor: "single_line", parameters: { heading: false, placeholder: null }, addons: [] },
  });

  await ensureField(client, model.id, `${REVIEW_MODEL}::comment`, {
    label: "Comment",
    api_key: "comment",
    field_type: "text",
    localized: true,
    validators: { required: {}, length: { max: 2000 } },
    appearance: { editor: "textarea", parameters: { placeholder: null }, addons: [] },
  });

  await ensureField(client, model.id, `${REVIEW_MODEL}::verified_rider`, {
    label: "Verified rider",
    api_key: "verified_rider",
    field_type: "boolean",
    localized: false,
    default_value: false,
    appearance: { editor: "boolean", parameters: {}, addons: [] },
  });

  await ensureField(client, model.id, `${REVIEW_MODEL}::date`, {
    label: "Review date",
    api_key: "date",
    field_type: "date",
    localized: false,
    appearance: { editor: "date_picker", parameters: {}, addons: [] },
  });

  if (author?.id) {
    try {
      await client.itemTypes.update(model.id, {
        title_field: { id: author.id, type: "field" },
      });
      console.log("  title_field → author_name");
    } catch (error) {
      console.log(`  skip title_field: ${String(error)}`);
    }
  }

  return { id: model.id, authorFieldId: author?.id ?? null };
}

async function ensureProductReviewsField(client: Client, reviewModelId: string): Promise<void> {
  const product = await client.itemTypes.find(PRODUCT_MODEL);
  const fieldsets = await client.fieldsets.list(product.id);
  const fieldset =
    fieldsets.find((fs) => fs.title === "Reviews") ??
    (await client.fieldsets.create(product.id, {
      title: "Reviews",
      hint: "Link curated product_review records shown on the PDP.",
      collapsible: true,
      start_collapsed: false,
    }));

  const pointer = `${PRODUCT_MODEL}::reviews`;
  if (await fieldExists(client, pointer)) {
    console.log(`  campo já existe: ${pointer}`);
    return;
  }
  try {
    await client.fields.create(product.id, {
      label: "Reviews",
      api_key: "reviews",
      field_type: "links",
      localized: false,
      fieldset: { type: "fieldset", id: fieldset.id },
      validators: {
        items_item_type: {
          item_types: [reviewModelId],
        },
      },
      appearance: {
        editor: "links_select",
        parameters: {},
        addons: [],
      },
    });
    console.log(`  campo criado: ${pointer}`);
  } catch (error) {
    if (error instanceof ApiError) {
      console.log(`  falha ao criar ${pointer}:`, JSON.stringify(error.response.body));
    }
    throw error;
  }
}

async function seedReviews(client: Client, locales: string[], reviewModelId: string): Promise<void> {
  for (const seed of SEEDS) {
    let productId: string | null = null;
    let existingReviews: string[] = [];

    for await (const item of client.items.listPagedIterator({
      filter: { type: PRODUCT_MODEL },
      version: "current",
    })) {
      const handle = readHandle(item).toLowerCase();
      if (!handle.includes(seed.match)) continue;
      productId = item.id;
      const raw = field(item, "reviews");
      existingReviews = Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : [];
      break;
    }

    if (!productId) {
      console.log(`  seed: nenhuma product_page com handle a conter "${seed.match}"`);
      continue;
    }
    if (existingReviews.length > 0) {
      console.log(`  seed ignorado (reviews já ligadas): ${seed.match}`);
      continue;
    }

    const created = await client.items.create({
      item_type: { type: "item_type", id: reviewModelId },
      author_name: seed.author,
      rating: seed.rating,
      title: localizedMap(locales, seed.title),
      comment: localizedMap(locales, seed.comment),
      verified_rider: seed.verified,
      date: seed.date,
    });
    await publishIfDraftModel(client, await client.items.find(created.id), `review:${seed.author}`);

    await client.items.update(productId, { reviews: [created.id] });
    await publishIfDraftModel(client, await client.items.find(productId), `product link:${seed.match}`);
    console.log(`  seed ligado: ${seed.match} ← ${seed.author}`);
  }
}

export default async function setupProductReviews(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name}) — locales: ${site.locales.join(", ")}`);

  const review = await ensureReviewModel(client);
  await ensureProductReviewsField(client, review.id);

  if (process.env.PRODUCT_REVIEWS_SEED === "1") {
    await seedReviews(client, site.locales, review.id);
  } else {
    console.log("  seed omitido (defina PRODUCT_REVIEWS_SEED=1 para criar reviews de exemplo)");
  }
}
