import { getNonce } from "@/lib/nonce";
import { stripStega } from "react-datocms/stega";

export type JsonLdNode = Record<string, unknown>;

type JsonLdProps = {
  graph: JsonLdNode | JsonLdNode[];
};

type JsonLdScriptSyncProps = JsonLdProps & {
  nonce?: string;
};

/**
 * Variante síncrona — usar quando o nonce já foi resolvido no componente pai async.
 */
export function JsonLdScriptSync({ graph, nonce }: JsonLdScriptSyncProps) {
  const payload = (Array.isArray(graph) ? graph : [graph]).map((node) => {
    if (node && typeof node === "object" && "@context" in node) {
      const rest = { ...node };
      delete rest["@context"];
      return rest;
    }
    return node;
  });
  const cleanPayload = stripStega(payload);

  return (
    <script
      type="application/ld+json"
      nonce={nonce ?? undefined}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": cleanPayload }),
      }}
    />
  );
}

/**
 * Injeta JSON-LD (Schema.org) com nonce CSP — prioriza crawlers e AEO.
 */
export async function JsonLdScript({ graph }: JsonLdProps) {
  const nonce = await getNonce();
  return <JsonLdScriptSync graph={graph} nonce={nonce} />;
}

/**
 * Ponto único de integração SEO na UI: JSON-LD com nonce (metadata fica em `generateMetadata`).
 */
export async function SeoManager(props: JsonLdProps) {
  return <JsonLdScript {...props} />;
}
