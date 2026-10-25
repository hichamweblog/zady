"use client";

import { useCallback, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import type { MindmapNode } from "@/lib/types";
import { findMindmapNode } from "@/lib/mindmap-layout";
import MindmapInfoSheet from "./MindmapInfoSheet";

interface MindmapOutlineProps {
  root: MindmapNode;
}

/**
 * «المحاور» — فهرس مرتّب بدل الرسم الشجري ذي البطاقات المتداخلة.
 *
 * لماذا؟
 *   - الطالب يبحث عن معلومة، لا عن شكل: قائمة واضحة أسرع للقراءة والتنقّل.
 *   - كل عنوان يُفتح في بطاقة شرح واحدة؛ لا لوحة جانبية تُبعده عن مكانه.
 *   - الفروع تُطوى/تُفتح بسهم صغير، بلا خطوط ولا إطارات حول كل سطر.
 */
export default function MindmapOutline({ root }: MindmapOutlineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const activeNode = activeId ? findMindmapNode(root, activeId) : null;

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const closeSheet = useCallback(() => setActiveId(null), []);
  const navigateTo = useCallback((id: string) => setActiveId(id), []);

  return (
    <div className="rounded-[1.75rem] bg-white p-2 shadow-sm dark:bg-slate-900 sm:p-3">
      <OutlineRow
        node={root}
        depth={0}
        activeId={activeId}
        collapsed={collapsed}
        onOpen={setActiveId}
        onToggle={toggle}
      />

      <MindmapInfoSheet node={activeNode} onClose={closeSheet} onNavigate={navigateTo} />
    </div>
  );
}

function OutlineRow({
  node,
  depth,
  activeId,
  collapsed,
  onOpen,
  onToggle,
}: {
  node: MindmapNode;
  depth: number;
  activeId: string | null;
  collapsed: Record<string, boolean>;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const isCollapsed = !!collapsed[node.id];
  const isActive = activeId === node.id;

  return (
    <div className={depth > 0 ? "ps-3 sm:ps-4" : ""}>
      <div
        className={`flex items-center gap-1.5 rounded-2xl py-1 pe-1 transition-colors ${
          isActive
            ? "bg-teal-50 dark:bg-teal-950/50"
            : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
        }`}
      >
        <button
          type="button"
          onClick={() => onOpen(node.id)}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-2 text-right"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: node.color || (depth === 0 ? "#0f766e" : "#14b8a6") }}
            aria-hidden="true"
          />
          <span
            className={`min-w-0 font-bold leading-snug ${
              depth === 0
                ? "text-body text-slate-900 dark:text-white"
                : "text-body-sm text-slate-800 dark:text-slate-200"
            } ${isActive ? "text-teal-900 dark:text-teal-200" : ""}`}
          >
            {node.label}
          </span>
          {node.details && (
            <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          )}
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
            <OutlineRow
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              collapsed={collapsed}
              onOpen={onOpen}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
