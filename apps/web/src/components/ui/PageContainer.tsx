import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return <div className={`mx-auto max-w-6xl px-6 py-8 ${className}`.trim()}>{children}</div>;
}
