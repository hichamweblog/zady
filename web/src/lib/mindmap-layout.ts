import type { MindmapNode } from "./types";

/**
 * تخطيط شجرة الخريطة الذهنية — دالة خالصة بلا React ولا DOM.
 *
 * لماذا تخطيط يدوي بدل مكتبة (dagre/elk)؟
 * الشجرة هنا صغيرة (≤ 40 عقدة) وهرمية بحتة، فلا حاجة إلى محرك تخطيط عام
 * يضيف ~40KB. الخوارزمية هنا هي «tidy tree» المبسّطة: كل ورقة تأخذ صفًّا
 * بارتفاعها، والأب يجلس في منتصف أبنائه.
 *
 * الاتجاه: RTL — الجذر في أقصى اليمين والأوراق تتفرّع يسارًا، وهو ما يوافق
 * اتجاه القراءة العربي بدل أن يبدأ الطالب من اليسار.
 */

export const WIDTH_BY_DEPTH = [250, 232, 214, 200];
const H_GAP = 76;
const V_GAP = 12;
const PADDING_X = 16;
const PADDING_Y = 12;
export const LINE_HEIGHT = 21;
const CHAR_WIDTH = 7.1;

export const widthForDepth = (depth: number): number =>
  WIDTH_BY_DEPTH[Math.min(depth, Math.max(WIDTH_BY_DEPTH.length - 1, 0))];

/** تقدير ارتفاع البطاقة من طول النص — للتباعد فقط، والارتفاع النهائي من المتصفح */
export function estimateHeight(label: string, depth: number, hasExtra: boolean): number {
  const usable = widthForDepth(depth) - PADDING_X * 2;
  const perLine = Math.max(6, Math.floor(usable / CHAR_WIDTH));
  const lines = Math.max(1, Math.ceil(label.length / perLine));
  return PADDING_Y + lines * LINE_HEIGHT + (hasExtra ? 20 : 0);
}

export interface LayoutNode {
  id: string;
  label: string;
  depth: number;
  /** الحد الأيسر للبطاقة بوحدات قماش React Flow */
  x: number;
  /** مركز البطاقة رأسيًا */
  y: number;
  width: number;
  height: number;
  hasDetails: boolean;
  hasProof: boolean;
  childCount: number;
}

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
}

export interface MindmapLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  /** أبعاد المحتوى الكاملة (تُستخدم للاختبارات وللعرض الاحتياطي) */
  width: number;
  height: number;
}

export function buildMindmapLayout(root: MindmapNode): MindmapLayout {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];

  let maxDepth = 0;
  const measureDepth = (node: MindmapNode, depth: number) => {
    maxDepth = Math.max(maxDepth, depth);
    node.children?.forEach((child) => measureDepth(child, depth + 1));
  };
  measureDepth(root, 0);

  // الأصل يمينًا ⇒ x ينقص كلما زاد العمق
  const xByDepth: number[] = new Array(maxDepth + 1).fill(0);
  for (let d = maxDepth - 1; d >= 0; d -= 1) {
    xByDepth[d] = xByDepth[d + 1] + widthForDepth(d + 1) + H_GAP;
  }

  let cursor = 0;
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  const place = (node: MindmapNode, depth: number): number => {
    const kids = node.children ?? [];
    const hasDetails = Boolean(node.details);
    const hasProof = Boolean(node.proof);
    const width = widthForDepth(depth);

    let centerY: number;
    if (kids.length === 0) {
      const height = estimateHeight(node.label, depth, hasDetails || hasProof);
      centerY = cursor + height / 2;
      cursor += height + V_GAP;
    } else {
      const childCenters = kids.map((child) => place(child, depth + 1));
      centerY = (childCenters[0] + childCenters[childCenters.length - 1]) / 2;
    }

    const height = estimateHeight(node.label, depth, hasDetails || hasProof);
    const x = xByDepth[depth];

    nodes.push({
      id: node.id,
      label: node.label,
      depth,
      x,
      y: centerY,
      width,
      height,
      hasDetails,
      hasProof,
      childCount: kids.length,
    });

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + width);
    minY = Math.min(minY, centerY - height / 2);
    maxY = Math.max(maxY, centerY + height / 2);

    kids.forEach((child) => {
      edges.push({ id: `${node.id}->${child.id}`, source: node.id, target: child.id });
    });

    return centerY;
  };

  place(root, 0);

  return {
    nodes,
    edges,
    width: maxX - minX,
    height: maxY - minY,
  };
}
