import { cn } from "@/lib/cn";
import type { ElementType, HTMLAttributes, ReactNode } from "react";

/**
 * Larguras alinhadas aos wrappers atuais do site:
 * - xs (2xl): hero centrado / narrow
 * - sm (3xl): artigo / prose
 * - md (5xl): páginas e listagens (default)
 * - lg (6xl): header, footer e secções wide
 *
 * Identificação no DOM (como `data-cms-block` nos blocos CMS):
 * `data-container="Container"` + `data-container-size="md"`.
 * Usa `name` para instâncias nomeadas (ex.: `name="GlobalHeader"`).
 */
export const containerSizeClass = {
  xs: "max-w-2xl",
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
} as const;

export type ContainerSize = keyof typeof containerSizeClass;

const DEFAULT_ELEMENT = "div";

type ContainerProps<T extends ElementType = typeof DEFAULT_ELEMENT> = {
  as?: T;
  size?: ContainerSize;
  /**
   * Valor de `data-container` (DevTools / testes).
   * Default: `"Container"`. Ex.: `name="GlobalHeader"`.
   */
  name?: string;
  /** Padding horizontal `px-4`. Desligar em nested full-bleed ou quando o pai já faz o gutter. */
  padded?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "as" | "children" | "className">;

export function Container<T extends ElementType = typeof DEFAULT_ELEMENT>({
  as,
  size = "md",
  name = "Container",
  padded = true,
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Comp = as ?? DEFAULT_ELEMENT;
  return (
    <Comp
      data-container={name}
      data-container-size={size}
      className={cn(
        "mx-auto w-full",
        containerSizeClass[size],
        padded && "px-4",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
