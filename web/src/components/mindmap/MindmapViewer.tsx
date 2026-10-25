"use client";

import { useMemo, useState } from "react";
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
 *
 * الشجرة المفهومية فقط: لا شواهد ولا كلمات مفتاحية ولا ملاحظات في بيانات
 * الخريطة؛ ما ليس مفهومًا يُعرض في «نص الدرس» ببطاقة مصباح (إضاءة/فائدة).
 */
export default function MindmapViewer({ rootNode, imageSrc, unitTitle }: MindmapViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const nodeCount = useMemo(() => countMindmapNodes(rootNode), [rootNode]);

  const modes: { id: ViewMode; label: string; hint: string }[] = [
    {
      id: "map",
      label: "الخريطة",
      hint: "خريطة المفاهيم. اضغط عنصرًا ليصبح المركز ويُقرأ شرحه.",
    },
    {
      id: "image",
      label: "المصورة",
      hint: "الخريطة كما رُسمت: صورة واحدة تُكبَّر وتُسحب.",
    },
  ];

  const activeHint = modes.find((mode) => mode.id === viewMode)?.hint ?? "";

  return (
    <div className="space-y-4">
      <div className="mx-auto w-full max-w-[980px] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="u-tabs" role="presentation">
            {modes.map((mode) => {
              const isActive = viewMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`mindmap-panel-${mode.id}`}
                  onClick={() => setViewMode(mode.id)}
                  className="u-tab"
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
          <span className="u-chip shrink-0">{nodeCount} مفهومًا</span>
        </div>

        <p className="text-meta font-medium text-[var(--ink-faint)]">{activeHint}</p>
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
