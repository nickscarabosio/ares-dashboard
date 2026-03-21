import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/layout/Nav";
import { MobileNav } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "Ares Dashboard",
  description: "Chief of Staff Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="overflow-x-clip">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:bg-primary focus:px-3 focus:py-2 focus:font-headline focus:text-[10px] focus:font-bold focus:uppercase focus:tracking-[0.18em] focus:text-black"
        >
          Skip to content
        </a>
        <Providers>
          <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b-2 border-primary bg-background px-3 sm:px-4 md:px-6">
            <div className="min-w-0 pr-3">
              <span className="block truncate font-headline text-sm font-bold uppercase tracking-[0.18em] text-primary drop-shadow-[0_0_12px_rgba(255,23,68,0.7)] sm:text-base md:text-xl md:tracking-[0.2em]">
                Command Center
              </span>
            </div>
            <Nav />
            <MobileNav />
          </header>

          <main id="main" className="min-h-screen px-3 pb-12 pt-20 sm:px-4 md:px-6 md:pt-24 lg:ml-64 lg:px-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
