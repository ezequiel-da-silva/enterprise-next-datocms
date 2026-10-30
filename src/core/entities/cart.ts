import "@/core/zod-jitless";
import { z } from "zod";

export const CART_MAX_QUANTITY = 99;

export const cartIdSchema = z.string().trim().regex(/^gid:\/\/shopify\/Cart\/[A-Za-z0-9?=_-]+$/);
export const variantIdSchema = z.string().trim().regex(/^gid:\/\/shopify\/ProductVariant\/\d+$/);
export const cartLineIdSchema = z.string().trim().regex(/^gid:\/\/shopify\/CartLine\/[A-Za-z0-9?=_-]+$/);
export const quantitySchema = z.coerce.number().int().min(0).max(CART_MAX_QUANTITY);

export const addToCartSchema = z.object({
  variantId: variantIdSchema,
  quantity: quantitySchema.refine((n) => n >= 1),
});

export const updateCartLineSchema = z.object({
  lineId: cartLineIdSchema,
  quantity: quantitySchema,
});

export const removeCartLineSchema = z.object({
  lineId: cartLineIdSchema,
});

export function isShopifyVariantId(value: string): boolean {
  return variantIdSchema.safeParse(value).success;
}

/** Serializable cart payload for the quick-cart drawer (client-safe). */
export type CartSnapshotMoney = { amount: string; currencyCode: string };

export type CartSnapshotLine = {
  id: string;
  quantity: number;
  productTitle: string;
  productHandle: string;
  variantTitle?: string | null;
  unitPrice: CartSnapshotMoney;
  total: CartSnapshotMoney;
  image: { url: string; alt: string } | null;
};

export type CartSnapshot = {
  id: string;
  totalQuantity: number;
  subtotal: CartSnapshotMoney | null;
  checkoutUrl: string | null;
  lines: CartSnapshotLine[];
};

export type CartActionState =
  | { status: "idle" }
  | { status: "success"; message: string; totalQuantity: number; cart: CartSnapshot }
  | { status: "error"; message: string };
