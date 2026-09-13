import { Client } from "datocms/lib/cma-client-node";

/** Aceita URLs absolutas (https://…) ou caminhos internos (/blog, /privacy-policy). */
const RELATIVE_OR_ABSOLUTE_URL = {
  required: {},
  format: {
    custom_pattern: "^(https?:\\/\\/[^\\s]+|/[^\\s]*)$",
  },
};

export default async function navItemLinkAllowRelativePaths(client: Client): Promise<void> {
  await client.fields.update("nav_item_modular::nav_item_link", {
    hint: "Caminho interno (/blog) ou URL absoluta (https://…). O Next acrescenta o locale aos paths internos.",
    validators: RELATIVE_OR_ABSOLUTE_URL,
  });
  await client.fields.update("nav_item_simple::nav_item_link", {
    hint: "Caminho interno (/privacy-policy) ou URL absoluta (https://…). O Next acrescenta o locale aos paths internos.",
    validators: RELATIVE_OR_ABSOLUTE_URL,
  });
}
