"use server";

import { HONEYPOT_FIELD } from "@/constants/contact-form";
import { backInStockSchema, type BackInStockActionState } from "@/core/entities/back-in-stock";
import { registerBackInStockInterest } from "@/infra/back-in-stock/register";
import { checkRateLimit } from "@/infra/security/rate-limit";
import { isAppLocale, type AppLocale } from "@/constants/i18n";
import { backInStockCopy } from "@/lib/i18n/back-in-stock-copy";
import { getClientIpKey } from "@/lib/security/client-ip";

async function normalizeBotDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, 250 + Math.floor(Math.random() * 120)));
}

export async function submitBackInStock(
  _prev: BackInStockActionState,
  formData: FormData,
): Promise<BackInStockActionState> {
  const localeRaw = String(formData.get("locale") ?? "en");
  const locale: AppLocale = isAppLocale(localeRaw) ? localeRaw : "en";
  const copy = backInStockCopy(locale);

  const honeypot = String(formData.get(HONEYPOT_FIELD) ?? "");
  if (honeypot.trim().length > 0) {
    await normalizeBotDelay();
    return { status: "success", message: copy.success };
  }

  const rate = await checkRateLimit(await getClientIpKey("back-in-stock"), {
    limit: 5,
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return { status: "error", message: copy.errorRateLimit };
  }

  const parsed = backInStockSchema.safeParse({
    email: formData.get("email"),
    variantId: formData.get("variantId"),
    productHandle: formData.get("productHandle"),
    locale,
  });
  if (!parsed.success) {
    const emailIssue = parsed.error.flatten().fieldErrors.email?.[0];
    return {
      status: "error",
      message: copy.errorGeneric,
      fieldErrors: { email: emailIssue ? copy.errorEmail : undefined },
    };
  }

  await registerBackInStockInterest(parsed.data);
  return { status: "success", message: copy.success };
}
