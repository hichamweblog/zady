"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Moon, Sun, CheckCircle2, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UNITS_META } from "@/lib/units-meta";
import { toggleTheme, useIsDark } from "@/lib/useTheme";

export default function Navbar() {
  const pathname = usePathname();
  const isDark = useIsDark();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-600 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </span>
            <span>
              <span className="flex items-center gap-1.5">
                <span className="font-bold text-title tracking-tight text-slate-900 dark:text-white">
                  زادِي
                </span>
                <span className="text-label font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  BAC
                </span>
              </span>
              <span className="block text-meta text-slate-600 dark:text-slate-300 font-semibold">
                العلوم الإسلامية
              </span>
            </span>
          </Link>

          <nav aria-label="التنقل الرئيسي" className="hidden md:flex items-center gap-1.5">
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className={`px-3.5 py-2 rounded-xl text-body-sm font-bold transition-colors ${
                pathname === "/"
                  ? "bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300"
                  : "text-slate-700 dark:text-slate-300 hover:text-teal-800 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              الرئيسية
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-body-sm font-bold text-slate-700 dark:text-slate-300 hover:text-teal-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                <span>الوحدات الدراسية</span>
                <ChevronDown
                  className={`w-4 h-4 opacity-70 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-72 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-600">
                  {UNITS_META.map((unit) => {
                    const isActive = pathname === `/units/${unit.id}`;
                    return (
                      <Link
                        key={unit.id}
                        href={`/units/${unit.id}`}
                        onClick={() => setIsMenuOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center justify-between gap-2 p-2.5 rounded-xl text-label font-bold transition-colors ${
                          isActive
                            ? "bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="truncate">{unit.shortTitle}</span>
                        <span className="text-meta font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                          {unit.badge}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-label font-bold border border-emerald-200 dark:border-emerald-900/60">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>متاح بدون إنترنت</span>
          </span>

          <button
            onClick={toggleTheme}
            aria-label={isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الليلي"}
            aria-pressed={isDark}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-label font-bold border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="hidden sm:inline">الوضع الفاتح</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" aria-hidden="true" />
                <span className="hidden sm:inline">الوضع الليلي</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
