import type { AppLocale } from "@/constants/i18n";

export const ACCOUNT_OAUTH_ENV_VAR = "NEXT_PUBLIC_SITE_URL";

export type AccountOAuthLocalNotice = {
  title: string;
  summary: string;
  steps: string[];
  callbackUriLabel: string;
  callbackUri: string;
  callbackUriHint: string;
  envVarName: string;
};

function isLocalCallback(callbackUrl: string): boolean {
  try {
    const host = new URL(callbackUrl).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

const COPY: Record<AppLocale, Omit<AccountOAuthLocalNotice, "callbackUri" | "envVarName">> = {
  en: {
    title: "Developing on your computer",
    summary:
      "Shopify sign-in needs a public address on the internet. localhost alone is not enough for the login to work.",
    steps: [
      "Start a tunnel (for example ngrok http 3000) and open the site using the tunnel link, not localhost.",
      "In your .env file, set NEXT_PUBLIC_SITE_URL to that https URL (no trailing slash).",
      "In Shopify admin: Settings → Customer accounts → Customer Account API → Application setup — register the Callback URI and JavaScript origin using the same tunnel base URL.",
      "Restart the dev server and try Sign in again.",
    ],
    callbackUriLabel: "Return address sent today (Callback URI)",
    callbackUriHint:
      "After the tunnel is set up, this should look like https://your-tunnel.example/api/account/callback — not localhost.",
  },
  pt: {
    title: "Desenvolvimento no seu computador",
    summary:
      "O login com a Shopify precisa de um endereço público na internet; localhost sozinho não permite concluir o acesso.",
    steps: [
      "Suba um túnel (ex.: ngrok http 3000) e abra o site pelo link do túnel, não por localhost.",
      "No arquivo .env, defina NEXT_PUBLIC_SITE_URL com essa URL https (sem barra no final).",
      "No admin Shopify: Configurações → Contas de clientes → Customer Account API → Application setup — registre a Callback URI e a JavaScript origin com a mesma base do túnel.",
      "Reinicie o servidor de desenvolvimento e tente Entrar novamente.",
    ],
    callbackUriLabel: "Endereço de retorno enviado hoje (Callback URI)",
    callbackUriHint:
      "Depois do túnel, deve ficar como https://seu-tunel.exemplo/api/account/callback — não localhost.",
  },
  es: {
    title: "Desarrollo en tu ordenador",
    summary:
      "El inicio de sesión con Shopify necesita una dirección pública en internet; localhost solo no permite completar el acceso.",
    steps: [
      "Levanta un túnel (p. ej. ngrok http 3000) y abre el sitio con el enlace del túnel, no con localhost.",
      "En el archivo .env, define NEXT_PUBLIC_SITE_URL con esa URL https (sin barra final).",
      "En el admin de Shopify: Configuración → Cuentas de clientes → Customer Account API → Application setup — registra la Callback URI y la JavaScript origin con la misma base del túnel.",
      "Reinicia el servidor de desarrollo e intenta Iniciar sesión de nuevo.",
    ],
    callbackUriLabel: "Dirección de retorno enviada hoy (Callback URI)",
    callbackUriHint:
      "Tras el túnel, debe ser https://tu-tunel.ejemplo/api/account/callback — no localhost.",
  },
};

/** Shown on `/account` when OAuth would use localhost (Shopify rejects it). */
export function accountOAuthLocalNotice(locale: AppLocale, callbackUrl: string): AccountOAuthLocalNotice | null {
  if (!isLocalCallback(callbackUrl)) return null;
  const base = COPY[locale];
  return {
    ...base,
    callbackUri: callbackUrl,
    envVarName: ACCOUNT_OAUTH_ENV_VAR,
  };
}
