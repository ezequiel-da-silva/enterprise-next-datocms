"use client";

import { DynamicFaIcon, type DatoFontAwesomeIconJson } from "@/components/atoms/dynamic-fa-icon";
import { cn } from "@/lib/cn";

type FeatureGridCardIconProps = {
  icon: DatoFontAwesomeIconJson | null;
  className?: string;
};

/** Ilha cliente do CARD — Font Awesome sob demanda; ícone decorativo (título no heading). */
export function FeatureGridCardIcon({ icon, className }: FeatureGridCardIconProps) {
  return (
    <div
      className={cn(
        "inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary",
        className,
      )}
    >
      <DynamicFaIcon icon={icon} size="lg" className="text-primary" />
    </div>
  );
}
