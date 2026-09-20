import { Client } from "datocms/lib/cma-client-node";

export default async function orderContentListingSelectors(client: Client): Promise<void> {
  console.log("Ordering Content listing source selectors...");

  const contentSource = await client.fields.find("content_listing_section::content_source");
  const blogSelection = await client.fields.find("content_listing_section::blog_post_selection");
  const shopifySelection = await client.fields.find(
    "content_listing_section::shopify_product_selection",
  );

  await client.fields.update(blogSelection.id, { position: contentSource.position + 1 });
  await client.fields.update(shopifySelection.id, { position: contentSource.position + 2 });

  console.log("Content listing source selectors ordered.");
}
