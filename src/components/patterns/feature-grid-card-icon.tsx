"use client";

import { DynamicFaIcon, type DatoFontAwesomeIconJson } from "@/components/atoms/dynamic-fa-icon";

type FeatureGridCardIconProps = {
  icon: DatoFontAwesomeIconJson | null;
  title?: string;
};

/** Única parte cliente do Feature GRID — Font Awesome sob demanda. */
export function FeatureGridCardIcon({ icon, title }: FeatureGridCardIconProps) {
  return (
    <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <DynamicFaIcon icon={icon} size="lg" className="text-primary" title={title} />
    </div>
  );
}
