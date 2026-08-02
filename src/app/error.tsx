"use client";

import { Button } from "@/components/atoms/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Algo correu mal</h1>
      <p className="mt-3 text-muted-foreground">
        Ocorreu um erro inesperado. Pode tentar novamente ou voltar mais tarde.
      </p>
      {process.env.NODE_ENV === "development" && error.message ? (
        <pre className="mt-4 w-full overflow-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
          {error.message}
        </pre>
      ) : null}
      <Button type="button" variant="primary" className="mt-6" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
