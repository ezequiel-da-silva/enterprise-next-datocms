export type SearchHit = {
  id: string;
  title: string;
  href: string;
  kind: "page" | "post" | "author";
};
