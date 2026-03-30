import type { ButtonHTMLAttributes } from "react";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ className = "", ...props }: AppButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl bg-[#0B4B4A] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#083D3C] disabled:cursor-not-allowed disabled:opacity-70 ${className}`.trim()}
    />
  );
}

export function SecondaryButton({ className = "", ...props }: AppButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 ${className}`.trim()}
    />
  );
}
