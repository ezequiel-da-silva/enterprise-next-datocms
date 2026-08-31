import type { AppLocale } from "@/constants/i18n";
import { recordToWebsiteRoute } from "@/lib/datocms/record-to-website-route";
import { stripStega } from "react-datocms/stega";

export type LinkTypeContent = "external" | "page" | "post" | "category" | "author";

type UnknownRecord = Record<string, unknown>;

/** Bloqueia `javascript:`, `data:`, etc. em links externos vindos do CMS. */
export function isSafeExternalHref(href: string): boolean {
  const t = href.trim();
  if (!t) return false;
  const scheme = t.split(":")[0]?.toLowerCase() ?? "";
  if (["javascript", "data", "vbscript", "file"].includes(scheme)) {
    return false;
  }
  if (t.startsWith("//")) {
    return false;
  }
  try {
    const u = new URL(t, "https://placeholder.invalid");
    return ["http:", "https:", "mailto:", "tel:"].includes(u.protocol);
  } catch {
    return t.startsWith("/") && !t.startsWith("//");
  }
}

function readString(r: UnknownRecord, camel: string, snake: string): string | null {
  const raw = r[camel] ?? r[snake];
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  return t.length > 0 ? t : null;
}

function readBool(r: UnknownRecord, camel: string, snake: string): boolean {
  const raw = r[camel] ?? r[snake];
  return raw === true;
}

function readLinked(r: UnknownRecord, camel: string, snake: string): UnknownRecord | null {
  const raw = r[camel] ?? r[snake];
  if (!raw || typeof raw !== "object") return null;
  return raw as UnknownRecord;
}

function typenameOf(linked: UnknownRecord): string | null {
  const t = linked.__typename;
  return typeof t === "string" ? t : null;
}

function slugFromLinked(type: LinkTypeContent, linked: UnknownRecord): string | null {
  switch (type) {
    case "page": {
      const s = linked.slug;
      return typeof s === "string" && s.trim() !== "" ? s.trim() : null;
    }
    case "post": {
      const s = linked.postSlug ?? linked.post_slug;
      return typeof s === "string" && s.trim() !== "" ? s.trim() : null;
    }
    case "category": {
      const s = linked.categorySlug ?? linked.category_slug;
      return typeof s === "string" && s.trim() !== "" ? s.trim() : null;
    }
    case "author": {
      const s = linked.authorSlug ?? linked.author_slug;
      return typeof s === "string" && s.trim() !== "" ? s.trim() : null;
    }
    default:
      return null;
  }
}

export type ResolvedLinkBlock =
  | { kind: "internal"; href: string; newTab: boolean; ariaLabel: string | null; label: string | null }
  | { kind: "external"; href: string; newTab: boolean; ariaLabel: string | null; label: string | null };

/**
 * Lê o bloco Link do Dato (campos camelCase do GraphQL ou snake_case vindos de JSON).
 */
export function resolveLinkBlock(record: UnknownRecord, locale: AppLocale): ResolvedLinkBlock | null {
  const rawType = readString(record, "typeContent", "type_content");
  const typeRaw = rawType ? stripStega(rawType).toLowerCase() : null;
  if (!typeRaw) return null;

  const openInNewTab = readBool(record, "openInNewTab", "open_in_new_tab");
  const rawAriaLabel = readString(record, "ctaLinkAria", "cta_link_aria");
  const ariaLabel = rawAriaLabel ? stripStega(rawAriaLabel) : null;
  const label = readString(record, "ctaLabel", "cta_label");

  if (typeRaw === "external") {
    const href = readString(record, "externalLink", "external_link");
    if (!href || !isSafeExternalHref(href)) return null;
    return { kind: "external", href, newTab: true, ariaLabel, label };
  }

  const type = typeRaw as LinkTypeContent;
  if (type !== "page" && type !== "post" && type !== "category" && type !== "author") {
    return null;
  }

  const linked =
    type === "page"
      ? readLinked(record, "internalLinkPage", "internal_link_page")
      : type === "post"
        ? readLinked(record, "internalLinkPost", "internal_link_post")
        : type === "category"
          ? readLinked(record, "internalLinkCategory", "internal_link_category")
          : readLinked(record, "internalLinkAuthor", "internal_link_author");

  if (!linked) return null;

  const typename = typenameOf(linked);
  const slug = slugFromLinked(type, linked);
  if (!typename || !slug) return null;

  const path = recordToWebsiteRoute(typename, slug, locale);
  if (!path) return null;

  return {
    kind: "internal",
    href: path,
    newTab: openInNewTab,
    ariaLabel,
    label,
  };
}
