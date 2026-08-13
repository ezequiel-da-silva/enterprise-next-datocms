/**
 * Atributos estáveis para identificar blocos/seções CMS no DOM
 * (DevTools, testes, analytics, content-link). Não usam classes CSS.
 *
 * Exemplo: `<section data-cms-block="HeroSectionRecord" data-cms-block-id="abc">`
 */
export type CmsBlockRecordLike = {
  id?: string | null;
  __typename?: string | null;
};

export type CmsBlockAttrs = {
  "data-cms-block": string;
  "data-cms-block-id"?: string;
};

export function cmsBlockAttrs(record: CmsBlockRecordLike): CmsBlockAttrs {
  const typename = record.__typename?.trim() || "Unknown";
  const id = record.id != null ? String(record.id).trim() : "";
  if (id) {
    return { "data-cms-block": typename, "data-cms-block-id": id };
  }
  return { "data-cms-block": typename };
}
