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

const AR_4_3_TO_16_9 = {
  min_ar_numerator: 4,
  min_ar_denominator: 3,
  max_ar_numerator: 16,
  max_ar_denominator: 9,
};

const AR_21_9_TO_3_1 = {
  min_ar_numerator: 21,
  min_ar_denominator: 9,
  max_ar_numerator: 3,
  max_ar_denominator: 1,
};

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
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
  const existing = await findField(client, `${itemTypeApiKey}::${apiKey}`);
  if (existing) {
    return client.fields.update(existing.id, payload);
  }
  return client.fields.create(itemTypeId, { ...payload, api_key: apiKey });
}

/**
 * Keep uploads: rename leftover `asset` → `asset_mobile` when the mobile field
 * does not exist yet. Then ensure `asset_desktop`.
 */
async function ensureMobileAndDesktop(
  client: Client,
  itemTypeApiKey: string,
  itemTypeId: string,
  mobile: { label: string; hint: string; validators: Record<string, unknown> },
  desktop: { label: string; hint: string; validators: Record<string, unknown> },
) {
  const mobileExisting = await findField(client, `${itemTypeApiKey}::asset_mobile`);
  const legacyAsset = await findField(client, `${itemTypeApiKey}::asset`);

  if (!mobileExisting && legacyAsset) {
    await client.fields.update(legacyAsset.id, {
      api_key: "asset_mobile",
      label: mobile.label,
      hint: mobile.hint,
      validators: mobile.validators,
    });
  } else {
    await upsertFileField(
      client,
      itemTypeApiKey,
      itemTypeId,
      "asset_mobile",
      mobile.label,
      mobile.hint,
      mobile.validators,
    );
  }

  await upsertFileField(
    client,
    itemTypeApiKey,
    itemTypeId,
    "asset_desktop",
    desktop.label,
    desktop.hint,
    desktop.validators,
  );

  const leftoverAsset = await findField(client, `${itemTypeApiKey}::asset`);
  const mobileNow = await findField(client, `${itemTypeApiKey}::asset_mobile`);
  if (leftoverAsset && mobileNow && leftoverAsset.id !== mobileNow.id) {
    await client.fields.destroy(leftoverAsset.id);
  }
}

export default async function (client: Client): Promise<void> {
  const card = await client.itemTypes.find("card_image_block");
  const banner = await client.itemTypes.find("banner_image_block");

  await ensureMobileAndDesktop(
    client,
    "card_image_block",
    card.id,
    {
      label: "Image mobile",
      hint: "Mobile <768px. Recorte 4:3 a 16:9. Largura 600–1080px, altura 338–810px.",
      validators: {
        ...FILE_BASE,
        image_dimensions: dims(600, 1080, 338, 810),
        image_aspect_ratio: AR_4_3_TO_16_9,
      },
    },
    {
      label: "Image desktop",
      hint: "Desktop ≥768px. Recorte 4:3 a 16:9. Largura 960–1920px, altura 540–1440px.",
      validators: {
        ...FILE_BASE,
        image_dimensions: dims(960, 1920, 540, 1440),
        image_aspect_ratio: AR_4_3_TO_16_9,
      },
    },
  );

  await ensureMobileAndDesktop(
    client,
    "banner_image_block",
    banner.id,
    {
      label: "Image mobile",
      hint: "Mobile <768px. Recorte 21:9 a 3:1. Largura 750–1440px, altura 250–617px.",
      validators: {
        ...FILE_BASE,
        image_dimensions: dims(750, 1440, 250, 617),
        image_aspect_ratio: AR_21_9_TO_3_1,
      },
    },
    {
      label: "Image desktop",
      hint: "Desktop ≥768px. Recorte 21:9 a 3:1. Largura 1440–3840px, altura 480–1646px.",
      validators: {
        ...FILE_BASE,
        image_dimensions: dims(1440, 3840, 480, 1646),
        image_aspect_ratio: AR_21_9_TO_3_1,
      },
    },
  );

  await client.itemTypes.update(card.id, {
    hint: "Imagem de card/cover: mobile e desktop, recorte 4:3 a 16:9. Alt e title obrigatórios.",
    presentation_image_field: {
      id: (await client.fields.find("card_image_block::asset_desktop")).id,
      type: "field",
    },
  });
  await client.itemTypes.update(banner.id, {
    hint: "Imagem de banner: mobile e desktop, recorte 21:9 a 3:1. Alt e title obrigatórios.",
    presentation_image_field: {
      id: (await client.fields.find("banner_image_block::asset_desktop")).id,
      type: "field",
    },
  });

  await client.fields.update("card::image_card", {
    hint: "Card Image: mobile 600–1080px e desktop 960–1920px, recorte 4:3 a 16:9.",
  });
  await client.fields.update("tab_item::media_image", {
    hint: "Card Image: mobile 600–1080px e desktop 960–1920px, recorte 4:3 a 16:9.",
  });
  await client.fields.update("step_card::media_image", {
    hint: "Imagem da etapa (Card Image): mobile e desktop, recorte 4:3 a 16:9.",
  });
  await client.fields.update("post::cover_image", {
    hint: "Cover do artigo (Card Image): mobile e desktop, recorte 4:3 a 16:9.",
  });
  await client.fields.update("cta_banner::image_banner", {
    hint: "Banner Image (split/card inset): mobile 750–1440px e desktop 1440–3840px, recorte 21:9 a 3:1.",
  });
}
