import type { ReactNode } from "react";
import Header from "./Header";

type PageShellProps = {
  children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-[#f8f3eb] text-[#2f241d]">
      <Header />
      {children}
    </main>
  );
}