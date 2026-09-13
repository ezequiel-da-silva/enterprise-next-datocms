import type { LegalPageBySlugQuery } from "@/infra/datocms/generated/operations.types";

type LegalQueryData = NonNullable<LegalPageBySlugQuery["legalPage"]>;

export type LegalPageRecord = LegalQueryData & {
  title: string;
  slug: string;
};
