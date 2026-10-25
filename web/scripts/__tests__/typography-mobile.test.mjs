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

test("الخطوط محليّة: IBM Plex Sans Arabic للواجهة وAmiri للشاهد — بلا خط ويب خارجي", () => {
  // نستثني التعليقات: ذكر `next/font/google` في شرح ليس استيرادًا
  const layout = fs
    .readFileSync(path.join(SRC, "app", "layout.tsx"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  assert.match(layout, /next\/font\/local/, "الخطوط محلية لتعمل دون إنترنت");
  assert.doesNotMatch(layout, /from\s+["']next\/font\/google["']/, "لا خطوط من شبكة Google");

  // أربعة أوزان هندسية عربية، كلٌّ منها خفيف بما يكفي للجوال
  for (const weight of ["Regular", "Medium", "SemiBold", "Bold"]) {
    const file = `plex-arabic-${weight}.woff2`;
    const full = path.join(SRC, "app", "fonts", file);
    assert.ok(fs.existsSync(full), `${file} موجود`);
    assert.ok(fs.statSync(full).size < 90_000, `${file} خفيف (< 90KB)`);
  }

  // الواجهة تستعمل خطّ الواجهة، والآية تستعمل خطّ الشاهد
  const css = fs.readFileSync(path.join(SRC, "app", "globals.css"), "utf8");
  assert.match(css, /font-family: var\(--font-ui\)/, "المتن يستخدم --font-ui");
  assert.match(css, /--font-amiri/, "الشاهد له عائلته");
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
  assert.match(tablist, /u-tabs/, "شريط الخطوات يستخدم فئة الفهرس المقسّم");
  const cssTabs = fs.readFileSync(path.join(SRC, "app", "globals.css"), "utf8");
  const uTabsRule = cssTabs.slice(cssTabs.indexOf(".u-tabs {"));
  assert.match(uTabsRule.slice(0, 220), /flex-wrap:\s*wrap/, "الفهرس يلتف على الهاتف بدل أن يُقطع");
  assert.doesNotMatch(
    tablist,
    /whitespace-nowrap[^"]*hidden|hidden[^"]*whitespace-nowrap/,
    "أسماء الخطوات تظهر على الهاتف كاملة، لا أيقونات فقط"
  );
  assert.match(
    tablist + view + cssTabs,
    /text-label|u-tab/,
    "اسم الخطوة يظهر بنص مقروء على الهاتف"
  );
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

test("«المصورة» مفعَّلة باسمها الجديد", () => {
  const text = readSrc("components", "mindmap", "MindmapViewer.tsx");
  assert.match(text, /label: "المصورة"/, "اسم التبويب «المصورة»");
  assert.ok(!text.includes("قريبًا"), "لم تبقَ شارة «قريبًا»");
  assert.ok(!text.includes("VISUAL_MAP_ENABLED"), "لم يبقَ مفتاح تعطيل");
  assert.match(text, /MindmapImageView/, "عارض الصورة مركّب");
});

test("الخريطة صارت بلا React Flow ولا لوحة تفاصيل جانبية", () => {
  const dir = path.join(SRC, "components", "mindmap");
  const files = fs.readdirSync(dir);
  assert.ok(!files.includes("MindmapGraph.tsx"), "حُذف رسم React Flow القديم");
  assert.ok(!files.includes("MindmapDetailsPanel.tsx"), "حُذفت اللوحة الجانبية");
  for (const name of [
    "MindmapFocusMap.tsx",
    "MindmapInfoSheet.tsx",
    "MindmapIndexSheet.tsx",
    "MindmapImageView.tsx",
  ]) {
    assert.ok(files.includes(name), `${name} موجود`);
  }
  const pkg = fs.readFileSync(path.join(ROOT, "package.json"), "utf8");
  assert.ok(!pkg.includes("@xyflow/react"), "حزمة الرسم الثقيلة أُزيلت من التبعيات");
});

test("لا تكرار: وضعان فقط، والفهرس أداة تنقّل لا وضع عرض ثانٍ", () => {
  const viewer = readSrc("components", "mindmap", "MindmapViewer.tsx");
  const modes = [...viewer.matchAll(/id: "(map|image|outline)"/g)].map((m) => m[1]);
  assert.deepEqual(modes, ["map", "image"], "وضعان: الخريطة والمصورة");
  assert.ok(
    !fs.existsSync(path.join(SRC, "components", "mindmap", "MindmapOutline.tsx")),
    "حُذف وضع «المحاور» المكرّر"
  );
  const map = readSrc("components", "mindmap", "MindmapFocusMap.tsx");
  assert.match(map, /MindmapIndexSheet/, "الفهرس متاح من داخل الخريطة");
});

test("كل نوافذ الخريطة تُغلق بالضغط خارجها وبمفتاح Esc", () => {
  const hook = readSrc("components", "mindmap", "useSheetA11y.ts");
  assert.match(hook, /Escape/, "مفتاح Esc موحّد في خطّاف واحد");
  assert.match(hook, /overflow = "hidden"/, "تمرير الصفحة يُقفل خلف النافذة");
  assert.match(hook, /focus\(\)/, "التركيز يعود إلى مكانه بعد الإغلاق");

  for (const [file, modal] of [
    ["MindmapInfoSheet.tsx", 'aria-modal="true"'],
    ["MindmapIndexSheet.tsx", 'aria-modal="true"'],
  ]) {
    const text = readSrc("components", "mindmap", file);
    assert.match(text, /useSheetA11y/, `${file}: يستخدم الخطّاف المشترك`);
    assert.match(text, /onClick=\{onClose\}/, `${file}: الضغط خارج النافذة يغلقها`);
    assert.ok(text.includes(modal), `${file}: معرَّفة كحوار للقارئات`);
  }
});

test("لا ملاحظة متكرّرة عن الإغلاق، وفي كل وضع زر «رجوع» ظاهر", () => {
  const dir = path.join(SRC, "components", "mindmap");
  for (const name of fs.readdirSync(dir)) {
    const text = fs.readFileSync(path.join(dir, name), "utf8");
    assert.ok(
      !text.includes("اضغط خارج البطاقة"),
      `${name}: الملاحظة المتكرّرة يجب أن تبقى محذوفة`
    );
  }

  const map = readSrc("components", "mindmap", "MindmapFocusMap.tsx");
  assert.match(map, /<span>رجوع<\/span>/, "الخريطة: زر رجوع خطوة واحدة");
  assert.match(map, /goUp/, "الخريطة: يعود إلى المحور الأعلى");

  const sheet = readSrc("components", "mindmap", "MindmapInfoSheet.tsx");
  assert.match(sheet, /<span>رجوع<\/span>/, "بطاقة الشرح: زر رجوع");

  const viewer = readSrc("components", "mindmap", "MindmapImageView.tsx");
  assert.match(viewer, /<span>رجوع<\/span>/, "المصورة: زر رجوع من العارض");
});

test("ترتيب خطوات الوحدة: «نص الدرس» أولًا ثم الخريطة", () => {
  const view = readSrc("app", "units", "[unitId]", "UnitClientView.tsx");
  const lessonIndex = view.indexOf('id: "lesson"');
  const mindmapIndex = view.indexOf('id: "mindmap"');
  assert.ok(lessonIndex > 0 && mindmapIndex > 0, "الخطوتان موجودتان");
  assert.ok(lessonIndex < mindmapIndex, "الدرس قبل الخريطة في الترتيب");
  assert.match(view, /id: "lesson", label: "نص الدرس"/, "اسم الخطوة «نص الدرس»");
  assert.match(view, /useState<TabId>\("lesson"\)/, "الوحدة تفتح على نص الدرس");
});

test("الرجوع من عنصر فُتح من الفهرس يعيدك إلى القائمة لا إلى الخريطة", () => {
  const map = readSrc("components", "mindmap", "MindmapFocusMap.tsx");
  assert.match(map, /fromIndex/, "تاريخ التنقّل يحفظ مصدر الانتقال");
  assert.match(map, /if \(last\.fromIndex\) setIndexOpen\(true\)/, "الرجوع يفتح القائمة");
  assert.match(map, /moveFocus\(id, true\)/, "الانتقال من الفهرس يسجَّل أنه من القائمة");
});

test("المحتوى غير المفهومي في الدرس موسوم بمصباح «إضاءة/فائدة»", () => {
  const card = readSrc("components", "lesson", "InsightCard.tsx");
  assert.match(card, /Lightbulb/, "البطاقة تحمل أيقونة مصباح");
  assert.match(card, /illumination: "إضاءة"/, "نوع «إضاءة» موسوم بلفظه");
  assert.match(card, /benefit: "فائدة"/, "نوع «فائدة» موسوم بلفظه");

  const kinds = readSrc("lib", "content-kinds.ts");
  for (const key of [
    "keywords",
    "key_extraction_indicators",
    "pedagogical_note",
    "pedagogical_guidance",
    "common_pitfall",
    "examiner_warning",
  ]) {
    assert.ok(kinds.includes(`${key}:`) || kinds.includes(`${key}`), `الحقل ${key} مصنّف`);
  }
  assert.match(
    kinds,
    /_note.*_tip.*_guidance/s,
    "أي حقل جديد ينتهي بـ_note/_tip/_guidance يُعدّ إضاءة"
  );
});

test("الدرس يمرّر كل حقل غير مفهومي إلى بطاقة المصباح", () => {
  const viewer = readSrc("components", "lesson", "StandardLessonViewer.tsx");
  assert.match(viewer, /import InsightCard from "\.\/InsightCard"/, "يستعمل بطاقة المصباح");
  assert.match(viewer, /insightFor\(key\)/, "يكتشف الحقول غير المفهومية");
  assert.match(viewer, /isInsightField\(key\)/, "لا يعرضها بالعنوان العام مرة ثانية");
  assert.match(
    viewer,
    /<InsightCard tone="illumination" title="مؤشرات الاستخراج">/,
    "مؤشرات الاستخراج إضاءة لا مفهوم"
  );
  // العناصر الثلاثة التي تُذكر في الشرح ولا تُعدّ عناصر درس (توجيهات التدرّج الرسمي)
  assert.match(
    viewer,
    /\["relationship_linguistic_idiomatic", "core_foundation", "tawheed_categories"\]/,
    "العلاقة وأصل العقيدة وأقسام التوحيد بطاقات إضاءة"
  );
});

test("النص الشرعي ليس «إضاءة» ولا «فائدة» بل شاهدًا قائمًا بذاته", () => {
  const viewer = readSrc("components", "lesson", "StandardLessonViewer.tsx");
  assert.ok(
    !viewer.includes('tone="benefit" title={proofLabel}'),
    "لا شارة «فائدة» على الشاهد الشرعي"
  );
  assert.match(
    viewer,
    /proofText && \(\s*<figure[\s\S]{0,1400}blockquote/,
    "الشاهد اقتباس مستقل بخطّ جانبي"
  );
  assert.match(viewer, /figcaption/, "للشاهد تسمية ظاهرة");
  assert.match(viewer, /الشاهد الحديثي/, "عنوان الشاهد الحديثي");
  assert.match(viewer, /"الشاهد الشرعي"/, "عنوان الشاهد القرآني");
});

test("الخريطة الذهنية لا تعرض الشواهد ولا الكلمات المفتاحية", () => {
  const sheet = readSrc("components", "mindmap", "MindmapInfoSheet.tsx");
  assert.ok(!sheet.includes("node.proof"), "بطاقة العنصر لا تعرض شاهدًا");
  assert.ok(!sheet.includes("الشاهد"), "لا عنوان «الشاهد» داخل الخريطة");
  assert.match(sheet, /node.details/, "تعرض شرح المفهوم وحده");

  const types = readSrc("lib", "types.ts");
  const nodeType = types.slice(
    types.indexOf("interface MindmapNode"),
    types.indexOf("interface MindmapNode") + 400
  );
  assert.ok(!nodeType.includes("proof"), "نوع عقدة الخريطة لا يحمل حقل شاهد");
});

test("الخريطة تُعلن أنها خريطة مفاهيم، ولا تُسمّى عناصرها «عناصر»", () => {
  const viewer = readSrc("components", "mindmap", "MindmapViewer.tsx");
  assert.match(viewer, /خريطة المفاهيم/, "التنبيه يوضّح أن الخريطة للمفاهيم");
  assert.match(viewer, /\{nodeCount\} مفهومًا/, "العدّاد يقول «مفهومًا» لا «عنصرًا»");
});

test("نصوص الدرس كلها بمقاس واحد، لا مقاس أصغر في درس دون آخر", () => {
  const viewer = readSrc("components", "lesson", "StandardLessonViewer.tsx");
  const card = readSrc("components", "lesson", "InsightCard.tsx");
  assert.ok(!viewer.includes("text-body-sm"), "الدرس: لا نصّ بمقاس 16px بجانب نصوص 18px");
  assert.ok(!card.includes("text-body-sm"), "بطاقة المصباح: النص بمقاس نص الدرس");
  assert.match(viewer, /font-quran[^"]*text-title/, "النص القرآني بمقاس واحد ثابت في كل الدروس");
  assert.ok(!viewer.includes("sm:text-heading"), "لا يقفز مقاس الشاهد على الشاشات الكبيرة");
});

test("الوضع الليلي: أزرق فحميّ عميق وسطح كحلي مرتفع، لا أسود مسطّح", () => {
  const css = fs.readFileSync(path.join(SRC, "app", "globals.css"), "utf8");

  assert.match(css, /--background: #0b0f17/, "الكانفس الليلي Obsidian لا أسود");
  assert.match(css, /--surface: #131b2e/, "السطح الليلي كحلي أفتح من الكانفس");
  assert.match(css, /--ink: #f8fafc/, "حبر ليلي فاتح عالي التباين");
  assert.match(css, /--brand: #2dd4bf/, "التيل الفاتح للتفاعل في الليل");

  // حدود الليل شبه شفافة (7%) لا خطوط صلبة
  assert.match(css, /--hairline: rgb\(255 255 255 \/ 0\.07\)/, "حدّ ليلي شفاف 7%");

  // العمق بالظلّ المحيطي، ويعود لونًا مختلفًا في الليل
  assert.match(css, /--shadow-card:/, "ظلّ البطاقة معرَّف");
  assert.match(css, /--shadow-hover:/, "وظلّ الارتفاع عند المرور");
});

test("لا إطارات حول البطاقات ولا تدرّجات: الفصل بالسطوع والظلّ", () => {
  const css = fs.readFileSync(path.join(SRC, "app", "globals.css"), "utf8");

  // البطاقة: إطار شفاف في النهار وحدّ 6% في الليل فقط
  const card = css.slice(css.indexOf(".u-card {"), css.indexOf(".u-card-hover"));
  assert.match(card, /border: 1px solid transparent/, "البطاقة بلا إطار مرئي");
  assert.match(card, /box-shadow: var\(--shadow-card\)/, "وتفصلها ظلّ ناعم");

  // السلّم: 8→20px للحاويات، وأزرار 12px
  assert.match(css, /--radius-xl: 1rem/, "الحاويات 16px");
  assert.match(css, /\.u-cta \{[^}]*border-radius: 0\.75rem/, "الأزرار 12px");
  assert.match(css, /\.u-chip \{[^}]*border-radius: 999px/, "الرقائق حبّوبية");

  const offenders = [];
  for (const file of walk(SRC, ".tsx")) {
    const text = fs.readFileSync(file, "utf8");
    if (/bg-gradient|linear-gradient/.test(text)) offenders.push(path.basename(file));
  }
  assert.deepEqual(offenders, [], "لا تدرّجات لونية في أي مكوّن");
});

test("لوحة Slate & Teal: لون علامة واحد ولون تنبيه واحد في النهار", () => {
  const css = fs.readFileSync(path.join(SRC, "app", "globals.css"), "utf8");
  assert.match(css, /--canvas: #f8fafc/, "كانفس Slate 50");
  assert.match(css, /--surface: #ffffff/, "سطح أبيض");
  assert.match(css, /--brand: #0d9488/, "تيل 600 هو العلامة");
  assert.match(css, /--amber: #d97706/, "ذهب واحد للتنبيه");
  assert.match(css, /--ink: #0f172a/, "حبر Slate 900");
  assert.match(css, /--ink-soft: #475569/, "حبر ثانوي Slate 600");

  // لا لون زخرفي ثالث في طبقة المكوّنات
  const layer = css.slice(css.indexOf(".u-card {"));
  assert.doesNotMatch(layer, /purple|violet|indigo|fuchsia/, "لا ألوان قوس قزح");
});

test("مسار التعلّم: ثلاث مراحل لا ستة أزرار متساوية", () => {
  const view = readSrc("app", "units", "[unitId]", "UnitClientView.tsx");
  const stages = view.slice(
    view.indexOf("const STAGES"),
    view.indexOf("interface UnitClientViewProps")
  );
  assert.match(stages, /label: "استيعاب"/, "المرحلة 1: استيعاب");
  assert.match(stages, /label: "تثبيت"/, "المرحلة 2: تثبيت");
  assert.match(stages, /label: "اختبار"/, "المرحلة 3: اختبار");
  assert.match(stages, /steps: \["lesson", "mindmap"\]/, "القراءة والخريطة في الاستيعاب");

  // الخطوات المعروضة هي خطوات المرحلة الحالية فقط
  assert.match(view, /const visibleTabs = useMemo/, "الخطوات تُفلتر بالمرحلة");
  assert.match(view, /visibleTabs\.map/, "الشريط يعرض خطوات المرحلة");
  assert.doesNotMatch(view, /tabs\.map\(\s*\(tab, index\)/, "لم يبقَ شريط بستة أزرار");

  // والمسار يبقى ملتصقًا أعلى الصفحة
  assert.match(view, /sticky top-14/, "شريط المراحل لاصق أثناء التمرير");

  const rule = readSrc("components", "lesson", "ReadingRule.tsx");
  assert.match(rule, /requestAnimationFrame/, "مسطرة القراءة تُحدَّث في إطار رسم واحد");
});

test("البطاقات: 4:3 والتقييم لا يظهر إلا بعد القلب", () => {
  const deck = readSrc("components", "flashcards", "FlashcardSection.tsx");
  assert.match(deck, /aspect-\[4\/3\]/, "البطاقة بنسبة 4:3 كالبطاقة الورقية");
  assert.match(deck, /max-w-xl/, "بعرض محدود ومتمركز");
  assert.match(deck, /\{isFlipped \? \(/, "كتلة التقييم مشروطة بالقلب");
  assert.match(deck, /handleRate\("hard"\)/, "تقييم: صعب");
  assert.match(deck, /handleRate\("medium"\)/, "تقييم: متوسط");
  assert.match(deck, /handleRate\("easy"\)/, "تقييم: متقن");
  // لا تعليمات لوحة مفاتيح مزدحمة في الواجهة
  assert.doesNotMatch(deck, /اضغط Space للقلب، والأرقام/, "حُذفت تعليمات الكيبورد الطويلة");
});

test("QCM: شريط تقدّم وخيارات Radio Cards وتفسير بعد الإجابة", () => {
  const mcq = readSrc("components", "quiz", "McqQuizViewer.tsx");
  assert.match(mcq, /role="progressbar"/, "شريط تقدّم للاختبار");
  assert.match(mcq, /role="radiogroup"/, "الخيارات مجموعة اختيار واحد");
  assert.match(mcq, /role="radio"/, "كل خيار بطاقة اختيار");
  assert.match(
    mcq,
    /bg-\[var\(--surface-2\)\] text-\[var\(--ink\)\] hover:bg-\[var\(--surface-3\)\]/,
    "الخيار سطح بلا إطار"
  );
  assert.doesNotMatch(mcq, /border-2 border-slate/, "لا إطارات سميكة على الخيارات");
});

test("طلب واحدة لكل شاشة: إجراء ممتلئ واحد والباقي هادئ", () => {
  const page = readSrc("app", "page.tsx");
  const primary = (page.match(/className="u-cta"/g) || []).length;
  assert.equal(primary, 1, "إجراء واحد ممتلئ في الغلاف، لا أكثر");
  assert.match(page, /استعرض الوحدات/, "والإجراء الثاني رابط نصّي");
  assert.match(
    page,
    /text-label font-semibold text-\[var\(--brand-strong\)\]/,
    "وبطاقات الوحدات تُفتح برابط"
  );
});

test("لا مكوّنات على مفردات .z-* القديمة", () => {
  const legacy = [];
  for (const file of walk(SRC, ".tsx")) {
    const text = fs.readFileSync(file, "utf8");
    if (
      /className="[^"]*\bz-(?:sheet|hair|btn|link|num|kicker|display|index-item|quote)/.test(text)
    ) {
      legacy.push(path.basename(file));
    }
  }
  assert.deepEqual(legacy, [], "كل المكوّنات على طبقة u-* الجديدة");
});
