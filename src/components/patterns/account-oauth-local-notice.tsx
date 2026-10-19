import type { AccountOAuthLocalNotice } from "@/lib/shopify/account-oauth-setup-hint";
import { Fragment } from "react";

type AccountOAuthLocalNoticeProps = {
  notice: AccountOAuthLocalNotice;
};

const CODE_SNIPPETS = ["ngrok http 3000", "NEXT_PUBLIC_SITE_URL", "localhost"] as const;

function StepLine({ text }: { text: string }) {
  const pattern = new RegExp(`(${CODE_SNIPPETS.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts = text.split(pattern);

  return (
    <span>
      {parts.map((part, i) =>
        CODE_SNIPPETS.includes(part as (typeof CODE_SNIPPETS)[number]) ? (
          <code key={i} className="rounded bg-muted px-1 py-0.5 text-xs font-medium text-foreground">
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  );
}

function InfoIcon() {
  return (
    <svg
      aria-hidden
      className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function AccountOAuthLocalNotice({ notice }: AccountOAuthLocalNoticeProps) {
  const titleId = "account-oauth-local-notice-title";

  return (
    <aside
      role="region"
      aria-labelledby={titleId}
      className="max-w-prose rounded-xl border border-border bg-muted/40 p-4 sm:p-5"
    >
      <div className="flex gap-3">
        <InfoIcon />
        <div className="min-w-0 space-y-3">
          <div className="space-y-1">
            <h2 id={titleId} className="text-sm font-semibold text-foreground">
              {notice.title}
            </h2>
            <p className="text-sm text-muted-foreground">{notice.summary}</p>
          </div>

          <ol className="m-0 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {notice.steps.map((step, index) => (
              <li key={index}>
                <StepLine text={step} />
              </li>
            ))}
          </ol>

          <div className="space-y-1.5 border-t border-border pt-3">
            <p className="text-xs font-medium text-foreground">{notice.callbackUriLabel}</p>
            <code className="block break-all rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground">
              {notice.callbackUri}
            </code>
            <p className="text-xs text-muted-foreground">{notice.callbackUriHint}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
