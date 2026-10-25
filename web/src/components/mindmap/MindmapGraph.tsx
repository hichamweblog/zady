"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BookOpen, CircleDot, Sparkles } from "lucide-react";
import type { MindmapNode } from "@/lib/types";
import { buildMindmapLayout, type MindmapLayout } from "@/lib/mindmap-layout";
import { useIsDark } from "@/lib/useTheme";

interface MindmapNodeData extends Record<string, unknown> {
  label: string;
  depth: number;
  hasDetails: boolean;
  hasProof: boolean;
  childCount: number;
}

const toFlowNodes = (layout: MindmapLayout): Node<MindmapNodeData>[] =>
  layout.nodes.map((node) => ({
    id: node.id,
    type: "mindmap",
    position: { x: node.x, y: node.y - node.height / 2 },
    data: {
      label: node.label,
      depth: node.depth,
      hasDetails: node.hasDetails,
      hasProof: node.hasProof,
      childCount: node.childCount,
    },
    style: { width: node.width },
    // الجذر يمين والأوراق يسارًا ⇒ الوصلة تخرج من يسار الأب وتدخل يمين الابن
    sourcePosition: Position.Left,
    targetPosition: Position.Right,
    draggable: node.depth > 0,
    ariaLabel: `${node.label}${node.childCount ? ` — ${node.childCount} عناصر فرعية` : ""}`,
  }));

function countNodes(root: MindmapNode): number {
  let total = 1;
  root.children?.forEach((child) => {
    total += countNodes(child);
  });
  return total;
}

const toFlowEdges = (layout: MindmapLayout): Edge[] =>
  layout.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    style: { strokeWidth: 1.5 },
  }));

/* ------------------------------------------------------------------ */
/* عقدة مخصّصة                                                         */
/* ------------------------------------------------------------------ */

function MindmapFlowNode({ data, selected }: NodeProps<Node<MindmapNodeData>>) {
  const { label, depth, hasDetails, hasProof, childCount } = data;

  const tone =
    depth === 0
      ? "bg-gradient-to-br from-teal-700 to-emerald-800 text-white border-teal-900/40 shadow-lg shadow-teal-900/20"
      : depth === 1
        ? "bg-teal-50 text-teal-950 border-teal-300 dark:bg-teal-950/70 dark:text-teal-100 dark:border-teal-800"
        : "bg-white text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700";

  return (
    <div
      dir="rtl"
      className={`h-full w-full rounded-2xl border px-3.5 py-2.5 text-right transition-shadow ${tone} ${
        selected ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-transparent" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Right}
        isConnectable={false}
        className="!h-1.5 !w-1.5 !border-0 !bg-teal-500/70"
      />
      <Handle
        type="source"
        position={Position.Left}
        isConnectable={false}
        className="!h-1.5 !w-1.5 !border-0 !bg-teal-500/70"
      />

      <p
        className={`font-bold leading-snug ${
          depth === 0 ? "text-sm" : depth === 1 ? "text-[13px]" : "text-xs"
        }`}
      >
        {label}
      </p>

      {(childCount > 0 || hasDetails || hasProof) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {childCount > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-black/10 px-1 py-0.5 text-[10px] font-bold dark:bg-white/10">
              <CircleDot className="h-2.5 w-2.5" aria-hidden="true" />
              {childCount}
            </span>
          )}
          {hasProof && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              <BookOpen className="h-2.5 w-2.5" aria-hidden="true" />
              شاهد
            </span>
          )}
          {hasDetails && !hasProof && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-teal-100/70 px-1 py-0.5 text-[10px] font-bold text-teal-900 dark:bg-teal-900/60 dark:text-teal-100">
              <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
              شرح
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = { mindmap: MindmapFlowNode };

/* ------------------------------------------------------------------ */
/* الخريطة التفاعلية                                                   */
/* ------------------------------------------------------------------ */

interface MindmapGraphProps {
  root: MindmapNode;
  selectedId: string;
  onSelectNode: (id: string) => void;
}

export default function MindmapGraph({ root, selectedId, onSelectNode }: MindmapGraphProps) {
  const isDark = useIsDark();
  const layout = useMemo(() => buildMindmapLayout(root), [root]);
  const [nodes, , onNodesChange] = useNodesState(toFlowNodes(layout));
  const nodeCount = useMemo(() => countNodes(root), [root]);

  const edgeColor = isDark ? "#2dd4bf" : "#0f766e";
  const edges = useMemo(
    () =>
      toFlowEdges(layout).map((edge) => ({
        ...edge,
        style: { ...edge.style, stroke: edgeColor },
      })),
    [layout, edgeColor]
  );

  // تمييز العقدة المحدَّدة من لوحة التفاصيل
  const styledNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        selected: node.id === selectedId,
      })),
    [nodes, selectedId]
  );

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  const [hintDismissed, setHintDismissed] = useState(false);

  return (
    <div className="mindmap-flow relative h-[420px] sm:h-[520px] lg:h-[600px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      {!hintDismissed && (
        <button
          type="button"
          onClick={() => setHintDismissed(true)}
          className="absolute start-3 top-3 z-10 rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200"
        >
          اسحب للتحريك · انقر عقدة لعرض شرحها ✕
        </button>
      )}

      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        minZoom={0.2}
        maxZoom={1.75}
        colorMode={isDark ? "dark" : "light"}
        nodesConnectable={false}
        edgesFocusable={false}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: false }}
        aria-label="خريطة ذهنية تفاعلية للوحدة"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.4} />
        <Controls
          showInteractive={false}
          position="bottom-left"
          aria-label="أدوات التكبير والتصغير"
        />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          className="!hidden md:!block"
          nodeColor={(node) => {
            const depth = (node.data as MindmapNodeData)?.depth ?? 2;
            return depth === 0 ? "#0f766e" : depth === 1 ? "#5eead4" : "#cbd5e1";
          }}
          maskColor={isDark ? "rgba(2,6,23,0.7)" : "rgba(241,245,249,0.75)"}
        />
      </ReactFlow>

      <p className="sr-only">
        تضم الخريطة {nodeCount} عقدة. استخدم مفتاح Tab للتنقل بين العقد، ومفتاح Enter لعرض
        تفاصيل العقدة. للوصول البديل الكامل استخدم تبويب «المخطط الشجري».
      </p>
    </div>
  );
}
