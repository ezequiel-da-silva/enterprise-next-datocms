export type SearchHit = {
  id: string;
  title: string;
  href: string;
  kind: "page" | "post" | "author" | "product" | "collection";
};

export type SearchResultsPayload = { hits: SearchHit[]; error?: string };
