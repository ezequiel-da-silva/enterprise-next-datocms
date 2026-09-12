import { DEFAULT_APP_LOCALE } from "@/constants/i18n";
import { contactPagePath, getContactPage } from "@/infra/datocms/get-contact-page";
import { draftMode } from "next/headers";
import { permanentRedirect } from "next/navigation";

/** Compat: `/contato` aponta para a Page configurada em Global setting. */
export default async function ContatoRedirectPage() {
  const { isEnabled } = await draftMode();
  const page = await getContactPage(DEFAULT_APP_LOCALE, isEnabled);
  permanentRedirect(contactPagePath(DEFAULT_APP_LOCALE, page));
}
