/**
 * Creates the `product_question` model and a `questions` links field on `product_page`.
 *
 * Idempotent: model/fields are created only when missing.
 *
 *   npx datocms cma:script scripts/setup-product-qa.ts --profile=staging
 *   npx datocms cma:script scripts/setup-product-qa.ts --profile=default
 *
 * With `PRODUCT_QA_SEED=1`, every published `product_page` gets at least one complete Q&A
 * (en, pt-BR, es) so the PDP can emit FAQPage. Hydrogen and Liquid keep the curated copy when
 * they have no complete pair. Other boards get one pair built from profile, flex, terrain and
 * the first size-chart row — no shipping or price claims. A published board missing those facts
 * is logged and skipped. `PRODUCT_QA_FORCE=1` rewrites the first linked question.
 */
import { ApiError, type ApiTypes } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";
import { asLocalized, field, publishIfDraftModel, textIn, type Raw } from "./lib/dato-script-helpers";

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
      en: "Hydrogen runs flex 6/10 with a hybrid profile for all-mountain riding. Use the size guide above: 152 cm (waist 248 mm) for roughly 55–70 kg, 156 cm (252 mm) for 65–80 kg, 160 cm (256 mm) for 75–95 kg. Shorter lengths turn quicker; longer lengths stay more stable at speed.",
      "pt-BR":
        "A Hydrogen tem flex 6/10 e perfil híbrido para all-mountain. No guia de tamanhos acima: 152 cm (cintura 248 mm) para cerca de 55–70 kg, 156 cm (252 mm) para 65–80 kg, 160 cm (256 mm) para 75–95 kg. Comprimentos menores viram mais rápido; os maiores ficam mais estáveis em velocidade.",
      es: "Hydrogen tiene flex 6/10 y perfil híbrido para all-mountain. En la guía de tallas: 152 cm (cintura 248 mm) para unos 55–70 kg, 156 cm (252 mm) para 65–80 kg, 160 cm (256 mm) para 75–95 kg. Las más cortas giran más rápido; las más largas son más estables a velocidad.",
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
      en: "Yes for powder-first days: Liquid is rocker, flex 4/10, terrain rated powder, advanced rider level. Size chart: 148 cm (waist 246 mm) for about 50–65 kg, 154 cm (252 mm) for 60–80 kg. Expect less bite on hardpack than a camber all-mountain board.",
      "pt-BR":
        "Sim para dias de powder: a Liquid é rocker, flex 4/10, terreno powder e nível avançado. Guia: 148 cm (cintura 246 mm) para cerca de 50–65 kg, 154 cm (252 mm) para 60–80 kg. Em pista dura morde menos que uma all-mountain de camber.",
      es: "Sí para powder: Liquid es rocker, flex 4/10, terreno powder y nivel avanzado. Guía: 148 cm (cintura 246 mm) para unos 50–65 kg, 154 cm (252 mm) para 60–80 kg. En pista dura muerde menos que una all-mountain de camber.",
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

const CONTENT_LOCALES = ["en", "pt-BR", "es"] as const;

const PROFILE_LABELS: Record<(typeof CONTENT_LOCALES)[number], Record<string, string>> = {
  en: { camber: "Camber", rocker: "Rocker", hybrid: "Hybrid", flat: "Flat" },
  "pt-BR": { camber: "Camber", rocker: "Rocker", hybrid: "Híbrido", flat: "Flat" },
  es: { camber: "Camber", rocker: "Rocker", hybrid: "Híbrido", flat: "Flat" },
};

const TERRAIN_LABELS: Record<(typeof CONTENT_LOCALES)[number], Record<string, string>> = {
  en: { all_mountain: "all-mountain", freestyle: "freestyle", freeride: "freeride", powder: "powder" },
  "pt-BR": { all_mountain: "all-mountain", freestyle: "freestyle", freeride: "freeride", powder: "powder" },
  es: { all_mountain: "all-mountain", freestyle: "freestyle", freeride: "freeride", powder: "powder" },
};

const RIDER_LABELS: Record<(typeof CONTENT_LOCALES)[number], Record<string, string>> = {
  en: { beginner: "beginner", intermediate: "intermediate", advanced: "advanced", expert: "expert" },
  "pt-BR": { beginner: "iniciante", intermediate: "intermédio", advanced: "avançado", expert: "perito" },
  es: { beginner: "principiante", intermediate: "intermedio", advanced: "avanzado", expert: "experto" },
};

type SizeRow = { length: number; riderWeightKg: string; waistWidthMm: number };

function enumLabel(
  table: Record<(typeof CONTENT_LOCALES)[number], Record<string, string>>,
  locale: (typeof CONTENT_LOCALES)[number],
  raw: string,
): string {
  const key = raw.trim();
  return table[locale][key] ?? table.en[key] ?? key.replaceAll("_", " ");
}

function readPlain(item: object, key: string): string {
  const raw = field(item, key);
  if (typeof raw === "string") return raw.trim();
  return "";
}

function readFlex(item: object): number | null {
  const raw = field(item, "flex");
  const parsed = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 10 ? parsed : null;
}

function questionIds(item: object): string[] {
  const raw = field(item, "questions");
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : [];
}

function asWholeNumber(value: Raw): number | null {
  const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : Number.NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function firstSizeRow(raw: Raw): SizeRow | null {
  let source: Raw = raw;
  if (typeof raw === "string") {
    try {
      source = JSON.parse(raw) as Raw;
    } catch {
      return null;
    }
  }
  if (!Array.isArray(source)) return null;
  for (const entry of source) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, Raw>;
    const length = asWholeNumber(row.length);
    const waistWidthMm = asWholeNumber(row.waistWidthMm);
    const weight = typeof row.riderWeightKg === "string" ? row.riderWeightKg.trim() : "";
    if (length !== null && waistWidthMm !== null && weight) {
      return { length, riderWeightKg: weight, waistWidthMm };
    }
  }
  return null;
}

function specSeed(item: object): SeedQuestion | null {
  const profile = readPlain(item, "profile");
  const terrain = readPlain(item, "terrain");
  const flex = readFlex(item);
  const row = firstSizeRow(field(item, "size_chart"));
  if (!profile || !terrain || flex === null || !row) return null;

  const rider = readPlain(item, "rider_level");
  const profileByLocale = Object.fromEntries(
    CONTENT_LOCALES.map((locale) => [locale, enumLabel(PROFILE_LABELS, locale, profile)]),
  ) as Record<(typeof CONTENT_LOCALES)[number], string>;
  const terrainByLocale = Object.fromEntries(
    CONTENT_LOCALES.map((locale) => [locale, enumLabel(TERRAIN_LABELS, locale, terrain)]),
  ) as Record<(typeof CONTENT_LOCALES)[number], string>;
  const riderByLocale = rider
    ? (Object.fromEntries(
        CONTENT_LOCALES.map((locale) => [locale, enumLabel(RIDER_LABELS, locale, rider)]),
      ) as Record<(typeof CONTENT_LOCALES)[number], string>)
    : null;

  const riderEn = riderByLocale ? `, ${riderByLocale.en} rider` : "";
  const riderPt = riderByLocale ? `, nível ${riderByLocale["pt-BR"]}` : "";
  const riderEs = riderByLocale ? `, nivel ${riderByLocale.es}` : "";

  return {
    match: readHandle(item) || itemId(item),
    question: {
      en: "What flex, profile and size does this board use?",
      "pt-BR": "Qual é o flex, o perfil e a medida desta prancha?",
      es: "¿Cuál es el flex, el perfil y la medida de esta tabla?",
    },
    answer: {
      en: `Flex ${flex}/10, ${profileByLocale.en} profile, ${terrainByLocale.en} terrain${riderEn}. Size guide: ${row.length} cm (waist ${row.waistWidthMm} mm) for about ${row.riderWeightKg} kg.`,
      "pt-BR": `Flex ${flex}/10, perfil ${profileByLocale["pt-BR"]}, terreno ${terrainByLocale["pt-BR"]}${riderPt}. Guia de tamanhos: ${row.length} cm (cintura ${row.waistWidthMm} mm) para cerca de ${row.riderWeightKg} kg.`,
      es: `Flex ${flex}/10, perfil ${profileByLocale.es}, terreno ${terrainByLocale.es}${riderEs}. Guía de tallas: ${row.length} cm (cintura ${row.waistWidthMm} mm) para unos ${row.riderWeightKg} kg.`,
    },
  };
}

function itemId(item: object): string {
  const id = field(item, "id");
  return typeof id === "string" ? id : "";
}

async function hasCompletePair(client: Client, ids: string[]): Promise<boolean> {
  for (const id of ids) {
    try {
      const question = await client.items.find(id, { version: "published" });
      const complete = CONTENT_LOCALES.every(
        (locale) => textIn(field(question, "question"), locale) && textIn(field(question, "answer"), locale),
      );
      if (complete) return true;
    } catch (error) {
      if (error instanceof ApiError && (error.response.status === 404 || error.response.status === 422)) continue;
      throw error;
    }
  }
  return false;
}

async function seedQuestions(client: Client, locales: string[], questionModelId: string): Promise<void> {
  const force = process.env.PRODUCT_QA_FORCE === "1";
  const products: object[] = [];

  for await (const item of client.items.listPagedIterator({
    filter: { type: PRODUCT_MODEL },
    version: "published",
  })) {
    products.push(item);
  }

  for (const item of products) {
    const handle = readHandle(item).toLowerCase();
    const label = handle || itemId(item);
    const existing = questionIds(item);
    const curated = SEEDS.find((seed) => handle.includes(seed.match));

    if (!force && (await hasCompletePair(client, existing))) {
      console.log(`  seed ignorado (par completo): ${label}`);
      continue;
    }

    const generated = curated ?? specSeed(item);
    if (!generated) {
      console.log(`  seed ignorado (sem flex, perfil, terreno ou medida): ${label}`);
      continue;
    }

    const payload = {
      question: localizedMap(locales, generated.question),
      answer: localizedMap(locales, generated.answer),
    };

    if (force && existing[0]) {
      await client.items.update(existing[0], payload);
      await publishIfDraftModel(client, await client.items.find(existing[0]), `question force:${label}`);
      console.log(`  seed atualizado (FORCE): ${label}`);
      continue;
    }

    const created = await client.items.create({
      item_type: { type: "item_type", id: questionModelId },
      ...payload,
    });
    await publishIfDraftModel(client, await client.items.find(created.id), `question:${label}`);

    const productId = itemId(item);
    await client.items.update(productId, { questions: [created.id, ...existing.filter((id) => id !== created.id)] });
    await publishIfDraftModel(client, await client.items.find(productId), `product link:${label}`);
    console.log(`  seed ligado: ${label}`);
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
