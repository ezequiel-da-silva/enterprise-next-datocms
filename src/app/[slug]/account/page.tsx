import { AccountView } from "@/components/sections/account-view";
import { isAppLocale } from "@/constants/i18n";
import { getCustomerOverview } from "@/infra/shopify/customer-account";
import { accountCopy, isAccountErrorCode } from "@/lib/i18n/account-copy";
import { buildMetadata } from "@/lib/seo";
import { buildUnavailableMetadata } from "@/lib/seo/build-unavailable-metadata";
import {
  accountPath,
  CUSTOMER_COOKIE,
  isCustomerAccountEnabled,
  isSessionExpiring,
  readCustomerSession,
} from "@/lib/shopify/customer-session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

type AccountPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({ params }: AccountPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isCustomerAccountEnabled() || !isAppLocale(slug)) return buildUnavailableMetadata("Account");
  const copy = accountCopy(slug);
  return buildMetadata({
    title: copy.title,
    description: copy.description,
    path: accountPath(slug),
    locale: slug,
    noIndex: true,
  });
}

export default async function AccountPage({ params, searchParams }: AccountPageProps) {
  const { slug } = await params;
  if (!isCustomerAccountEnabled() || !isAppLocale(slug)) notFound();
  const rawError = (await searchParams).error;
  const error = typeof rawError === "string" && isAccountErrorCode(rawError) ? rawError : null;

  const session = readCustomerSession((await cookies()).get(CUSTOMER_COOKIE)?.value);
  if (session && isSessionExpiring(session)) {
    if (session.refreshToken) redirect(`/api/account/refresh?next=${encodeURIComponent(accountPath(slug))}`);
    return <AccountView locale={slug} customer={null} error={error} />;
  }

  const customer = session ? ((await getCustomerOverview(session.accessToken)) ?? "error") : null;
  return <AccountView locale={slug} customer={customer} error={error} />;
}
