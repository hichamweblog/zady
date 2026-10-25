"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * سلوك موحّد لكل نافذة منبثقة في قسم الخريطة
 * (بطاقة الشرح · فهرس المحاور · عارض الصورة):
 *
 *   - Esc يغلق.
 *   - الضغط خارج البطاقة يغلق (المستدعي يضعه على الخلفية).
 *   - تمرير الصفحة خلف النافذة يُقفل.
 *   - عند الإغلاق يعود التركيز إلى العنصر الذي فُتحت منه.
 */
export function useSheetA11y(
  open: boolean,
  onClose: () => void,
  focusRef?: RefObject<HTMLElement | null>
) {
  const latestClose = useRef(onClose);

  useEffect(() => {
    latestClose.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    focusRef?.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") latestClose.current();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, focusRef]);
}
