"use client";

import { useRef } from "react";
import { ArrowRight, ChevronRight, X } from "lucide-react";
import type { MindmapNode } from "@/lib/types";
import { useSheetA11y } from "./useSheetA11y";

interface MindmapInfoSheetProps {
  node: MindmapNode | null;
  onClose: () => void;
  /** الانتقال إلى عنصر فرعي من داخل البطاقة (يبدّل المحتوى بلا إغلاق) */
  onNavigate: (id: string) => void;
}

/**
 * بطاقة شرح واحدة تحلّ محلّ لوحة التفاصيل الجانبية.
 *
 * لماذا بطاقة فوق المحتوى (modal/sheet)؟
 *   - على الهاتف لا مساحة للوحة جانبية، فكان الطالب يصعد وينزل ليرى الشرح.
 *   - تركيز واحد: لا تظهر إلا تفاصيل العنصر الذي ضغطه، ويُغلق بالضغط خارجه
 *     أو بمفتاح Esc — أو بزر «رجوع» — فيعود كل شيء إلى أصله.
 * التصميم بلا حدود: كتل ملوّنة خفيفة وظلال ناعمة فقط.
 *
 * البطاقة تعرض **العنصر المفهومي وحده**: التسمية وشرحها. أمّا الشواهد
 * والكلمات المفتاحية والملاحظات فليست عناصر مفهومية، ولذلك لا تدخل الخريطة،
 * وإنما تظهر في «نص الدرس» بعلامة المصباح (إضاءة/فائدة).
 */
export default function MindmapInfoSheet({ node, onClose, onNavigate }: MindmapInfoSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useSheetA11y(Boolean(node), onClose, closeRef);

  if (!node) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-[#07231c]/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mindmap-sheet-title"
        className="relative z-10 max-h-[86vh] w-full overflow-y-auto rounded-t-[1.75rem] border border-[var(--rule)] bg-[var(--sheet)] p-5 shadow-[var(--shadow-lg)] sm:max-w-xl sm:rounded-[1.75rem] sm:p-7"
      >
        <div
          className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--rule-strong)] sm:hidden"
          aria-hidden="true"
        />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="u-chip">تفاصيل العنصر</p>
            <h2 id="mindmap-sheet-title" className="u-display text-title">
              {node.label}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="إغلاق البطاقة"
            className="shrink-0 p-2 text-[var(--ink-faint)] transition-colors hover:bg-[var(--sunken)] hover:text-[var(--ink)]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {node.details ? (
          <p className="mt-4 rounded-2xl bg-[var(--sunken)] p-4 text-body leading-loose font-medium text-[var(--ink-soft)]">
            {node.details}
          </p>
        ) : (
          <p className="mt-4 border-s-2 border-[var(--rule-strong)] ps-3 text-body font-medium text-[var(--ink-faint)]">
            {node.children?.length
              ? "هذا محور رئيسي: اختر أحد عناصره الفرعية لقراءة الشرح."
              : "لا يوجد شرح إضافي لهذا العنصر في هذه الوحدة."}
          </p>
        )}

        {node.children && node.children.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="u-chip">عناصر هذا المحور ({node.children.length})</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {node.children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => onNavigate(child.id)}
                  className="flex items-center justify-between gap-2 rounded-xl bg-[var(--sunken)] px-3 py-2.5 text-right text-label font-bold text-[var(--ink)] transition-colors hover:bg-[var(--pine-soft)]"
                >
                  <span className="min-w-0">{child.label}</span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 rotate-180 text-[var(--ink-faint)]"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <button type="button" onClick={onClose} className="u-ghost mt-5 w-full">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span>رجوع</span>
        </button>
      </div>
    </div>
  );
}
