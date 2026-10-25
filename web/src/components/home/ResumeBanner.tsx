"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, History, X } from "lucide-react";
import { useProgress } from "@/lib/useProgressStore";
import { UNITS_META } from "@/lib/units-meta";

const TAB_LABELS: Record<string, string> = {
  mindmap: "الخريطة الذهنية",
  lesson: "نص الدرس",
  flashcards: "الحفظ والاسترجاع",
  mcq: "اختبار QCM",
  quiz: "بنك الأسئلة",
  revision: "المراجعة السريعة",
};

/**
 * «تابع من حيث توقفت».
 *
 * قبل ذلك كانت الصفحة الرئيسية تترك الطالب يسأل نفسه في كل مرة:
 * «أي وحدة كنت أدرس؟ وأي نمط؟». هنا يُقرأ آخر مكان (يسجّله UnitClientView)
 * ويُعرض إجراء واحد مباشر.
 *
 * لا يحتاج`useEffect`ولا حالة hydration:`useSyncExternalStore`تُرجع لقطة
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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--pine-soft)] px-4 py-3">
      <div className="flex min-w-0 items-baseline gap-3">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-meta font-bold text-[var(--pine-deep)] dark:bg-black/20">
          <History className="h-3.5 w-3.5" aria-hidden="true" />
          تابع من حيث توقفت
        </span>
        <p className="min-w-0 truncate text-body font-bold text-[var(--ink)]">
          {unit.shortTitle}
          <span className="mx-2 font-normal text-[var(--rule-strong)]">/</span>
          <span className="font-medium text-[var(--ink-soft)]">{tabLabel}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link href={href} className="u-cta min-h-9 px-4 py-1.5">
          <span>تابع</span>
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="إخفاء اقتراح المتابعة"
          className="p-2 text-[var(--ink-faint)] transition-colors hover:text-[var(--ink)]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
