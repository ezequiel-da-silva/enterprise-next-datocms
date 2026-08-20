"use client";

import { HONEYPOT_FIELD } from "@/constants/contact-form";
import type { AppLocale } from "@/constants/i18n";
import type { UserReviewActionState } from "@/core/entities/user-review";
import {
  userReviewFormClientSchema,
  type UserReviewFormClientValues,
} from "@/core/entities/user-review";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Field } from "@/components/molecules/field";
import { cn } from "@/lib/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useState, startTransition } from "react";
import { Controller, useForm } from "react-hook-form";

function toFormData(values: UserReviewFormClientValues, locale: AppLocale): FormData {
  const fd = new FormData();
  fd.append("authorName", values.authorName);
  fd.append("authorEmail", values.authorEmail);
  fd.append("rating", String(values.rating));
  fd.append("comment", values.comment);
  fd.append("locale", locale);
  fd.append(HONEYPOT_FIELD, values[HONEYPOT_FIELD] ?? "");
  return fd;
}

export type ReviewFormProps = {
  locale: AppLocale;
  action: (prev: UserReviewActionState, formData: FormData) => Promise<UserReviewActionState>;
};

export function ReviewForm({ locale, action }: ReviewFormProps) {
  const [state, formAction, isPending] = useActionState(action, { status: "idle" });
  const [previewRating, setPreviewRating] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<UserReviewFormClientValues>({
    resolver: zodResolver(userReviewFormClientSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      authorName: "",
      authorEmail: "",
      rating: 5,
      comment: "",
      [HONEYPOT_FIELD]: "",
      locale,
    },
  });

  useEffect(() => {
    if (state.status === "success") {
      reset({
        authorName: "",
        authorEmail: "",
        rating: 5,
        comment: "",
        [HONEYPOT_FIELD]: "",
        locale,
      });
    }
    if (state.status === "error" && state.fieldErrors) {
      for (const [key, message] of Object.entries(state.fieldErrors)) {
        if (
          key === "authorName" ||
          key === "authorEmail" ||
          key === "rating" ||
          key === "comment"
        ) {
          setError(key, { type: "server", message });
        }
      }
    }
  }, [state, reset, setError, locale]);

  return (
    <form
      className="mx-auto grid max-w-xl gap-6 rounded-2xl border border-border bg-background/80 p-6 shadow-sm"
      noValidate
      aria-busy={isPending}
      onSubmit={handleSubmit((values) => {
        startTransition(() => {
          formAction(toFormData(values, locale));
        });
      })}
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Deixe sua avaliação</h3>
        <p className="text-sm text-muted-foreground">
          Seu depoimento será publicado após moderação.
        </p>
      </div>

      <Field id="authorName" label="Nome" error={errors.authorName?.message}>
        <Input
          id="authorName"
          autoComplete="name"
          required
          {...register("authorName")}
          aria-invalid={!!errors.authorName}
          aria-required="true"
        />
      </Field>

      <Field id="authorEmail" label="E-mail" error={errors.authorEmail?.message}>
        <Input
          id="authorEmail"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          {...register("authorEmail")}
          aria-invalid={!!errors.authorEmail}
          aria-required="true"
        />
      </Field>

      <Field
        id="rating"
        label="Avaliação"
        hint="Selecione de 1 a 5 estrelas. A avaliação começa com 5 estrelas."
        error={errors.rating?.message}
      >
        <Controller
          name="rating"
          control={control}
          render={({ field }) => {
            const selectedRating = Number(field.value);
            const visibleRating = previewRating ?? selectedRating;

            return (
              <div
                id="rating"
                role="radiogroup"
                aria-label="Avaliação de 1 a 5 estrelas"
                aria-required="true"
                aria-invalid={!!errors.rating}
                aria-describedby={errors.rating ? "rating-error" : "rating-hint"}
                className="flex w-fit flex-wrap gap-1 rounded-xl border border-border bg-muted/30 p-1.5"
                onMouseLeave={() => setPreviewRating(null)}
              >
                {[1, 2, 3, 4, 5].map((value) => {
                  const selected = selectedRating === value;
                  const highlighted = value <= visibleRating;

                  return (
                    <label
                      key={value}
                      className={cn(
                        "group relative inline-flex size-12 cursor-pointer items-center justify-center rounded-lg",
                        "transition-[transform,background-color,box-shadow] duration-150",
                        "hover:-translate-y-0.5 hover:bg-background hover:shadow-sm active:translate-y-0 active:scale-95",
                        "motion-reduce:translate-y-0 motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
                        "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
                        selected && "bg-background shadow-sm ring-1 ring-border",
                      )}
                      onMouseEnter={() => setPreviewRating(value)}
                      onFocus={() => setPreviewRating(value)}
                      onBlur={() => {
                        setPreviewRating(null);
                        field.onBlur();
                      }}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        value={value}
                        checked={selected}
                        onChange={() => field.onChange(value)}
                        name={field.name}
                        ref={field.ref}
                      />
                      <svg
                        viewBox="0 0 24 24"
                        className={cn(
                          "size-7 transition-[transform,color,fill] duration-150 group-hover:scale-110 motion-reduce:group-hover:scale-100",
                          highlighted
                            ? "fill-amber-400 text-amber-500"
                            : "fill-transparent text-muted-foreground/50",
                        )}
                        aria-hidden
                      >
                        <path
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                          d="m12 2.75 2.82 5.72 6.31.92-4.57 4.45 1.08 6.28L12 17.15l-5.64 2.97 1.08-6.28-4.57-4.45 6.31-.92L12 2.75Z"
                        />
                      </svg>
                      <span className="sr-only">
                        {value} {value === 1 ? "estrela" : "estrelas"}
                      </span>
                    </label>
                  );
                })}
              </div>
            );
          }}
        />
      </Field>

      <Field id="comment" label="Comentário" error={errors.comment?.message}>
        <Textarea
          id="comment"
          rows={5}
          required
          {...register("comment")}
          aria-invalid={!!errors.comment}
          aria-required="true"
        />
      </Field>

      <div className="relative">
        <label htmlFor={`review-${HONEYPOT_FIELD}`} className="sr-only">
          Não preencha este campo
        </label>
        <input
          id={`review-${HONEYPOT_FIELD}`}
          tabIndex={-1}
          autoComplete="off"
          {...register(HONEYPOT_FIELD)}
          className="absolute left-0 top-0 h-px w-px opacity-0"
          aria-hidden
        />
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      {state.status === "success" ? (
        <p role="status" className="text-sm text-muted-foreground">
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending || !isValid}
        aria-disabled={isPending || !isValid}
        variant="primary"
        className={cn(
          "min-h-12 cursor-pointer shadow-sm",
          "transition-[transform,box-shadow,background-color] duration-150",
          "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99]",
          "motion-reduce:translate-y-0 motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
          "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none",
        )}
      >
        {isPending ? "Enviando…" : "Enviar avaliação"}
      </Button>
      {!isValid && state.status !== "success" ? (
        <p className="-mt-3 text-center text-xs text-muted-foreground">
          Preencha corretamente todos os campos para enviar.
        </p>
      ) : null}
    </form>
  );
}
