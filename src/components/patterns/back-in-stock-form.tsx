"use client";

import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Field } from "@/components/molecules/field";
import { HONEYPOT_FIELD } from "@/constants/contact-form";
import type { AppLocale } from "@/constants/i18n";
import type { BackInStockActionState } from "@/core/entities/back-in-stock";
import type { BackInStockCopy } from "@/lib/i18n/back-in-stock-copy";
import { useActionState, useId } from "react";

export type BackInStockAction = (
  prev: BackInStockActionState,
  formData: FormData,
) => Promise<BackInStockActionState>;

type BackInStockFormProps = {
  locale: AppLocale;
  variantId: string;
  productHandle: string;
  copy: BackInStockCopy;
  action: BackInStockAction;
};

const INITIAL: BackInStockActionState = { status: "idle" };

export function BackInStockForm({
  locale,
  variantId,
  productHandle,
  copy,
  action,
}: BackInStockFormProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const emailId = useId();
  const emailError = state.status === "error" ? state.fieldErrors?.email : undefined;

  if (state.status === "success") {
    return (
      <p role="status" className="rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm text-foreground">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border bg-muted/30 p-3" noValidate>
      <p className="text-sm font-medium text-foreground">{copy.title}</p>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="productHandle" value={productHandle} />
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0" aria-hidden>
        <label htmlFor={`${emailId}-hp`}>
          Company website
          <input id={`${emailId}-hp`} type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Field id={emailId} label={copy.emailLabel} error={emailError}>
        <Input
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder={copy.emailPlaceholder}
          aria-invalid={Boolean(emailError)}
          aria-required="true"
        />
      </Field>
      {state.status === "error" && !emailError ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" variant="outline" className="w-full min-h-11" disabled={pending}>
        {pending ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}
