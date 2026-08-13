"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Fallback de documento completo (layout/root). Rotas `error.tsx` não incluem `<html>`.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Erro</title>
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Algo correu mal</h1>
          <p style={{ marginTop: "0.75rem", opacity: 0.8 }}>
            Ocorreu um erro inesperado. Pode tentar novamente ou voltar mais tarde.
          </p>
          {process.env.NODE_ENV === "development" && error.message ? (
            <pre
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                textAlign: "left",
                fontSize: "0.75rem",
                overflow: "auto",
                background: "#1e293b",
                borderRadius: "0.375rem",
              }}
            >
              {error.message}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1rem",
              borderRadius: "0.375rem",
              border: "none",
              background: "#f8fafc",
              color: "#0f172a",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
