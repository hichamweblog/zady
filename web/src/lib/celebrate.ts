/**
 * تأثير الاحتفال (confetti) — تحميل كسول.
 *
 * كان `canvas-confetti` يُستورد استيرادًا ثابتًا في ثلاثة مكوّنات، فيدخل حزمة
 * JavaScript الأولية لصفحة الوحدة رغم أنه لا يُستدعى إلا عند إجابة صحيحة أو
 * تقييم بطاقة بـ«سهل». هنا يُحمَّل عند أول استخدام فقط، ويُتجاهل الفشل بهدوء
 * (زائر يفضّل تقليل الحركة أو شبكة بطيئة لا يجب أن يتعطّل عنده التطبيق).
 *
 * كذلك يحترم `prefers-reduced-motion`: لا حركة احتفالية لمن طلب تقليلها.
 */
type ConfettiOptions = {
  particleCount?: number;
  spread?: number;
  origin?: { y?: number; x?: number };
  colors?: string[];
};

type ConfettiFn = (options?: ConfettiOptions) => void;

let loader: Promise<ConfettiFn | null> | null = null;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function loadConfetti(): Promise<ConfettiFn | null> {
  if (!loader) {
    loader = import("canvas-confetti")
      .then((mod) => {
        const fn = (mod.default ?? mod) as unknown as ConfettiFn;
        return typeof fn === "function" ? fn : null;
      })
      .catch(() => null);
  }
  return loader;
}

export function celebrate(options: ConfettiOptions = {}): void {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  void loadConfetti().then((fire) => {
    if (!fire) return;
    try {
      fire(options);
    } catch {
      /* لا شيء — التأثير تزييني فقط */
    }
  });
}
