import Link from "next/link";
import { UNITS_META } from "@/lib/units-meta";
import ResetProgressButton from "@/components/settings/ResetProgressButton";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--hairline)] bg-[var(--surface-2)] py-8">
      <div className="u-wrap space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/diraya-logo-symbol.svg"
              alt="شعار دراية"
              className="h-7 w-auto shrink-0 dark:brightness-0 dark:invert"
            />
            <div>
              <p className="text-label font-semibold text-[var(--ink)]">
                دراية — مساحة مراجعة للعلوم الإسلامية
              </p>
            </div>
          </div>

          <nav aria-label="روابط الوحدات" className="flex items-center gap-2 flex-wrap">
            {UNITS_META.map((unit) => (
              <Link
                key={unit.id}
                href={`/units/${unit.id}`}
                className="rounded-lg px-2.5 py-1 text-label font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"
              >
                {unit.badge}
              </Link>
            ))}
            <ResetProgressButton />
          </nav>
        </div>

        <div className="flex flex-col items-start justify-between gap-2 text-meta text-[var(--ink-faint)] sm:flex-row sm:items-center">
          <p>محتوى تعليمي وفق التدرّج السنوي الرسمي — يُراجَع مع أستاذ المادة.</p>
          <p>نسخة تفاعلية · ٢٠٢٦</p>
        </div>
      </div>
    </footer>
  );
}
