/**
 * Rewrites the `legal_page` slug `refund-policy` so the human copy matches the
 * PDP JSON-LD contract (30-day window, free return shipping, market outbound rates).
 *
 * Idempotent: skips when the English body already contains the anchor sentence.
 * `REFUND_POLICY_FORCE=1` rewrites anyway. Does not create the record if missing.
 *
 *   npx datocms cma:script scripts/update-refund-policy-page.ts --profile=default
 */
import type { Client } from "datocms/lib/cma-client-node";
import { asLocalized, field, publishIfDraftModel, type Raw } from "./lib/dato-script-helpers";

const SLUG = "refund-policy";
const ANCHOR = "You can return an unused item within 30 days of delivery.";

type Span = { type: "span"; value: string };
type Paragraph = { type: "paragraph"; children: Span[] };
type Heading = { type: "heading"; level: 2; children: Span[] };
type ListItem = { type: "listItem"; children: Paragraph[] };
type BulletList = { type: "list"; style: "bulleted"; children: ListItem[] };
type Block = Heading | Paragraph | BulletList;

type LocaleCopy = {
  title: string;
  seoDescription: string;
  blocks: Block[];
};

function paragraph(value: string): Paragraph {
  return { type: "paragraph", children: [{ type: "span", value }] };
}

function heading(value: string): Heading {
  return { type: "heading", level: 2, children: [{ type: "span", value }] };
}

function bullets(items: string[]): BulletList {
  return {
    type: "list",
    style: "bulleted",
    children: items.map((value) => ({ type: "listItem", children: [paragraph(value)] })),
  };
}

function dast(blocks: Block[]) {
  return { schema: "dast" as const, document: { type: "root" as const, children: blocks } };
}

const COPY: Record<string, LocaleCopy> = {
  en: {
    title: "Refund policy",
    seoDescription: "30-day returns on unused items, free return shipping, and how refunds are paid.",
    blocks: [
      heading("Returns"),
      paragraph(ANCHOR),
      paragraph("The item must be unused, with its tags attached, and in the original packaging."),
      heading("How to start a return"),
      paragraph("Return shipping is free. We email a prepaid return label after you request it."),
      paragraph(
        "Request the label from the contact page at /contact, or from your Shopify order confirmation email. Include your order number.",
      ),
      heading("Shipping"),
      paragraph(
        "We prepare orders in 1–2 business days. Transit usually takes 3–7 business days. Outbound shipping depends on the market:",
      ),
      bullets(["United States: $9.90", "Brazil: free", "Spain: €5"]),
      heading("Refunds"),
      paragraph(
        "After we inspect the return, we process the refund within 3 business days to the original payment method.",
      ),
    ],
  },
  "pt-BR": {
    title: "Política de reembolso",
    seoDescription: "Devolução em 30 dias para artigos sem uso, frete de devolução grátis e como o reembolso é pago.",
    blocks: [
      heading("Devoluções"),
      paragraph("Podes devolver um artigo sem uso no prazo de 30 dias após a entrega."),
      paragraph("O artigo tem de estar sem uso, com as etiquetas e na embalagem original."),
      heading("Como iniciar uma devolução"),
      paragraph("O frete de devolução é grátis. Enviamos uma etiqueta pré-paga depois do pedido."),
      paragraph(
        "Pede a etiqueta na página de contacto em /contato, ou a partir do e-mail de confirmação da Shopify. Indica o número do pedido.",
      ),
      heading("Envio"),
      paragraph(
        "Preparamos os pedidos em 1–2 dias úteis. O transporte costuma levar 3–7 dias úteis. O frete de ida depende do mercado:",
      ),
      bullets(["Estados Unidos: $9.90", "Brasil: grátis", "Espanha: 5 €"]),
      heading("Reembolso"),
      paragraph(
        "Depois de inspecionarmos a devolução, processamos o reembolso em até 3 dias úteis, no mesmo meio de pagamento.",
      ),
    ],
  },
  es: {
    title: "Política de devoluciones",
    seoDescription: "Devolución en 30 días para artículos sin usar, gastos de devolución gratuitos y cómo se paga el reembolso.",
    blocks: [
      heading("Devoluciones"),
      paragraph("Puedes devolver un artículo sin usar en un plazo de 30 días desde la entrega."),
      paragraph("El artículo debe estar sin usar, con las etiquetas y en su embalaje original."),
      heading("Cómo iniciar una devolución"),
      paragraph("Los gastos de devolución son gratuitos. Enviamos una etiqueta prepagada después de la solicitud."),
      paragraph(
        "Pide la etiqueta en la página de contacto en /contacto, o desde el correo de confirmación de Shopify. Incluye el número de pedido.",
      ),
      heading("Envío"),
      paragraph(
        "Preparamos los pedidos en 1–2 días laborables. El tránsito suele ser de 3–7 días laborables. El envío de ida depende del mercado:",
      ),
      bullets(["Estados Unidos: $9.90", "Brasil: gratis", "España: 5 €"]),
      heading("Reembolso"),
      paragraph(
        "Tras inspeccionar la devolución, procesamos el reembolso en un plazo de hasta 3 días laborables, en el mismo medio de pago.",
      ),
    ],
  },
};

function copyFor(locale: string): LocaleCopy {
  return COPY[locale] ?? COPY.en;
}

function collectText(node: Raw): string {
  if (!node || typeof node !== "object") return "";
  const value = field(node, "value");
  const own = typeof value === "string" ? value : "";
  const children = field(node, "children");
  const nested = Array.isArray(children) ? children.map((child) => collectText(child as Raw)).join(" ") : "";
  const document = field(node, "document");
  return `${own} ${nested} ${document ? collectText(document) : ""}`;
}

function slugMatches(raw: Raw): boolean {
  if (typeof raw === "string") return raw.trim() === SLUG;
  return Object.values(asLocalized<Raw>(raw)).some((value) => typeof value === "string" && value.trim() === SLUG);
}

export default async function updateRefundPolicyPage(client: Client): Promise<void> {
  const site = await client.site.find();
  const locales = site.locales;
  const force = process.env.REFUND_POLICY_FORCE === "1";
  console.log(`Site ${site.id} (${site.name}) — locales: ${locales.join(", ")}`);

  let page: { id: string } | null = null;
  for await (const candidate of client.items.listPagedIterator({ filter: { type: "legal_page" } })) {
    if (slugMatches(field(candidate, "slug"))) {
      page = candidate;
      break;
    }
  }

  if (!page) {
    console.warn(`  legal_page "${SLUG}" não encontrada — nada criado.`);
    return;
  }

  const full = await client.items.find(page.id, { nested: true });
  const english = asLocalized<Raw>(field(full, "content")).en;
  const alreadyAligned = collectText(english).includes(ANCHOR);
  if (alreadyAligned && !force) {
    console.log(`  ${SLUG} já alinhada (use REFUND_POLICY_FORCE=1 para reescrever)`);
    await publishIfDraftModel(client, full, SLUG);
    return;
  }

  const currentSeo = asLocalized<Raw>(field(full, "seo_settings_social"));
  await client.items.update(full.id, {
    title: Object.fromEntries(locales.map((locale) => [locale, copyFor(locale).title])),
    content: Object.fromEntries(locales.map((locale) => [locale, dast(copyFor(locale).blocks)])),
    seo_settings_social: Object.fromEntries(
      locales.map((locale) => {
        const previous = currentSeo[locale];
        const base = previous && typeof previous === "object" && !Array.isArray(previous) ? previous : {};
        return [
          locale,
          {
            ...base,
            title: copyFor(locale).title,
            description: copyFor(locale).seoDescription,
          },
        ];
      }),
    ),
  });
  console.log(force && alreadyAligned ? `  ${SLUG} reescrita (REFUND_POLICY_FORCE=1)` : `  ${SLUG} atualizada`);
  await publishIfDraftModel(client, await client.items.find(full.id), SLUG);
}
