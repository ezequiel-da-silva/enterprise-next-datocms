"use server";

import { HONEYPOT_FIELD } from "@/constants/contact-form";
import { DEFAULT_APP_LOCALE, isAppLocale, type AppLocale } from "@/constants/i18n";
import type { UserReviewActionState } from "@/core/entities/user-review";
import { submitUserReviewUseCase } from "@/core/use-cases/submit-user-review";
import { createPendingUserReview } from "@/infra/datocms/create-user-review";
import { reviewsCopy } from "@/lib/i18n/reviews-copy";
import { getClientIpKey } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

async function normalizeBotDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, 250 + Math.floor(Math.random() * 120)));
}

function readLocale(formData: FormData): AppLocale {
  const raw = String(formData.get("locale") ?? "").trim();
  return isAppLocale(raw) ? raw : DEFAULT_APP_LOCALE;
}

export async function submitUserReview(
  _prev: UserReviewActionState,
  formData: FormData,
): Promise<UserReviewActionState> {
  const locale = readLocale(formData);
  const copy = reviewsCopy(locale);
  const honeypot = String(formData.get(HONEYPOT_FIELD) ?? "");

  if (honeypot.trim().length > 0) {
    await normalizeBotDelay();
    return { status: "success", message: copy.status.submitted };
  }

  const ipKey = await getClientIpKey("user-review");
  const rate = checkRateLimit(ipKey, { limit: 5, windowMs: 60_000 });
  if (!rate.ok) {
    return { status: "error", message: copy.status.rateLimited };
  }

  const raw = {
    authorName: formData.get("authorName"),
    authorEmail: formData.get("authorEmail"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  };

  const result = await submitUserReviewUseCase(raw, locale, createPendingUserReview);

  if (!result.ok) {
    return {
      status: "error",
      fieldErrors: result.fieldErrors,
      /* `fieldErrors` seguem como código: quem traduz campo a campo é o formulário. */
      message: result.statusCode ? copy.status[result.statusCode] : undefined,
    };
  }

  return { status: "success", message: copy.status[result.statusCode] };
}
