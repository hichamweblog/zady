"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, CornerDownLeft, ListTree, Sparkles } from "lucide-react";
import type { MindmapNode } from "@/lib/types";
import { buildFocusLayout, findMindmapNode, findNodePath } from "@/lib/mindmap-layout";
import MindmapInfoSheet from "./MindmapInfoSheet";
import MindmapIndexSheet from "./MindmapIndexSheet";

interface MindmapFocusMapProps {
  root: MindmapNode;
}

/**
 * «خريطة التركيز» — بديل الخريطة التفاعلية السابقة (React Flow).
 *
 * الفكرة: مستوى واحد في كل شاشة.
 *   - المركز: المحور الذي تنظر إليه الآن.
 *   - حوله: عناصره الفرعية فقط، موصولة بخطوط خفيفة.
 *   - الضغط على عنصر ⇒ يظهر شرحه في بطاقة، وينتقل التركيز إليه (يغدو هو المركز).
 *   - الضغط خارج البطاقة ⇒ يُغلق الشرح ويعود التركيز إلى أصله.
 *
 * هذا يحقّق ما كان ناقصًا: لا عشرون عقدة مزدحمة، لا مصغّرة ولا أزرار تكبير،
 * ولا تمرير جانبي؛ عنصر واحد مركّز في كل لحظة، وشرحه أمام عينيك.
 */
export default function MindmapFocusMap({ root }: MindmapFocusMapProps) {
  const [focusId, setFocusId] = useState(root.id);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [indexOpen, setIndexOpen] = useState(false);
  /**
   * تاريخ التنقّل: كل انتقال يحفظ ما قبله مع *مصدره*.
   * الفرق مهم: انتقال من «الفهرس» يجب أن يعيدك إلى **القائمة** عند الرجوع،
   * لا إلى مستوى أعلى في الخريطة — لأن القائمة هي مكانك الأصلي.
   */
  const [history, setHistory] = useState<{ focusId: string; fromIndex: boolean }[]>([]);
  /** هل فتحُ البطاقة الحالية نقل التركيز؟ (حتى لا يُرجِع الإغلاق خطوة لم تحدث) */
  const cardMovedFocus = useRef(false);

  const focused = useMemo(() => findMindmapNode(root, focusId) ?? root, [root, focusId]);
  const trail = useMemo(() => findNodePath(root, focused.id), [root, focused.id]);
  const children = useMemo(() => focused.children ?? [], [focused]);
  const ring = useMemo(() => buildFocusLayout(children), [children]);
  const activeNode = activeId ? findMindmapNode(root, activeId) : null;

  /** ينقل التركيز ويسجّل الخطوة السابقة ومصدرها */
  const moveFocus = useCallback(
    (id: string, fromIndex: boolean) => {
      if (id === focusId) return;
      setHistory((prev) => [...prev, { focusId, fromIndex }]);
      setFocusId(id);
    },
    [focusId]
  );

  /**
   * الرجوع خطوة واحدة. يعيد `true` إن كان قد رجع فعلًا.
   * إن كانت الخطوة السابقة قادمة من الفهرس ⇒ تُفتح القائمة مرة أخرى،
   * لأن الأصل هو القائمة لا الخريطة.
   */
  const stepBack = useCallback(() => {
    const last = history[history.length - 1];
    if (!last) return false;
    setHistory((prev) => prev.slice(0, -1));
    setFocusId(last.focusId);
    if (last.fromIndex) setIndexOpen(true);
    return true;
  }, [history]);

  /**
   * فتح عنصر: يصبح هو مركز الخريطة ويظهر شرحه في البطاقة.
   * أي عنصر — حتى الورقة الأخيرة — ينتقل إليه التركيز.
   */
  const activate = useCallback(
    (node: MindmapNode) => {
      setActiveId(node.id);
      cardMovedFocus.current = node.id !== focusId;
      moveFocus(node.id, false);
    },
    [focusId, moveFocus]
  );

  /** إغلاق البطاقة: يعود التركيز إلى ما كان عليه قبل فتحها */
  const closeSheet = useCallback(() => {
    setActiveId(null);
    if (!cardMovedFocus.current) return;
    cardMovedFocus.current = false;
    stepBack();
  }, [stepBack]);

  /** التنقّل من داخل البطاقة إلى عنصر فرعي */
  const navigateTo = useCallback(
    (id: string) => {
      if (!findMindmapNode(root, id)) return;
      setActiveId(id);
      cardMovedFocus.current = true;
      moveFocus(id, false);
    },
    [root, moveFocus]
  );

  const parentNode = trail.length > 1 ? trail[trail.length - 2] : null;

  /** زر «رجوع»: الخطوة السابقة، وإلا المحور الأعلى */
  const goUp = useCallback(() => {
    if (stepBack()) return;
    if (parentNode) setFocusId(parentNode.id);
  }, [stepBack, parentNode]);

  /** الانتقال من الفهرس: يغلق القائمة وينقل التركيز (ويحفظ أنه جاء منها) */
  const focusFromIndex = useCallback(
    (id: string) => {
      setIndexOpen(false);
      moveFocus(id, true);
    },
    [moveFocus]
  );

  const connector = (x: number, y: number) => {
    const midX = (50 + x * 100) / 2;
    return `M 50 50 C ${midX} 50, ${midX} ${y * 100}, ${x * 100} ${y * 100}`;
  };

  return (
    <div className="space-y-3">
      {/* مسار التتبّع + الفهرس: أين أنا الآن، وكيف أصل إلى أي محور */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav
          aria-label="مسار المحاور"
          className="flex min-w-0 flex-wrap items-center gap-1.5 text-label font-bold"
        >
          {trail.map((node, index) => {
            const isCurrent = index === trail.length - 1;
            return (
              <span key={node.id} className="flex items-center gap-1.5">
                {index > 0 && <ChevronLeft className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                <button
                  type="button"
                  onClick={() => moveFocus(node.id, false)}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`max-w-40 truncate rounded-lg px-1.5 py-1 transition-colors ${
                    isCurrent
                      ? "bg-teal-700 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {node.label}
                </button>
              </span>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          {(parentNode || history.length > 0) && (
            <button
              type="button"
              onClick={goUp}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-label font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span>رجوع</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIndexOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-label font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ListTree className="h-4 w-4" aria-hidden="true" />
            <span>الفهرس</span>
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_50%_42%,#ecfdf5,#ffffff_74%)] p-4 dark:bg-[radial-gradient(circle_at_50%_42%,#093330,#020617_74%)] sm:p-6 lg:h-[600px] lg:p-0">
        {/* وصلات خفيفة: خط شعرة واحد لكل ابن، بلا إطارات حول العناصر */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {ring.map((item) => (
            <path
              key={item.id}
              d={connector(item.x, item.y)}
              fill="none"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              className="stroke-teal-700/25 dark:stroke-teal-300/25"
            />
          ))}
        </svg>

        {/* المركز */}
        <button
          type="button"
          onClick={() => activate(focused)}
          className="relative z-10 w-full rounded-[1.75rem] bg-teal-700 p-4 text-right text-white shadow-lg shadow-teal-900/20 transition-colors hover:bg-teal-800 sm:p-5 lg:absolute lg:top-1/2 lg:left-1/2 lg:w-60 lg:-translate-x-1/2 lg:-translate-y-1/2"
        >
          <span className="text-meta font-bold text-teal-100">
            {trail.length > 1 ? "المحور الحالي" : "موضوع الوحدة"}
          </span>
          <span className="mt-1 block text-title leading-snug font-bold">{focused.label}</span>
          <span className="mt-2 inline-flex items-center gap-1.5 text-meta font-bold text-teal-100">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            اضغط لقراءة الشرح
          </span>
        </button>

        {/* أبناء المحور الحالي */}
        {children.length > 0 ? (
          <div className="relative z-10 mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:contents">
            {children.map((child, index) => {
              const position = ring[index];
              if (!position) return null;
              const isActive = activeId === child.id;
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => activate(child)}
                  style={
                    {
                      "--x": position.x,
                      "--y": position.y,
                    } as CSSProperties
                  }
                  className={`group min-w-0 rounded-2xl bg-white/90 px-3 py-2.5 text-right text-slate-900 shadow-sm shadow-slate-900/10 backdrop-blur transition-all hover:bg-teal-700 hover:text-white focus-visible:outline-2 focus-visible:outline-teal-600 dark:bg-slate-700/95 dark:text-slate-50 dark:shadow-black/40 dark:hover:bg-teal-700 lg:absolute lg:top-[calc(var(--y)*100%)] lg:left-[calc(var(--x)*100%)] lg:w-44 lg:-translate-x-1/2 lg:-translate-y-1/2 ${
                    isActive ? "bg-teal-700 text-white" : "text-slate-800 dark:text-slate-100"
                  }`}
                >
                  <span className="line-clamp-3 block text-body-sm leading-snug font-bold">
                    {child.label}
                  </span>
                  {position.childCount > 0 && (
                    <span className="mt-1 flex items-center gap-1 text-meta font-bold text-slate-500 group-hover:text-white">
                      <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
                      {position.childCount} عناصر
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="relative z-10 mt-3 rounded-2xl bg-white/80 px-4 py-3 text-body-sm font-medium text-slate-600 dark:bg-slate-700/70 dark:text-slate-300 lg:absolute lg:bottom-8 lg:left-1/2 lg:mt-0 lg:-translate-x-1/2">
            هذا العنصر ورقة أخيرة: لا فروع تحته. شرحه في البطاقة، وزر «رجوع» يعيدك خطوة.
          </p>
        )}

        <p className="mt-3 text-center text-meta font-medium text-slate-500 dark:text-slate-400 lg:absolute lg:bottom-4 lg:left-1/2 lg:mt-0 lg:w-full lg:-translate-x-1/2">
          اضغط عنصرًا ليصبح هو المركز ويظهر شرحه
        </p>
      </div>

      <MindmapIndexSheet
        root={root}
        open={indexOpen}
        currentId={focused.id}
        onClose={() => setIndexOpen(false)}
        onSelect={focusFromIndex}
      />

      <MindmapInfoSheet node={activeNode} onClose={closeSheet} onNavigate={navigateTo} />
    </div>
  );
}
