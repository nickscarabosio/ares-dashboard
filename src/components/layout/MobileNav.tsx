'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Command' },
  { href: '/clients', label: 'Clients' },
  { href: '/agents', label: 'Agents' },
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/core4', label: 'Core 4' },
  { href: '/settings', label: 'Settings' },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(target) &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown);
    firstLinkRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div className="relative md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-controls="mobile-navigation-menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-12 w-12 items-center justify-center border-2 border-primary bg-surface-0 text-primary transition-all duration-150 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      >
        <span aria-hidden="true" className="font-mono text-2xl leading-none">
          {isOpen ? 'x' : '\u2630'}
        </span>
      </button>

      {isOpen ? (
        <div
          ref={panelRef}
          id="mobile-navigation-menu"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 flex min-w-[240px] flex-col border-2 border-primary bg-surface-0 shadow-[0_0_24px_rgba(255,23,68,0.2)]"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col">
            {NAV_ITEMS.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-12 items-center border-b border-primary/20 px-4 font-headline text-[11px] font-bold uppercase tracking-[0.22em] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
                    isActive
                      ? 'bg-primary/12 text-primary'
                      : 'text-on-surface hover:bg-primary/8 hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
