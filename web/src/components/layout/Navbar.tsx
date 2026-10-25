"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UNITS_META } from "@/lib/units-meta";
import { toggleTheme, useIsDark } from "@/lib/useTheme";

/**
 * ترويسة الكتاب: خطّ شعري واحد، واسمٌ واحد، وفهرسُ وحدات مفتوح.
 *
 * أُزيلت الشعارات المتدرّجة وشارة «متاح بدون إنترنت»: الشارة كانت تُكرّر ما
 * يقوله التطبيق فعلًا عند فتحه بلا شبكة، والشعار المتدرّج كان أول ما يجعل
 * الواجهة تُقرأ كقالب جاهز. العنوان الآن نصّ نسخي كبير، والتنقّل كلمات.
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
    <header className="sticky top-0 z-50 w-full border-b border-[var(--rule)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-baseline gap-6">
          <Link href="/" className="shrink-0" aria-label="زادِي — الصفحة الرئيسية">
            <span className="text-title font-bold tracking-tight text-[var(--ink)]">زادِي</span>
            <span className="ms-2 hidden text-meta font-medium text-[var(--ink-faint)] sm:inline">
              العلوم الإسلامية
            </span>
          </Link>

          <nav aria-label="التنقل الرئيسي" className="hidden items-baseline gap-5 md:flex">
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className={`text-label font-bold transition-colors ${
                pathname === "/"
                  ? "text-[var(--ink)] underline decoration-[var(--pine)] decoration-2 underline-offset-[6px]"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              الغلاف
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                className="flex items-baseline gap-1 text-label font-bold text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
              >
                <span>الوحدات</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 opacity-60 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
                {activeUnit && (
                  <span className="z-num ms-1 text-meta">
                    {activeUnit.badge.replace("وحدة ", "")}
                  </span>
                )}
              </button>

              {isMenuOpen && (
                <div className="absolute top-full end-0 mt-2 w-72 border border-[var(--rule)] bg-[var(--sheet)] p-1">
                  {UNITS_META.map((unit) => {
                    const isActive = pathname === `/units/${unit.id}`;
                    return (
                      <Link
                        key={unit.id}
                        href={`/units/${unit.id}`}
                        onClick={() => setIsMenuOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-baseline justify-between gap-3 px-3 py-2.5 text-label transition-colors ${
                          isActive
                            ? "bg-[var(--sunken)] font-bold text-[var(--ink)]"
                            : "font-medium text-[var(--ink-soft)] hover:bg-[var(--sunken)] hover:text-[var(--ink)]"
                        }`}
                      >
                        <span className="min-w-0 truncate">{unit.shortTitle}</span>
                        <span className="z-num shrink-0">{unit.badge.replace("وحدة ", "")}</span>
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
          className="flex min-h-11 items-center gap-2 border border-[var(--rule)] px-3 text-label font-bold text-[var(--ink-soft)] transition-colors hover:bg-[var(--sunken)] hover:text-[var(--ink)]"
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4 text-[var(--ochre)]" aria-hidden="true" />
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
