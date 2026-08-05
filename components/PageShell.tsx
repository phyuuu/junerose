import type { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

type PageShellProps = {
  children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f3eb] text-[#2f241d]">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
