"use client";

import { Lightbulb } from "lucide-react";
import { insightFor, type InsightTone } from "@/lib/content-kinds";

interface InsightCardProps {
  /** نوع البطاقة: إضاءة (فهم) أو فائدة (معلومة مساعدة) */
  tone?: InsightTone;
  /** عنوان البطاقة إن وُجد، مثل «مؤشرات الاستخراج» */
  title?: string;
  /** مفتاح الحقل في بيانات الدرس — يستعمل لتسمية البطاقة تلقائيًا */
  field?: string;
  className?: string;
  children: React.ReactNode;
}

const TONE_LABEL: Record<InsightTone, string> = {
  illumination: "إضاءة",
  benefit: "فائدة",
};

/**
 * بطاقة «إضاءة / فائدة» — علامة المحتوى غير المفهومي داخل نصّ الدرس.
 *
 * في اتجاه الكتاب المطبوع ليست بطاقة مستديرة ملوّنة، بل **هامش جانبي**:
 * خطّ مغرة رقيق على الجانب، خلفية ورقية أغمق درجة، ومصباح صغير. المغرة هي
 * اللون الوحيد المسموح به خارج الحبر والصنوبري، ولذلك تحمل معنى «انتبه، هذا
 * ليس متنًا» بلا حاجة إلى زخرفة.
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
  const heading = title ?? meta?.label ?? "";

  return (
    <aside
      className={`border-s-2 border-[var(--ochre)]/60 bg-[var(--sunken)] px-3.5 py-3 sm:px-4 ${className}`}
      title={meta?.hint}
      data-insight={resolvedTone}
    >
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="inline-flex items-center gap-1.5 text-meta font-bold text-[var(--ochre)]">
          <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{TONE_LABEL[resolvedTone]}</span>
        </span>
        {heading && <span className="text-meta font-bold text-[var(--ink-soft)]">{heading}</span>}
      </p>

      <div className="mt-1.5 space-y-2 text-body leading-loose font-medium text-[var(--ink-soft)]">
        {children}
      </div>
    </aside>
  );
}
