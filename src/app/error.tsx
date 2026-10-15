"use client";

import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { errorCopy, errorLocaleFromPath } from "@/lib/i18n/error-copy";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  const copy = errorCopy(errorLocaleFromPath(usePathname()));
  const headingRef = useRef<HTMLHeadingElement>(null);

  /* Moves focus off whatever was clicked so screen readers announce the error; next Tab reaches the retry button. */
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <Container
      size="xs"
      name="RouteError"
      className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center"
    >
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-foreground outline-none">
        {copy.title}
      </h1>
      <p className="mt-3 text-muted-foreground">{copy.description}</p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {copy.reference}: <code className="font-mono select-all">{error.digest}</code>
        </p>
      ) : null}
      {process.env.NODE_ENV === "development" && error.message ? (
        <pre className="mt-4 w-full overflow-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
          {error.message}
        </pre>
      ) : null}
      <Button type="button" variant="primary" className="mt-6" onClick={reset}>
        {copy.retry}
      </Button>
    </Container>
  );
}
