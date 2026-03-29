import type { ReactNode } from "react";

type AlertVariant = "error" | "success";

type AlertMessageProps = {
  children: ReactNode;
  variant?: AlertVariant;
  className?: string;
};

const STYLES: Record<AlertVariant, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function AlertMessage({ children, variant = "error", className = "" }: AlertMessageProps) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${STYLES[variant]} ${className}`.trim()}>
      {children}
    </div>
  );
}
