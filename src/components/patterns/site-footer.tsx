import { SocialNavLink } from "@/components/patterns/social-nav-link";
import { structuredTextDatoNodeRules } from "@/components/patterns/structured-text-dato-rules";
import type { NavigationData, NavItemRecord } from "@/infra/datocms/types-navigation";
import type { AppLocale } from "@/constants/i18n";
import { navLinkAriaProps } from "@/lib/a11y/nav-link";
import { isExternalHref, localizeInternalHref } from "@/lib/i18n/nav-href";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";
import Image from "next/image";
import Link from "next/link";
import { StructuredText } from "react-datocms/structured-text";

function FooterLink({ item, locale }: { item: NavItemRecord; locale: AppLocale }) {
  const hrefRaw = item.navItemLink.trim();
  const href = isExternalHref(hrefRaw) ? hrefRaw : localizeInternalHref(hrefRaw, locale);
  const aria = navLinkAriaProps(locale, item.navItemLabel, {
    customAria: item.navItemLinkAria,
    external: isExternalHref(href),
    newTab: item.openInNewTab,
  });
  const className =
    "touch-target-text text-sm text-muted-foreground transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
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
      <h3 className="text-sm font-semibold text-foreground">{item.navItemLabel}</h3>
      {children.length > 0 ? (
        <ul className="space-y-2">
          {children.map((child) => (
            <li key={child.id}>
              <FooterLink item={child} locale={locale} />
              {child.submenu?.length ? (
                <ul className="mt-2 space-y-2 border-l border-border pl-3">
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
};

export function SiteFooter({ data, locale }: SiteFooterProps) {
  const footerLogo = data?.footerLogo;
  const footerMenu = data?.footerMenu?.filter(Boolean) ?? [];
  const social = data?.socialLinks?.filter(Boolean) ?? [];
  const legal = data?.legalLinks?.filter(Boolean) ?? [];
  const copy = data?.copyrightText;

  const copyData: CdaStructuredTextValue | null =
    copy?.value != null
      ? {
          value: copy.value,
          blocks: copy.blocks as CdaStructuredTextValue["blocks"],
          links: copy.links as CdaStructuredTextValue["links"],
          inlineBlocks: copy.inlineBlocks ?? [],
        }
      : null;

  return (
    <footer className="mt-auto border-t border-border bg-muted/20">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          {footerLogo?.url ? (
            <div className="shrink-0">
              <Image
                src={footerLogo.url}
                alt={footerLogo.alt ?? ""}
                width={footerLogo.width ?? 140}
                height={footerLogo.height ?? 40}
                sizes="140px"
                className="h-10 w-auto max-w-[12rem] object-contain object-left"
              />
            </div>
          ) : null}

          {footerMenu.length > 0 ? (
            <div className="grid flex-1 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {footerMenu.map((item) => (
                <FooterMenuColumn key={item.id} item={item} locale={locale} />
              ))}
            </div>
          ) : null}
        </div>

        {social.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            {social.map((s) => (
              <SocialNavLink key={s.id} link={s} />
            ))}
          </div>
        ) : null}

        {copyData ? (
          <div className="structured-text max-w-3xl text-sm text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-4 [&_p]:leading-relaxed">
            <StructuredText data={copyData} customNodeRules={structuredTextDatoNodeRules} />
          </div>
        ) : null}

        {legal.length > 0 ? (
          <nav aria-label="Links legais" className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-6">
            {legal.map((item) => (
              <FooterLink key={item.id} item={item} locale={locale} />
            ))}
          </nav>
        ) : null}
      </div>
    </footer>
  );
}
