/**
 * حواجز انحدار على الطباعة والتصميم الموبايل-أولًا.
 *
 * ما تمنعه هذه الاختبارات (كلها أخطاء وقعت فعلًا):
 *  - مقاسات نص متفرقة (10px · 11px · 12px · 13px · 14px · 16px…) بلا نظام،
 *    فكان النص العربي يتفاوت بين بطاقة وأخرى ويصغر عن حدّ القراءة.
 *  - أوزان 800/900 مع عائلة لا تحملها (Noto Naskh حتى 700) ⇒ سمك مصنَّع مشوّه.
 *  - صفوف تبويبات بـ`overflow-x-auto` بلا دليل تمرير ⇒ أقسام تختفي على الهاتف.
 *  - غياب تنقّل سفلي على الهاتف.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..", "..");
const SRC = path.join(ROOT, "src");

const walk = (dir, ext, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, ext, out);
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out;
};

const tsxFiles = walk(SRC, ".tsx");
const readAll = (files) => files.map((f) => ({ file: f, text: fs.readFileSync(f, "utf8") }));

/* ------------------------------------------------------------------ */
/* 1) مقياس طباعة واحد                                                 */
/* ------------------------------------------------------------------ */

test("لا توجد مقاسات نص عشوائية (px أو مقاسات Tailwind القديمة)", () => {
  const offenders = [];
  for (const { file, text } of readAll(tsxFiles)) {
    for (const match of text.matchAll(
      /(?<![\w:-])text-(\[[0-9]+px\]|xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)(?![\w-])/g
    )) {
      const line = text.slice(0, match.index).split("\n").length;
      offenders.push(`${path.relative(ROOT, file)}:${line} → ${match[1]}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    "استخدم مقياس text-meta/label/body-sm/body/title/heading/display فقط"
  );
});

test("لا نص أصغر من 13px في أي مكوّن", () => {
  const meta = fs.readFileSync(path.join(SRC, "app", "globals.css"), "utf8");
  const value = meta.match(/--text-meta:\s*([\d.]+)rem/);
  assert.ok(value, "--text-meta معرّف في globals.css");
  const px = Number.parseFloat(value[1]) * 16;
  assert.ok(px >= 13, `أصغر مقاس يجب أن يكون ≥ 13px (الحالي ${px}px)`);
});

test("المتن الافتراضي 18px على الأقل (قراءة من الهاتف)", () => {
  const css = fs.readFileSync(path.join(SRC, "app", "globals.css"), "utf8");
  const body = css.match(/--text-body:\s*([\d.]+)rem/);
  assert.ok(body, "--text-body معرّف");
  const px = Number.parseFloat(body[1]) * 16;
  assert.ok(px >= 18, `متن التطبيق يجب أن يكون ≥ 18px (الحالي ${px}px)`);
  assert.match(
    css,
    /body\s*\{[^}]*font-size:\s*var\(--text-body\)/,
    "body يستخدم المقياس الموحّد لا قيمة منفصلة"
  );
});

test("ستة مقاسات لا أكثر (مقياس مغلق)", () => {
  const css = fs.readFileSync(path.join(SRC, "app", "globals.css"), "utf8");
  const theme = css.slice(css.indexOf("@theme"), css.indexOf("@layer base"));
  const sizes = [...theme.matchAll(/--text-([a-z-]+):\s*[\d.]+rem/g)].map((m) => m[1]);
  assert.deepEqual(
    [...new Set(sizes)].sort(),
    ["body", "body-sm", "display", "heading", "label", "meta", "title"],
    "المقياس يجب أن يبقى مغلقًا؛ أي حجم جديد يحتاج قرارًا واعيًا"
  );
});

test("لا أوزان 800/900 مع عائلة لا تحملها", () => {
  const offenders = [];
  for (const { file, text } of readAll(tsxFiles)) {
    for (const match of text.matchAll(/(?<![\w:-])font-(black|extrabold)(?![\w-])/g)) {
      const line = text.slice(0, match.index).split("\n").length;
      offenders.push(`${path.relative(ROOT, file)}:${line}`);
    }
  }
  assert.deepEqual(offenders, [], "Noto Naskh يحمل 400–700؛ استخدم font-bold");
});

/* ------------------------------------------------------------------ */
/* 2) الخط                                                             */
/* ------------------------------------------------------------------ */

test("خط المتن نَسخي محلي (Noto Naskh Arabic) لا خط ويب خارجي", () => {
  // نستثني التعليقات: ذكر `next/font/google` في شرح ليس استيرادًا
  const layout = fs
    .readFileSync(path.join(SRC, "app", "layout.tsx"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  assert.match(layout, /next\/font\/local/, "الخطوط محلية لتعمل دون إنترنت");
  assert.doesNotMatch(layout, /next\/font\/google/, "لا اعتماد على Google Fonts وقت البناء");
  assert.match(layout, /variable:\s*"--font-body"/, "متغيّر خط المتن");

  for (const file of ["noto-naskh-400.woff2", "noto-naskh-700.woff2"]) {
    const full = path.join(SRC, "app", "fonts", file);
    assert.ok(fs.existsSync(full), `${file} موجود`);
    assert.ok(fs.statSync(full).size < 80_000, `${file} خفيف (< 80KB)`);
  }

  const css = fs.readFileSync(path.join(SRC, "app", "globals.css"), "utf8");
  assert.match(css, /font-family:\s*var\(--font-body\)/, "المتن يستخدم --font-body");
});

/* ------------------------------------------------------------------ */
/* 3) الهاتف أولًا                                                     */
/* ------------------------------------------------------------------ */

test("شريط خطوات الوحدة لا يعتمد على تمرير أفقي (كل الخطوات ظاهرة)", () => {
  const view = fs.readFileSync(
    path.join(SRC, "app", "units", "[unitId]", "UnitClientView.tsx"),
    "utf8"
  );
  const tablist = view.slice(
    view.indexOf('role="tablist"'),
    view.indexOf("</div>", view.indexOf('role="tablist"'))
  );
  assert.doesNotMatch(
    tablist,
    /overflow-x-auto/,
    "التبويبات كانت تُقطع على الهاتف: استخدم شبكة بدل التمرير"
  );
  assert.match(tablist, /flex-wrap/, "التبويبات تلتف على الهاتف بدل أن تُقطع");
  assert.doesNotMatch(
    tablist,
    /whitespace-nowrap[^"]*hidden|hidden[^"]*whitespace-nowrap/,
    "أسماء الخطوات تظهر على الهاتف كاملة، لا أيقونات فقط"
  );
  assert.match(tablist, /text-label/, "اسم الخطوة يظهر بنص مقروء على الهاتف");
});

test("يوجد شريط تنقّل سفلي للهاتف ومركّب في التخطيط", () => {
  const bar = path.join(SRC, "components", "layout", "MobileTabBar.tsx");
  assert.ok(fs.existsSync(bar), "MobileTabBar.tsx موجود");
  const text = fs.readFileSync(bar, "utf8");
  assert.match(text, /fixed inset-x-0 bottom-0/, "ملتصق بأسفل الشاشة (منطقة الإبهام)");
  assert.match(text, /md:hidden/, "يظهر على الهاتف فقط");

  // نستثني التعليقات: ذكر `next/font/google` في شرح ليس استيرادًا
  const layout = fs
    .readFileSync(path.join(SRC, "app", "layout.tsx"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  assert.match(layout, /<MobileTabBar \/>/, "مركّب في التخطيط العام");

  const css = fs.readFileSync(path.join(SRC, "app", "globals.css"), "utf8");
  assert.match(
    css,
    /@media \(max-width: 767px\)[\s\S]{0,200}padding-bottom/,
    "مساحة سفلية حتى لا يغطّي الشريط آخر عنصر في الصفحة"
  );
});

test("لا شريط تنقّل أفقي مقطوع داخل رأس الصفحة على الهاتف", () => {
  const navbar = fs.readFileSync(path.join(SRC, "components", "layout", "Navbar.tsx"), "utf8");
  assert.doesNotMatch(
    navbar,
    /md:hidden[^"]*overflow-x-auto/,
    "كان شريط الوحدات على الهاتف يُقطع؛ نُقل إلى الشريط السفلي"
  );
});

test("الحافة الأفقية محتواة عالميًا (لا تمرير أفقي غير مقصود)", () => {
  const css = fs.readFileSync(path.join(SRC, "app", "globals.css"), "utf8");
  assert.match(css, /html\s*\{[^}]*overflow-x:\s*hidden/, "html يمنع الفائض الأفقي");
  assert.match(css, /body\s*\{[^}]*overflow-x:\s*hidden/, "body يمنع الفائض الأفقي");
});

test("أهداف اللمس ≥ 44px على الأجهزة اللمسية", () => {
  const css = fs.readFileSync(path.join(SRC, "app", "globals.css"), "utf8");
  assert.match(css, /@media \(pointer: coarse\)/, "قاعدة أهداف اللمس موجودة");
  assert.match(css, /min-height:\s*44px/, "الحد الأدنى 44px");
});

test("لا تعارض في @font-face بين ملفات بنفس العائلة والوزن", () => {
  /*
   * الخطأ الذي وقع فعلًا: وضع ملف لاتيني (بلا حروف عربية) في نفس عائلة
   * الملف العربي وبالوزن نفسه، فولّد Next قاعدتين متطابقتين في (العائلة،
   * الوزن) — والمتأخرة تُلغي الأولى، فتختفي العربية ويظهر tofu.
   */
  const layout = fs.readFileSync(path.join(SRC, "app", "layout.tsx"), "utf8");
  const calls = [...layout.matchAll(/localFont\(\{([\s\S]*?)\n\}\);/g)].map((m) => m[1]);
  assert.ok(calls.length >= 2, "هناك أكثر من عائلة خطوط");

  const faces = [];
  for (const body of calls) {
    const family = body.match(/variable:\s*"([^"]+)"/)?.[1];
    const weights = [...body.matchAll(/weight:\s*"(\d+)"/g)].map((m) => m[1]);
    for (const w of weights) faces.push(`${family}|${w}`);
  }

  const duplicates = faces.filter((f, i) => faces.indexOf(f) !== i);
  assert.deepEqual(duplicates, [], "كل (عائلة + وزن) يجب أن يظهر مرة واحدة، وإلا فملف يُلغي آخر");
});

/* ------------------------------------------------------------------ */
/* 4) لا اختصارات «اكشف كل شيء» ولا تصنيفات داخلية للطالب              */
/* ------------------------------------------------------------------ */

const readSrc = (...parts) => fs.readFileSync(path.join(SRC, ...parts), "utf8");

test("لا زر «إظهار جميع الفراغات» أو «إخفاء الكل» في تحدي الفراغات", () => {
  const text = readSrc("components", "flashcards", "FlashcardSection.tsx");
  for (const phrase of ["إظهار جميع الفراغات", "إخفاء الكل"]) {
    assert.ok(!text.includes(phrase), `حُذف «${phrase}»: الطالب يكتب الإجابة بنفسه`);
  }
  assert.match(text, /onChange=/, "الفراغات حقول كتابة لا أزرار كشف");
  assert.match(text, /إظهار الإجابة الصحيحة/, "بعد الخطأ يمكنه رؤية الإجابة الصحيحة");
});

test("لا تنبيه منهجي متكرر داخل كل بطاقة فراغ", () => {
  const text = readSrc("components", "flashcards", "FlashcardSection.tsx");
  assert.ok(!text.includes("تنبيه منهجي"), "التنبيه المتكرر أُزيل");
  assert.ok(!text.includes("تجنب استخدام المترادفات"), "نص التنبيه أُزيل");
});

test("بنك الأسئلة: لا تصنيفات ولا عدّاد لكل نوع ولا «استعراض جميع الأسئلة»", () => {
  const bank = readSrc("components", "quiz", "BacQuizSection.tsx");
  const mcq = readSrc("components", "quiz", "McqQuizViewer.tsx");
  assert.ok(!bank.includes("selectedCategory"), "لا شرائح تصنيف ظاهرة للطالب");
  assert.ok(!bank.includes("question.category"), "لا شارة تصنيف على السؤال نفسه");
  assert.ok(!bank.includes("بنك أسئلة البكالوريا"), "الاسم صار «بنك الأسئلة»");
  assert.match(bank, /بنك الأسئلة/, "العنوان الجديد موجود");
  assert.ok(!mcq.includes("استعراض جميع الأسئلة"), "حُذف وضع القائمة من اختبار QCM");
  assert.ok(!mcq.includes('"list"'), "لا حالة عرض قائمة متبقية");
});

test("الخريطة البصرية معطَّلة مؤقتًا", () => {
  const text = readSrc("components", "mindmap", "MindmapViewer.tsx");
  assert.match(text, /VISUAL_MAP_ENABLED = false/, "التبويب معطَّل حتى تُعاد الصور");
  assert.ok(
    !/onClick=\{\(\) => setViewMode\("image"\)\}/.test(text),
    "لا طريق للوصول إلى صور غير جاهزة"
  );
});
