import { cn } from "@/lib/cn";

type CartIconProps = {
  className?: string;
};

/**
 * Optimized outline shopping trolley.
 * Unified path for a cleaner, modern look in outline style.
 */
export function CartIcon({ className }: CartIconProps) {
  return (
    <svg
      aria-hidden
      className={cn("h-5 w-5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2" // Mantenha 2 para clareza em 20px (h-5/w-5)
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Estrutura unificada e limpa */}
      <path d="M6 16.25h12l1.68-7H5.4M3.5 4.5h2.1l2.22 8.5" />
      
      {/* Rodas com r mais definido para melhor renderização */}
      <circle cx="8.5" cy="19.5" r="1.5" strokeWidth="1.75" />
      <circle cx="16.5" cy="19.5" r="1.5" strokeWidth="1.75" />
    </svg>
  );
}