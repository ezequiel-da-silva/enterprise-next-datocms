/**
 * One-shot PT-BR home FAQ polish (home seed preserves faq_group):
 * - “placa” → “prancha”
 * - Soften punitive refund wording
 *
 *   npx datocms cma:script scripts/patch-home-faq-pt-br.ts --profile=default
 */
import { buildBlockRecord } from "@datocms/cma-client-node";
import type { Client } from "datocms/lib/cma-client-node";
import {
  type BlockPayload,
  type Raw,
  asLocalized,
  blockAttr,
  blockId,
  blockTypeId,
  field,
  findPageBySlug,
  publishIfDraftModel,
  ref,
} from "./lib/dato-script-helpers";

const PT = "pt-BR";

const EMPATHIC_REFUND =
  "Antes de enviar a devolução, confira as condições na Política de reembolso — assim evitamos atrasos no seu reembolso.";

type DastNode = {
  type?: string;
  value?: string;
  children?: DastNode[];
  document?: DastNode;
  schema?: string;
};

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

function collectSpans(node: DastNode | null | undefined, out: string[] = []): string[] {
  if (!node || typeof node !== "object") return out;
  if (typeof node.value === "string") out.push(node.value);
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectSpans(child, out);
  }
  if (node.document) collectSpans(node.document, out);
  return out;
}

function dastPlain(raw: Raw): string {
  if (!raw || typeof raw !== "object") return "";
  const root = field(raw, "document") ?? raw;
  return collectSpans(root as DastNode)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function rewriteQuestion(text: string): string | null {
  let next = text;
  next = next.replace(/\bplaca\b/gi, "prancha");
  next = next.replace(/\bplacas\b/gi, "pranchas");
  next = next.replace(/Qual placa/gi, "Qual prancha");
  return next !== text ? next : null;
}

function rewriteAnswer(text: string): string | null {
  let next = text;
  next = next.replace(/\bplaca\b/gi, "prancha");
  next = next.replace(/\bplacas\b/gi, "pranchas");

  const punitive =
    /leia-as antes|antes de enviar qualquer|antes de devolver/i.test(next) ||
    (/política de reembolso/i.test(next) && /leia/i.test(next) && /antes/i.test(next));

  if (punitive) {
    return EMPATHIC_REFUND;
  }

  return next !== text ? next : null;
}

export default async function patchHomeFaqPtBr(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name}) — patch home FAQ pt-BR`);

  const [faqGroup, faqItem] = await Promise.all([
    client.itemTypes.find("faq_group"),
    client.itemTypes.find("faq_item"),
  ]);

  const page = await findPageBySlug(client, new Set(["home"]));
  if (!page) throw new Error('Page slug "home" not found');

  const full = await client.items.find(page.id, { nested: true });
  const content = asLocalized<Raw[]>(field(full, "content_page"));
  const localeBlocks = content[PT] ?? [];
  if (localeBlocks.length === 0) {
    throw new Error(`home content_page empty for ${PT}`);
  }

  let changedItems = 0;
  const nextLocale: BlockPayload[] = [];

  for (const block of localeBlocks) {
    const id = blockId(block);
    if (!id) continue;
    if (blockTypeId(block) !== faqGroup.id) {
      nextLocale.push(id);
      continue;
    }

    const questionsRaw = blockAttr(block, "questions");
    const questions = Array.isArray(questionsRaw) ? questionsRaw : [];
    const nextQuestions: BlockPayload[] = [];

    for (const q of questions) {
      const qid = blockId(q);
      if (!qid) continue;
      const qText = dastPlain(blockAttr(q, "question"));
      const aText = dastPlain(blockAttr(q, "answer"));
      const newQ = rewriteQuestion(qText);
      const newA = rewriteAnswer(aText);

      if (!newQ && !newA) {
        nextQuestions.push(qid);
        continue;
      }

      changedItems += 1;
      console.log(`  FAQ item ${qid}:`);
      if (newQ) console.log(`    Q: "${qText}" → "${newQ}"`);
      if (newA) console.log(`    A: "${aText.slice(0, 80)}…" → "${newA.slice(0, 80)}…"`);

      nextQuestions.push(
        buildBlockRecord({
          id: qid,
          item_type: ref(faqItem.id),
          question: plainStructuredText([newQ ?? qText]),
          answer: plainStructuredText([newA ?? aText]),
        }),
      );
    }

    const headerRaw = blockAttr(block, "text_header_section");
    const headerIds = Array.isArray(headerRaw)
      ? headerRaw.map((h) => blockId(h)).filter((hid): hid is string => Boolean(hid))
      : [];

    nextLocale.push(
      buildBlockRecord({
        id,
        item_type: ref(faqGroup.id),
        text_header_section: headerIds,
        advanced_options: blockAttr(block, "advanced_options") ?? true,
        accordion_mode: blockAttr(block, "accordion_mode") ?? "single",
        open_first_item: blockAttr(block, "open_first_item") ?? true,
        enable_faq_schema: blockAttr(block, "enable_faq_schema") ?? true,
        header_alignment: blockAttr(block, "header_alignment") ?? "left",
        questions: nextQuestions,
      }),
    );
  }

  if (changedItems === 0) {
    console.log("  nenhum item FAQ pt-BR precisou de alteração (placa / tom reembolso)");
    return;
  }

  const nextContent = { ...content, [PT]: nextLocale };
  await client.items.update(page.id, { content_page: nextContent });
  await publishIfDraftModel(client, await client.items.find(page.id), "home");
  console.log(`  atualizados ${changedItems} item(ns) FAQ`);
}
