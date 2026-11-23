import type { AppLocale } from "@/constants/i18n";

/** Code-only gallery / lightbox strings (no `ui_string` migration in this wave). */
export type ProductGalleryCopy = {
  openGallery: string;
  closeGallery: string;
  zoomHint: string;
  previousMedia: string;
  nextMedia: string;
  playVideo: string;
};

const EN: ProductGalleryCopy = {
  openGallery: "Open image gallery",
  closeGallery: "Close gallery",
  zoomHint: "Pinch or scroll to zoom",
  previousMedia: "Previous image",
  nextMedia: "Next image",
  playVideo: "Play video",
};

const PT: ProductGalleryCopy = {
  openGallery: "Abrir galeria de imagens",
  closeGallery: "Fechar galeria",
  zoomHint: "Pinça ou scroll para ampliar",
  previousMedia: "Imagem anterior",
  nextMedia: "Imagem seguinte",
  playVideo: "Reproduzir vídeo",
};

const ES: ProductGalleryCopy = {
  openGallery: "Abrir galería de imágenes",
  closeGallery: "Cerrar galería",
  zoomHint: "Pellizca o usa el scroll para ampliar",
  previousMedia: "Imagen anterior",
  nextMedia: "Imagen siguiente",
  playVideo: "Reproducir vídeo",
};

export const PRODUCT_GALLERY_COPY: Record<AppLocale, ProductGalleryCopy> = {
  en: EN,
  pt: PT,
  es: ES,
};
