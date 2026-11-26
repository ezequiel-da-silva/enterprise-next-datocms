/**
 * Audits `legal_page` slug `refund-policy` (and a `page` with the same slug, if any)
 * for Brazilian CDC copy in locale `en`. Cleans `en` only when a hit is found.
 *
 *   npx datocms cma:script scripts/audit-refund-policy-en.ts --profile=staging
 *   npx datocms cma:script scripts/audit-refund-policy-en.ts --profile=default
 */
import type { Client } from "datocms/lib/cma-client-node";
import { asLocalized, field, publishIfDraftModel, type Raw } from "./lib/dato-script-helpers";

const SLUG = "refund-policy";
const EN = "en";
const CDC = /Art\.?\s*49|\bCDC\b|arrependimento|90 dias/i;

const CLEAN_TITLE = "Refund policy";
const CLEAN_SEO = "30-day returns on unused items, free return shipping, and how refunds are paid.";

function paragraph(value: string) {
  return { type: "paragraph" as const, children: [{ type: "span" as const, value }] };
}

function heading(value: string) {
  return { type: "heading" as const, level: 2 as const, children: [{ type: "span" as const, value }] };
}

function cleanEnglishDast() {
  const blocks = [
    heading("Returns"),
    paragraph("You can return an unused item within 30 days of delivery."),
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
    {
      type: "list" as const,
      style: "bulleted" as const,
      children: ["United States: $9.90", "Brazil: free", "Spain: €5"].map((value) => ({
        type: "listItem" as const,
        children: [paragraph(value)],
      })),
    },
    heading("Refunds"),
    paragraph(
      "After we inspect the return, we process the refund within 3 business days to the original payment method.",
    ),
  ];
  return { schema: "dast" as const, document: { type: "root" as const, children: blocks } };
}

function collectText(node: Raw): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node !== "object") return "";
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

function englishBlob(record: { id: string }): string {
  const title = asLocalized<Raw>(field(record, "title")).en;
  const content = asLocalized<Raw>(field(record, "content")).en;
  const seo = asLocalized<Raw>(field(record, "seo_settings_social")).en;
  const seoText =
    seo && typeof seo === "object"
      ? `${typeof field(seo, "title") === "string" ? field(seo, "title") : ""} ${typeof field(seo, "description") === "string" ? field(seo, "description") : ""}`
      : "";
  return `${collectText(title)} ${collectText(content)} ${seoText}`;
}

async function findByType(client: Client, type: string): Promise<{ id: string } | null> {
  for await (const candidate of client.items.listPagedIterator({ filter: { type }, version: "current" })) {
    if (slugMatches(field(candidate, "slug"))) return candidate;
  }
  return null;
}

export default async function auditRefundPolicyEn(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name}) — audit refund-policy en`);

  const hits: { type: string; id: string }[] = [];
  for (const type of ["legal_page", "page"] as const) {
    const found = await findByType(client, type);
    if (found) hits.push({ type, id: found.id });
  }

  if (hits.length === 0) {
    console.warn(`  nenhum registo slug "${SLUG}" — nada alterado`);
    return;
  }

  for (const hit of hits) {
    const full = await client.items.find(hit.id, { nested: true });
    const blob = englishBlob(full);
    if (!CDC.test(blob)) {
      console.log(`  ${hit.type} ${hit.id}: en clean`);
      continue;
    }

    console.log(`  ${hit.type} ${hit.id}: CDC copy in en — cleaning en only`);
    const titles = asLocalized<Raw>(field(full, "title"));
    const content = asLocalized<Raw>(field(full, "content"));
    const seo = asLocalized<Raw>(field(full, "seo_settings_social"));
    const previousSeo = seo.en && typeof seo.en === "object" && !Array.isArray(seo.en) ? seo.en : {};

    await client.items.update(hit.id, {
      title: { ...titles, [EN]: CLEAN_TITLE },
      content: { ...content, [EN]: cleanEnglishDast() },
      seo_settings_social: {
        ...seo,
        [EN]: { ...previousSeo, title: CLEAN_TITLE, description: CLEAN_SEO },
      },
    });
    await publishIfDraftModel(client, await client.items.find(hit.id), `${hit.type} ${SLUG}`);
  }
}
