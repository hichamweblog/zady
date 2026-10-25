"use client";

import { useMemo } from "react";
import { useProgress, weightedProgress } from "@/lib/useProgressStore";

interface UnitProgressBadgeProps {
  unitId: number;
  totals: {
    sections: number;
    cards: number;
    questions: number;
    mcq: number;
  };
}

/**
 * شريط تقدّم الوحدة على بطاقتها في الصفحة الرئيسية.
 *
 * قبل ذلك كانت البطاقة تُظهر «49 بطاقة · 20 QCM · 30 BAC» (حجم المحتوى فقط)
 * ولا تُظهر أين وصل الطالب — فيضطر لفتح كل وحدة ليعرف ما أنجزه.
 * هنا تُقرأ عدّادات المخزن بنفس صيغة`getUnitStats`(دالة مشتركة) دون الحاجة
 * إلى تحميل بيانات الوحدة الكاملة إلى العميل.
 */
export default function UnitProgressBadge({ unitId, totals }: UnitProgressBadgeProps) {
  const { data } = useProgress();

  const percentage = useMemo(() => {
    const prefix = `u${unitId}_`;
    const countEasy = Object.entries(data.flashcardRatings).filter(
      ([key, rating]) => key.startsWith(`${prefix}c_`) && rating === "easy"
    ).length;
    const countTrue = (map: Record<string, boolean>, kind: string) =>
      Object.entries(map).filter(([key, value]) => key.startsWith(`${prefix}${kind}_`) && value)
        .length;

    const attempt = data.quizAttempts[unitId];

    return weightedProgress({
      sectionsDone: countTrue(data.readSections, "s"),
      sectionsTotal: totals.sections,
      cardsDone: countEasy,
      cardsTotal: totals.cards,
      quizScore: attempt?.score ?? 0,
      quizTotal: totals.mcq,
      quizAttempted: Boolean(attempt),
      questionsDone: countTrue(data.masteredQuestions, "q"),
      questionsTotal: totals.questions,
    });
  }, [data, totals, unitId]);

  if (percentage === 0) {
    return <span className="text-meta font-bold text-[var(--ink-faint)]">لم تبدأ بعد</span>;
  }

  return (
    <span className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-meta font-bold text-[var(--ink-faint)]">تقدّمك</span>
        <span className="u-num text-meta text-[var(--pine)]">{percentage}%</span>
      </span>
      <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-[var(--sunken)]">
        <span className="block h-full bg-[var(--pine)]" style={{ width: `${percentage}%` }} />
      </span>
    </span>
  );
}
