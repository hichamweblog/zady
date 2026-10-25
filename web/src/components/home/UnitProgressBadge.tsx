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
    return <p className="text-meta font-bold text-slate-500 dark:text-slate-400">لم تبدأ بعد</p>;
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-meta font-bold">
        <span className="text-slate-600 dark:text-slate-300">تقدّمك</span>
        <span className="text-teal-800 dark:text-teal-300">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
        <div
          style={{ width: `${percentage}%` }}
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
        />
      </div>
    </div>
  );
}
