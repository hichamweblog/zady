"use client";

import { useSyncExternalStore } from "react";

/**
 * حالة الثيم (فاتح/داكن) من كلاس `<html>`.
 *
 * الكلاس يُهيّأ في `<head>` قبل الرسم (انظر `layout.tsx`) لمنع وميض الشاشة،
 * فهو المصدر الوحيد للحقيقة؛ أي مكوّن يحتاج الثيم يشترك فيه عبر
 * `useSyncExternalStore` بدل قراءة `localStorage` بنفسه.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => false;

export function useIsDark(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function toggleTheme(): void {
  const nextIsDark = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", nextIsDark);
  try {
    localStorage.setItem("zady_theme", nextIsDark ? "dark" : "light");
  } catch {
    /* التخزين المحلي محجوب: الثيم يبقى لهذه الجلسة فقط */
  }
}
