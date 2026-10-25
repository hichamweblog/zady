"use client";

import { useEffect, useState } from "react";

/**
 * مسطرة القراءة — خطّ شعري أعلى صفحة الدرس يمتلئ كلّما تقدّم الطالب.
 *
 * لماذا؟
 *   - نصّ الدرس أطول شاشة في التطبيق، وكان الطالب لا يعرف كم بقي عليه.
 *   - في منطق الكتاب المطبوع، الأداة ليست شريطًا ملوّنًا سميكًا بل خطّ رفيع
 *     يطول؛ فيبقى الحبر هو الوحيد الملوّن في الصفحة.
 *
 * تُحسب النسبة من موضع التمرير داخل نافذة العرض، وتُحدَّث مرة واحدة في كل إطار
 * رسم (requestAnimationFrame) حتى لا تكلّف شيئًا على الهاتف.
 */
export default function ReadingRule() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 80 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none sticky top-[6.75rem] z-20 -mx-5 h-[3px] rounded-full bg-[var(--surface-3)] sm:-mx-0"
    >
      <div
        className="h-full rounded-full bg-[var(--brand)] transition-[width] duration-150 ease-out"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </div>
  );
}
