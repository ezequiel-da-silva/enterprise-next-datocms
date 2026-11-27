import "@/core/zod-jitless";
import { z } from "zod";

export const backInStockSchema = z.object({
  email: z.string().trim().email().max(254),
  variantId: z.string().trim().min(1).max(128),
  productHandle: z.string().trim().min(1).max(128),
  locale: z.enum(["en", "pt", "es"]),
});

export type BackInStockInput = z.infer<typeof backInStockSchema>;

export type BackInStockActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: { email?: string } };
