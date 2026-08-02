import { NONCE_HEADER } from "@/constants/security";
import { headers } from "next/headers";

export async function getNonce(): Promise<string | undefined> {
  const h = await headers();
  return h.get(NONCE_HEADER) ?? undefined;
}
