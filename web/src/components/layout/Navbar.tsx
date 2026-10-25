"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Moon, Sun, CheckCircle2, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { UNITS } from "@/lib/data-loader";

export default function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Default to Light Mode unless explicitly set to dark in localStorage
    const savedTheme = localStorage.getItem("zady_theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("zady_theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("zady_theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
                  زادِي
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  BAC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                العلوم الإسلامية
              </p>
            </div>
          </Link>

          {/* Quick Units Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-colors ${
                pathname === "/"
                  ? "bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300"
                  : "text-slate-700 dark:text-slate-300 hover:text-teal-700 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              الرئيسية
            </Link>

            <div className="relative group" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-teal-700 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                <span>الوحدات الدراسية</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              <div
                className={`absolute top-full right-0 mt-1 w-72 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 transition-all ${
                  isMenuOpen ? "block" : "hidden group-hover:block"
                }`}
              >
                {UNITS.map((u) => {
                  const isActive = pathname === `/units/${u.id}`;
                  return (
                    <Link
                      key={u.id}
                      href={`/units/${u.id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="truncate">{u.shortTitle}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {u.badge}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Action badges & Theme toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-900/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>متاح بدون إنترنت</span>
          </div>

          <button
            onClick={toggleTheme}
            aria-label="تبديل المظهر"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">الوضع الفاتح</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">الوضع الليلي</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Units Horizontal Scroll */}
      <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none bg-slate-50 dark:bg-slate-900/50">
        <Link
          href="/"
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold ${
            pathname === "/"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          }`}
        >
          الرئيسية
        </Link>
        {UNITS.map((u) => {
          const isActive = pathname === `/units/${u.id}`;
          return (
            <Link
              key={u.id}
              href={`/units/${u.id}`}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                isActive
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {u.shortTitle}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
