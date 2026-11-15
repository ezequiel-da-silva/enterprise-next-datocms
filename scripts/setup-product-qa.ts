/**
 * Creates the `product_question` model and a `questions` links field on `product_page`.
 *
 * Idempotent: model/fields are created only when missing.
 *
 *   npx datocms cma:script scripts/setup-product-qa.ts --profile=staging
 *   npx datocms cma:script scripts/setup-product-qa.ts --profile=default
 *
 * With `PRODUCT_QA_SEED=1`, creates sample Q&A (general fit/riding guidance, no shipping or
 * pricing claims) and links them on hydrogen / liquid product pages that have an empty
 * `questions` list.
 */
import { ApiError, type ApiTypes } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";
import { asLocalized, field, publishIfDraftModel } from "./lib/dato-script-helpers";

const QUESTION_MODEL = "product_question";
const PRODUCT_MODEL = "product_page";

type SeedQuestion = {
  match: string;
  question: Record<string, string>;
  answer: Record<string, string>;
};

const SEEDS: SeedQuestion[] = [
  {
    match: "hydrogen",
    question: {
      en: "How do I choose the right board length?",
      "pt-BR": "Como escolho o comprimento certo da prancha?",
      es: "¿Cómo elijo el largo correcto de la tabla?",
    },
    answer: {
      en: "Start from your height and weight and check the size guide on this page. Shorter boards turn quicker; longer boards are more stable at speed.",
      "pt-BR":
        "Parta da sua altura e peso e consulte o guia de tamanhos nesta página. Pranchas mais curtas viram mais rápido; as mais longas são mais estáveis em velocidade.",
      es: "Parte de tu altura y peso y consulta la guía de tallas de esta página. Las tablas más cortas giran más rápido; las más largas son más estables a velocidad.",
    },
  },
  {
    match: "liquid",
    question: {
      en: "Is this board suitable for powder days?",
      "pt-BR": "Esta prancha serve para dias de powder?",
      es: "¿Esta tabla sirve para días de powder?",
    },
    answer: {
      en: "Check the recommended terrain and camber profile in the specs above. Rocker-leaning profiles float better in deep snow.",
      "pt-BR":
        "Veja o terreno recomendado e o perfil de curvatura nas especificações acima. Perfis com mais rocker flutuam melhor em neve profunda.",
      es: "Consulta el terreno recomendado y el perfil de curvatura en las especificaciones. Los perfiles con más rocker flotan mejor en nieve profunda.",
    },
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

async function ensureQuestionModel(client: Client): Promise<{ id: string }> {
  let model = await findItemType(client, QUESTION_MODEL);
  if (!model) {
    model = await client.itemTypes.create({
      name: "Product question",
      api_key: QUESTION_MODEL,
      modular_block: false,
      draft_mode_active: true,
      collection_appearance: "table",
      hint: "Curated Q&A linked from product pages (PDP details + FAQPage JSON-LD). Draft until published.",
    });
    console.log(`  modelo criado: ${QUESTION_MODEL}`);
  } else {
    console.log(`  modelo já existe: ${QUESTION_MODEL}`);
  }

  const question = await ensureField(client, model.id, `${QUESTION_MODEL}::question`, {
    label: "Question",
    api_key: "question",
    field_type: "string",
    localized: true,
    validators: { required: {}, length: { max: 200 } },
    appearance: { editor: "single_line", parameters: { heading: false, placeholder: null }, addons: [] },
  });

  await ensureField(client, model.id, `${QUESTION_MODEL}::answer`, {
    label: "Answer",
    api_key: "answer",
    field_type: "text",
    localized: true,
    validators: { required: {}, length: { max: 2000 } },
    appearance: { editor: "textarea", parameters: { placeholder: null }, addons: [] },
  });

  if (question?.id) {
    try {
      await client.itemTypes.update(model.id, {
        title_field: { id: question.id, type: "field" },
      });
      console.log("  title_field → question");
    } catch (error) {
      console.log(`  skip title_field: ${String(error)}`);
    }
  }

  return { id: model.id };
}

async function ensureProductQuestionsField(client: Client, questionModelId: string): Promise<void> {
  const product = await client.itemTypes.find(PRODUCT_MODEL);
  const fieldsets = await client.fieldsets.list(product.id);
  const fieldset =
    fieldsets.find((fs) => fs.title === "Q&A") ??
    (await client.fieldsets.create(product.id, {
      title: "Q&A",
      hint: "Link curated product_question records shown on the PDP.",
      collapsible: true,
      start_collapsed: false,
    }));

  const pointer = `${PRODUCT_MODEL}::questions`;
  if (await fieldExists(client, pointer)) {
    console.log(`  campo já existe: ${pointer}`);
    return;
  }
  try {
    await client.fields.create(product.id, {
      label: "Questions",
      api_key: "questions",
      field_type: "links",
      localized: false,
      fieldset: { type: "fieldset", id: fieldset.id },
      validators: {
        items_item_type: {
          item_types: [questionModelId],
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

async function seedQuestions(client: Client, locales: string[], questionModelId: string): Promise<void> {
  for (const seed of SEEDS) {
    let productId: string | null = null;
    let existing: string[] = [];

    for await (const item of client.items.listPagedIterator({
      filter: { type: PRODUCT_MODEL },
      version: "current",
    })) {
      const handle = readHandle(item).toLowerCase();
      if (!handle.includes(seed.match)) continue;
      productId = item.id;
      const raw = field(item, "questions");
      existing = Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : [];
      break;
    }

    if (!productId) {
      console.log(`  seed: nenhuma product_page com handle a conter "${seed.match}"`);
      continue;
    }
    if (existing.length > 0) {
      console.log(`  seed ignorado (perguntas já ligadas): ${seed.match}`);
      continue;
    }

    const created = await client.items.create({
      item_type: { type: "item_type", id: questionModelId },
      question: localizedMap(locales, seed.question),
      answer: localizedMap(locales, seed.answer),
    });
    await publishIfDraftModel(client, await client.items.find(created.id), `question:${seed.match}`);

    await client.items.update(productId, { questions: [created.id] });
    await publishIfDraftModel(client, await client.items.find(productId), `product link:${seed.match}`);
    console.log(`  seed ligado: ${seed.match}`);
  }
}

export default async function setupProductQa(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name}) — locales: ${site.locales.join(", ")}`);

  const model = await ensureQuestionModel(client);
  await ensureProductQuestionsField(client, model.id);

  if (process.env.PRODUCT_QA_SEED === "1") {
    await seedQuestions(client, site.locales, model.id);
  } else {
    console.log("  seed omitido (defina PRODUCT_QA_SEED=1 para criar perguntas de exemplo)");
  }
}
