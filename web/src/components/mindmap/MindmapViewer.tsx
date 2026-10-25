"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ImageIcon, ListTree, Network } from "lucide-react";
import type { MindmapNode } from "@/lib/types";
import { countMindmapNodes } from "@/lib/mindmap-layout";
import MindmapOutline from "./MindmapOutline";
import MindmapFocusMap from "./MindmapFocusMap";

/**
 * «المصورة» = الخريطة البصرية القديمة (صورة الوحدة).
 * معطَّلة حتى تُعاد تصميم الصور: ارفع القيمة إلى true بعد استبدال ملفات
 * public/lessons/unit0X_mindmap.webp.
 */
const VISUAL_MAP_ENABLED = false;

type ViewMode = "outline" | "map" | "image";

interface MindmapViewerProps {
  rootNode: MindmapNode;
  imageSrc: string;
  unitTitle: string;
}

const MODES: {
  id: ViewMode;
  label: string;
  icon: typeof ListTree;
  hint: string;
}[] = [
  {
    id: "outline",
    label: "المحاور",
    icon: ListTree,
    hint: "قائمة مرتّبة: اضغط أي عنوان لقراءة شرحه في بطاقة.",
  },
  {
    id: "map",
    label: "الخريطة",
    icon: Network,
    hint: "اضغط عنصرًا ليصبح مركز الخريطة ويظهر شرحه.",
  },
  {
    id: "image",
    label: "المصورة",
    icon: ImageIcon,
    hint: "صورة الخريطة الكاملة للوحدة.",
  },
];

export default function MindmapViewer({ rootNode, imageSrc, unitTitle }: MindmapViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("outline");
  const nodeCount = useMemo(() => countMindmapNodes(rootNode), [rootNode]);
  const activeHint = MODES.find((mode) => mode.id === viewMode)?.hint ?? "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-title font-bold text-slate-900 dark:text-white">الخريطة الذهنية</h2>
          <span className="text-meta font-bold text-slate-500 dark:text-slate-400">
            {nodeCount} عنصرًا · طريقتان للعرض
          </span>
        </div>

        <div role="tablist" aria-label="طرق عرض الخريطة" className="grid grid-cols-3 gap-2">
          {MODES.map((mode) => {
            const isDisabled = mode.id === "image" && !VISUAL_MAP_ENABLED;
            const isActive = viewMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`mindmap-panel-${mode.id}`}
                disabled={isDisabled}
                onClick={() => setViewMode(mode.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-label font-bold transition-all sm:flex-row sm:gap-2 ${
                  isActive
                    ? "bg-teal-700 text-white shadow-sm shadow-teal-700/25"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                } ${isDisabled ? "cursor-not-allowed opacity-55" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{mode.label}</span>
                {isDisabled && <span className="text-meta font-medium">قريبًا</span>}
              </button>
            );
          })}
        </div>

        <p className="text-body-sm font-medium text-slate-600 dark:text-slate-300">{activeHint}</p>
      </div>

      {viewMode === "outline" && (
        <div role="tabpanel" id="mindmap-panel-outline" aria-label="المحاور">
          <MindmapOutline root={rootNode} />
        </div>
      )}
      {viewMode === "map" && (
        <div role="tabpanel" id="mindmap-panel-map" aria-label="الخريطة">
          <MindmapFocusMap root={rootNode} />
        </div>
      )}

      {VISUAL_MAP_ENABLED && viewMode === "image" && (
        <div className="overflow-hidden rounded-[1.75rem] bg-white p-3 shadow-sm dark:bg-slate-900 sm:p-5">
          <Image
            src={imageSrc}
            alt={`الخريطة المصوّرة لوحدة ${unitTitle}`}
            width={2000}
            height={1400}
            sizes="(max-width: 768px) 100vw, 1100px"
            className="h-auto w-full rounded-2xl"
            priority={false}
          />
          <a
            href={imageSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-label font-bold text-teal-700 hover:underline dark:text-teal-300"
          >
            فتح الصورة بالحجم الكامل ↗
          </a>
        </div>
      )}
    </div>
  );
}
