import { ReactNode } from "react";

interface WebLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function WebLayout({ sidebar, children }: WebLayoutProps) {
  return (
    <>
      {/* Mobile: children only */}
      <div className="flex md:hidden w-full">{children}</div>

      {/* Desktop: sidebar + children */}
      <div className="hidden md:flex w-full h-dvh overflow-hidden">
        {sidebar}
        <main className="flex-1 min-w-0 h-dvh overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
}
