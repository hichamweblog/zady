"use client";

import { useMemo, useState } from "react";
import { ImageIcon, Network } from "lucide-react";
import type { MindmapNode } from "@/lib/types";
import { countMindmapNodes } from "@/lib/mindmap-layout";
import MindmapFocusMap from "./MindmapFocusMap";
import MindmapImageView from "./MindmapImageView";

type ViewMode = "map" | "image";

interface MindmapViewerProps {
  rootNode: MindmapNode;
  imageSrc: string;
  unitTitle: string;
}

/**
 * قسم الخريطة الذهنية — وضعان لا أكثر:
 *
 *   «الخريطة»  : تجربة التعلّم (تركيز + شرح).  ← الافتراضي
 *   «المصورة»  : صورة الوحدة الكاملة لمن يفضّل الشكل المطبوعة.
 *
 * أُزيل التبويب الثالث («المحاور») لأنه كان يعرض الشجرة نفسها بقائمة، فيبدو
 * تكرارًا بلا فائدة؛ بدلًا منه صار في الخريطة زر «الفهرس» يفتح الشجرة كأداة
 * تنقّل صغيرة ثم يعود بك إلى الخريطة.
 */
export default function MindmapViewer({ rootNode, imageSrc, unitTitle }: MindmapViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const nodeCount = useMemo(() => countMindmapNodes(rootNode), [rootNode]);

  const modes: { id: ViewMode; label: string; icon: typeof Network; hint: string }[] = [
    {
      id: "map",
      label: "الخريطة",
      icon: Network,
      hint: "اضغط عنصرًا ليصبح مركز الخريطة ويظهر شرحه. «الفهرس» يوصلك إلى أي محور، و«رجوع» يعيدك خطوة.",
    },
    {
      id: "image",
      label: "المصورة",
      icon: ImageIcon,
      hint: "خريطة الوحدة كصورة واحدة — اضغطها للتكبير والتحريك بلا حدود.",
    },
  ];

  const activeHint = modes.find((mode) => mode.id === viewMode)?.hint ?? "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-title font-bold text-slate-900 dark:text-white">الخريطة الذهنية</h2>
          <span className="text-meta font-bold text-slate-500 dark:text-slate-400">
            {nodeCount} عنصرًا
          </span>
        </div>

        <div role="tablist" aria-label="طرق عرض الخريطة" className="grid grid-cols-2 gap-2">
          {modes.map((mode) => {
            const isActive = viewMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`mindmap-panel-${mode.id}`}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-label font-bold transition-all ${
                  isActive
                    ? "bg-teal-700 text-white shadow-sm shadow-teal-700/25"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        <p className="text-body-sm font-medium text-slate-600 dark:text-slate-300">{activeHint}</p>
      </div>

      {viewMode === "map" && (
        <div role="tabpanel" id="mindmap-panel-map" aria-label="الخريطة">
          <MindmapFocusMap root={rootNode} />
        </div>
      )}

      {viewMode === "image" && (
        <div role="tabpanel" id="mindmap-panel-image" aria-label="المصورة">
          <MindmapImageView src={imageSrc} unitTitle={unitTitle} />
        </div>
      )}
    </div>
  );
}
