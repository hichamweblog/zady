"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UNITS_META } from "@/lib/units-meta";
import { toggleTheme, useIsDark } from "@/lib/useTheme";

/**
 * الترويسة — شريط أبيض لاصق بشعار دراية الأفقي المعتمد (v4.1).
 */
export default function Navbar() {
  const pathname = usePathname();
  const isDark = useIsDark();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeUnit = UNITS_META.find((u) => pathname === `/units/${u.id}`);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--hairline)] bg-[var(--canvas)]/80 backdrop-blur-xl">
      <div className="u-wrap flex h-14 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="دراية — الرئيسية">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/diraya-logo-horizontal.svg"
              alt="دراية"
              className="h-9 w-auto dark:brightness-0 dark:invert"
            />
            <span className="hidden border-s border-[var(--hairline)] ps-2.5 text-meta font-semibold text-[var(--ink-faint)] sm:inline">
              العلوم الإسلامية
            </span>
          </Link>

          <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-label font-semibold transition-colors ${
                pathname === "/"
                  ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              }`}
            >
              الرئيسية
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-label font-semibold text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              >
                <span>الوحدات</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 opacity-70 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
                {activeUnit && <span className="u-chip ms-1 py-0">{activeUnit.id}</span>}
              </button>

              {isMenuOpen && (
                <div className="absolute end-0 top-full mt-2 w-72 rounded-2xl bg-[var(--surface)] p-1.5 shadow-[var(--shadow-float)] ring-1 ring-black/[0.04] dark:ring-white/10">
                  {UNITS_META.map((unit) => {
                    const isActive = pathname === `/units/${unit.id}`;
                    return (
                      <Link
                        key={unit.id}
                        href={`/units/${unit.id}`}
                        onClick={() => setIsMenuOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-label transition-colors ${
                          isActive
                            ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand-strong)]"
                            : "font-medium text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                        }`}
                      >
                        <span className="min-w-0 truncate">{unit.shortTitle}</span>
                        <span className="u-num text-meta text-[var(--ink-faint)]">
                          {String(unit.id).padStart(2, "0")}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الليلي"}
          aria-pressed={isDark}
          className="flex min-h-10 items-center gap-2 rounded-lg bg-[var(--surface-2)] px-2.5 text-label font-semibold text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4 text-[var(--amber)]" aria-hidden="true" />
              <span className="hidden sm:inline">نهاري</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">ليلي</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
