import type { FileFieldLike } from "@/infra/datocms/types-page";

type FileLike = { url?: string | null } | null | undefined;

export type SpecializedImageBlockLike = {
  __typename?: string | null;
  asset?: FileLike;
  assetMobile?: FileLike;
  asset_mobile?: FileLike;
  assetDesktop?: FileLike;
  asset_desktop?: FileLike;
} | null | undefined;

export type ResolvedSpecializedImage = {
  mobile: FileFieldLike;
  desktop: FileFieldLike;
};

function asFile(value: FileLike): FileFieldLike {
  if (!value || typeof value !== "object") return null;
  const url = value.url;
  if (typeof url !== "string" || !url.trim()) return null;
  return value as FileFieldLike;
}

function typenameOf(block: NonNullable<SpecializedImageBlockLike>): string {
  return typeof block.__typename === "string" ? block.__typename : "";
}

/**
 * Normaliza os três blocos de imagem especializados (+ `ImageBlockRecord` legado)
 * para o par `{ mobile, desktop }` usado em `DatoResponsivePicture`.
 *
 * Hero / card / banner: `assetMobile` + `assetDesktop` (`asset` só como fallback).
 * Legacy `image_block`: `asset` + `assetDesktop`.
 */
export function resolveSpecializedImage(block: SpecializedImageBlockLike): ResolvedSpecializedImage {
  if (!block) return { mobile: null, desktop: null };

  const typename = typenameOf(block);
  const mobileLegacy = asFile(block.asset);
  const mobileNamed = asFile(block.assetMobile ?? block.asset_mobile);
  const desktop = asFile(block.assetDesktop ?? block.asset_desktop);

  if (
    typename === "HeroImageBlockRecord" ||
    typename === "CardImageBlockRecord" ||
    typename === "BannerImageBlockRecord"
  ) {
    return { mobile: mobileNamed ?? mobileLegacy, desktop };
  }

  if (typename === "ImageBlockRecord") {
    return { mobile: mobileLegacy, desktop };
  }

  return {
    mobile: mobileNamed ?? mobileLegacy,
    desktop,
  };
}
