type HomeCmsSectionProps = {
  locales: string[];
  error?: string;
};

export function HomeCmsSection({ locales, error }: HomeCmsSectionProps) {
  if (error) {
    return (
      <section aria-labelledby="cms-heading" className="rounded-lg border border-border p-6">
        <h2 id="cms-heading" className="text-lg font-semibold text-foreground">
          DatoCMS
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure <code className="rounded bg-muted px-1 py-0.5">DATOCMS_API_TOKEN</code> para
          ativar o conteúdo dinâmico. Detalhe: {error}
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="cms-heading" className="rounded-lg border border-border p-6">
      <h2 id="cms-heading" className="text-lg font-semibold text-foreground">
        Conteúdo via DatoCMS
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Locales publicados no projeto:{" "}
        <span className="font-medium text-foreground">{locales.join(", ") || "—"}</span>
      </p>
    </section>
  );
}
