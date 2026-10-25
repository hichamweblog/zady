"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, PlayCircle } from "lucide-react";
import { useProgress } from "@/lib/useProgressStore";
import { UNITS_META } from "@/lib/units-meta";

/**
 * شريط تنقّل سفلي للهاتف.
 *
 * لماذا؟
 *  - الإبهام يغطّي الثلث السفلي من الشاشة؛ كل تطبيقات التعلّم (Duolingo,
 *    Khan Academy, Coursera) تضع التنقّل الأساسي هناك لأن 75% من التفاعلات
 *    بالإبهام. كان التنقّل في هذا التطبيق شريطًا أفقيًا داخل الرأس يُقطع
 *    على الهاتف فلا يرى الطالب بقية الوحدات.
 *  - ثلاثة أهداف فقط: الرئيسية · الوحدات · متابعة (آخر مكان).
 * - يُخفى على الشاشات ≥ md حيث يكفي شريط التنقّل العلوي.
 */
export default function MobileTabBar() {
  const pathname = usePathname();
  const { data } = useProgress();

  const last = data.lastActivity;
  const resumeUnit = UNITS_META.find((u) => u.id === last?.unitId) ?? UNITS_META[0];
  const isHome = pathname === "/";
  const isUnitPage = pathname.startsWith("/units/");

  const itemClass = (active: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-meta font-bold transition-colors ${
      active ? "text-teal-800 dark:text-teal-300" : "text-slate-600 dark:text-slate-400"
    }`;

  return (
    <nav
      aria-label="التنقّل السريع"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch gap-1 px-2 py-1">
        <Link href="/" aria-current={isHome ? "page" : undefined} className={itemClass(isHome)}>
          <Home className="h-5 w-5" aria-hidden="true" />
          <span>الرئيسية</span>
        </Link>

        <Link
          href="/#units"
          aria-current={isHome ? undefined : undefined}
          className={itemClass(false)}
        >
          <Library className="h-5 w-5" aria-hidden="true" />
          <span>الوحدات</span>
        </Link>

        <Link
          href={`/units/${resumeUnit.id}`}
          aria-current={isUnitPage ? "page" : undefined}
          className={itemClass(isUnitPage)}
        >
          <PlayCircle className="h-5 w-5" aria-hidden="true" />
          <span>{last ? "متابعة" : "ابدأ"}</span>
        </Link>
      </div>
    </nav>
  );
}
