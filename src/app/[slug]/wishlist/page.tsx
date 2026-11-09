import { Container } from "@/components/atoms/container";
import { WishlistView } from "@/components/sections/wishlist-view";
import { isAppLocale } from "@/constants/i18n";
import { getProductsIndexPage, productsIndexPath } from "@/infra/datocms/get-products-index-page";
import { wishlistCopy, wishlistPath } from "@/lib/i18n/wishlist-copy";
import { buildMetadata } from "@/lib/seo";
import { buildUnavailableMetadata } from "@/lib/seo/build-unavailable-metadata";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

type WishlistPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: WishlistPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isAppLocale(slug)) return buildUnavailableMetadata("Wishlist");
  const copy = wishlistCopy(slug);
  return buildMetadata({
    title: copy.title,
    description: copy.lead,
    path: wishlistPath(slug),
    locale: slug,
    noIndex: true,
  });
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { slug } = await params;
  if (!isAppLocale(slug)) notFound();
  const { isEnabled } = await draftMode();
  const catalog = await getProductsIndexPage(slug, isEnabled);
  const copy = wishlistCopy(slug);

  return (
    <Container as="article" size="lg" name="WishlistPage" className="py-12">
      <header className="mb-8 space-y-3">
        <h1 className="type-display">{copy.title}</h1>
        <p className="type-lead">{copy.lead}</p>
      </header>
      <WishlistView locale={slug} shopPath={productsIndexPath(slug, catalog)} />
    </Container>
  );
}
