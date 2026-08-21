import type { AppLocale } from "@/constants/i18n";
import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbNavProps = {
  items: BreadcrumbItem[];
  locale: AppLocale;
};

function navAriaLabel(locale: AppLocale): string {
  if (locale === "pt") return "Navegação estrutural";
  if (locale === "es") return "Navegación estructural";
  return "Breadcrumb";
}

/**
 * Breadcrumbs visíveis — alinhados ao JSON-LD e úteis para AEO / orientação.
 */
export function BreadcrumbNav({ items, locale }: BreadcrumbNavProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label={navAriaLabel(locale)} className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
              {index > 0 ? (
                <span aria-hidden className="px-0.5 text-muted-foreground">
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-foreground" : undefined} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
