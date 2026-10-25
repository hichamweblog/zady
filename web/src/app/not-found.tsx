import Link from "next/link";
import { BookOpen, Home, Compass } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { UNITS_META } from "@/lib/units-meta";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="max-w-lg w-full u-card p-8 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto border border-teal-200 dark:border-teal-900">
            <BookOpen className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <p className="text-label font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 inline-block">
              404 — الصفحة غير موجودة
            </p>
            <h1 className="text-title font-bold text-slate-900 dark:text-white">
              الوحدة أو الصفحة المطلوبة غير متوفرة
            </h1>
            <p className="text-body text-[var(--ink-soft)] leading-relaxed">
              تأكد من رقم الوحدة (من 1 إلى {UNITS_META.length})، أو اختر إحدى الوحدات المتوفرة
              أدناه.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {UNITS_META.map((unit) => (
              <Link
                key={unit.id}
                href={`/units/${unit.id}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-label font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                {unit.badge}
              </Link>
            ))}
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-700 text-white font-bold text-body-sm hover:bg-teal-800 transition-colors shadow-md shadow-teal-700/20"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>العودة إلى الصفحة الرئيسية</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
