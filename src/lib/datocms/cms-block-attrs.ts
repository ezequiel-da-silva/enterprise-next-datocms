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

export type CmsRecordAttrs = {
  "data-cms-record": string;
  "data-cms-record-id"?: string;
};

export function cmsBlockAttrs(record: CmsBlockRecordLike): CmsBlockAttrs {
  const typename = record.__typename?.trim() || "Unknown";
  const id = record.id != null ? String(record.id).trim() : "";
  if (id) {
    return { "data-cms-block": typename, "data-cms-block-id": id };
  }
  return { "data-cms-block": typename };
}

/**
 * Atributos estáveis para registros independentes do DatoCMS no DOM
 * (modelos como AuthorRecord, LegalPageRecord, etc. que não são blocos modulares).
 *
 * Exemplo: `<section data-cms-record="AuthorRecord" data-cms-record-id="123">`
 */
export function cmsRecordAttrs(record: CmsBlockRecordLike): CmsRecordAttrs {
  const typename = record.__typename?.trim() || "Unknown";
  const id = record.id != null ? String(record.id).trim() : "";
  if (id) {
    return { "data-cms-record": typename, "data-cms-record-id": id };
  }
  return { "data-cms-record": typename };
}
