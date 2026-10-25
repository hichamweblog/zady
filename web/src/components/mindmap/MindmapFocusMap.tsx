"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, CornerDownLeft, ListTree } from "lucide-react";
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
                {index > 0 && (
                  <ChevronLeft
                    className="h-3.5 w-3.5 text-[var(--rule-strong)]"
                    aria-hidden="true"
                  />
                )}
                <button
                  type="button"
                  onClick={() => moveFocus(node.id, false)}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`max-w-40 truncate px-1 py-1 transition-colors ${
                    isCurrent
                      ? "font-bold text-[var(--ink)] underline decoration-[var(--pine)] decoration-2 underline-offset-4"
                      : "text-[var(--ink-faint)] hover:text-[var(--ink)]"
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
              className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[var(--rule)] bg-[var(--sheet)] px-3.5 text-label font-bold text-[var(--ink-soft)] shadow-[var(--shadow-xs)] transition-colors hover:border-[var(--pine)] hover:text-[var(--ink)]"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span>رجوع</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIndexOpen(true)}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-[var(--pine)] px-3.5 text-label font-bold text-white shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--pine-deep)] dark:text-[#06201a]"
          >
            <ListTree className="h-4 w-4" aria-hidden="true" />
            <span>الفهرس</span>
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--rule)] bg-[var(--band)] p-4 shadow-[var(--shadow-card)] sm:p-6 lg:h-[560px] lg:p-0">
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
              className="stroke-[var(--rule-strong)]"
            />
          ))}
        </svg>

        {/* المركز: كتلة حبر واحدة في الصفحة */}
        <button
          type="button"
          onClick={() => activate(focused)}
          className="relative z-10 w-full rounded-2xl bg-[var(--pine)] p-5 text-right text-white shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5 dark:text-[#06201a] sm:p-6 lg:absolute lg:top-1/2 lg:left-1/2 lg:w-64 lg:-translate-x-1/2 lg:-translate-y-1/2"
        >
          <span className="block text-meta font-bold opacity-70">
            {trail.length > 1 ? "المحور الحالي" : "موضوع الوحدة"}
          </span>
          <span className="mt-1.5 block text-title leading-snug font-bold">{focused.label}</span>
          <span className="mt-2.5 block text-meta font-medium opacity-70">اقرأ الشرح</span>
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
                  className={`group min-w-0 rounded-2xl border px-3 py-2.5 text-right shadow-[var(--shadow-xs)] transition-all ${
                    isActive
                      ? "border-transparent bg-[var(--pine)] text-white shadow-[var(--shadow-lift)] dark:text-[#06201a]"
                      : "border-[var(--rule)] bg-[var(--sheet)] text-[var(--ink)] hover:-translate-y-0.5 hover:border-[var(--pine)] hover:shadow-[var(--shadow-card)]"
                  } lg:absolute lg:top-[calc(var(--y)*100%)] lg:left-[calc(var(--x)*100%)] lg:w-44 lg:-translate-x-1/2 lg:-translate-y-1/2`}
                >
                  <span className="line-clamp-3 block text-label leading-snug font-bold">
                    {child.label}
                  </span>
                  {position.childCount > 0 && (
                    <span className="mt-1.5 flex items-center gap-1 text-meta font-medium text-[var(--ink-faint)] group-hover:text-inherit">
                      <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
                      {position.childCount} فروع
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="relative z-10 mt-3 rounded-2xl border border-[var(--rule)] bg-[var(--sheet)] px-4 py-3 text-body font-medium text-[var(--ink-soft)] shadow-[var(--shadow-xs)] lg:absolute lg:bottom-10 lg:left-1/2 lg:mt-0 lg:max-w-md lg:-translate-x-1/2">
            عنصر نهائي — لا فروع تحته.
          </p>
        )}

        <p className="mt-3 text-center text-meta font-medium text-[var(--ink-faint)] lg:absolute lg:bottom-4 lg:left-1/2 lg:mt-0 lg:w-full lg:-translate-x-1/2">
          اضغط عنصرًا ليصبح المركز
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
