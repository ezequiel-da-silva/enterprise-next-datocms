import { Client } from "datocms/lib/cma-client-node";

const FILE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

const FILE_BASE = {
  required: {},
  extension: { extensions: [...FILE_EXTENSIONS] },
  required_alt_title: { title: true, alt: true },
};

function dims(
  widthMin: number,
  widthMax: number,
  heightMin: number,
  heightMax: number,
) {
  return {
    width_min_value: widthMin,
    width_max_value: widthMax,
    height_min_value: heightMin,
    height_max_value: heightMax,
  };
}

/** Exact ratio (hero desktop 16:9). */
const AR_16_9 = {
  eq_ar_numerator: 16,
  eq_ar_denominator: 9,
  min_ar_numerator: 16,
  min_ar_denominator: 9,
  max_ar_numerator: 16,
  max_ar_denominator: 9,
};

/** Portrait 4:5 through square 1:1 (hero mobile). */
const AR_4_5_TO_1_1 = {
  min_ar_numerator: 4,
  min_ar_denominator: 5,
  max_ar_numerator: 1,
  max_ar_denominator: 1,
};

/** Landscape 4:3 through 16:9 (cards / covers). */
const AR_4_3_TO_16_9 = {
  min_ar_numerator: 4,
  min_ar_denominator: 3,
  max_ar_numerator: 16,
  max_ar_denominator: 9,
};

/** Ultra-wide 21:9 through 3:1 (banners). */
const AR_21_9_TO_3_1 = {
  min_ar_numerator: 21,
  min_ar_denominator: 9,
  max_ar_numerator: 3,
  max_ar_denominator: 1,
};

async function findOrCreateBlock(
  client: Client,
  apiKey: string,
  name: string,
  hint: string,
) {
  try {
    const existing = await client.itemTypes.find(apiKey);
    await client.itemTypes.update(existing.id, { name, hint });
    return existing;
  } catch {
    return client.itemTypes.create({
      name,
      api_key: apiKey,
      modular_block: true,
      hint,
    });
  }
}

async function upsertFileField(
  client: Client,
  itemTypeApiKey: string,
  itemTypeId: string,
  apiKey: string,
  label: string,
  hint: string,
  validators: Record<string, unknown>,
) {
  const payload = {
    label,
    hint,
    field_type: "file" as const,
    localized: false,
    validators,
  };
  try {
    const existing = await client.fields.find(`${itemTypeApiKey}::${apiKey}`);
    return client.fields.update(existing.id, payload);
  } catch {
    return client.fields.create(itemTypeId, { ...payload, api_key: apiKey });
  }
}

async function setBlockAllowlist(
  client: Client,
  fieldId: string,
  blockId: string,
  kind: "single_block" | "rich_text",
) {
  const field = await client.fields.find(fieldId);
  const current = (field.validators ?? {}) as Record<string, unknown>;
  if (kind === "single_block") {
    await client.fields.update(field.id, {
      validators: {
        ...current,
        single_block_blocks: { item_types: [blockId] },
      },
    });
    return;
  }
  await client.fields.update(field.id, {
    validators: {
      ...current,
      rich_text_blocks: { item_types: [blockId] },
    },
  });
}

export default async function (client: Client): Promise<void> {
  const hero = await findOrCreateBlock(
    client,
    "hero_image_block",
    "Hero Image",
    "Imagem de hero: desktop 16:9 (1280–3840×720–2160) e mobile 4:5 ou 1:1 (750–1080px de largura). Alt e title obrigatórios.",
  );
  const card = await findOrCreateBlock(
    client,
    "card_image_block",
    "Card Image",
    "Imagem de card/cover: 4:3 a 16:9, largura 600–1920px. Alt e title obrigatórios.",
  );
  const banner = await findOrCreateBlock(
    client,
    "banner_image_block",
    "Banner Image",
    "Imagem de banner: 21:9 a 3:1, largura 1440–3840px. Alt e title obrigatórios.",
  );

  await upsertFileField(client, "hero_image_block", hero.id, "asset_desktop", "Image desktop", "Desktop ≥768px. Exactamente 16:9. Largura 1280–3840px, altura 720–2160px.", {
    ...FILE_BASE,
    image_dimensions: dims(1280, 3840, 720, 2160),
    image_aspect_ratio: AR_16_9,
  });
  await upsertFileField(client, "hero_image_block", hero.id, "asset_mobile", "Image mobile", "Mobile <768px. Recorte 4:5 (retrato) ou 1:1. Largura 750–1080px.", {
    ...FILE_BASE,
    image_dimensions: dims(750, 1080, 750, 1350),
    image_aspect_ratio: AR_4_5_TO_1_1,
  });

  await upsertFileField(client, "card_image_block", card.id, "asset", "Image", "Card, tab, step ou cover. Recorte 4:3 a 16:9. Largura 600–1920px.", {
    ...FILE_BASE,
    image_dimensions: dims(600, 1920, 338, 1440),
    image_aspect_ratio: AR_4_3_TO_16_9,
  });

  await upsertFileField(client, "banner_image_block", banner.id, "asset", "Image", "Banner CTA. Recorte 21:9 a 3:1. Largura 1440–3840px.", {
    ...FILE_BASE,
    image_dimensions: dims(1440, 3840, 617, 1280),
    image_aspect_ratio: AR_21_9_TO_3_1,
  });

  await client.itemTypes.update(hero.id, {
    presentation_image_field: { id: (await client.fields.find("hero_image_block::asset_desktop")).id, type: "field" },
  });
  await client.itemTypes.update(card.id, {
    presentation_image_field: { id: (await client.fields.find("card_image_block::asset")).id, type: "field" },
  });
  await client.itemTypes.update(banner.id, {
    presentation_image_field: { id: (await client.fields.find("banner_image_block::asset")).id, type: "field" },
  });

  await setBlockAllowlist(client, "hero_section::image_hero", hero.id, "single_block");
  await setBlockAllowlist(client, "hero_section::image_overlay", hero.id, "single_block");
  await client.fields.update("hero_section::image_hero", {
    hint: "Bloco Hero Image. Desktop 16:9 (1280–3840px); mobile 4:5 ou 1:1 (750–1080px).",
  });
  await client.fields.update("hero_section::image_overlay", {
    hint: "Overlay do hero. Mesmas regras que Hero Image (16:9 desktop, 4:5/1:1 mobile).",
  });

  await setBlockAllowlist(client, "card::image_card", card.id, "single_block");
  await setBlockAllowlist(client, "tab_item::media_image", card.id, "single_block");
  await setBlockAllowlist(client, "step_card::media_image", card.id, "rich_text");
  await setBlockAllowlist(client, "post::cover_image", card.id, "single_block");
  await client.fields.update("card::image_card", {
    hint: "Card Image: 4:3 a 16:9, largura 600–1920px.",
  });
  await client.fields.update("tab_item::media_image", {
    hint: "Card Image: 4:3 a 16:9, largura 600–1920px.",
  });
  await client.fields.update("step_card::media_image", {
    hint: "Imagem da etapa (Card Image): 4:3 a 16:9, largura 600–1920px.",
  });
  await client.fields.update("post::cover_image", {
    hint: "Cover do artigo (Card Image): 4:3 a 16:9, largura 600–1920px.",
  });

  await setBlockAllowlist(client, "cta_banner::image_banner", banner.id, "rich_text");
  await client.fields.update("cta_banner::image_banner", {
    hint: 'Banner Image (split/card inset): 21:9 a 3:1, largura 1440–3840px. Recorte object-cover no site.',
  });
}
