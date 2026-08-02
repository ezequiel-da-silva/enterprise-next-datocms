import { Children, cloneElement, isValidElement, type ReactElement } from "react";
import { renderNodeRule } from "react-datocms/structured-text";
import { isBlockquote, isCode, isThematicBreak } from "datocms-structured-text-utils";

/**
 * Regras DAST partilhadas entre páginas CMS e o blog (sem blocos modulares).
 */
export const structuredTextDatoNodeRules = [
  renderNodeRule(isCode, ({ adapter: { renderNode, renderText }, key, node }) => {
    const label = (node.language ?? "code").trim() || "code";
    return renderNode(
      "figure",
      { key, className: "my-6 overflow-hidden rounded-lg border border-border bg-muted/40" },
      renderNode(
        "figcaption",
        {
          key: `${key}-cap`,
          className:
            "border-b border-border bg-muted/80 px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wide text-muted-foreground",
        },
        renderText(label, `${key}-lang`),
      ),
      renderNode(
        "pre",
        {
          key: `${key}-pre`,
          className: "m-0 overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-foreground",
        },
        renderNode("code", { key: `${key}-code`, className: "block whitespace-pre" }, renderText(node.code, `${key}-src`)),
      ),
    );
  }),
  renderNodeRule(isBlockquote, ({ adapter: { renderNode, renderText, renderFragment }, key, node, children }) => {
    const keyedInner = Children.map(children ?? null, (child, i) =>
      isValidElement(child) ? cloneElement(child, { key: `${key}-st-${i}` }) : child,
    );
    const inner = renderFragment((keyedInner ?? []) as ReactElement[], `${key}-inner`);
    const quoteBody = renderNode(
      "div",
      { key: `${key}-body`, className: "space-y-2 text-base italic leading-relaxed text-muted-foreground" },
      inner,
    );
    if (!node.attribution) {
      return renderNode("blockquote", { key, className: "my-6 border-l-4 border-primary/35 pl-4" }, quoteBody);
    }
    const cite = renderNode(
      "cite",
      { key: `${key}-cite`, className: "mt-3 block text-sm font-medium not-italic text-foreground" },
      renderText(node.attribution, `${key}-cite-text`),
    );
    return renderNode(
      "blockquote",
      { key, className: "my-6 border-l-4 border-primary/35 pl-4" },
      renderFragment([quoteBody, cite] as ReactElement[], `${key}-frag`),
    );
  }),
  renderNodeRule(isThematicBreak, ({ adapter: { renderNode }, key }) =>
    renderNode("hr", { key, className: "my-10 border-0 border-t border-border" }),
  ),
];
