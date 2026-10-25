"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  Layers,
  FileImage,
  Network,
  ArrowUp,
} from "lucide-react";
import type { MindmapNode } from "@/lib/types";
import MindmapDetailsPanel from "./MindmapDetailsPanel";

/**
 * الخريطة التفاعلية (React Flow) تُحمَّل عند الطلب فقط:
 * حزمتها (~55KB مضغوطًا) لا تخصم من وقت التحميل الأول للصفحة،
 * ولا تُحمَّل إطلاقًا لمن يكتفي بالمخطط الشجري.
 */
const MindmapGraph = dynamic(() => import("./MindmapGraph"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] sm:h-[520px] lg:h-[600px] w-full animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-center">
      <span className="text-body-sm font-bold text-slate-600 dark:text-slate-300">
        جارٍ تجهيز الخريطة التفاعلية…
      </span>
    </div>
  ),
});

/**
 * الخريطة البصرية (الصورة) معطَّلة مؤقتًا حتى تُعاد تصميم صورها،
 * ارفع القيمة إلى true بعد استبدال الصور في public/lessons.
 */
const VISUAL_MAP_ENABLED = false;

type ViewMode = "tree" | "graph" | "image";

interface MindmapViewerProps {
  rootNode: MindmapNode;
  imageSrc: string;
  unitTitle: string;
}

export default function MindmapViewer({ rootNode, imageSrc, unitTitle }: MindmapViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [selectedNode, setSelectedNode] = useState<MindmapNode>(rootNode);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const contentRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);

  /** فهرس id ⇒ عقدة (تُستخدمه الخريطة التفاعلية للتنقل من العقدة إلى لوحة الشرح) */
  const nodesById = useMemo(() => {
    const map = new Map<string, MindmapNode>();
    const walk = (node: MindmapNode) => {
      map.set(node.id, node);
      node.children?.forEach(walk);
    };
    walk(rootNode);
    return map;
  }, [rootNode]);

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.5), 2.5));
  };

  /**
   * يُظهر العنصر فقط إذا كان خارج الشاشة، فلا يقفز المحتوى بلا داعٍ.
   * هذا ما يحلّ شكوى «أضغط فلا أرى الشرح، عليّ أن أصعد أو أنزل».
   */
  const revealIfOffscreen = (element: HTMLElement | null) => {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const headerOffset = 80;
    const isVisible = rect.top >= headerOffset && rect.top < window.innerHeight - 140;
    if (!isVisible) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSelectNode = useCallback((node: MindmapNode) => {
    setSelectedNode(node);
    window.requestAnimationFrame(() => revealIfOffscreen(detailsRef.current));
  }, []);

  const switchMode = (mode: ViewMode) => {
    if (mode === viewMode) {
      revealIfOffscreen(contentRef.current);
      return;
    }
    setViewMode(mode);
    window.requestAnimationFrame(() => revealIfOffscreen(contentRef.current));
  };

  const selectById = useCallback(
    (id: string) => {
      const node = nodesById.get(id);
      if (node) handleSelectNode(node);
    },
    [nodesById, handleSelectNode]
  );

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-4">
      {/* مبدّل العرض: يبقى ظاهرًا أثناء التمرير ليعرف الطالب أين هو */}
      <div
        ref={tabsRef}
        className="sticky top-2 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-2.5 space-y-2"
      >
        <div role="tablist" aria-label="طرق عرض الخريطة الذهنية" className="grid grid-cols-2 gap-2">
          <button
            role="tab"
            aria-selected={viewMode === "tree"}
            onClick={() => switchMode("tree")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 rounded-2xl text-label font-bold transition-all ${
              viewMode === "tree"
                ? "bg-teal-700 text-white shadow-sm shadow-teal-700/25"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Layers className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>المخطط الشجري</span>
          </button>

          <button
            role="tab"
            aria-selected={viewMode === "graph"}
            onClick={() => switchMode("graph")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 rounded-2xl text-label font-bold transition-all ${
              viewMode === "graph"
                ? "bg-teal-700 text-white shadow-sm shadow-teal-700/25"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Network className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>الخريطة التفاعلية</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap px-1">
          <p className="text-meta text-slate-600 dark:text-slate-300 font-semibold">
            {viewMode === "graph"
              ? "اسحب الخريطة وتنقّل بين العقد، وانقر أي عقدة لعرض شرحها."
              : "اختر محورًا من الفهرس ليظهر شرحه في الأعلى."}
          </p>

          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-meta font-bold text-slate-500 dark:text-slate-400"
            title="الصور الحالية قيد إعادة التصميم"
          >
            <FileImage className="w-3.5 h-3.5" aria-hidden="true" />
            <span>الخريطة البصرية: قيد إعادة التصميم</span>
          </span>
        </div>
      </div>

      <div ref={contentRef} className="scroll-mt-28 space-y-4">
        {viewMode === "tree" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div
              ref={detailsRef}
              className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-sm scroll-mt-32"
            >
              <MindmapDetailsPanel
                node={selectedNode}
                rootId={rootNode.id}
                entitiesLabel="محاور"
                onSelect={setSelectedNode}
                onBackToRoot={() => setSelectedNode(rootNode)}
              />
            </div>

            <nav
              aria-label="فهرس محاور الوحدة"
              className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles
                    className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0"
                    aria-hidden="true"
                  />
                  <h2 className="font-bold text-body text-slate-900 dark:text-white truncate">
                    فهرس المحاور
                  </h2>
                </div>
                <span className="text-meta font-bold text-slate-600 dark:text-slate-300 shrink-0">
                  {rootNode.children?.length ?? 0} أبواب
                </span>
              </div>

              <div className="space-y-3 lg:max-h-[680px] lg:overflow-y-auto lg:pr-1">
                <button
                  onClick={() => handleSelectNode(rootNode)}
                  aria-current={selectedNode?.id === rootNode.id ? "true" : undefined}
                  className={`w-full p-3.5 rounded-2xl transition-all border-2 flex items-center justify-between gap-2 text-right ${
                    selectedNode?.id === rootNode.id
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-950/60"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-teal-300"
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full bg-teal-700 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-bold text-slate-900 dark:text-white text-body-sm truncate">
                      {rootNode.label}
                    </span>
                  </span>
                  <span className="text-meta font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 shrink-0">
                    الأصل
                  </span>
                </button>

                <div className="space-y-2.5 ps-3 border-r-2 border-teal-200 dark:border-teal-900/60 mr-3">
                  {rootNode.children?.map((branch) => (
                    <TreeNodeItem
                      key={branch.id}
                      node={branch}
                      selectedNode={selectedNode}
                      onSelect={handleSelectNode}
                      collapsedNodes={collapsedNodes}
                      onToggleCollapse={toggleCollapse}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={scrollToDetails}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-label font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowUp className="w-4 h-4" aria-hidden="true" />
                <span>الذهاب إلى الشرح</span>
              </button>
            </nav>
          </div>
        )}

        {viewMode === "graph" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-3">
              <MindmapGraph
                root={rootNode}
                selectedId={selectedNode?.id ?? rootNode.id}
                onSelectNode={selectById}
              />
              <p className="text-meta text-slate-600 dark:text-slate-300 font-medium px-1">
                الخريطة مولَّدة من نفس بيانات المحاور — كل عقدة قابلة للنقر. إن واجهت صعوبة في
                التنقل، استخدم «المخطط الشجري» فهو يعمل بلوحة المفاتيح وقارئ الشاشة.
              </p>
            </div>

            <div
              ref={detailsRef}
              className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm lg:sticky lg:top-40 scroll-mt-32"
            >
              <MindmapDetailsPanel
                node={selectedNode}
                rootId={rootNode.id}
                entitiesLabel="محاور"
                compact
                onSelect={setSelectedNode}
                onBackToRoot={() => setSelectedNode(rootNode)}
              />
            </div>
          </div>
        )}

        {VISUAL_MAP_ENABLED && viewMode === "image" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col items-center">
            <div className="w-full flex items-center justify-end gap-2 pb-3">
              <button
                onClick={() => handleZoom(0.25)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                aria-label="تكبير الخريطة"
              >
                <ZoomIn className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => handleZoom(-0.25)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                aria-label="تصغير الخريطة"
              >
                <ZoomOut className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                aria-label="إعادة ضبط التكبير"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="text-label font-bold text-slate-700 dark:text-slate-300 min-w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            <div className="w-full overflow-auto max-h-[750px] p-2 flex justify-center">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "top center",
                  transition: "transform 0.2s ease-out",
                }}
                className="max-w-none rounded-2xl overflow-hidden"
              >
                <Image
                  src={imageSrc}
                  alt={`الخريطة الذهنية لوحدة ${unitTitle}`}
                  width={2000}
                  height={1400}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1100px"
                  className="max-w-full h-auto block rounded-xl"
                  priority={false}
                />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between gap-2 text-label text-slate-600 dark:text-slate-300 flex-wrap">
              <span>الخريطة البصرية الشاملة للوحدة</span>
              <a
                href={imageSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 dark:text-teal-400 hover:underline font-bold"
              >
                فتح الصورة بالحجم الكامل ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TreeNodeItem({
  node,
  selectedNode,
  onSelect,
  collapsedNodes,
  onToggleCollapse,
}: {
  node: MindmapNode;
  selectedNode: MindmapNode | null;
  onSelect: (node: MindmapNode) => void;
  collapsedNodes: Record<string, boolean>;
  onToggleCollapse: (id: string) => void;
}) {
  const isSelected = selectedNode?.id === node.id;
  const isCollapsed = !!collapsedNodes[node.id];
  const hasChildren = (node.children?.length ?? 0) > 0;

  return (
    <div className="space-y-1.5">
      <div
        className={`p-3 rounded-2xl transition-all border flex items-center justify-between gap-2 ${
          isSelected
            ? "border-teal-500 bg-teal-50 dark:bg-teal-950/60 ring-1 ring-teal-500"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <button
          onClick={() => onSelect(node)}
          aria-current={isSelected ? "true" : undefined}
          className="flex items-center gap-2.5 min-w-0 flex-1 text-right"
        >
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: node.color || "#0d9488" }}
            aria-hidden="true"
          />
          <span
            className={`text-body-sm font-bold leading-snug ${
              isSelected ? "text-teal-900 dark:text-teal-200" : "text-slate-800 dark:text-slate-200"
            }`}
          >
            {node.label}
          </span>
        </button>

        {hasChildren && (
          <button
            onClick={() => onToggleCollapse(node.id)}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? `توسيع ${node.label}` : `طي ${node.label}`}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors shrink-0"
          >
            {isCollapsed ? (
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {hasChildren && !isCollapsed && (
        <div className="space-y-1.5 ps-3 border-r border-slate-200 dark:border-slate-800 mr-2">
          {node.children?.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              selectedNode={selectedNode}
              onSelect={onSelect}
              collapsedNodes={collapsedNodes}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </div>
      )}
    </div>
  );
}
