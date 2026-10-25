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

const LABEL: Record<InsightTone, string> = {
  illumination: "إضاءة",
  benefit: "فائدة",
};

/**
 * بطاقة «إضاءة / فائدة» — علامة المحتوى غير المفهومي داخل نصّ الدرس.
 *
 * الشكل: سطح ذهبي فاتح مستدير مع شريحة صغيرة تحمل المصباح. الذهبي هو اللون
 * الثاني الوحيد في النظام، ولا يُستعمل إلا لهذا المعنى (شيء ليس متنًا)، فتُقرأ
 * البطاقة فورًا بلا حاجة إلى إطار أو عنوان صارخ.
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
      className={`rounded-2xl border border-[var(--ochre-soft)] bg-[var(--band-warm)] px-3.5 py-3 ${className}`}
      title={meta?.hint}
      data-insight={resolvedTone}
    >
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2 py-0.5 text-meta font-bold text-[var(--ochre)] dark:bg-black/25">
          <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{LABEL[resolvedTone]}</span>
        </span>
        {heading && <span className="text-meta font-bold text-[var(--ink-soft)]">{heading}</span>}
      </p>

      <div className="mt-2 space-y-2 text-body leading-loose font-medium text-[var(--ink-soft)]">
        {children}
      </div>
    </aside>
  );
}
