import { DEFAULT_APP_LOCALE } from "@/constants/i18n";
import { redirect } from "next/navigation";

/**
 * Fallback se o proxy não correr (ex. alguns ambientes de teste).
 * A home canónica é `/{locale}` — o redirect 308 principal está em `src/proxy.ts`.
 */
export default function Home() {
  redirect(`/${DEFAULT_APP_LOCALE}`);
}
