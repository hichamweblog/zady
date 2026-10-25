import Link from "next/link";
import { BookOpen, Home, Compass } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { UNITS_META } from "@/lib/units-meta";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--canvas)]">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="w-full max-w-lg space-y-6 rounded-3xl bg-[var(--surface)] p-8 shadow-[var(--shadow-float)]">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
            <BookOpen className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <p className="u-chip">404 — الصفحة غير موجودة</p>
            <h1 className="text-heading font-semibold text-[var(--ink)]">
              الوحدة أو الصفحة المطلوبة غير متوفرة
            </h1>
            <p className="text-body-sm leading-relaxed text-[var(--ink-soft)]">
              تأكد من رقم الوحدة (من 1 إلى {UNITS_META.length})، أو اختر إحدى الوحدات المتوفرة
              أدناه.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {UNITS_META.map((unit) => (
              <Link
                key={unit.id}
                href={`/units/${unit.id}`}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-label font-medium text-[var(--ink)] transition-colors hover:bg-[var(--surface-3)]"
              >
                <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                {unit.badge}
              </Link>
            ))}
          </div>

          <Link href="/" className="u-cta">
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>العودة إلى الصفحة الرئيسية</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
