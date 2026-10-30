import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import type { AppLocale } from "@/constants/i18n";
import type { CustomerOrder, CustomerOverview } from "@/infra/shopify/customer-account";
import type { AccountCopy, AccountErrorCode } from "@/lib/i18n/account-copy";
import { crumbsToNavItems, homeBreadcrumbLabel } from "@/lib/seo/breadcrumb-labels";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import { AccountOAuthLocalNotice } from "@/components/patterns/account-oauth-local-notice";
import type { AccountOAuthLocalNotice as AccountOAuthLocalNoticeContent } from "@/lib/shopify/account-oauth-setup-hint";
import { accountPath } from "@/lib/shopify/customer-session";

type AccountViewProps = {
  locale: AppLocale;
  /** Resolved on the server (CMS `ui_string` over the built-in copy). */
  copy: AccountCopy;
  /** `null` = signed out; `"error"` = signed in but the Customer Account API call failed. */
  customer: CustomerOverview | "error" | null;
  error?: AccountErrorCode | null;
  /** When set, shown under the sign-in button (localhost OAuth setup). */
  oauthLocalNotice?: AccountOAuthLocalNoticeContent | null;
};

function formatOrderDate(locale: AppLocale, iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : locale, { dateStyle: "medium", timeZone: "UTC" }).format(
    date,
  );
}

function OrderItem({ order, locale, copy }: { order: CustomerOrder; locale: AppLocale; copy: AccountCopy }) {
  const status = order.financialStatus ? (copy.financialStatus[order.financialStatus] ?? order.financialStatus) : null;
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border py-4">
      <div className="min-w-0 space-y-1">
        <p className="font-semibold text-foreground">{order.name}</p>
        <p className="text-sm text-muted-foreground">
          <time dateTime={order.processedAt}>{formatOrderDate(locale, order.processedAt)}</time>
          {status ? ` · ${status}` : null}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {order.totalPrice ? (
          <span className="font-semibold text-foreground">
            {formatStorefrontMoney(locale, order.totalPrice.amount, order.totalPrice.currencyCode)}
          </span>
        ) : null}
        {order.statusPageUrl ? (
          <a
            href={order.statusPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target-text text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {copy.viewOrder} <span className="sr-only">{`${order.name} ${copy.viewOrderHint}`}</span>
          </a>
        ) : null}
      </div>
    </li>
  );
}

export function AccountView({ locale, copy, customer, error, oauthLocalNotice }: AccountViewProps) {
  const loginHref = `/api/account/login?locale=${locale}`;
  const hideLoginErrorBecauseNotice = error === "login" && oauthLocalNotice != null;
  const message = error && !hideLoginErrorBecauseNotice ? copy.errors[error] : customer === "error" ? copy.loadError : null;
  const loginErrorWithNotice =
    error === "login" && oauthLocalNotice != null ? copy.errors.login : null;

  return (
    <Container as="section" size="sm" name="AccountView" data-ui-section="AccountView" className="py-12">
      <header className="space-y-4">
        <BreadcrumbNav
          locale={locale}
          items={crumbsToNavItems([
            { name: homeBreadcrumbLabel(locale), path: `/${locale}` },
            { name: copy.title, path: accountPath(locale) },
          ])}
        />
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground">{copy.title}</h1>
      </header>

      {message ? (
        <p role="alert" className="mt-6 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      {customer && customer !== "error" ? (
        <div className="mt-8 space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-6">
            <div className="min-w-0 space-y-1">
              <p className="text-lg font-semibold text-foreground">{copy.greeting(customer.firstName)}</p>
              {customer.email ? <p className="break-all text-sm text-muted-foreground">{customer.email}</p> : null}
            </div>
            <Button asChild variant="outline" className="touch-target">
              <a href={`/api/account/logout?locale=${locale}`}>{copy.signOut}</a>
            </Button>
          </div>

          <section data-ui-section="AccountOrders" aria-labelledby="account-orders-title" className="space-y-2">
            <h2 id="account-orders-title" className="text-2xl font-semibold tracking-tight text-foreground">
              {copy.ordersTitle}
            </h2>
            {customer.orders.length === 0 ? (
              <p className="text-muted-foreground">{copy.noOrders}</p>
            ) : (
              <ul className="m-0 list-none border-t border-border p-0">
                {customer.orders.map((order) => (
                  <OrderItem key={order.id} order={order} locale={locale} copy={copy} />
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <p className="text-lg text-muted-foreground">{copy.signedOutIntro}</p>
          <Button asChild className="touch-target">
            <a href={loginHref}>{copy.signIn}</a>
          </Button>
          {loginErrorWithNotice ? (
            <p role="alert" className="text-sm text-destructive">
              {loginErrorWithNotice}
            </p>
          ) : null}
          {oauthLocalNotice ? <AccountOAuthLocalNotice notice={oauthLocalNotice} /> : null}
        </div>
      )}
    </Container>
  );
}
