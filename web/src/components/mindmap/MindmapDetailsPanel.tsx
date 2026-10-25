"use client";

import { ArrowRight, BookOpen, Info } from "lucide-react";
import type { MindmapNode } from "@/lib/types";

interface MindmapDetailsPanelProps {
  node: MindmapNode | null;
  rootId: string;
  /** كلمة تصنيف العناصر الفرعية («محاور»، «عناصر»…) */
  entitiesLabel?: string;
  compact?: boolean;
  onSelect: (node: MindmapNode) => void;
  onBackToRoot: () => void;
}

/**
 * لوحة «الشرح والشاهد» المشتركة بين المخطط الشجري والخريطة التفاعلية.
 * استُخرجت من`MindmapViewer`لتفادي نسختين تتباعدان مع الوقت.
 */
export default function MindmapDetailsPanel({
  node,
  rootId,
  entitiesLabel = "عناصر",
  compact = false,
  onSelect,
  onBackToRoot,
}: MindmapDetailsPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2
              className={`font-bold text-slate-900 dark:text-white ${
                compact ? "text-body" : "text-title"
              }`}
            >
              شرح وتفاصيل المحور المحدد
            </h2>
            <p className="text-body-sm text-slate-600 dark:text-slate-300 font-medium">
              {compact ? "انقر عقدة من الخريطة" : "انقر فوق عناصر الفهرس للتنقل"}
            </p>
          </div>
        </div>

        {node && node.id !== rootId && (
          <button
            onClick={onBackToRoot}
            className="text-label font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
          >
            الرجوع للأصل
          </button>
        )}
      </div>

      {node ? (
        <div className="space-y-5">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
            <span className="text-label font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 block">
              العنوان المفهومي
            </span>
            <h3
              className={`font-bold text-slate-900 dark:text-white leading-snug ${
                compact ? "text-title" : "text-title sm:text-heading"
              }`}
            >
              {node.label}
            </h3>
          </div>

          {node.details ? (
            <div className="space-y-2">
              <span className="text-label font-bold text-slate-500 dark:text-slate-400 block">
                البيان والشرح
              </span>
              <div
                className={`rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 leading-relaxed font-medium ${
                  compact ? "p-4 text-body-sm" : "p-5 text-body"
                }`}
              >
                {node.details}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-900/40 text-body-sm text-teal-900 dark:text-teal-200 font-medium">
              هذا محور رئيسي: اختر أحد عناصره الفرعية لعرض الشرح والشواهد.
            </div>
          )}

          {node.proof && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-body-sm font-bold text-amber-900 dark:text-amber-400">
                <BookOpen className="w-5 h-5 text-amber-600" aria-hidden="true" />
                <span>الشاهد الشرعي</span>
              </div>
              <div
                className={`rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border-r-4 border-amber-500 text-amber-950 dark:text-amber-100 font-quran leading-loose ${
                  compact ? "p-4 text-title" : "p-5 sm:p-6 text-title sm:text-heading"
                }`}
              >
                {node.proof}
              </div>
            </div>
          )}

          {node.children && node.children.length > 0 && (
            <div className="space-y-3 pt-1">
              <span className="text-label font-bold text-slate-500 dark:text-slate-400 block">
                يتفرع عن هذا المحور ({node.children.length} {entitiesLabel}):
              </span>
              <div
                className={`grid gap-2.5 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}
              >
                {node.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => onSelect(child)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-slate-800 transition-all flex items-center justify-between gap-2 text-body-sm font-bold text-slate-800 dark:text-slate-200 text-right"
                  >
                    <span className="truncate">{child.label}</span>
                    <ArrowRight
                      className="w-4 h-4 text-slate-400 shrink-0 rotate-180"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-body-sm text-slate-500">حدد عنصرًا لاستعراض تفاصيله.</p>
      )}
    </div>
  );
}
