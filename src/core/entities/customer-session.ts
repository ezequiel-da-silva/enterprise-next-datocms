import "@/core/zod-jitless";
import { z } from "zod";

/** Tokens from the Customer Account API, kept server-side in the sealed `nd-customer` cookie. */
export const customerSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).nullable(),
  idToken: z.string().min(1),
  /** Epoch ms when `accessToken` expires. */
  expiresAt: z.number().int().positive(),
});

export type CustomerSession = z.infer<typeof customerSessionSchema>;

/** Short-lived OAuth handshake data, sealed in `nd-oauth` between login and callback. */
export const oauthHandshakeSchema = z.object({
  state: z.string().min(16),
  nonce: z.string().min(16),
  verifier: z.string().min(43).max(128),
  locale: z.string().min(2),
});

export type OAuthHandshake = z.infer<typeof oauthHandshakeSchema>;

/** Token response from the Shopify `token_endpoint`. */
export const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
  id_token: z.string().min(1).optional(),
  refresh_token: z.string().min(1).optional(),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;
