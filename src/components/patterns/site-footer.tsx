import { Container } from "@/components/atoms/container";
import { CookiePreferencesButton } from "@/components/patterns/consent/cookie-preferences-button";
import { PaymentMethodBadges } from "@/components/patterns/payment-method-badges";
import { SocialNavLink } from "@/components/patterns/social-nav-link";
import type { NavigationData, NavItemRecord } from "@/infra/datocms/types-navigation";
import type { AppLocale } from "@/constants/i18n";
import { navLinkAriaProps } from "@/lib/a11y/nav-link";
import { isSafeExternalHref } from "@/lib/datocms/link-block";
import { isExternalHref, localizeInternalHref } from "@/lib/i18n/nav-href";
import Image from "next/image";
import Link from "next/link";

function FooterLink({
  item,
  locale,
  dense = false,
}: {
  item: NavItemRecord;
  locale: AppLocale;
  /** Bottom legal row — matches Cookie preferences (text-xs). */
  dense?: boolean;
}) {
  const hrefRaw = item.navItemLink.trim();
  if (isExternalHref(hrefRaw) && !isSafeExternalHref(hrefRaw)) {
    return null;
  }
  const href = isExternalHref(hrefRaw) ? hrefRaw : localizeInternalHref(hrefRaw, locale);
  const aria = navLinkAriaProps(locale, item.navItemLabel, {
    customAria: item.navItemLinkAria,
    external: isExternalHref(href),
    newTab: item.openInNewTab,
  });
  const className = dense
    ? "touch-target-text inline-flex items-center py-1 text-xs leading-none text-muted-foreground transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    : "touch-target-text block min-h-10 py-1 text-sm text-muted-foreground transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:min-h-0";
  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        className={className}
        {...aria}
        {...(item.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {item.navItemLabel}
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...aria}>
      {item.navItemLabel}
    </Link>
  );
}

function FooterMenuColumn({ item, locale }: { item: NavItemRecord; locale: AppLocale }) {
  const children = item.submenu?.filter(Boolean) ?? [];
  return (
    <div className="min-w-0 space-y-3">
      <h2 className="text-sm font-semibold text-foreground">{item.navItemLabel}</h2>
      {children.length > 0 ? (
        <ul className="space-y-1.5">
          {children.map((child) => (
            <li key={child.id}>
              <FooterLink item={child} locale={locale} />
              {child.submenu?.length ? (
                <ul className="mt-1.5 space-y-1.5 border-l border-border pl-3">
                  {child.submenu.map((sub) => (
                    <li key={sub.id}>
                      <FooterLink item={sub} locale={locale} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <FooterLink item={item} locale={locale} />
      )}
    </div>
  );
}

type SiteFooterProps = {
  data: NavigationData | null;
  locale: AppLocale;
  /** Label of the cookie preferences button (CMS `ui_string` over the built-in copy). */
  cookiePreferencesLabel: string;
  brandTagline?: string | null;
  marketSummary?: string | null;
  secureCheckoutNote?: string | null;
  paymentsLabel?: string | null;
  showPix?: boolean;
};

export function SiteFooter({
  data,
  locale,
  cookiePreferencesLabel,
  brandTagline = null,
  marketSummary = null,
  secureCheckoutNote = null,
  paymentsLabel = null,
  showPix = locale === "pt",
}: SiteFooterProps) {
  const footerLogo = data?.footerLogo;
  const footerMenu = data?.footerMenu?.filter(Boolean) ?? [];
  const social = data?.socialLinks?.filter(Boolean) ?? [];
  const legal = data?.legalLinks?.filter(Boolean) ?? [];
  const year = new Date().getFullYear();

  const legalNavLabel =
    locale === "pt" ? "Links legais" : locale === "es" ? "Enlaces legales" : "Legal links";
  const footerNavLabel = locale === "pt" ? "Rodapé" : locale === "es" ? "Pie de página" : "Footer";

  return (
    <footer className="mt-auto border-t border-border bg-muted/20">
      <Container size="lg" name="SiteFooter" className="py-12">
        <nav aria-label={footerNavLabel}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="min-w-0 space-y-4">
              {footerLogo?.url ? (
                <Image
                  src={footerLogo.url}
                  alt={footerLogo.alt ?? ""}
                  width={footerLogo.width ?? 140}
                  height={footerLogo.height ?? 40}
                  sizes="140px"
                  className="h-10 w-auto max-w-[12rem] object-contain object-left"
                />
              ) : null}
              {brandTagline?.trim() ? (
                <p className="max-w-sm text-sm text-muted-foreground">{brandTagline.trim()}</p>
              ) : null}
              {marketSummary?.trim() ? (
                <p className="text-xs text-muted-foreground">{marketSummary.trim()}</p>
              ) : null}
              {social.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {social.map((s) => (
                    <SocialNavLink key={s.id} link={s} />
                  ))}
                </div>
              ) : null}
            </div>

            {footerMenu.map((item) => (
              <FooterMenuColumn key={item.id} item={item} locale={locale} />
            ))}
          </div>
        </nav>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p>
              © {year}
              {secureCheckoutNote?.trim() ? ` · ${secureCheckoutNote.trim()}` : null}
            </p>
            <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-2">
              {legal.length > 0 ? (
                <nav aria-label={legalNavLabel} className="inline-flex flex-wrap items-center gap-x-4 gap-y-2">
                  {legal.map((item) => (
                    <FooterLink key={item.id} item={item} locale={locale} dense />
                  ))}
                </nav>
              ) : null}
              <CookiePreferencesButton label={cookiePreferencesLabel} />
            </div>
          </div>
          {paymentsLabel?.trim() ? (
            <PaymentMethodBadges locale={locale} label={paymentsLabel.trim()} showPix={showPix} />
          ) : (
            <PaymentMethodBadges
              locale={locale}
              label={locale === "pt" ? "Formas de pagamento" : "Payment methods"}
              showPix={showPix}
            />
          )}
        </div>
      </Container>
    </footer>
  );
}
