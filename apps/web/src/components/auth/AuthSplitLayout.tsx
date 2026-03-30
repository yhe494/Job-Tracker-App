import type { ReactNode } from "react";

type AuthSplitLayoutProps = {
  title: string;
  subtitle: string;
  rightTitle: ReactNode;
  quote: string;
  footer: string;
  children: ReactNode;
};

export function AuthSplitLayout({ title, subtitle, rightTitle, quote, footer, children }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0B4B4A] text-white">
                <span className="text-lg font-semibold">{"{ }"}</span>
              </div>
              <div className="text-xl font-semibold text-slate-900">JobTracker</div>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>

            {children}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B4B4A] via-[#0A5452] to-[#0B3F43]" />
          <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_30%,white,transparent_50%)]" />
          <div className="relative flex h-full flex-col justify-center px-14 text-white">
            <h2 className="text-5xl font-semibold leading-tight tracking-tight">{rightTitle}</h2>

            <div className="mt-10 max-w-lg">
              <div className="text-4xl leading-none opacity-70">“</div>
              <p className="mt-3 text-lg leading-8 text-white/85">{quote}</p>
            </div>

            <div className="mt-16 text-sm text-white/60">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
