"use client";

import { useState } from "react";
import { MindmapNode } from "@/lib/types";
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

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.5), 2.5));
  };

  const resetZoom = () => setZoomLevel(1);

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setViewMode("tree")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              viewMode === "tree"
                ? "bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>المخطط الشجري والتفاصيل</span>
          </button>
          <button
            onClick={() => setViewMode("image")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              viewMode === "image"
                ? "bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>الخريطة البصرية (HD)</span>
          </button>
        </div>

        {/* Zoom Controls for Image Mode */}
        {viewMode === "image" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom(0.25)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(-0.25)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetZoom}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              title="إعادة ضبط"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 min-w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>
        )}

        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden md:block">
          💡 اختر أي عنصر من الهيكل لعرض شرحه وشواهده بخط كبير وواضح
        </div>
      </div>

      {/* Main Content Area: DETAILS ON THE RIGHT (LARGER), TREE ON THE LEFT */}
      {viewMode === "tree" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 1. DETAILS PANEL (ON THE RIGHT IN RTL = FIRST IN DOM), LARGER: 7 COLS */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    شرح وتفاصيل المحور المحدد
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    انقر فوق عناصر الفهرس للتنقل
                  </span>
                </div>
              </div>

              {selectedNode && selectedNode.id !== rootNode.id && (
                <button
                  onClick={() => setSelectedNode(rootNode)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  الرجوع للأصل
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-6">
                {/* Node Title */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
                    العنوان المفهومي
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                    {selectedNode.label}
                  </h2>
                </div>

                {/* Details Explanation Text */}
                {selectedNode.details ? (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 block">
                      البيان والشرح
                    </span>
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-relaxed font-medium border border-slate-200 dark:border-slate-800 shadow-xs">
                      {selectedNode.details}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 text-sm text-teal-900 dark:text-teal-200 font-medium">
                    انقر على أي من العناصر الفرعية في الهيكل لاستعراض الشرح والشواهد.
                  </div>
                )}

                {/* Quranic Proof Box */}
                {selectedNode.proof && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-black text-amber-700 dark:text-amber-400">
                      <BookOpen className="w-5 h-5 text-amber-600" />
                      <span>الشاهد الشرعي</span>
                    </div>
                    <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border-r-4 border-amber-500 text-amber-950 dark:text-amber-100 font-quran text-xl sm:text-2xl leading-loose shadow-xs">
                      {selectedNode.proof}
                    </div>
                  </div>
                )}

                {/* Sub-branches Links */}
                {selectedNode.children && selectedNode.children.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-slate-400 block">
                      يتفرع عن هذا المحور ({selectedNode.children.length} عناصر):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedNode.children.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => setSelectedNode(c)}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-between text-sm font-bold text-slate-800 dark:text-slate-200 group"
                        >
                          <span className="truncate group-hover:text-teal-700 dark:group-hover:text-teal-300">
                            {c.label}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0 rotate-180" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">حدد عنصراً من الهيكل لاستعراض تفاصيله.</p>
            )}
          </div>

          {/* 2. TREE INDEX NAVIGATOR (ON THE LEFT IN RTL = SECOND IN DOM), 5 COLS */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  فهرس محاور الوحدة
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {rootNode.children?.length || 0} أبواب رئيسية
              </span>
            </div>

            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
              {/* Root Node Item */}
              <div
                onClick={() => setSelectedNode(rootNode)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all border-2 flex items-center justify-between ${
                  selectedNode?.id === rootNode.id
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-950/60 shadow-xs"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-teal-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-teal-600 shrink-0" />
                  <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                    {rootNode.label}
                  </span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 shrink-0">
                  الأصل
                </span>
              </div>

              {/* Tree Branches */}
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
          </div>
        </div>
      ) : (
        /* HD Mindmap Image Viewer */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col items-center">
          <div className="w-full overflow-auto max-h-[750px] p-2 flex justify-center">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease-out",
              }}
              className="max-w-none shadow-2xl rounded-2xl overflow-hidden"
            >
              <img
                src={imageSrc}
                alt={`الخريطة البصرية - ${unitTitle}`}
                className="max-w-full h-auto block rounded-xl"
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between text-xs text-slate-500">
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
  onSelect: (n: MindmapNode) => void;
  collapsedNodes: Record<string, boolean>;
  onToggleCollapse: (id: string, e: React.MouseEvent) => void;
}) {
  const isSelected = selectedNode?.id === node.id;
  const isCollapsed = !!collapsedNodes[node.id];
  const hasChildren = node.children && node.children.length > 0;
  const nodeColor = node.color || "#0d9488";

  return (
    <div className="space-y-1.5">
      <div
        onClick={() => onSelect(node)}
        className={`p-3 rounded-2xl cursor-pointer transition-all border flex items-center justify-between group ${
          isSelected
            ? "border-teal-500 bg-teal-50 dark:bg-teal-950/60 shadow-xs ring-1 ring-teal-500"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-3 h-3 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: nodeColor }}
          />
          <span
            className={`text-sm sm:text-base font-bold leading-snug ${
              isSelected
                ? "text-teal-950 dark:text-teal-200"
                : "text-slate-800 dark:text-slate-200"
            }`}
          >
            {node.label}
          </span>
        </div>

        {hasChildren && (
          <button
            onClick={(e) => onToggleCollapse(node.id, e)}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors shrink-0"
            title={isCollapsed ? "توسيع" : "طي"}
          >
            {isCollapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {hasChildren && !isCollapsed && (
        <div className="space-y-1.5 ps-3 border-r border-slate-200 dark:border-slate-800 mr-2">
          {node.children!.map((child) => (
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
