/**
 * Enriches the Page slug `home` into a CRO landing (Opção 1 — content only):
 *
 * - Keep `hero_page` and existing `faq_group` block(s)
 * - Ensure one `content_listing_section` (Shopify manual curated boards, `has_limit` + limit 4)
 * - Ensure one `feature_grid` with 4 editorial benefit cards (Font Awesome icons)
 * - No `cta_banner` — home uses HeroPrimaryRepeat when the last block is not a CTA
 *
 * Idempotent: re-running keeps the first listing/grid per locale and drops duplicates;
 * missing blocks are created. FAQ and other blocks are preserved (FAQs stay before others).
 * Existing listings are not rewritten — use `curate-home-featured.ts` to switch auto → manual.
 *
 *   npx datocms cma:script scripts/setup-home-landing.ts --profile=default
 */
import { buildBlockRecord } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";
import {
  faLeaf,
  faLock,
  faShieldHalved,
  faTruck,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import {
  type BlockPayload,
  type Raw,
  asLocalized,
  blockId,
  blockTypeId,
  carouselOptions,
  field,
  findPageBySlug,
  publishIfDraftModel,
  ref,
  textHeaderBlock,
} from "./lib/dato-script-helpers";
import {
  HOME_FEATURED_BOARD_HANDLES,
  HOME_FEATURED_LISTING_LIMIT,
} from "./lib/home-featured-boards";

type LocaleCopy = {
  listingTitle: string;
  listingDescription: string;
  benefitsTitle: string;
  benefitsDescription: string;
  benefits: ReadonlyArray<{ title: string; description: string; icon: IconDefinition }>;
};

const COPY: Record<string, LocaleCopy> = {
  en: {
    listingTitle: "Featured boards",
    listingDescription: "Pick a board for the next run — prices confirmed at Shopify checkout.",
    benefitsTitle: "Why shop with us",
    benefitsDescription: "Enterprise checkout, clear policies, and boards built to last.",
    benefits: [
      {
        title: "Secure global delivery",
        description: "Tracked shipping to your door with carrier coverage on every order.",
        icon: faTruck,
      },
      {
        title: "2-year board warranty",
        description: "Manufacturing defects covered so you can ride with confidence.",
        icon: faShieldHalved,
      },
      {
        title: "Direct Shopify checkout",
        description: "Pay securely on Shopify — cart and payment stay on a trusted stack.",
        icon: faLock,
      },
      {
        title: "Responsible materials",
        description: "Boards and packaging chosen with durability and lower waste in mind.",
        icon: faLeaf,
      },
    ],
  },
  "pt-BR": {
    listingTitle: "Pranchas em destaque",
    listingDescription: "Escolhe a prancha para a próxima descida — preços confirmados no checkout Shopify.",
    benefitsTitle: "Porque comprar connosco",
    benefitsDescription: "Checkout enterprise, políticas claras e pranchas feitas para durar.",
    benefits: [
      {
        title: "Entrega global segura",
        description: "Envio com rastreio até à porta e cobertura da transportadora em cada encomenda.",
        icon: faTruck,
      },
      {
        title: "Garantia de 2 anos",
        description: "Defeitos de fabrico cobertos para poderes andar com confiança.",
        icon: faShieldHalved,
      },
      {
        title: "Checkout Shopify directo",
        description: "Paga com segurança na Shopify — carrinho e pagamento num stack de confiança.",
        icon: faLock,
      },
      {
        title: "Materiais responsáveis",
        description: "Pranchas e embalagens pensadas para durabilidade e menos desperdício.",
        icon: faLeaf,
      },
    ],
  },
  es: {
    listingTitle: "Tablas destacadas",
    listingDescription: "Elige una tabla para la próxima bajada — precios confirmados en el checkout de Shopify.",
    benefitsTitle: "Por qué comprar con nosotros",
    benefitsDescription: "Checkout enterprise, políticas claras y tablas hechas para durar.",
    benefits: [
      {
        title: "Entrega global segura",
        description: "Envío con seguimiento a tu puerta y cobertura del transportista en cada pedido.",
        icon: faTruck,
      },
      {
        title: "Garantía de 2 años",
        description: "Defectos de fabricación cubiertos para que puedas disfrutar con confianza.",
        icon: faShieldHalved,
      },
      {
        title: "Checkout Shopify directo",
        description: "Paga con seguridad en Shopify — carrito y pago en un stack de confianza.",
        icon: faLock,
      },
      {
        title: "Materiales responsables",
        description: "Tablas y embalajes pensados para durabilidad y menos residuos.",
        icon: faLeaf,
      },
    ],
  },
};

function copyFor(locale: string): LocaleCopy {
  return COPY[locale] ?? COPY.en;
}

/** Plugin Font Awesome guarda JSON stringificado (prefix + iconName + path). */
function faIconField(icon: IconDefinition): string {
  return JSON.stringify({
    prefix: icon.prefix,
    iconName: icon.iconName,
    icon: icon.icon,
  });
}

async function loadFeaturedProductIds(client: Client): Promise<string[]> {
  const byHandle = new Map<string, string>();
  for await (const record of client.items.listPagedIterator({
    filter: { type: "product_page" },
    version: "published",
  })) {
    const handle = field(record, "shopify_handle");
    if (typeof handle !== "string" || !handle.trim()) continue;
    byHandle.set(handle.trim().toLowerCase(), record.id);
  }
  return HOME_FEATURED_BOARD_HANDLES.map((h) => byHandle.get(h)).filter((id): id is string => Boolean(id));
}

export default async function setupHomeLanding(client: Client): Promise<void> {
  const site = await client.site.find();
  const locales = site.locales;
  console.log(`Site ${site.id} (${site.name}) — locales: ${locales.join(", ")}`);
  console.log(`Environment: ${process.env.DATOCMS_ENVIRONMENT ?? "(default / profile)"}`);

  const [textHeader, listingSection, shopifyConfig, featureGrid, card, carouselSetting, faqGroup] =
    await Promise.all([
      client.itemTypes.find("text_header"),
      client.itemTypes.find("content_listing_section"),
      client.itemTypes.find("shopify_listing_config"),
      client.itemTypes.find("feature_grid"),
      client.itemTypes.find("card"),
      client.itemTypes.find("carousel_setting"),
      client.itemTypes.find("faq_group"),
    ]);

  const page = await findPageBySlug(client, new Set(["home"]));
  if (!page) {
    throw new Error('Page with slug "home" not found — create/publish home before running this script.');
  }
  console.log(`  home page: ${page.id}`);

  const selectedProducts = await loadFeaturedProductIds(client);
  console.log(
    `  featured boards para novos listings: ${selectedProducts.length}/${HOME_FEATURED_BOARD_HANDLES.length}`,
  );

  const listingBlock = (locale: string) => {
    const c = copyFor(locale);
    return buildBlockRecord({
      item_type: ref(listingSection.id),
      text_header_section: [textHeaderBlock(textHeader.id, c.listingTitle, c.listingDescription)],
      listing_config: buildBlockRecord({
        item_type: ref(shopifyConfig.id),
        fetch_mode: "manual",
        collection_filter: "all",
        source_collection: null,
        selected_products: selectedProducts,
      }),
      display_type: "grid",
      has_limit: true,
      limit: HOME_FEATURED_LISTING_LIMIT,
      initial_count: null,
      load_more_step: null,
      load_more_label:
        locale === "pt-BR"
          ? "Carregar mais produtos"
          : locale === "es"
            ? "Cargar más productos"
            : "Load more products",
      carousel_options: carouselOptions(carouselSetting.id),
    });
  };

  const benefitsBlock = (locale: string) => {
    const c = copyFor(locale);
    return buildBlockRecord({
      item_type: ref(featureGrid.id),
      text_header_section: [textHeaderBlock(textHeader.id, c.benefitsTitle, c.benefitsDescription)],
      advanced_options: false,
      variant: null,
      carousel_options: carouselOptions(carouselSetting.id),
      items_feature_grid: c.benefits.map((benefit) =>
        buildBlockRecord({
          item_type: ref(card.id),
          card_source: "editorial",
          source_product: null,
          source_collection: null,
          title_card: benefit.title,
          has_icon: true,
          icon_card: faIconField(benefit.icon),
          has_description: true,
          description_card: benefit.description,
          has_image: false,
          image_card: null,
          has_link: false,
          link_card: null,
        }),
      ),
    });
  };

  const full = await client.items.find(page.id, { nested: true });
  const content = asLocalized<Raw[]>(field(full, "content_page"));

  let listingsCreated = 0;
  let gridsCreated = 0;
  let listingsDeduped = 0;
  let gridsDeduped = 0;
  let faqsKept = 0;

  const nextContent = Object.fromEntries(
    locales.map((l) => {
      let listing: BlockPayload | null = null;
      let grid: BlockPayload | null = null;
      const faqs: BlockPayload[] = [];
      const others: BlockPayload[] = [];

      for (const block of content[l] ?? []) {
        const id = blockId(block);
        if (!id) continue;
        const typeId = blockTypeId(block);
        if (typeId === listingSection.id) {
          if (listing) {
            listingsDeduped += 1;
            continue;
          }
          listing = id;
          continue;
        }
        if (typeId === featureGrid.id) {
          if (grid) {
            gridsDeduped += 1;
            continue;
          }
          grid = id;
          continue;
        }
        if (typeId === faqGroup.id) {
          faqs.push(id);
          faqsKept += 1;
          continue;
        }
        others.push(id);
      }

      if (!listing) {
        listing = listingBlock(l);
        listingsCreated += 1;
      }
      if (!grid) {
        grid = benefitsBlock(l);
        gridsCreated += 1;
      }

      return [l, [listing, grid, ...faqs, ...others]];
    }),
  );

  const changed =
    listingsCreated > 0 || gridsCreated > 0 || listingsDeduped > 0 || gridsDeduped > 0;

  if (changed) {
    await client.items.update(page.id, { content_page: nextContent });
    if (listingsCreated > 0) {
      console.log(
        `  listing criado (manual, limit ${HOME_FEATURED_LISTING_LIMIT}, ${listingsCreated} locale(s))`,
      );
    }
    if (gridsCreated > 0) console.log(`  feature_grid de benefícios criado (${gridsCreated} locale(s))`);
    if (listingsDeduped > 0) console.log(`  listings duplicados removidos: ${listingsDeduped}`);
    if (gridsDeduped > 0) console.log(`  feature_grids duplicados removidos: ${gridsDeduped}`);
  } else {
    console.log("  listing e feature_grid já presentes — ordem/FAQ preservados");
    /* Ainda assim reordenar se FAQ/outros estiverem fora da ordem alvo. */
    await client.items.update(page.id, { content_page: nextContent });
    console.log("  content_page reordenado (listing → benefits → FAQ → outros)");
  }

  console.log(`  faq_group preservado: ${faqsKept} bloco(s) nos locales`);
  await publishIfDraftModel(client, await client.items.find(page.id), "home");
  console.log(`Concluído. Verifica /en · /pt · /es`);
}
