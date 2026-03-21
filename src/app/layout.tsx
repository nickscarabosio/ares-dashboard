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
      <body>
        <Providers>
          <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-background border-b-2 border-primary">
            <div className="flex items-center gap-4">
              <span className="text-xl font-headline font-bold uppercase tracking-[0.2em] text-primary drop-shadow-[0_0_12px_rgba(255,23,68,0.7)]">
                COMMAND CENTER
              </span>
            </div>
            <Nav />
          </header>

          <main id="main" className="lg:ml-64 pt-24 px-8 pb-12 min-h-screen">
            {children}
          </main>

          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
