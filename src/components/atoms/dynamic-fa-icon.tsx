"use client";

import { config, type IconDefinition, type SizeProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { startTransition, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import type { DatoFontAwesomeIconJson } from "@/lib/datocms/fa-icon-types";

export type { DatoFontAwesomeIconJson };

/* CSS estático em globals.css — evita <style> injectado sem nonce (CSP). */
config.autoAddCss = false;

export type DynamicFaIconProps = {
  icon?: DatoFontAwesomeIconJson | null;
  /** Sobrescreve `icon.prefix` quando ambos existem. */
  prefix?: string;
  /** Sobrescreve `icon.iconName` quando ambos existem. */
  iconName?: string;
  className?: string;
  size?: SizeProp;
  /** Classes de cor Tailwind (ex. `text-primary`). Preferir `className`. */
  colorClassName?: string;
  /** Quando definido, o ícone deixa de ser puramente decorativo (`aria-label`). */
  title?: string;
};

type FaFamily = "fas" | "far" | "fab";

/**
 * Mapeamento pedido: prefixo JSON → pacote carregado sob demanda (code-split por família).
 * - fas → @fortawesome/free-solid-svg-icons
 * - far → @fortawesome/free-regular-svg-icons
 * - fab → @fortawesome/free-brands-svg-icons
 */
const FAMILY_LOADERS: Record<FaFamily, () => Promise<Record<string, unknown>>> = {
  fas: () => import("@fortawesome/free-solid-svg-icons"),
  far: () => import("@fortawesome/free-regular-svg-icons"),
  fab: () => import("@fortawesome/free-brands-svg-icons"),
};

const packCache = new Map<FaFamily, Promise<Record<string, unknown>>>();

function loadIconPack(family: FaFamily): Promise<Record<string, unknown>> {
  const cached = packCache.get(family);
  if (cached) return cached;
  const p = FAMILY_LOADERS[family]();
  packCache.set(family, p);
  return p;
}

function normalizeFamily(prefix: string | undefined): FaFamily | null {
  const p = (prefix ?? "").trim().toLowerCase();
  if (p === "fas" || p === "solid" || p === "fa-solid") return "fas";
  if (p === "far" || p === "regular" || p === "fa-regular") return "far";
  if (p === "fab" || p === "brands" || p === "fa-brands") return "fab";
  return null;
}

/** `rocket` → `faRocket`; `circle-check` → `faCircleCheck`. */
function iconNameToExportKey(iconName: string): string {
  const clean = iconName.trim().toLowerCase();
  if (!clean) return "";
  return (
    "fa" +
    clean
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")
  );
}

function isIconDefinition(value: unknown): value is IconDefinition {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.prefix === "string" && typeof v.iconName === "string" && Array.isArray(v.icon);
}

async function resolveIconDefinition(family: FaFamily, exportKey: string): Promise<IconDefinition | null> {
  if (!exportKey) return null;
  try {
    const mod = await loadIconPack(family);
    const candidate = mod[exportKey];
    return isIconDefinition(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

/** Dimensões via classes Tailwind — evita `style={{}}` desnecessário (preferir CSP-friendly). */
function sizeBoxClass(size: SizeProp | undefined): string {
  if (size == null) return "size-[1em]";
  const map: Partial<Record<SizeProp, string>> = {
    "2xs": "size-[0.625rem]",
    xs: "size-3",
    sm: "size-[0.875rem]",
    lg: "size-[1.125rem]",
    xl: "size-5",
    "2xl": "size-6",
    "1x": "size-4",
    "2x": "size-8",
    "3x": "size-12",
    "4x": "size-16",
    "5x": "size-20",
    "6x": "size-24",
    "7x": "size-28",
    "8x": "size-32",
    "9x": "size-36",
    "10x": "size-40",
  };
  return map[size] ?? "size-[1em]";
}

function LoadingPlaceholder({ className, size }: { className?: string; size?: SizeProp }) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 animate-pulse rounded-sm bg-muted align-middle",
        sizeBoxClass(size),
        className,
      )}
      aria-hidden
    />
  );
}

function FallbackIcon({
  className,
  size,
  label,
  decorative,
}: {
  className?: string;
  size?: SizeProp;
  label: string;
  decorative: boolean;
}) {
  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={cn("inline-block shrink-0 fill-current", sizeBoxClass(size), className)}
    >
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 217.3c0 17 12.1 30.1 30.1 30.1h.1c17 0 30.1-12.1 30.1-30.1v-3.2c0-34.3 23.6-64 57.7-71.9v24.6c0 17 12.1 30.1 30.1 30.1h.1c17 0 30.1-12.1 30.1-30.1V168.6c0-22.5-18.3-40.8-40.8-40.8H200.3c-22.5 0-40.8 18.3-40.8 40.8v48.7zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
    </svg>
  );

  if (decorative) {
    return <span aria-hidden>{svg}</span>;
  }

  return (
    <span role="img" aria-label={label}>
      {svg}
    </span>
  );
}

/**
 * Ícone Font Awesome a partir do JSON do Dato (`prefix` + `iconName`).
 * Cada família (`fas` / `far` / `fab`) é carregada com `import()` na primeira utilização — o bundle inicial não inclui os três pacotes completos.
 */
export function DynamicFaIcon({
  icon,
  prefix: prefixProp,
  iconName: iconNameProp,
  className,
  size,
  colorClassName,
  title,
}: DynamicFaIconProps) {
  const prefix = prefixProp ?? icon?.prefix;
  const iconName = iconNameProp ?? icon?.iconName;

  const family = useMemo(() => normalizeFamily(prefix), [prefix]);
  const exportKey = useMemo(() => (iconName ? iconNameToExportKey(iconName) : ""), [iconName]);

  const invalid = !family || !exportKey;

  const [definition, setDefinition] = useState<IconDefinition | null>(null);
  const [loading, setLoading] = useState(false);

  const decorative = !title;
  const mergedClassName = cn(colorClassName, className);

  /* Sincronizar estado com nova chave (prefix/iconName) antes do paint; o fetch assíncrono fica no `useEffect`. */
  /* eslint-disable react-hooks/set-state-in-effect -- reset explícito ao mudar família/export */
  useLayoutEffect(() => {
    if (invalid) {
      setLoading(false);
      setDefinition(null);
      return;
    }
    setLoading(true);
    setDefinition(null);
  }, [invalid, family, exportKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (invalid) return;

    let cancelled = false;
    void (async () => {
      const def = await resolveIconDefinition(family, exportKey);
      if (cancelled) return;
      startTransition(() => {
        setDefinition(def);
        setLoading(false);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [invalid, family, exportKey]);

  if (invalid) {
    return (
      <FallbackIcon
        className={mergedClassName}
        size={size}
        label={title ?? "Ícone inválido"}
        decorative={decorative}
      />
    );
  }

  if (loading) {
    return <LoadingPlaceholder className={mergedClassName} size={size} />;
  }

  if (!definition) {
    return (
      <FallbackIcon
        className={mergedClassName}
        size={size}
        label={title ?? "Ícone indisponível"}
        decorative={decorative}
      />
    );
  }

  return (
    <FontAwesomeIcon
      icon={definition}
      className={mergedClassName}
      size={size}
      title={title}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
    />
  );
}
