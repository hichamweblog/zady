import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { UNITS_META } from "@/lib/units-meta";
import ResetProgressButton from "@/components/settings/ResetProgressButton";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--rule-strong)] py-8">
      <div className="mx-auto max-w-[1180px] space-y-6 px-5 sm:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-2">
            <GraduationCap
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ink-faint)]"
              aria-hidden="true"
            />
            <div>
              <p className="text-label font-bold text-[var(--ink)]">
                زادِي — مساحة مراجعة للعلوم الإسلامية
              </p>
            </div>
          </div>

          <nav aria-label="روابط الوحدات" className="flex items-center gap-2 flex-wrap">
            {UNITS_META.map((unit) => (
              <Link
                key={unit.id}
                href={`/units/${unit.id}`}
                className="px-2 py-1 text-label font-medium text-[var(--ink-soft)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
              >
                {unit.badge}
              </Link>
            ))}
            <ResetProgressButton />
          </nav>
        </div>

        <div className="flex flex-col items-start justify-between gap-2 border-t border-[var(--rule)] pt-4 text-meta text-[var(--ink-faint)] sm:flex-row sm:items-center">
          <p>محتوى تعليمي وفق التدرّج السنوي الرسمي — يُراجَع مع أستاذ المادة.</p>
          <p>نسخة تفاعلية تعمل دون اتصال · ٢٠٢٦</p>
        </div>
      </div>
    </footer>
  );
}
