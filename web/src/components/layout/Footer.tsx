import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { UNITS_META } from "@/lib/units-meta";
import ResetProgressButton from "@/components/settings/ResetProgressButton";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-2">
            <GraduationCap className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                زادِي — مساحة مراجعة للعلوم الإسلامية
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                تطبيق محلي بالكامل: لا حساب، ولا تتبّع، وتقدّمك محفوظ على جهازك فقط.
              </p>
            </div>
          </div>

          <nav aria-label="روابط الوحدات" className="flex items-center gap-2 flex-wrap">
            {UNITS_META.map((unit) => (
              <Link
                key={unit.id}
                href={`/units/${unit.id}`}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {unit.badge}
              </Link>
            ))}
            <ResetProgressButton />
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
          <p>محتوى تعليمي وفق التدرّج السنوي الرسمي — يُراجَع مع أستاذ المادة.</p>
          <p className="text-slate-500 dark:text-slate-400">نسخة تفاعلية تعمل دون اتصال (PWA) • 2026</p>
        </div>
      </div>
    </footer>
  );
}
