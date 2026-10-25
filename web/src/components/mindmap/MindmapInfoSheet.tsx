"use client";

import { useRef } from "react";
import { ArrowRight, BookOpen, ChevronRight, X } from "lucide-react";
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
 */
export default function MindmapInfoSheet({ node, onClose, onNavigate }: MindmapInfoSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useSheetA11y(Boolean(node), onClose, closeRef);

  if (!node) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mindmap-sheet-title"
        className="relative z-10 max-h-[86vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl dark:bg-slate-900 sm:max-w-xl sm:rounded-[2rem] sm:p-7"
      >
        <div
          className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700 sm:hidden"
          aria-hidden="true"
        />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-meta font-bold text-teal-700 dark:text-teal-400">تفاصيل العنصر</p>
            <h2
              id="mindmap-sheet-title"
              className="text-title font-bold leading-snug text-slate-900 dark:text-white"
            >
              {node.label}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="إغلاق البطاقة"
            className="shrink-0 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {node.details ? (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-body leading-loose font-medium text-slate-800 dark:bg-slate-800/60 dark:text-slate-100">
            {node.details}
          </p>
        ) : (
          <p className="mt-4 rounded-2xl bg-teal-50/80 p-4 text-body-sm font-medium text-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
            {node.children?.length
              ? "هذا محور رئيسي: اختر أحد عناصره الفرعية لقراءة الشرح."
              : "لا يوجد شرح إضافي لهذا العنصر في هذه الوحدة."}
          </p>
        )}

        {node.proof && (
          <div className="mt-4 rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/30">
            <p className="flex items-center gap-2 text-label font-bold text-amber-900 dark:text-amber-300">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>الشاهد</span>
            </p>
            <p className="font-quran mt-2 text-title leading-loose text-amber-950 dark:text-amber-100">
              {node.proof}
            </p>
          </div>
        )}

        {node.children && node.children.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-label font-bold text-slate-500 dark:text-slate-400">
              عناصر هذا المحور ({node.children.length})
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {node.children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => onNavigate(child.id)}
                  className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-right text-body-sm font-bold text-slate-800 transition-colors hover:bg-teal-50 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-teal-950/40"
                >
                  <span className="min-w-0">{child.label}</span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 rotate-180 text-slate-400"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-label font-bold text-slate-800 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span>رجوع</span>
        </button>
      </div>
    </div>
  );
}
