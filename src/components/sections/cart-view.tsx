import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { Input } from "@/components/atoms/input";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import type { AppLocale } from "@/constants/i18n";
import { CART_MAX_QUANTITY } from "@/core/entities/cart";
import type { StorefrontCart, StorefrontCartLine } from "@/infra/shopify/cart";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { cartCopy, type CartCopy } from "@/lib/i18n/cart-copy";
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
  cart: StorefrontCart | null;
  shopPath: string;
  actions: CartViewActions;
};

function variantLabel(line: StorefrontCartLine): string | null {
  const options = line.selectedOptions.filter((option) => option.value !== "Default Title");
  return options.length > 0 ? options.map((option) => `${option.name}: ${option.value}`).join(" · ") : null;
}

type CartLineItemProps = {
  line: StorefrontCartLine;
  locale: AppLocale;
  copy: CartCopy;
  actions: CartViewActions;
};

function CartLineItem({ line, locale, copy, actions }: CartLineItemProps) {
  const quantityId = `cart-qty-${line.id.replace(/\W/g, "")}`;
  const variant = variantLabel(line);
  return (
    <li className="flex flex-wrap gap-4 border-b border-border py-6 sm:flex-nowrap">
      {line.image?.url ? (
        <Image
          src={line.image.url}
          alt={line.image.altText?.trim() || line.productTitle}
          width={96}
          height={96}
          sizes="96px"
          loading="lazy"
          className="h-24 w-24 shrink-0 rounded-md border border-border object-cover"
        />
      ) : null}
      <div className="min-w-0 flex-1 space-y-1">
        <Link
          href={productPagePath(locale, line.productHandle)}
          className="touch-target-text font-medium text-foreground underline-offset-4 hover:underline"
        >
          {line.productTitle}
        </Link>
        {variant ? <p className="text-sm text-muted-foreground">{variant}</p> : null}
        <p className="text-sm text-muted-foreground">
          {formatStorefrontMoney(locale, line.unitPrice.amount, line.unitPrice.currencyCode)}
        </p>
        <div className="flex flex-wrap items-end gap-2 pt-2">
          <form action={actions.updateLine} className="flex items-end gap-2">
            <input type="hidden" name="lineId" value={line.id} />
            <input type="hidden" name="locale" value={locale} />
            <div className="space-y-1">
              <label htmlFor={quantityId} className="block text-sm font-medium text-foreground">
                {copy.quantity}
              </label>
              <Input
                id={quantityId}
                name="quantity"
                type="number"
                inputMode="numeric"
                min={0}
                max={CART_MAX_QUANTITY}
                defaultValue={line.quantity}
                className="w-20"
              />
            </div>
            <Button type="submit" variant="outline" className="touch-target">
              {copy.update}
            </Button>
          </form>
          <form action={actions.removeLine}>
            <input type="hidden" name="lineId" value={line.id} />
            <input type="hidden" name="locale" value={locale} />
            <Button type="submit" variant="ghost" className="touch-target">
              {copy.remove}
            </Button>
          </form>
        </div>
      </div>
      <p className="shrink-0 font-medium text-foreground">
        {formatStorefrontMoney(locale, line.total.amount, line.total.currencyCode)}
      </p>
    </li>
  );
}

export function CartView({ locale, cart, shopPath, actions }: CartViewProps) {
  const copy = cartCopy(locale);
  const lines = cart?.lines ?? [];
  const subtotal = cart?.subtotal;

  return (
    <Container as="section" size="sm" name="CartView" className="py-12">
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
          <div className="mt-8 space-y-4 sm:ml-auto sm:max-w-sm">
            {subtotal ? (
              <p className="flex justify-between text-lg font-medium text-foreground">
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
