'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'command', label: 'Command', href: '/' },
  { name: 'clients', label: 'Clients', href: '/clients' },
  { name: 'agents', label: 'Agents', href: '/agents' },
  { name: 'pipeline', label: 'Pipeline', href: '/pipeline' },
];

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 w-full z-50 flex justify-around items-center h-16 bg-background border-t-2 border-primary"
      role="tablist"
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            role="tab"
            aria-selected={isActive}
            aria-label={item.label}
            className={`flex flex-col items-center justify-center h-full w-full transition-all ${
              isActive
                ? 'text-primary bg-primary/5'
                : 'text-on-surface/40'
            }`}
          >
            <span className="text-[8px] font-mono font-bold uppercase mt-1 tracking-widest">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

MobileNav.displayName = 'MobileNav';
