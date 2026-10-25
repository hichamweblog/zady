"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  Info,
  BookOpen,
  Layers,
  FileImage,
  ArrowRight,
} from "lucide-react";
import type { MindmapNode } from "@/lib/types";

interface MindmapViewerProps {
  rootNode: MindmapNode;
  imageSrc: string;
  unitTitle: string;
}

export default function MindmapViewer({ rootNode, imageSrc, unitTitle }: MindmapViewerProps) {
  const [viewMode, setViewMode] = useState<"tree" | "image">("tree");
  const [selectedNode, setSelectedNode] = useState<MindmapNode | null>(rootNode);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.5), 2.5));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl" role="tablist">
          <button
            role="tab"
            aria-selected={viewMode === "tree"}
            onClick={() => setViewMode("tree")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              viewMode === "tree"
                ? "bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" aria-hidden="true" />
            <span>المخطط الشجري والتفاصيل</span>
          </button>
          <button
            role="tab"
            aria-selected={viewMode === "image"}
            onClick={() => setViewMode("image")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              viewMode === "image"
                ? "bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <FileImage className="w-4 h-4" aria-hidden="true" />
            <span>الخريطة البصرية</span>
          </button>
        </div>

        {viewMode === "image" && (
          <div className="flex items-center gap-2">
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
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>
        )}

        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold hidden md:block">
          💡 اختر أي محور من الفهرس لعرض شرحه وشواهده
        </p>
      </div>

      {viewMode === "tree" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* لوحة التفاصيل */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center">
                  <Info className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-black text-lg text-slate-900 dark:text-white">
                    شرح وتفاصيل المحور المحدد
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    انقر فوق عناصر الفهرس للتنقل
                  </p>
                </div>
              </div>

              {selectedNode && selectedNode.id !== rootNode.id && (
                <button
                  onClick={() => setSelectedNode(rootNode)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
                >
                  الرجوع للأصل
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-6">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-400 block">
                    العنوان المفهومي
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                    {selectedNode.label}
                  </h3>
                </div>

                {selectedNode.details ? (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                      البيان والشرح
                    </span>
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-relaxed font-medium border border-slate-200 dark:border-slate-800">
                      {selectedNode.details}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-900/40 text-sm text-teal-900 dark:text-teal-200 font-medium">
                    هذا محور رئيسي: اختر أحد عناصره الفرعية لعرض الشرح والشواهد.
                  </div>
                )}

                {selectedNode.proof && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-black text-amber-900 dark:text-amber-400">
                      <BookOpen className="w-5 h-5 text-amber-600" aria-hidden="true" />
                      <span>الشاهد الشرعي</span>
                    </div>
                    <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border-r-4 border-amber-500 text-amber-950 dark:text-amber-100 font-quran text-xl sm:text-2xl leading-loose">
                      {selectedNode.proof}
                    </div>
                  </div>
                )}

                {selectedNode.children && selectedNode.children.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                      يتفرع عن هذا المحور ({selectedNode.children.length} عناصر):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedNode.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => setSelectedNode(child)}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-slate-800 transition-all flex items-center justify-between gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 text-right"
                        >
                          <span className="truncate">{child.label}</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 rotate-180" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">حدد عنصرًا من الفهرس لاستعراض تفاصيله.</p>
            )}
          </div>

          {/* فهرس الشجرة */}
          <nav
            aria-label="فهرس محاور الوحدة"
            className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                <h2 className="font-black text-base text-slate-900 dark:text-white">فهرس محاور الوحدة</h2>
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {rootNode.children?.length ?? 0} أبواب رئيسية
              </span>
            </div>

            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedNode(rootNode)}
                aria-current={selectedNode?.id === rootNode.id ? "true" : undefined}
                className={`w-full p-3.5 rounded-2xl transition-all border-2 flex items-center justify-between text-right ${
                  selectedNode?.id === rootNode.id
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-950/60"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-teal-300"
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="w-3.5 h-3.5 rounded-full bg-teal-700 shrink-0" aria-hidden="true" />
                  <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base truncate">
                    {rootNode.label}
                  </span>
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 shrink-0">
                  الأصل
                </span>
              </button>

              <div className="space-y-2.5 ps-3 border-r-2 border-teal-200 dark:border-teal-900/60 mr-3">
                {rootNode.children?.map((branch) => (
                  <TreeNodeItem
                    key={branch.id}
                    node={branch}
                    selectedNode={selectedNode}
                    onSelect={setSelectedNode}
                    collapsedNodes={collapsedNodes}
                    onToggleCollapse={toggleCollapse}
                  />
                ))}
              </div>
            </div>
          </nav>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col items-center">
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
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
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
            className={`text-sm sm:text-base font-bold leading-snug truncate ${
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
