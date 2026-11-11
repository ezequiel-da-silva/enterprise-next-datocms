/**
 * Adds snowboard engineering fields to `product_page`.
 *
 * Idempotent: each field is created only when `product_page::<api_key>` is missing.
 * Existing published boards stay valid — every new field is optional.
 *
 *   npx datocms cma:script scripts/setup-snowboard-specs-model.ts --profile=default
 *
 * With `SNOWBOARD_SPECS_SEED=1`, fills fictional specs on boards whose
 * `shopify_handle` contains `hydrogen` or `liquid`. Skips a record that already
 * has `profile`. Does not upload a base graphic.
 */
import { ApiError, type ApiTypes } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";
import { asLocalized, field, publishIfDraftModel } from "./lib/dato-script-helpers";

const MODEL = "product_page";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "avif"];

type SelectOption = { label: string; value: string };

type Seed = {
  match: string;
  profile: string;
  flex: number;
  terrain: string;
  riderLevel: string;
  badge: string;
  core: Record<string, string>;
  sizeChart: { length: number; riderWeightKg: string; waistWidthMm: number }[];
};

const SEEDS: Seed[] = [
  {
    match: "hydrogen",
    profile: "hybrid",
    flex: 6,
    terrain: "all_mountain",
    riderLevel: "intermediate",
    badge: "new",
    core: {
      en: "FSC Certified Poplar & Paulownia Core",
      "pt-BR": "Núcleo de choupo e paulownia com certificação FSC",
      pt_BR: "Núcleo de choupo e paulownia com certificação FSC",
      es: "Núcleo de álamo y paulownia con certificación FSC",
    },
    sizeChart: [
      { length: 152, riderWeightKg: "55-70", waistWidthMm: 248 },
      { length: 156, riderWeightKg: "65-80", waistWidthMm: 252 },
      { length: 160, riderWeightKg: "75-95", waistWidthMm: 256 },
    ],
  },
  {
    match: "liquid",
    profile: "rocker",
    flex: 4,
    terrain: "powder",
    riderLevel: "advanced",
    badge: "limited",
    core: {
      en: "Paulownia core with beech stringers",
      "pt-BR": "Núcleo de paulownia com longarinas de faia",
      pt_BR: "Núcleo de paulownia com longarinas de faia",
      es: "Núcleo de paulownia con largueros de haya",
    },
    sizeChart: [
      { length: 148, riderWeightKg: "50-65", waistWidthMm: 246 },
      { length: 154, riderWeightKg: "60-80", waistWidthMm: 252 },
    ],
  },
];

function selectAppearance(options: SelectOption[]): ApiTypes.FieldCreateSchema["appearance"] {
  return {
    editor: "string_select",
    parameters: { options },
    addons: [],
  };
}

async function fieldExists(client: Client, apiKey: string): Promise<boolean> {
  try {
    await client.fields.find(`${MODEL}::${apiKey}`);
    return true;
  } catch (error) {
    if (error instanceof ApiError && (error.response.status === 404 || error.response.status === 422)) {
      return false;
    }
    throw error;
  }
}

async function ensureField(client: Client, itemTypeId: string, body: ApiTypes.FieldCreateSchema): Promise<void> {
  const apiKey = body.api_key;
  if (!apiKey) return;
  if (await fieldExists(client, apiKey)) {
    console.log(`  campo já existe: ${MODEL}::${apiKey}`);
    return;
  }
  try {
    await client.fields.create(itemTypeId, body);
    console.log(`  campo criado: ${MODEL}::${apiKey}`);
  } catch (error) {
    if (error instanceof ApiError && error.response.status === 422) {
      console.log(`  campo já existe (422): ${MODEL}::${apiKey}`);
      return;
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

function hasProfile(item: object): boolean {
  const raw = field(item, "profile");
  return typeof raw === "string" && raw.trim().length > 0;
}

function localizedCore(locales: string[], copy: Record<string, string>): Record<string, string> {
  const fallback = copy.en ?? "";
  return Object.fromEntries(locales.map((locale) => [locale, copy[locale] ?? fallback]));
}

async function seedBoards(client: Client, locales: string[]): Promise<void> {
  const wanted = new Set(SEEDS.map((seed) => seed.match));
  const seen = new Set<string>();

  for await (const item of client.items.listPagedIterator({
    filter: { type: MODEL },
    version: "current",
  })) {
    const handle = readHandle(item).toLowerCase();
    const seed = SEEDS.find((candidate) => handle.includes(candidate.match));
    if (!seed) continue;
    seen.add(seed.match);
    if (hasProfile(item)) {
      console.log(`  seed ignorado (profile já preenchido): ${handle}`);
      continue;
    }
    await client.items.update(item.id, {
      profile: seed.profile,
      flex: seed.flex,
      terrain: seed.terrain,
      rider_level: seed.riderLevel,
      badge: seed.badge,
      core_material: localizedCore(locales, seed.core),
      size_chart: JSON.stringify(seed.sizeChart),
    });
    console.log(`  seed aplicado: ${handle}`);
    await publishIfDraftModel(client, await client.items.find(item.id), handle);
  }

  for (const match of wanted) {
    if (!seen.has(match)) {
      console.log(`  nenhuma product_page com handle a conter "${match}"`);
    }
  }
}

export default async function setupSnowboardSpecsModel(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name}) — locales: ${site.locales.join(", ")}`);

  const model = await client.itemTypes.find(MODEL);

  await ensureField(client, model.id, {
    label: "Profile",
    api_key: "profile",
    field_type: "string",
    localized: false,
    hint: "Camber profile of the board.",
    validators: { enum: { values: ["camber", "rocker", "hybrid", "flat"] } },
    appearance: selectAppearance([
      { label: "Camber", value: "camber" },
      { label: "Rocker", value: "rocker" },
      { label: "Hybrid", value: "hybrid" },
      { label: "Flat", value: "flat" },
    ]),
  });

  await ensureField(client, model.id, {
    label: "Flex",
    api_key: "flex",
    field_type: "integer",
    localized: false,
    hint: "Stiffness from 1 to 10. 1–3 soft, 4–7 all-mountain, 8–10 stiff.",
    validators: { number_range: { min: 1, max: 10 } },
    appearance: { editor: "integer", parameters: {}, addons: [] },
  });

  await ensureField(client, model.id, {
    label: "Terrain",
    api_key: "terrain",
    field_type: "string",
    localized: false,
    hint: "Primary terrain the board is shaped for.",
    validators: { enum: { values: ["all_mountain", "freestyle", "freeride", "powder"] } },
    appearance: selectAppearance([
      { label: "All-mountain", value: "all_mountain" },
      { label: "Freestyle", value: "freestyle" },
      { label: "Freeride", value: "freeride" },
      { label: "Powder", value: "powder" },
    ]),
  });

  await ensureField(client, model.id, {
    label: "Rider level",
    api_key: "rider_level",
    field_type: "string",
    localized: false,
    hint: "Rider the board is built for.",
    validators: { enum: { values: ["beginner", "intermediate", "advanced", "expert"] } },
    appearance: selectAppearance([
      { label: "Beginner", value: "beginner" },
      { label: "Intermediate", value: "intermediate" },
      { label: "Advanced", value: "advanced" },
      { label: "Expert", value: "expert" },
    ]),
  });

  await ensureField(client, model.id, {
    label: "Core material",
    api_key: "core_material",
    field_type: "string",
    localized: true,
    hint: "Core layup, written for readers and answer engines. Example: FSC Certified Poplar & Paulownia Core.",
    appearance: { editor: "single_line", parameters: {}, addons: [] },
  });

  await ensureField(client, model.id, {
    label: "Badge",
    api_key: "badge",
    field_type: "string",
    localized: false,
    hint: "Optional merchandising seal. Leave empty when the board has no badge.",
    validators: { enum: { values: ["new", "limited", "pro_model"] } },
    appearance: selectAppearance([
      { label: "New", value: "new" },
      { label: "Limited", value: "limited" },
      { label: "Pro model", value: "pro_model" },
    ]),
  });

  await ensureField(client, model.id, {
    label: "Base image",
    api_key: "base_image",
    field_type: "file",
    localized: false,
    hint: "High-resolution graphic of the board base.",
    validators: {
      extension: { extensions: IMAGE_EXTS },
      required_alt_title: { alt: true, title: false },
    },
    appearance: { editor: "file", parameters: {}, addons: [] },
  });

  await ensureField(client, model.id, {
    label: "Size chart",
    api_key: "size_chart",
    field_type: "json",
    localized: false,
    hint: 'Biometric size matrix: [{ "length": 152, "riderWeightKg": "55-70", "waistWidthMm": 248 }]',
    appearance: { editor: "json", parameters: {}, addons: [] },
  });

  if (process.env.SNOWBOARD_SPECS_SEED === "1") {
    console.log("SNOWBOARD_SPECS_SEED=1 — a preencher pranchas hydrogen/liquid");
    await seedBoards(client, site.locales);
  } else {
    console.log("Seed desligado (SNOWBOARD_SPECS_SEED=1 para preencher hydrogen/liquid)");
  }

  console.log("Concluído. Campos técnicos de snowboard em product_page.");
}
