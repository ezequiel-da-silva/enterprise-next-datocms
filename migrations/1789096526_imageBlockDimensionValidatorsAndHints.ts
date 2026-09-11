import { Client } from "datocms/lib/cma-client-node";

const FILE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif"] as const;

const FILE_VALIDATORS = {
  required: {},
  extension: { extensions: [...FILE_EXTENSIONS] },
  required_alt_title: { title: true, alt: true },
};

const ASSET_HINT =
  "Imagem para ecrãs < 768px. Mínimo: 750px de largura. Recomendado: hero/CTA 768px; artigo/cover 768px; card/tabs 640px; logo/avatar ≥2× o tamanho CSS (o mínimo global pode exigir um ficheiro maior).";

const ASSET_DESKTOP_HINT =
  "Imagem para ecrãs ≥ 768px. Mínimo: 960px de largura. Recomendado: hero/CTA 1920px; artigo/cover 1280px; card/tabs 960px.";

const IMAGE_BLOCK_HINT =
  "Bloco reutilizado (hero, cards, logos, avatares). Image = mobile; Image desktop = desktop. Alt e title obrigatórios. Larguras mínimas nos campos; tamanhos ideais no hint de cada slot pai.";

export default async function (client: Client): Promise<void> {
  await client.itemTypes.update("image_block", { hint: IMAGE_BLOCK_HINT });

  await client.fields.update("image_block::asset", {
    hint: ASSET_HINT,
    validators: {
      ...FILE_VALIDATORS,
      image_dimensions: {
        width_min_value: 750,
        width_max_value: 10000,
        height_min_value: 1,
        height_max_value: 10000,
      },
    },
  });

  await client.fields.update("image_block::asset_desktop", {
    hint: ASSET_DESKTOP_HINT,
    validators: {
      ...FILE_VALIDATORS,
      image_dimensions: {
        width_min_value: 960,
        width_max_value: 10000,
        height_min_value: 1,
        height_max_value: 10000,
      },
    },
  });

  const parentHints: Array<[string, string]> = [
    ["hero_section::image_hero", "Hero. Recomendado: mobile ≥768px de largura, desktop ≥1920px (full-bleed)."],
    ["hero_section::image_overlay", "Overlay do hero. Recomendado: mobile ≥768px, desktop ≥1920px."],
    ["post::cover_image", "Cover do artigo. Recomendado: mobile ≥768px, desktop ≥1280px."],
    [
      "cta_banner::image_banner",
      'Imagem ilustrativa do banner (usada principalmente no formato "Lado a Lado / Split"). Recomendado: mobile ≥768px, desktop ≥1920px (split) ou 1280px.',
    ],
    ["card::image_card", "Imagem do card. Recomendado: mobile ≥640px, desktop ≥960px."],
    ["logo_grid::logos", "Logos. Preferir ≥2× o tamanho CSS. O bloco exige mobile ≥750px e desktop ≥960px."],
    ["author::avatar_bio", "Avatar. Preferir ≥2× o tamanho CSS; o bloco exige mobile ≥750px e desktop ≥960px."],
    ["global_setting::image404", "Ilustração 404. Recomendado: mobile ≥768px, desktop ≥1280px."],
    ["tab_item::media_image", "Imagem do tab. Recomendado: mobile ≥640px, desktop ≥960px."],
    [
      "step_card::media_image",
      "Imagem ou print de demonstração para esta etapa. Recomendado: mobile ≥640px, desktop ≥960px.",
    ],
  ];

  for (const [fieldId, hint] of parentHints) {
    await client.fields.update(fieldId, { hint });
  }
}
