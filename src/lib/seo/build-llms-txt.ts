export type LlmsLink = {
  title: string;
  url: string;
  description?: string | null;
};

export type LlmsDocumentInput = {
  siteName: string;
  description: string;
  pages: LlmsLink[];
  blog: LlmsLink[];
  products: LlmsLink[];
  collections: LlmsLink[];
  policies: LlmsLink[];
  sitemapUrl: string;
  robotsUrl: string;
};

const BLURB_MAX = 160;

/** Uma linha citável: espaços colapsados e corte perto de 160 caracteres. */
export function llmsBlurb(value: string | null | undefined): string | undefined {
  const collapsed = value?.replace(/\s+/g, " ").trim();
  if (!collapsed) return undefined;
  if (collapsed.length <= BLURB_MAX) return collapsed;
  const slice = collapsed.slice(0, BLURB_MAX);
  const space = slice.lastIndexOf(" ");
  const cut = (space > 100 ? slice.slice(0, space) : slice).trim();
  return `${cut}…`;
}

function linkLabel(title: string, url: string): string {
  const cleaned = title.replace(/[[\]]/g, "").replace(/\s+/g, " ").trim();
  return cleaned || url;
}

function linkLine(link: LlmsLink): string {
  const item = `- [${linkLabel(link.title, link.url)}](${link.url})`;
  const blurb = llmsBlurb(link.description);
  return blurb ? `${item}: ${blurb}` : item;
}

function section(heading: string, links: LlmsLink[]): string[] {
  if (links.length === 0) return [];
  return ["", `## ${heading}`, "", ...links.map(linkLine)];
}

/** Markdown llmstxt.org: identidade, páginas, blog, catálogo, políticas e sitemap. */
export function buildLlmsTxt(input: LlmsDocumentInput): string {
  const lines = [`# ${input.siteName.trim() || "Site"}`, "", input.description.trim()];
  lines.push(...section("Pages", input.pages));
  lines.push(...section("Blog", input.blog));
  lines.push(...section("Products", input.products));
  lines.push(...section("Collections", input.collections));
  lines.push(...section("Policies", input.policies));
  lines.push(
    "",
    "## Optional",
    "",
    `- [Sitemap](${input.sitemapUrl})`,
    `- [Robots](${input.robotsUrl})`,
    "",
  );
  return lines.join("\n");
}
