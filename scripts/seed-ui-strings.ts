/**
 * Fills the `ui_string` singleton with the built-in texts of `src/lib/i18n/*-copy.ts`, so
 * editors see the real copy instead of empty fields.
 *
 * Idempotent: only EMPTY (locale, field) pairs are written — existing edits are never overwritten.
 * Run once per environment after the `uiStringsSingleton` migration:
 *
 *   npx datocms cma:script scripts/seed-ui-strings.ts --profile=staging
 *   npx datocms cma:script scripts/seed-ui-strings.ts --profile=default
 */
import type { Client } from "datocms/lib/cma-client-node";
import { ACCOUNT_COPY } from "../src/lib/i18n/account-copy";
import { CART_COPY } from "../src/lib/i18n/cart-copy";
import { CONSENT_COPY } from "../src/lib/i18n/consent-copy";
import {
  ACCOUNT_ERROR_FIELDS,
  ACCOUNT_FIELDS,
  ACCOUNT_TEMPLATE_FIELDS,
  CART_FIELDS,
  CART_LINK_FIELDS,
  CONSENT_FIELDS,
} from "../src/lib/i18n/ui-strings-fields";
import { field, publishIfDraftModel, type Localized } from "./lib/dato-script-helpers";

type AppLocale = "en" | "pt" | "es";

/** Dato site locale → app locale (`pt-BR` is served under `/pt`). */
const APP_LOCALE_BY_DATO: Record<string, AppLocale> = { en: "en", "pt-BR": "pt", es: "es" };

function camelToSnake(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/** CDA field name → built-in text for one locale (templates use `{count}` / `{name}`). */
function defaultsFor(locale: AppLocale): Record<string, string> {
  const consent = CONSENT_COPY[locale];
  const cart = CART_COPY[locale];
  const account = ACCOUNT_COPY[locale];
  const out: Record<string, string> = {};

  for (const [key, name] of Object.entries(CONSENT_FIELDS)) {
    out[name] = consent[key as keyof typeof CONSENT_FIELDS];
  }
  for (const [key, name] of Object.entries(CART_FIELDS)) {
    out[name] = cart[key as keyof typeof CART_FIELDS];
  }
  out[CART_LINK_FIELDS.one] = cart.linkLabel(1).replace("1", "{count}");
  out[CART_LINK_FIELDS.other] = cart.linkLabel(2).replace("2", "{count}");

  for (const [key, name] of Object.entries(ACCOUNT_FIELDS)) {
    out[name] = account[key as keyof typeof ACCOUNT_FIELDS];
  }
  for (const [key, name] of Object.entries(ACCOUNT_ERROR_FIELDS)) {
    out[name] = account.errors[key as keyof typeof ACCOUNT_ERROR_FIELDS];
  }
  out[ACCOUNT_TEMPLATE_FIELDS.greeting] = account.greeting("{name}");
  out[ACCOUNT_TEMPLATE_FIELDS.greetingAnonymous] = account.greeting(null);
  out[ACCOUNT_TEMPLATE_FIELDS.linkSignedIn] = account.linkLabel(true);
  out[ACCOUNT_TEMPLATE_FIELDS.linkSignedOut] = account.linkLabel(false);
  return out;
}

export default async function seedUiStrings(client: Client): Promise<void> {
  const site = await client.site.find();
  const model = await client.itemTypes.find("ui_string");
  const locales = site.locales.filter((locale) => APP_LOCALE_BY_DATO[locale]);
  console.log(`Site ${site.id} (${site.name}) — locales: ${locales.join(", ")}`);

  const [existing] = await client.items.list({ filter: { type: "ui_string" }, page: { limit: 1 } });

  const current = (apiKey: string): Localized<unknown> => {
    const raw = existing ? field(existing, apiKey) : null;
    return raw && typeof raw === "object" ? (raw as Localized<unknown>) : {};
  };

  const values: Record<string, Localized<string>> = {};
  let filled = 0;
  for (const locale of locales) {
    const defaults = defaultsFor(APP_LOCALE_BY_DATO[locale]);
    for (const [cdaName, text] of Object.entries(defaults)) {
      const apiKey = camelToSnake(cdaName);
      const hash = (values[apiKey] ??= { ...(current(apiKey) as Localized<string>) });
      const present = hash[locale];
      if (typeof present === "string" && present.trim()) continue;
      hash[locale] = text;
      filled += 1;
    }
  }

  if (filled === 0) {
    console.log("  nada a preencher — todos os campos já têm texto.");
    return;
  }

  const record = existing
    ? await client.items.update(existing.id, values)
    : await client.items.create({ item_type: { type: "item_type", id: model.id }, ...values });
  console.log(`  ${existing ? "atualizado" : "criado"}: ${record.id} (${filled} valor(es) preenchido(s))`);
  await publishIfDraftModel(client, record, "ui_string");
}
