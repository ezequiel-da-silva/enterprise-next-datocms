import { Label } from "@radix-ui/react-label";
import { cn } from "@/lib/cn";
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Corre sempre por `Children.map`, mesmo sem `describedBy`: alternar entre o array
 * mapeado e os `children` crus muda a forma da árvore e faz o React remontar o
 * campo — o que rouba o foco a meio da escrita quando o erro aparece/desaparece.
 */
function attachDescribedBy(children: ReactNode, describedBy?: string): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const prev = (child.props as { "aria-describedby"?: string })["aria-describedby"];
    const merged = [prev, describedBy].filter(Boolean).join(" ") || undefined;
    return cloneElement(child as ReactElement<{ "aria-describedby"?: string }>, {
      "aria-describedby": merged,
    });
  });
}

export function Field({ id, label, hint, error, children, className }: FieldProps) {
  const describedBy = [hint && !error ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {attachDescribedBy(children, describedBy || undefined)}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
