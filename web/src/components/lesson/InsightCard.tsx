"use client";

import { Lightbulb } from "lucide-react";
import { insightFor, type InsightTone } from "@/lib/content-kinds";

interface InsightCardProps {
  /** نوع البطاقة: إضاءة (فهم) أو فائدة (معلومة مساعدة) */
  tone?: InsightTone;
  /** عنوان البطاقة إن وُجد، مثل «الشاهد الشرعي» أو «مؤشرات الاستخراج» */
  title?: string;
  /** مفتاح الحقل في بيانات الدرس — يستعمل لتسمية البطاقة تلقائيًا */
  field?: string;
  className?: string;
  children: React.ReactNode;
}

const TONE_STYLE: Record<InsightTone, { label: string; card: string; chip: string; icon: string }> =
  {
    illumination: {
      label: "إضاءة",
      card: "bg-amber-50/80 dark:bg-amber-950/25",
      chip: "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100",
      icon: "text-amber-600 dark:text-amber-400",
    },
    benefit: {
      label: "فائدة",
      card: "bg-emerald-50/80 dark:bg-emerald-950/25",
      chip: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100",
      icon: "text-emerald-700 dark:text-emerald-400",
    },
  };

/**
 * بطاقة «إضاءة / فائدة» — علامة المحتوى غير المفهومي داخل نص الدرس.
 *
 * الخريطة الذهنية لا تحمل إلا العناصر المفهومية (تعريف، أقسام، آثار، أسباب…)،
 * أمّا الشواهد والكلمات المفتاحية ومؤشرات الاستخراج والملاحظات المنهجية فتبقى
 * في الدرس لأن الطالب يحتاجها للفهم، لكنها تُوسم بمصباح صغير حتى لا يخلط بين
 * ما يُحفظ كمفهوم وما هو مجرّد إضاءة أو فائدة.
 */
export default function InsightCard({
  tone,
  title,
  field,
  className = "",
  children,
}: InsightCardProps) {
  const meta = field ? insightFor(field) : null;
  const resolvedTone: InsightTone = tone ?? meta?.tone ?? "illumination";
  const style = TONE_STYLE[resolvedTone];
  const heading = title ?? meta?.label ?? "";

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 space-y-2.5 ${style.card} ${className}`}
      title={meta?.hint}
      data-insight={resolvedTone}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label font-bold ${style.chip}`}
        >
          <Lightbulb className={`w-4 h-4 ${style.icon}`} aria-hidden="true" />
          <span>{style.label}</span>
        </span>
        {heading && (
          <span className="text-label font-bold text-slate-700 dark:text-slate-200">{heading}</span>
        )}
      </div>

      <div className="space-y-2 text-body leading-relaxed font-medium text-slate-800 dark:text-slate-100">
        {children}
      </div>
    </div>
  );
}
