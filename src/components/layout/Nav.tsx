'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Command', icon: 'grid_view' },
  { href: '/clients', label: 'Clients', icon: 'group' },
  { href: '/agents', label: 'Agents', icon: 'badge' },
  { href: '/pipeline', label: 'Pipeline', icon: 'account_tree' },
  { href: '/core4', label: 'Core 4', icon: 'grid_view' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar nav links (desktop) */}
      <div className="hidden md:flex items-center gap-8">
        <nav className="flex gap-8" aria-label="Main navigation">
          {NAV_LINKS.filter(l => l.href !== '/settings' && l.href !== '/').map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono font-bold uppercase tracking-[0.2em] py-1 text-xs transition-all duration-300 ${
                  isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface/40 hover:text-primary'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Side nav (desktop) */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface-1 border-r-2 border-primary/20 flex-col py-8 hidden lg:flex z-40">
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-primary pip-glow" />
            <span className="font-headline font-bold uppercase tracking-[0.15em] text-[10px] text-primary">
              OPERATOR_SESSION
            </span>
          </div>
          <div className="text-[9px] font-mono text-on-surface/30 tracking-[0.2em] uppercase">
            SYS_ACTIVE // SECTOR 7-G
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const isSettings = link.href === '/settings';
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 px-6 py-4 font-headline font-bold uppercase tracking-widest text-[10px] transition-all ${
                  isSettings ? 'mt-auto' : ''
                } ${
                  isActive
                    ? 'bg-primary/10 text-primary border-r-2 border-primary shadow-[inset_-8px_0_15px_-5px_rgba(255,23,68,0.2)]'
                    : 'text-on-surface/40 hover:bg-primary/5 hover:text-primary'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 mt-8">
          <button className="w-full py-4 bg-primary text-black font-headline font-black text-[10px] uppercase tracking-[0.2em] active:translate-y-px transition-all shadow-[0_0_20px_rgba(255,23,68,0.3)] hover:shadow-[0_0_30px_rgba(255,23,68,0.5)]">
            INITIATE COMMAND
          </button>
        </div>
      </aside>
    </>
  );
}
