/**
 * Adds `product_page` to `post::post_content` Structured Text link allowlist.
 *
 * Idempotent: only appends the model ID when missing; keeps `page` and any other
 * existing `structured_text_links.item_types` (and cascade strategies).
 *
 *   npx datocms cma:script scripts/allow-product-in-blog-st.ts --profile=staging
 *   npx datocms cma:script scripts/allow-product-in-blog-st.ts --profile=default
 */
import type { Client } from "datocms/lib/cma-client-node";

const POST_CONTENT = "post::post_content";
const PRODUCT_MODEL = "product_page";

type StructuredTextLinksValidator = {
  item_types: string[];
  on_publish_with_unpublished_references_strategy?: "fail" | "publish_references";
  on_reference_unpublish_strategy?: "fail" | "unpublish" | "delete_references";
  on_reference_delete_strategy?: "fail" | "delete_references";
};

type StructuredTextFieldValidators = {
  structured_text_blocks?: { item_types: string[] };
  structured_text_inline_blocks?: { item_types: string[] };
  structured_text_links?: StructuredTextLinksValidator;
  required?: Record<string, never>;
  length?: { min?: number; max?: number };
};

function asStringArray(value: object | string | number | boolean | null | string[] | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string");
}

function readStructuredTextValidators(
  validators: object | null | undefined,
): StructuredTextFieldValidators {
  if (!validators || typeof validators !== "object") {
    return {};
  }
  const raw = validators as StructuredTextFieldValidators;
  return raw;
}

export default async function allowProductInBlogSt(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Site ${site.id} (${site.name})`);

  const productPage = await client.itemTypes.find(PRODUCT_MODEL);
  const postContent = await client.fields.find(POST_CONTENT);

  const current = readStructuredTextValidators(postContent.validators);
  const links = current.structured_text_links ?? { item_types: [] };
  const itemTypes = asStringArray(links.item_types);

  if (itemTypes.includes(productPage.id)) {
    console.log(`  já permitido: ${PRODUCT_MODEL} em ${POST_CONTENT} structured_text_links`);
    return;
  }

  itemTypes.push(productPage.id);
  await client.fields.update(postContent.id, {
    validators: {
      ...current,
      structured_text_links: { ...links, item_types: itemTypes },
    },
  });
  console.log(
    `  adicionado: ${PRODUCT_MODEL} → ${POST_CONTENT} structured_text_links (${itemTypes.length} tipos)`,
  );
}
