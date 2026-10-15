import { Client } from "datocms/lib/cma-client-node";

/**
 * Singleton `ui_string`: textos de interface localizados (cookies, carrinho, conta).
 *
 * Todos os campos são opcionais — vazio = texto padrão do código (`src/lib/i18n/*-copy.ts`).
 * Os api keys espelham `src/lib/i18n/ui-strings-fields.ts` (camelCase no CDA); o teste
 * `ui-strings-fields.test.ts` falha se divergirem.
 *
 * Placeholders: `{count}` (rótulo do carrinho) e `{name}` (saudação da conta).
 *
 * Depois de aplicar (em cada projecto), preencher com os textos do código — só campos vazios:
 *   npx datocms cma:script scripts/seed-ui-strings.ts --profile=staging
 *   npx datocms cma:script scripts/seed-ui-strings.ts --profile=default
 */

type Spec = { key: string; label: string; multiline?: boolean; hint?: string };

const TEMPLATE_HINT_COUNT = "Use {count} para o número de itens.";
const TEMPLATE_HINT_NAME = "Use {name} para o primeiro nome do cliente.";

const GROUPS: { title: string; hint: string; fields: Spec[] }[] = [
  {
    title: "🍪 Cookies",
    hint: "Banner de consentimento (LGPD/GDPR). Texto legal: revise antes de publicar.",
    fields: [
      { key: "cookies_title", label: "Banner title" },
      { key: "cookies_description", label: "Banner description", multiline: true },
      { key: "cookies_accept_all", label: "Accept all button" },
      { key: "cookies_reject_non_essential", label: "Reject non-essential button" },
      { key: "cookies_privacy_policy", label: "Privacy policy link label" },
      { key: "cookies_manage", label: "Footer link: cookie preferences" },
    ],
  },
  {
    title: "🛒 Cart",
    hint: "Carrinho, botão de compra e mensagens de erro.",
    fields: [
      { key: "cart_title", label: "Cart page title" },
      { key: "cart_add_to_cart", label: "Add to cart button" },
      { key: "cart_adding", label: "Adding (loading) label" },
      { key: "cart_added", label: "Added confirmation" },
      { key: "cart_view_cart", label: "View cart link" },
      { key: "cart_sold_out", label: "Sold out label" },
      { key: "cart_error_generic", label: "Generic error", multiline: true },
      { key: "cart_error_rate_limit", label: "Rate limit error", multiline: true },
      { key: "cart_empty", label: "Empty cart message", multiline: true },
      { key: "cart_continue_shopping", label: "Continue shopping link" },
      { key: "cart_quantity", label: "Quantity label" },
      { key: "cart_each", label: "Unit price suffix", hint: 'Texto após o preço unitário, ex.: "cada".' },
      { key: "cart_update", label: "Update button" },
      { key: "cart_remove", label: "Remove button" },
      { key: "cart_subtotal", label: "Subtotal label" },
      { key: "cart_checkout", label: "Checkout button" },
      { key: "cart_checkout_note", label: "Checkout note", multiline: true },
      { key: "cart_checkout_unavailable", label: "Checkout unavailable message", multiline: true },
      {
        key: "cart_link_label_one",
        label: "Header cart link (1 item)",
        hint: `Nome acessível do ícone do carrinho no singular. ${TEMPLATE_HINT_COUNT} Só vale se o plural também estiver preenchido.`,
      },
      {
        key: "cart_link_label_other",
        label: "Header cart link (many items)",
        hint: `Nome acessível do ícone do carrinho no plural. ${TEMPLATE_HINT_COUNT} Só vale se o singular também estiver preenchido.`,
      },
    ],
  },
  {
    title: "👤 Account",
    hint: "Área do cliente (Shopify Customer Account).",
    fields: [
      { key: "account_title", label: "Account page title" },
      { key: "account_description", label: "Account page description", multiline: true },
      { key: "account_signed_out_intro", label: "Signed-out intro", multiline: true },
      { key: "account_sign_in", label: "Sign in button" },
      { key: "account_sign_out", label: "Sign out button" },
      { key: "account_greeting", label: "Greeting (with name)", hint: TEMPLATE_HINT_NAME },
      { key: "account_greeting_anonymous", label: "Greeting (no name)" },
      { key: "account_orders_title", label: "Recent orders title" },
      { key: "account_no_orders", label: "No orders message", multiline: true },
      { key: "account_view_order", label: "View order link" },
      { key: "account_view_order_hint", label: "View order hint (new tab)" },
      { key: "account_load_error", label: "Load error", multiline: true },
      { key: "account_error_login", label: "Error: sign-in incomplete", multiline: true },
      { key: "account_error_rate", label: "Error: too many attempts", multiline: true },
      { key: "account_error_unavailable", label: "Error: sign-in unavailable", multiline: true },
      { key: "account_link_label_signed_in", label: "Header link (signed in)" },
      { key: "account_link_label_signed_out", label: "Header link (signed out)" },
    ],
  },
];

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

async function findOrCreateModel(client: Client, apiKey: string, name: string, hint: string) {
  try {
    const existing = await client.itemTypes.find(apiKey);
    await client.itemTypes.update(existing.id, { name, hint });
    return existing;
  } catch {
    return client.itemTypes.create({
      name,
      api_key: apiKey,
      modular_block: false,
      singleton: true,
      draft_mode_active: false,
      all_locales_required: false,
      hint,
    });
  }
}

function stringPayload(spec: Spec) {
  const hint = [spec.hint, "Deixe vazio para usar o texto padrão do site."].filter(Boolean).join(" ");
  return spec.multiline
    ? {
        label: spec.label,
        hint,
        field_type: "text" as const,
        localized: true as const,
        validators: { length: { max: 600 } },
        appearance: { editor: "textarea", parameters: { placeholder: null }, addons: [] },
      }
    : {
        label: spec.label,
        hint,
        field_type: "string" as const,
        localized: true as const,
        validators: { length: { max: 160 } },
        appearance: { editor: "single_line", parameters: { heading: false, placeholder: null }, addons: [] },
      };
}

export default async function uiStringsSingleton(client: Client): Promise<void> {
  const model = await findOrCreateModel(
    client,
    "ui_string",
    "🔤 UI strings",
    "Textos de interface por idioma. Campo vazio = texto padrão do código. Não use para segredos nem para textos das páginas de erro.",
  );

  const fieldsets = await client.fieldsets.list(model.id);

  for (const group of GROUPS) {
    const fieldset =
      fieldsets.find((fs) => fs.title === group.title) ??
      (await client.fieldsets.create(model.id, {
        title: group.title,
        hint: group.hint,
        collapsible: true,
        start_collapsed: group.title !== "🍪 Cookies",
      }));

    for (const spec of group.fields) {
      const payload = stringPayload(spec);
      const existing = await findField(client, `ui_string::${spec.key}`);
      if (existing) {
        await client.fields.update(existing.id, payload);
      } else {
        await client.fields.create(model.id, {
          ...payload,
          api_key: spec.key,
          fieldset: { type: "fieldset", id: fieldset.id },
        });
      }
    }
  }
}
