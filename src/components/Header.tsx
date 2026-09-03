"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/talk", label: "Let's Talk" },
  { href: "/events", label: "Events" },
  { href: "/community", label: "Community" },
  { href: "/resources", label: "Resources" },
  { href: "/stories", label: "Stories" },
  { href: "/get-involved", label: "Get Involved" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClickOutside);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      data-testid="site-header"
      className="sticky top-0 z-50 border-b border-neutral-200 bg-white"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Men Let&apos;s Talk
        </Link>

        {/* Desktop nav */}
        <nav data-testid="desktop-nav" className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:underline">
              {link.label}
            </Link>
          ))}
          <Link
            href="/get-involved"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Join the Conversation
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          data-testid="mobile-menu-toggle"
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="h-0.5 w-6 bg-neutral-900" />
          <span className="h-0.5 w-6 bg-neutral-900" />
          <span className="h-0.5 w-6 bg-neutral-900" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav data-testid="mobile-nav" className="flex flex-col gap-1 border-t border-neutral-200 px-6 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/get-involved"
            className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-center text-sm font-semibold text-white"
            onClick={() => setMenuOpen(false)}
          >
            Join the Conversation
          </Link>
        </nav>
      )}
    </header>
  );
}
