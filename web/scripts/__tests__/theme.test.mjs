/**
 * حواجز انحدار على الثيم (فاتح/داكن).
 *
 * الخطأ الذي وقع فعلًا: Tailwind v4 يجعل `dark:` تتبع
 * `@media (prefers-color-scheme: dark)` افتراضيًا. التطبيق يملك مفتاح تبديل
 * صريحًا (كلاس `.dark`)، فكان من نظامه داكن يرى واجهة داكنة دائمًا ولا يستجيب
 * المفتاح — بينما خلفية الصفحة (متغيّرات CSS) تتبع الكلاس ⇒ خليط فاتح/داكن.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..", "..");
const read = (...parts) => fs.readFileSync(path.join(ROOT, ...parts), "utf8");

test("الوضع الداكن مبني على الكلاس لا على تفضيل النظام", () => {
  // نُزيل التعليقات أولًا: ذكر `prefers-color-scheme` في شرح ليس مخالفة
  const css = read("src", "app", "globals.css").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.match(
    css,
    /@custom-variant\s+dark\s*\(\s*&:where\(\.dark,\s*\.dark\s+\*\)\s*\)/,
    "globals.css يجب أن يربط dark: بالكلاس .dark"
  );
  assert.doesNotMatch(
    css,
    /@media[^{]*prefers-color-scheme[^{]*\{/,
    "لا يجوز ضبط ألوان الثيم عبر تفضيل النظام"
  );
});

test("سكربت تهيئة الثيم يقرأ الاختيار المحفوظ فقط", () => {
  const layout = read("src", "app", "layout.tsx");
  const script = layout.match(/const THEME_SCRIPT = `([\s\S]*?)`;/);
  assert.ok(script, "THEME_SCRIPT موجود");
  assert.match(script[1], /zady_theme/, "يقرأ الاختيار من localStorage");
  assert.doesNotMatch(
    script[1],
    /prefers-color-scheme/,
    "لا يفرض الوضع الداكن بحسب نظام التشغيل"
  );
});

test("كل +لا يوجد+ مكوّن يضبط الثيم مباشرة بدل useTheme", () => {
  const dir = path.join(ROOT, "src", "components");
  const offenders = [];
  const walk = (folder) => {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".tsx")) {
        const text = fs.readFileSync(full, "utf8");
        if (/classList\.(add|remove|toggle)\(\s*["']dark["']/.test(text)) {
          offenders.push(path.relative(ROOT, full));
        }
      }
    }
  };
  walk(dir);
  assert.deepEqual(
    offenders,
    [],
    "تبديل الثيم يجب أن يمرّ عبر toggleTheme في src/lib/useTheme.ts"
  );
});

test("color-scheme مضبوط حتى تتبع عناصر النظام (الحقول، أشرطة التمرير)", () => {
  const css = read("src", "app", "globals.css");
  assert.match(css, /:root\s*\{[^}]*color-scheme:\s*light/, "color-scheme: light في :root");
  assert.match(css, /\.dark\s*\{[^}]*color-scheme:\s*dark/, "color-scheme: dark في .dark");
});
