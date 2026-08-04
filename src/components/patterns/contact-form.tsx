"use client";

import { HONEYPOT_FIELD } from "@/constants/contact-form";
import type { ContactActionState } from "@/core/entities/contact";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Field } from "@/components/molecules/field";
import {
  contactFormClientSchema,
  type ContactFormClientValues,
} from "@/core/entities/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, startTransition } from "react";
import { useForm } from "react-hook-form";

function toFormData(values: ContactFormClientValues): FormData {
  const fd = new FormData();
  fd.append("name", values.name);
  fd.append("email", values.email);
  fd.append("message", values.message);
  fd.append(HONEYPOT_FIELD, values[HONEYPOT_FIELD] ?? "");
  return fd;
}

export type ContactFormProps = {
  action: (prev: ContactActionState, formData: FormData) => Promise<ContactActionState>;
};

export function ContactForm({ action }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(action, { status: "idle" });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactFormClientValues>({
    resolver: zodResolver(contactFormClientSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      [HONEYPOT_FIELD]: "",
    },
  });

  useEffect(() => {
    if (state.status === "success") {
      reset();
    }
    if (state.status === "error" && state.fieldErrors) {
      for (const [key, message] of Object.entries(state.fieldErrors)) {
        if (key === "name" || key === "email" || key === "message") {
          setError(key, { type: "server", message });
        }
      }
    }
  }, [state, reset, setError]);

  return (
    <form
      className="mx-auto grid max-w-xl gap-6"
      noValidate
      aria-busy={isPending}
      onSubmit={handleSubmit((values) => {
        startTransition(() => {
          formAction(toFormData(values));
        });
      })}
    >
      <Field id="name" label="Nome" error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          required
          {...register("name")}
          aria-invalid={!!errors.name}
          aria-required="true"
        />
      </Field>

      <Field id="email" label="E-mail" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          {...register("email")}
          aria-invalid={!!errors.email}
          aria-required="true"
        />
      </Field>

      <Field id="message" label="Mensagem" error={errors.message?.message}>
        <Textarea
          id="message"
          rows={6}
          required
          {...register("message")}
          aria-invalid={!!errors.message}
          aria-required="true"
        />
      </Field>

      <div className="relative">
        <label htmlFor={HONEYPOT_FIELD} className="sr-only">
          Não preencha este campo
        </label>
        <input
          id={HONEYPOT_FIELD}
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

      <Button type="submit" disabled={isPending} variant="primary">
        {isPending ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  );
}
