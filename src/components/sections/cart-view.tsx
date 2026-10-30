import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import type { AppLocale } from "@/constants/i18n";
import { CART_MAX_QUANTITY } from "@/core/entities/cart";
import type { StorefrontCart, StorefrontCartLine } from "@/infra/shopify/cart";
import { productPagePath } from "@/lib/datocms/product-page-path";
import type { CartCopy } from "@/lib/i18n/cart-copy";
import { crumbsToNavItems, homeBreadcrumbLabel } from "@/lib/seo/breadcrumb-labels";
import { cartPath } from "@/lib/shopify/cart-cookie";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import Image from "next/image";
import Link from "next/link";

type CartLineAction = (formData: FormData) => Promise<void>;

export type CartViewActions = {
  updateLine: CartLineAction;
  removeLine: CartLineAction;
};

type CartViewProps = {
  locale: AppLocale;
  /** Resolved on the server (CMS `ui_string` over the built-in copy). */
  copy: CartCopy;
  cart: StorefrontCart | null;
  shopPath: string;
  actions: CartViewActions;
};

function variantLabel(line: StorefrontCartLine): string | null {
  const options = line.selectedOptions.filter(
    (option) => option.value !== "Default Title" && option.value !== line.productTitle,
  );
  if (options.length === 0) return null;
  if (options.length === 1) return options[0].value;
  return options.map((option) => `${option.name}: ${option.value}`).join(" · ");
}

type CartLineItemProps = {
  line: StorefrontCartLine;
  locale: AppLocale;
  copy: CartCopy;
  actions: CartViewActions;
};

function CartLineItem({ line, locale, copy, actions }: CartLineItemProps) {
  const variant = variantLabel(line);
  const decreaseLabel =
    locale === "pt" ? "Diminuir quantidade" : locale === "es" ? "Disminuir cantidad" : "Decrease quantity";
  const increaseLabel =
    locale === "pt" ? "Aumentar quantidade" : locale === "es" ? "Aumentar cantidad" : "Increase quantity";

  return (
    <li className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-4 border-b border-border py-6 sm:grid-cols-[6rem_minmax(0,1fr)]">
      <div className="row-span-2">
        {line.image?.url ? (
          <Image
            src={line.image.url}
            alt={line.image.altText?.trim() || line.productTitle}
            width={96}
            height={96}
            sizes="(max-width: 640px) 72px, 96px"
            loading="lazy"
            className="aspect-square w-full rounded-lg border border-border bg-muted object-cover"
          />
        ) : (
          <div aria-hidden className="aspect-square w-full rounded-lg border border-border bg-muted" />
        )}
      </div>

      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <Link
            href={productPagePath(locale, line.productHandle)}
            className="rounded-sm font-medium leading-snug text-foreground underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {line.productTitle}
          </Link>
          {variant ? <p className="text-sm text-muted-foreground">{variant}</p> : null}
          <p className="text-sm text-muted-foreground">
            {formatStorefrontMoney(locale, line.unitPrice.amount, line.unitPrice.currencyCode)} {copy.each}
          </p>
        </div>
        <p className="shrink-0 text-right font-semibold text-foreground">
          {formatStorefrontMoney(locale, line.total.amount, line.total.currencyCode)}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form
          action={actions.updateLine}
          className="inline-flex items-center rounded-lg border border-border bg-background shadow-xs"
        >
          <input type="hidden" name="lineId" value={line.id} />
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            name="quantity"
            value={line.quantity - 1}
            disabled={line.quantity <= 1}
            aria-label={`${decreaseLabel}: ${line.productTitle}`}
            className="flex h-8 w-8 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="min-w-8 px-2 text-center text-sm font-semibold tabular-nums text-foreground">
            {line.quantity}
          </span>
          <button
            type="submit"
            name="quantity"
            value={line.quantity + 1}
            disabled={line.quantity >= CART_MAX_QUANTITY}
            aria-label={`${increaseLabel}: ${line.productTitle}`}
            className="flex h-8 w-8 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </form>
        <form action={actions.removeLine}>
          <input type="hidden" name="lineId" value={line.id} />
          <input type="hidden" name="locale" value={locale} />
          <Button type="submit" variant="ghost" className="touch-target text-muted-foreground hover:text-destructive">
            <svg
              aria-hidden
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            </svg>
            {copy.remove}
          </Button>
        </form>
      </div>
    </li>
  );
}

export function CartView({ locale, copy, cart, shopPath, actions }: CartViewProps) {
  const lines = cart?.lines ?? [];
  const subtotal = cart?.subtotal;

  return (
    <Container as="section" size="sm" name="CartView" data-ui-section="CartView" className="py-12">
      <header className="space-y-4">
        <BreadcrumbNav
          locale={locale}
          items={crumbsToNavItems([
            { name: homeBreadcrumbLabel(locale), path: `/${locale}` },
            { name: copy.title, path: cartPath(locale) },
          ])}
        />
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground">{copy.title}</h1>
      </header>

      {lines.length === 0 ? (
        <div className="mt-8 space-y-4">
          <p className="text-lg text-muted-foreground">{copy.empty}</p>
          <Button asChild className="touch-target">
            <Link href={shopPath}>{copy.continueShopping}</Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className="m-0 mt-8 list-none border-t border-border p-0">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} locale={locale} copy={copy} actions={actions} />
            ))}
          </ul>
          <div className="mx-auto mt-8 w-full max-w-md space-y-4 rounded-xl border border-border bg-muted/40 p-6">
            {subtotal ? (
              <p className="flex justify-between text-lg font-semibold text-foreground">
                <span>{copy.subtotal}</span>
                <span>{formatStorefrontMoney(locale, subtotal.amount, subtotal.currencyCode)}</span>
              </p>
            ) : null}
            <p className="text-sm text-muted-foreground">{copy.checkoutNote}</p>
            {cart?.checkoutUrl ? (
              <Button asChild className="touch-target w-full">
                <a href={cart.checkoutUrl}>{copy.checkout}</a>
              </Button>
            ) : (
              <p role="alert" className="text-sm text-destructive">
                {copy.checkoutUnavailable}
              </p>
            )}
            <Link
              href={shopPath}
              className="touch-target-text block text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {copy.continueShopping}
            </Link>
          </div>
        </>
      )}
    </Container>
  );
}
