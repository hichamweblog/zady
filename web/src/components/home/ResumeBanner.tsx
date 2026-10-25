"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, History, X } from "lucide-react";
import { useProgress } from "@/lib/useProgressStore";
import { UNITS_META } from "@/lib/units-meta";

const TAB_LABELS: Record<string, string> = {
  mindmap: "الخريطة الذهنية",
  lesson: "الدرس المنهجي",
  flashcards: "الحفظ والاسترجاع",
  mcq: "اختبار QCM",
  quiz: "بنك أسئلة البكالوريا",
  revision: "المراجعة السريعة",
};

/**
 * «تابع من حيث توقفت».
 *
 * قبل ذلك كانت الصفحة الرئيسية تترك الطالب يسأل نفسه في كل مرة:
 * «أي وحدة كنت أدرس؟ وأي نمط؟». هنا يُقرأ آخر مكان (يسجّله UnitClientView)
 * ويُعرض إجراء واحد مباشر.
 *
 * لا يحتاج `useEffect` ولا حالة hydration: `useSyncExternalStore` تُرجع لقطة
 * فارغة على الخادم ثم اللقطة الحقيقية بعد الترطيب، فيظهر البانر لمن له سجل فقط
 * بلا اختلاف بين HTML الخادم والعميل.
 */
export default function ResumeBanner() {
  const { data } = useProgress();
  const [dismissed, setDismissed] = useState(false);

  const last = data.lastActivity;
  if (dismissed || !last) return null;

  const unit = UNITS_META.find((u) => u.id === last.unitId);
  if (!unit) return null;

  const tabLabel = TAB_LABELS[last.tab] ?? "الوحدة";
  // الوحدة تفتح تلقائيًا على آخر خطوة (UnitClientView يستأنفها من المخزن)
  const href = `/units/${unit.id}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50/70 p-4 dark:border-teal-900 dark:bg-teal-950/30">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
          <History className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-black text-teal-950 dark:text-teal-100">تابع من حيث توقفت</p>
          <p className="truncate text-xs font-semibold text-teal-900/80 dark:text-teal-200/80">
            {unit.shortTitle} · {tabLabel}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-xs font-black text-white transition-colors hover:bg-teal-800"
        >
          <span>متابعة</span>
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="إخفاء اقتراح المتابعة"
          className="rounded-lg p-2 text-teal-900/70 hover:bg-teal-700/10 dark:text-teal-200/70"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
