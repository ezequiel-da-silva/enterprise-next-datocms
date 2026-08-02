import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

/**
 * Botão só-ícone com área tocável fixa (evita deformação com conteúdo variável).
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref as never}
        type={asChild ? undefined : type}
        className={cn(
          "touch-target cursor-pointer rounded-md border border-border bg-background text-foreground shadow-sm transition-colors",
          "hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

IconButton.displayName = "IconButton";
