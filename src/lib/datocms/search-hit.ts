export type SearchHit = {
  id: string;
  title: string;
  href: string;
  kind: "page" | "post" | "author";
};

export type SearchResultsPayload = { hits: SearchHit[]; error?: string };
