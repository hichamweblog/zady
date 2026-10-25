import type { UnitMeta } from "./types";

/**
 * البيانات الخفيفة للوحدات — الوحيدة المسموح استيرادها في مكوّنات العميل.
 * لا تحتوي أي محتوى تعليمي، وبذلك لا تُشحن ملفات الدروس إلى المتصفح.
 */
export const UNITS_META: UnitMeta[] = [
  {
    id: 1,
    slug: "aqidah",
    title: "الوحدة 01: العقيدة الإسلامية وأثرها على الفرد والمجتمع",
    shortTitle: "العقيدة الإسلامية وأثرها",
    badge: "الوحدة 01",
  },
  {
    id: 2,
    slug: "quran-means",
    title: "الوحدة 02: وسائل القرآن الكريم في تثبيت العقيدة الإسلامية",
    shortTitle: "وسائل القرآن في تثبيت العقيدة",
    badge: "الوحدة 02",
  },
  {
    id: 3,
    slug: "islam-messages",
    title: "الوحدة 03: الإسلام والرسالات السماوية",
    shortTitle: "الإسلام والرسالات السماوية",
    badge: "الوحدة 03",
  },
  {
    id: 4,
    slug: "intellect",
    title: "الوحدة 04: العقل في القرآن الكريم",
    shortTitle: "العقل في القرآن الكريم",
    badge: "الوحدة 04",
  },
];

export function getUnitMeta(id: number): UnitMeta | undefined {
  return UNITS_META.find((u) => u.id === id);
}

export function getAdjacentUnits(id: number): { prev?: UnitMeta; next?: UnitMeta } {
  return {
    prev: UNITS_META.find((u) => u.id === id - 1),
    next: UNITS_META.find((u) => u.id === id + 1),
  };
}
