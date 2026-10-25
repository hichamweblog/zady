import type { MindmapNode } from "./types";

/**
 * هندسة «خريطة التركيز» — دوال خالصة بلا React ولا DOM.
 *
 * لماذا لا مكتبة تخطيط (dagre/elk) ولا React Flow؟
 *   الشجرة صغيرة (13–22 عقدة)، فمحرّك رسم عام يضيف ~55KB ولا يضيف فهمًا.
 *   والأهم: الطالب لا يحتاج رؤية العشرين عقدة معًا في وقت واحد — يحتاج أن
 *   يفهم عقدة واحدة في سياق أبنائها. لذلك نرسم «مدار» حول العقدة المركّزة،
 *   كل مستوى في شاشة واحدة، بلا خطوط كثيرة ولا أزرار تحكّم.
 *
 * الاتجاه: عربي (RTL) — يبدأ المدار من أعلى اليمين ويتقدّم عكس عقارب الساعة،
 * فتقرأ العين العناصر بالترتيب الطبيعي بدل أن تقفز من اليسار.
 */

export interface FocusRingItem {
  id: string;
  /** موضع أفقي نسبي داخل الحاوية (0 = أقصى اليمين بالنسبة للاتجاه، 1 = أقصى اليسار) */
  x: number;
  /** موضع رأسي نسبي (0 أعلى · 1 أسفل) */
  y: number;
  /** زاوية بالدرجات (للدعم في الاختبار والترتيب) */
  angle: number;
  childCount: number;
  hasDetails: boolean;
  hasProof: boolean;
}

export const RING_RADIUS_X = 0.34;
export const RING_RADIUS_Y = 0.3;
/** أول عنصر في أعلى اليمين، ثم ندور عكس عقارب الساعة */
const START_ANGLE = -45;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * توزيع أبناء العقدة المركّزة على مدار بيضاوي حول المركز.
 * عنصر واحد يُوضع يسار المركز (اتجاه التفرّع الطبيعي في القراءة العربية).
 */
export function buildFocusLayout(
  children: MindmapNode[],
  radius: { x?: number; y?: number } = {}
): FocusRingItem[] {
  const rx = radius.x ?? RING_RADIUS_X;
  const ry = radius.y ?? RING_RADIUS_Y;
  const count = children.length;
  if (count === 0) return [];

  const step = 360 / count;

  return children.map((child, index) => {
    const angle = count === 1 ? 180 : START_ANGLE - index * step;
    return {
      id: child.id,
      x: clamp(0.5 + Math.cos(toRad(angle)) * rx, 0.04, 0.96),
      y: clamp(0.5 + Math.sin(toRad(angle)) * ry, 0.06, 0.94),
      angle: ((angle % 360) + 360) % 360,
      childCount: child.children?.length ?? 0,
      hasDetails: Boolean(child.details),
      hasProof: Boolean(child.proof),
    };
  });
}

/** مسار الأجداد من الجذر إلى العقدة المطلوبة (لبطاقة التتبّع) */
export function findNodePath(root: MindmapNode, id: string): MindmapNode[] {
  const walk = (node: MindmapNode, trail: MindmapNode[]): MindmapNode[] | null => {
    const next = [...trail, node];
    if (node.id === id) return next;
    for (const child of node.children ?? []) {
      const found = walk(child, next);
      if (found) return found;
    }
    return null;
  };
  return walk(root, []) ?? [];
}

/** بحث بالمعرّف داخل الشجرة */
export function findMindmapNode(root: MindmapNode, id: string): MindmapNode | null {
  const path = findNodePath(root, id);
  return path.length > 0 ? path[path.length - 1] : null;
}

/** عدد العقد الكلي — يُعرض في ترويسة القسم للطالب */
export function countMindmapNodes(root: MindmapNode): number {
  return 1 + (root.children ?? []).reduce((total, child) => total + countMindmapNodes(child), 0);
}
