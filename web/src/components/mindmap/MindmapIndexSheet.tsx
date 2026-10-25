"use client";

import { useRef, useState } from "react";
import { ChevronDown, ListTree, X } from "lucide-react";
import type { MindmapNode } from "@/lib/types";
import { useSheetA11y } from "./useSheetA11y";

interface MindmapIndexSheetProps {
  root: MindmapNode;
  open: boolean;
  /** العنصر المركّز الآن — يُبرز في الفهرس */
  currentId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}

/**
 * «الفهرس» — ورقة تنقّل داخل الخريطة، لا وضع عرض ثانٍ.
 *
 * قبل ذلك كان للقسم تبويبان متساويان (المحاور · الخريطة) يعرضان الشجرة نفسها
 * بطريقتين، فيبدو الأمر تكرارًا بلا فائدة. الآن: الخريطة هي التجربة الواحدة
 * للتعلّم، وهذا الفهرس أداة صغيرة للوصول السريع إلى أي محور (خصوصًا في
 * الوحدات الطويلة)، ثم يعود الطالب إلى الخريطة مباشرة.
 */
export default function MindmapIndexSheet({
  root,
  open,
  currentId,
  onClose,
  onSelect,
}: MindmapIndexSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useSheetA11y(open, onClose, closeRef);

  if (!open) return null;

  const toggle = (id: string) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

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
        aria-labelledby="mindmap-index-title"
        className="relative z-10 flex max-h-[86vh] w-full flex-col rounded-t-[2rem] bg-white shadow-2xl dark:bg-slate-800 sm:max-w-lg sm:rounded-[2rem]"
      >
        <div className="flex items-start justify-between gap-3 p-5 pb-3">
          <div className="min-w-0 space-y-1">
            <h2
              id="mindmap-index-title"
              className="flex items-center gap-2 text-title font-bold text-slate-900 dark:text-white"
            >
              <ListTree className="h-5 w-5 text-teal-700 dark:text-teal-400" aria-hidden="true" />
              <span>فهرس المحاور</span>
            </h2>
            <p className="text-body-sm font-medium text-slate-600 dark:text-slate-300">
              اختر أي عنوان لينتقل إليه التركيز في الخريطة.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="إغلاق الفهرس"
            className="shrink-0 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 sm:px-3">
          <IndexRow
            node={root}
            depth={0}
            currentId={currentId}
            collapsed={collapsed}
            onToggle={toggle}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
}

function IndexRow({
  node,
  depth,
  currentId,
  collapsed,
  onToggle,
  onSelect,
}: {
  node: MindmapNode;
  depth: number;
  currentId: string;
  collapsed: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const isCollapsed = !!collapsed[node.id];
  const isCurrent = currentId === node.id;

  return (
    <div className={depth > 0 ? "ps-3 sm:ps-4" : ""}>
      <div
        className={`flex items-center gap-1 rounded-xl py-0.5 transition-colors ${
          isCurrent ? "bg-teal-50 dark:bg-teal-950/50" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          aria-current={isCurrent ? "true" : undefined}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-2 text-right text-body-sm font-bold text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: node.color || (depth === 0 ? "#0f766e" : "#14b8a6") }}
            aria-hidden="true"
          />
          <span className={`min-w-0 ${isCurrent ? "text-teal-800 dark:text-teal-300" : ""}`}>
            {node.label}
          </span>
        </button>

        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            aria-expanded={!isCollapsed}
            aria-label={`${isCollapsed ? "إظهار" : "إخفاء"} عناصر «${node.label}»`}
            className="shrink-0 rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {hasChildren && !isCollapsed && (
        <div className="mt-0.5 space-y-0.5">
          {children.map((child) => (
            <IndexRow
              key={child.id}
              node={child}
              depth={depth + 1}
              currentId={currentId}
              collapsed={collapsed}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
