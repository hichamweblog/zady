/**
 * قراءة فهرس الوحدات (`src/lib/units-meta.ts`) من سكربتات Node بلا تشغيل TypeScript.
 *
 * الفهرس يُستعمل في الواجهة (الشريط العلوي، الشريط السفلي، الفوتر) بلا تحميل
 * بيانات الوحدات كاملة، ولذلك يتكرّر فيه id/slug/title/shortTitle/badge.
 * القراءة هنا تسمح للاختبارات بالتأكّد أن ملفات الوحدات تطابقه، فلا ينفصل
 * العنوان المعروض في القائمة عن العنوان داخل الوحدة.
 */
import fs from "node:fs";
import path from "node:path";

export function readUnitsMeta(rootDir = path.join(import.meta.dirname, "..", "..")) {
  const file = path.join(rootDir, "src", "lib", "units-meta.ts");
  const source = fs.readFileSync(file, "utf8");

  return [...source.matchAll(/\{([^{}]*)\}/g)]
    .map((match) => {
      const body = match[1];
      const get = (key) => body.match(new RegExp(`${key}:\\s*"([^"]*)"`))?.[1];
      const id = Number(body.match(/id:\s*(\d+)/)?.[1]);
      if (!id) return null;
      return {
        id,
        slug: get("slug"),
        title: get("title"),
        shortTitle: get("shortTitle"),
        badge: get("badge"),
      };
    })
    .filter(Boolean);
}
