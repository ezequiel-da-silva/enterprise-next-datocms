import type { CtaBannerVariant } from "@/lib/datocms/resolve-cta-banner-options";
import { readCdaArray, readCdaBool } from "@/lib/datocms/cda-field";

type ImageAssetLike = { url?: string | null } | null | undefined;

export type CtaBannerImageBlockLike = {
  asset?: ImageAssetLike;
  assetDesktop?: ImageAssetLike;
};

export type ResolvedCtaBannerImage = {
  /** Variante permite imagem e `hasImage` está activo no CMS. */
  enabled: boolean;
  block: CtaBannerImageBlockLike | null;
  hasValidAsset: boolean;
};

function variantAllowsImage(variant: CtaBannerVariant): boolean {
  return variant === "split" || variant === "card_inset";
}

function readImageBlocks(record: Record<string, unknown>): CtaBannerImageBlockLike[] {
  const raw =
    record.imageBanner ??
    record.image_banner ??
    readCdaArray<CtaBannerImageBlockLike>(record, "imageBanner", "image_banner");
  return Array.isArray(raw) ? raw : [];
}

function firstBlockWithAsset(blocks: CtaBannerImageBlockLike[]): CtaBannerImageBlockLike | null {
  return blocks.find((block) => Boolean(block?.asset?.url?.trim())) ?? null;
}

/** Resolve se o CTA Banner deve renderizar imagem (toggle CMS + variant + asset válido). */
export function resolveCtaBannerImage(
  record: Record<string, unknown>,
  variant: CtaBannerVariant,
): ResolvedCtaBannerImage {
  if (!variantAllowsImage(variant)) {
    return { enabled: false, block: null, hasValidAsset: false };
  }

  const hasImageEnabled = readCdaBool(record, "hasImage", "has_image");
  if (!hasImageEnabled) {
    return { enabled: false, block: null, hasValidAsset: false };
  }

  const block = firstBlockWithAsset(readImageBlocks(record));
  const hasValidAsset = Boolean(block?.asset?.url?.trim());

  return {
    enabled: true,
    block: hasValidAsset ? block : null,
    hasValidAsset,
  };
}
