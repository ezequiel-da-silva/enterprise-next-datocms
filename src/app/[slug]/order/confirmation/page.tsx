import { Button } from "@/components/atoms/button";
import { Container } from "@/components/atoms/container";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { isAppLocale, type AppLocale } from "@/constants/i18n";
import { getProductsIndexPage, productsIndexPath } from "@/infra/datocms/get-products-index-page";
import { orderConfirmationCopy } from "@/lib/i18n/order-confirmation-copy";
import { buildMetadata } from "@/lib/seo";
import { crumbsToNavItems, homeBreadcrumbLabel } from "@/lib/seo/breadcrumb-labels";
import { buildUnavailableMetadata } from "@/lib/seo/build-unavailable-metadata";
import { sanitizeOrderDisplayName } from "@/lib/shopify/parse-order-webhook";
import { isCartEnabled } from "@/lib/shopify/cart-cookie";
import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

type OrderConfirmationPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string | string[] }>;
};

function confirmationPath(locale: AppLocale): string {
  return `/${locale}/order/confirmation`;
}

export async function generateMetadata({ params }: OrderConfirmationPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isCartEnabled() || !isAppLocale(slug)) return buildUnavailableMetadata("Order");
  const copy = orderConfirmationCopy(slug);
  return buildMetadata({
    title: copy.title,
    description: copy.lead,
    path: confirmationPath(slug),
    locale: slug,
    noIndex: true,
  });
}

export default async function OrderConfirmationPage({ params, searchParams }: OrderConfirmationPageProps) {
  const { slug } = await params;
  if (!isCartEnabled() || !isAppLocale(slug)) notFound();

  const { isEnabled } = await draftMode();
  const query = await searchParams;
  const rawOrder = Array.isArray(query.order) ? query.order[0] : query.order;
  const orderName = sanitizeOrderDisplayName(rawOrder);
  const copy = orderConfirmationCopy(slug);
  const catalog = await getProductsIndexPage(slug, isEnabled);
  const shopPath = productsIndexPath(slug, catalog);

  return (
    <Container as="section" size="sm" name="OrderConfirmation" className="py-12" data-ui-section="OrderConfirmation">
      <header className="space-y-4">
        <BreadcrumbNav
          locale={slug}
          items={crumbsToNavItems([
            { name: homeBreadcrumbLabel(slug), path: `/${slug}` },
            { name: copy.title, path: confirmationPath(slug) },
          ])}
        />
        <h1 className="type-display">{copy.title}</h1>
        <p className="type-lead">{copy.lead}</p>
        {orderName ? <p className="text-sm font-medium text-foreground">{copy.orderLabel(orderName)}</p> : null}
      </header>

      <div className="mt-8">
        <Button asChild className="touch-target h-12 rounded-lg">
          <Link href={shopPath}>{copy.continueShopping}</Link>
        </Button>
      </div>
    </Container>
  );
}
