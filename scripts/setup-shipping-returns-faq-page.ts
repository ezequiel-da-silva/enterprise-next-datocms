/**
 * Creates (or completes) the Shipping & Returns FAQ page and wires discovery:
 *
 * - `page` with a single `faq_group` (Q&A aligned to published `market_policy` US/BR/ES)
 * - `navigation.footer_menu`: link per locale (skipped if already present)
 *
 * Idempotent: finds the page by slug; skips recreating the FAQ unless
 * `SHIPPING_FAQ_FORCE=1`. Re-run after editing market_policy to refresh copy with force.
 *
 *   npx datocms cma:script scripts/setup-shipping-returns-faq-page.ts --profile=default
 */
import { buildBlockRecord } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";
import {
  type BlockPayload,
  type Raw,
  asLocalized,
  blockId,
  blockTypeId,
  ensureFooterLink,
  field,
  findPageBySlug,
  publishIfDraftModel,
  ref,
  textHeaderBlock,
} from "./lib/dato-script-helpers";

/** Published `market_policy` values (US / BR / ES) — keep FAQ answers in sync. */
const POLICY = {
  US: {
    shipping: "$9.90",
    handling: "1–2 business days",
    transit: "3–7 business days",
    returnDays: 30,
    returnFees: "free",
  },
  BR: {
    shipping: "grátis",
    handling: "1–2 dias úteis",
    transit: "3–7 dias úteis",
    returnDays: 30,
    returnFees: "free",
  },
  ES: {
    shipping: "5,00 €",
    handling: "1–2 días laborables",
    transit: "3–7 días laborables",
    returnDays: 30,
    returnFees: "free",
  },
} as const;

type LocaleCopy = {
  title: string;
  slug: string;
  appLocale: "en" | "pt" | "es";
  navLabel: string;
  headerTitle: string;
  headerDescription: string;
  seoDescription: string;
  refundPath: string;
  items: { question: string; answer: string[] }[];
};

const COPY: Record<string, LocaleCopy> = {
  en: {
    title: "Shipping & returns",
    slug: "shipping-returns",
    appLocale: "en",
    navLabel: "Shipping & returns",
    headerTitle: "Shipping & returns",
    headerDescription: "How delivery and returns work for orders placed in our US store.",
    seoDescription: "Shipping costs, delivery windows, and how to start a return or refund.",
    refundPath: "/en/refund-policy",
    items: [
      {
        question: "How much does shipping cost?",
        answer: [
          `For US orders, standard shipping is ${POLICY.US.shipping}. Rates for Brazil and Spain may differ by market; the checkout always shows the final amount before you pay.`,
        ],
      },
      {
        question: "How long does delivery take?",
        answer: [
          `We prepare US orders in ${POLICY.US.handling}, then transit usually takes ${POLICY.US.transit}. You will receive tracking from Shopify once the carrier scans the parcel.`,
        ],
      },
      {
        question: "Which countries do you ship to?",
        answer: [
          "We fulfill orders for our Shopify markets: United States, Brazil, and Spain. Currency and shipping options follow the market selected at checkout.",
        ],
      },
      {
        question: "What is the return window?",
        answer: [
          `You can request a return within ${POLICY.US.returnDays} days of delivery, matching our published return policy for the US market.`,
        ],
      },
      {
        question: "Who pays for return shipping?",
        answer: [
          "Return shipping is free for eligible returns in the US market. Start the return from your order confirmation or account; we cover the return label when the request qualifies.",
        ],
      },
      {
        question: "How do I start a return or refund?",
        answer: [
          `Use the order status page from your Shopify confirmation email, or contact us with your order number. Full terms are in our refund policy (${"/en/refund-policy"}).`,
        ],
      },
    ],
  },
  "pt-BR": {
    title: "Envios e devoluções",
    slug: "envios-e-devolucoes",
    appLocale: "pt",
    navLabel: "Envios e devoluções",
    headerTitle: "Envios e devoluções",
    headerDescription: "Como funcionam a entrega e as devoluções nos pedidos da loja no Brasil.",
    seoDescription: "Custos de envio, prazos de entrega e como iniciar uma devolução ou reembolso.",
    refundPath: "/pt/refund-policy",
    items: [
      {
        question: "Quanto custa o frete?",
        answer: [
          `Para pedidos no Brasil, o frete padrão é ${POLICY.BR.shipping}. Nos mercados dos EUA e de Espanha os valores podem diferir; o checkout mostra sempre o total antes do pagamento.`,
        ],
      },
      {
        question: "Qual o prazo de entrega?",
        answer: [
          `Preparamos pedidos no Brasil em ${POLICY.BR.handling}; o transporte costuma levar ${POLICY.BR.transit}. O rastreio chega pelo e-mail de confirmação da Shopify quando a transportadora regista o envio.`,
        ],
      },
      {
        question: "Para que países enviam?",
        answer: [
          "Atendemos os mercados Shopify: Brasil, Estados Unidos e Espanha. Moeda e opções de envio seguem o mercado escolhido no checkout.",
        ],
      },
      {
        question: "Qual o prazo para devolver?",
        answer: [
          `Podes pedir devolução até ${POLICY.BR.returnDays} dias após a entrega, de acordo com a política publicada para o mercado brasileiro.`,
        ],
      },
      {
        question: "Quem paga o frete da devolução?",
        answer: [
          "O frete de devolução é gratuito nas devoluções elegíveis no Brasil. Inicia o pedido a partir da confirmação ou da conta; quando o pedido for aceite, a loja cobre a etiqueta de devolução.",
        ],
      },
      {
        question: "Como inicio uma devolução ou reembolso?",
        answer: [
          `Usa a página de estado do pedido no e-mail da Shopify ou contacta-nos com o número do pedido. Os termos completos estão na política de reembolso (${"/pt/refund-policy"}).`,
        ],
      },
    ],
  },
  es: {
    title: "Envíos y devoluciones",
    slug: "envios-y-devoluciones",
    appLocale: "es",
    navLabel: "Envíos y devoluciones",
    headerTitle: "Envíos y devoluciones",
    headerDescription: "Cómo funcionan la entrega y las devoluciones en pedidos de la tienda en España.",
    seoDescription: "Costes de envío, plazos de entrega y cómo iniciar una devolución o reembolso.",
    refundPath: "/es/refund-policy",
    items: [
      {
        question: "¿Cuánto cuesta el envío?",
        answer: [
          `En pedidos de España, el envío estándar es ${POLICY.ES.shipping}. En EE. UU. y Brasil las tarifas pueden variar; el checkout muestra siempre el total antes de pagar.`,
        ],
      },
      {
        question: "¿Cuánto tarda la entrega?",
        answer: [
          `Preparamos los pedidos de España en ${POLICY.ES.handling}; el tránsito suele ser de ${POLICY.ES.transit}. Recibirás el seguimiento por el correo de confirmación de Shopify cuando el transportista registre el paquete.`,
        ],
      },
      {
        question: "¿A qué países enviáis?",
        answer: [
          "Servimos los mercados de Shopify: España, Estados Unidos y Brasil. La moneda y las opciones de envío siguen el mercado elegido en el checkout.",
        ],
      },
      {
        question: "¿Cuál es el plazo de devolución?",
        answer: [
          `Puedes solicitar una devolución en un plazo de ${POLICY.ES.returnDays} días desde la entrega, según la política publicada para el mercado español.`,
        ],
      },
      {
        question: "¿Quién paga el envío de la devolución?",
        answer: [
          "El envío de devolución es gratuito en devoluciones elegibles en España. Inicia la solicitud desde la confirmación del pedido o la cuenta; si procede, la tienda cubre la etiqueta de devolución.",
        ],
      },
      {
        question: "¿Cómo inicio una devolución o reembolso?",
        answer: [
          `Usa la página de estado del pedido del correo de Shopify o contáctanos con el número de pedido. Los términos completos están en la política de reembolso (${"/es/refund-policy"}).`,
        ],
      },
    ],
  },
};

function copyFor(locale: string): LocaleCopy {
  return COPY[locale] ?? COPY.en;
}

/** Public URL with app locale (logging / docs). */
function pagePath(locale: string): string {
  const c = copyFor(locale);
  return `/${c.appLocale}/${c.slug}`;
}

/**
 * Footer/nav path without locale prefix — `localizeInternalHref` adds the active locale
 * (same pattern as `/blog`, `/contact`).
 */
function navPath(locale: string): string {
  return `/${copyFor(locale).slug}`;
}

/** Minimal DAST document (paragraphs only) for FAQ Structured Text fields. */
function plainStructuredText(paragraphs: string[]) {
  return {
    schema: "dast" as const,
    document: {
      type: "root" as const,
      children: paragraphs
        .map((p) => p.trim())
        .filter(Boolean)
        .map((value) => ({
          type: "paragraph" as const,
          children: [{ type: "span" as const, value }],
        })),
    },
  };
}

export default async function setupShippingReturnsFaqPage(client: Client): Promise<void> {
  const site = await client.site.find();
  const locales = site.locales;
  const force = process.env.SHIPPING_FAQ_FORCE === "1";
  console.log(`Site ${site.id} (${site.name}) — locales: ${locales.join(", ")}`);

  const [pageModel, textHeader, faqGroup, faqItem, navItem] = await Promise.all([
    client.itemTypes.find("page"),
    client.itemTypes.find("text_header"),
    client.itemTypes.find("faq_group"),
    client.itemTypes.find("faq_item"),
    client.itemTypes.find("nav_item_modular"),
  ]);

  const faqBlock = (locale: string) => {
    const c = copyFor(locale);
    return buildBlockRecord({
      item_type: ref(faqGroup.id),
      text_header_section: [textHeaderBlock(textHeader.id, c.headerTitle, c.headerDescription)],
      advanced_options: true,
      accordion_mode: "single",
      open_first_item: true,
      enable_faq_schema: true,
      header_alignment: "left",
      questions: c.items.map((item) =>
        buildBlockRecord({
          item_type: ref(faqItem.id),
          question: plainStructuredText([item.question]),
          answer: plainStructuredText(item.answer),
        }),
      ),
    });
  };

  const slugs = new Set(Object.values(COPY).map((c) => c.slug));
  let page = await findPageBySlug(client, slugs);

  if (!page) {
    page = await client.items.create({
      item_type: ref(pageModel.id),
      title: Object.fromEntries(locales.map((l) => [l, copyFor(l).title])),
      slug: Object.fromEntries(locales.map((l) => [l, copyFor(l).slug])),
      hero_page: Object.fromEntries(locales.map((l) => [l, null])),
      content_page: Object.fromEntries(locales.map((l) => [l, [faqBlock(l)]])),
      seo_settings_social: Object.fromEntries(
        locales.map((l) => [
          l,
          {
            title: copyFor(l).title,
            description: copyFor(l).seoDescription,
            image: null,
            twitter_card: null,
            no_index: false,
          },
        ]),
      ),
    });
    console.log(`  página criada: ${page.id}`);
  } else {
    console.log(`  página existente: ${page.id}`);
  }

  const full = await client.items.find(page.id, { nested: true });
  const content = asLocalized<Raw[]>(field(full, "content_page"));
  let faqsAdded = 0;
  let faqsReplaced = 0;

  const nextContent = Object.fromEntries(
    locales.map((l) => {
      const kept: BlockPayload[] = [];
      let seenFaq = false;
      for (const block of content[l] ?? []) {
        const id = blockId(block);
        if (!id) continue;
        if (blockTypeId(block) === faqGroup.id) {
          if (force) {
            faqsReplaced += 1;
            continue;
          }
          if (seenFaq) continue;
          seenFaq = true;
          kept.push(id);
          continue;
        }
        kept.push(id);
      }
      if (!seenFaq || force) {
        kept.unshift(faqBlock(l));
        if (!seenFaq) faqsAdded += 1;
      }
      return [l, kept];
    }),
  );

  if (faqsAdded > 0 || faqsReplaced > 0) {
    await client.items.update(page.id, {
      content_page: nextContent,
      title: Object.fromEntries(locales.map((l) => [l, copyFor(l).title])),
      slug: Object.fromEntries(locales.map((l) => [l, copyFor(l).slug])),
      seo_settings_social: Object.fromEntries(
        locales.map((l) => [
          l,
          {
            title: copyFor(l).title,
            description: copyFor(l).seoDescription,
            image: null,
            twitter_card: null,
            no_index: false,
          },
        ]),
      ),
    });
    if (faqsAdded > 0) console.log(`  faq_group adicionado (${faqsAdded} locale(s))`);
    if (faqsReplaced > 0) console.log(`  faq_group substituído (${faqsReplaced} bloco(s), SHIPPING_FAQ_FORCE=1)`);
  } else {
    console.log("  faq_group já presente (use SHIPPING_FAQ_FORCE=1 para reescrever)");
  }

  await publishIfDraftModel(client, await client.items.find(page.id), "página shipping-returns");

  await ensureFooterLink(client, {
    navItemTypeId: navItem.id,
    locales,
    pathFor: navPath,
    labelFor: (l) => copyFor(l).navLabel,
    name: "envios/devoluções",
    stalePathsFor: (l) => [pagePath(l)],
  });

  console.log(`Concluído. Página: ${locales.map(pagePath).join(" · ")}`);
}
