/**
 * حواجز انحدار على البيانات التعليمية — الوحدة في **ملف واحد**.
 *
 * كل فحص هنا يقابل خطأً وقع فعلًا في المشروع أو قرارًا اتُّخذ لحماية الطالب:
 *  - 70/70 سؤال QCM إجابته الخيار الأول
 *  - 38 بطاقة بلا نص أو بلا جواب
 *  - 39 عقدة في الخريطة بلا شرح
 *  - عناوين إنجليزية داخل واجهة عربية
 *  - «القواعد المنهجية» تُعرض محورًا دراسيًا ومكانها المراجعة
 *  - نصّ منسوب إلى «رواية ورش» (مرفوض شرعيًا ومنهجيًا)
 *
 * التشغيل: npm run test:data
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";
import { validateUnitFile } from "../lib/unit-validator.mjs";
import { readUnitsMeta } from "../lib/units-meta.mjs";

const ROOT = path.join(import.meta.dirname, "..", "..");
const UNITS_DIR = path.join(ROOT, "src", "data", "units");
const SCHEMA_FILE = path.join(ROOT, "src", "data", "schema", "unit.schema.json");
const SRC = path.join(ROOT, "src");

const FILES = fs
  .readdirSync(UNITS_DIR)
  .filter((f) => /^unit-\d{2}\.json$/.test(f))
  .sort();
const UNITS = FILES.map((file) => ({
  file: path.join(UNITS_DIR, file),
  data: JSON.parse(fs.readFileSync(path.join(UNITS_DIR, file), "utf8")),
}));
const META = readUnitsMeta(ROOT);
const read = (rel) => fs.readFileSync(path.join(SRC, rel), "utf8");

const leaves = (node, out = []) => {
  if (!(node.children || []).length) out.push(node);
  for (const child of node.children || []) leaves(child, out);
  return out;
};

const walkNodes = (node, out = []) => {
  out.push(node);
  for (const child of node.children || []) walkNodes(child, out);
  return out;
};

/* ─────────────── المخطط: عقد الملف الواحد ─────────────── */

test("مخطط الوحدة الموحّد موجود ومعلن الإصدار 2", () => {
  assert.ok(existsSync(SCHEMA_FILE), "src/data/schema/unit.schema.json موجود");
  const schema = JSON.parse(fs.readFileSync(SCHEMA_FILE, "utf8"));
  assert.equal(schema.schemaVersion, undefined, "المخطط نفسه JSON Schema لا ملف وحدة");
  assert.equal(schema.properties.schemaVersion.const, 2, "إصدار المخطط 2");
  for (const key of ["unit", "lesson", "mindmap", "flashcards", "cloze", "quiz", "questionBank", "revision"]) {
    assert.ok(schema.properties[key], `المخطط يعرّف القسم «${key}»`);
  }
  assert.ok(schema.$defs.video, "المخطط يعرّف الفيديو");
});

test("كل ملفات الوحدات صالحة وفق المدقّق", () => {
  assert.equal(UNITS.length, 4, "أربع وحدات");
  for (const { file, data } of UNITS) {
    const errors = validateUnitFile(data, { meta: META.find((m) => m.id === data.unit.id) });
    assert.deepEqual(errors, [], `${path.basename(file)}:\n- ${errors.join("\n- ")}`);
  }
});

test("لا ملفات قديمة موزّعة (خمسة ملفات لكل وحدة) بعد التوحيد", () => {
  assert.equal(
    existsSync(path.join(ROOT, "src", "data", "lessons")),
    false,
    "‏src/data/lessons حُذف: الملف الواحد هو المصدر"
  );
});

test("القالب `_template.json` صالح ويوثّق الفيديو والشواهد", () => {
  const template = JSON.parse(fs.readFileSync(path.join(UNITS_DIR, "_template.json"), "utf8"));
  assert.deepEqual(validateUnitFile(template), [], "القالب يمرّ من المدقّق نفسه");
  assert.ok(template.unit.video, "القالب يبيّن كيف يُضاف الفيديو");
  assert.ok(Array.isArray(template.unit.video.chapters), "القالب يبيّن الفصول");
  assert.ok(Array.isArray(template.proofs) && template.proofs.length > 0, "القالب يبيّن الشواهد");
});

/* ─────────────── اكتمال المادة ─────────────── */

test("أعداد المادة العلمية لم تنقص بعد التوحيد", () => {
  const totals = UNITS.reduce(
    (acc, { data }) => ({
      sections: acc.sections + data.lesson.sections.length,
      cards: acc.cards + data.flashcards.length,
      cloze: acc.cloze + data.cloze.length,
      quiz: acc.quiz + data.quiz.length,
      bank: acc.bank + data.questionBank.length,
    }),
    { sections: 0, cards: 0, cloze: 0, quiz: 0, bank: 0 }
  );
  assert.deepEqual(totals, {
    sections: 14,
    cards: 131,
    cloze: 24,
    quiz: 70,
    bank: 104,
  });
});

/* ─────────────── أسئلة QCM ─────────────── */

test("الإجابة الصحيحة موجودة بين الخيارات ولها تعليل", () => {
  for (const { file, data } of UNITS) {
    for (const question of data.quiz) {
      assert.ok(
        question.options.includes(question.correct_answer),
        `${path.basename(file)} :: ${question.question_id}: الإجابة ليست بين الخيارات`
      );
      assert.equal(question.options.length, 4, `${question.question_id}: عدد الخيارات ليس 4`);
      assert.ok(question.explanation?.trim(), `${question.question_id}: لا يوجد تعليل`);
    }
  }
});

test("موضع الإجابة الصحيحة موزّع على الخيارات الأربعة", () => {
  const totals = [0, 0, 0, 0];
  let all = 0;
  for (const { data } of UNITS) {
    for (const question of data.quiz) {
      totals[question.options.indexOf(question.correct_answer)] += 1;
      all += 1;
    }
  }
  assert.equal(all, 70, "إجمالي أسئلة QCM");
  for (const [position, count] of totals.entries()) {
    assert.ok(count / all >= 0.15, `الموضع ${position}: ${count}/${all} — انحياز`);
    assert.ok(count / all <= 0.35, `الموضع ${position}: ${count}/${all} — تركيز مفرط`);
  }
});

test("لا سؤال QCM مكرّر داخل الوحدة", () => {
  for (const { file, data } of UNITS) {
    const seen = new Set();
    for (const question of data.quiz) {
      const key = question.question.trim();
      assert.ok(!seen.has(key), `${path.basename(file)}: سؤال مكرّر → ${key.slice(0, 60)}`);
      seen.add(key);
    }
  }
});

/* ─────────────── بنك الأسئلة ─────────────── */

test("كل سؤال في البنك له نص وعناصر إجابة وتصنيف داخلي", () => {
  for (const { file, data } of UNITS) {
    assert.ok(data.questionBank.length > 0, `${path.basename(file)}: لا أسئلة`);
    for (const question of data.questionBank) {
      assert.ok(question.question?.trim(), `${question.id}: بلا نص`);
      assert.ok(question.modelAnswer?.trim(), `${question.id}: بلا عناصر إجابة`);
      assert.ok(question.category?.trim(), `${question.id}: بلا تصنيف`);
    }
  }
});

test("معرّفات أسئلة البنك فريدة داخل كل وحدة", () => {
  for (const { file, data } of UNITS) {
    const ids = data.questionBank.map((q) => q.id);
    assert.equal(new Set(ids).size, ids.length, `${path.basename(file)}: معرّفات مكرّرة`);
  }
});

/* ─────────────── الخريطة الذهنية ─────────────── */

test("كل عقدة طرفية لها شرح، والمعرّفات فريدة", () => {
  for (const { file, data } of UNITS) {
    const missing = leaves(data.mindmap.root).filter((node) => !node.details?.trim());
    assert.deepEqual(missing.map((n) => n.id), [], `${path.basename(file)}: عقد بلا شرح`);
    const all = walkNodes(data.mindmap.root);
    assert.equal(new Set(all.map((n) => n.id)).size, all.length, "معرّفات مكرّرة");
  }
});

test("الخريطة عناصر مفهومية فقط: لا شواهد ولا كلمات مفتاحية", () => {
  for (const { file, data } of UNITS) {
    for (const node of walkNodes(data.mindmap.root)) {
      for (const key of ["proof", "keywords", "note", "tip", "pedagogical_note"]) {
        assert.equal(node[key], undefined, `${path.basename(file)} :: ${node.id}: «${key}» ليس مفهومًا`);
      }
    }
  }
});

test("خريطة الوحدة 01 = عناصر التدرّج الرسمي وحدها", () => {
  const root = UNITS[0].data.mindmap.root;
  const labels = walkNodes(root).map((n) => n.label);
  for (const notAnElement of ["العلاقة بين", "أصول العقيدة", "أقسام التوحيد", "توحيد الربوبية"]) {
    assert.ok(!labels.some((label) => label.includes(notAnElement)), `«${notAnElement}» ليس عنصرًا`);
  }
  assert.equal(root.children.length, 3, "ثلاثة محاور فقط");
  assert.deepEqual(
    root.children.map((child) => (child.children || []).length),
    [2, 3, 3],
    "ثمانية عناصر مفهومية"
  );
});

/* ─────────────── البطاقات وملء الفراغات ─────────────── */

test("كل بطاقة حفظ لها وجه وظهر غير فارغين", () => {
  for (const { file, data } of UNITS) {
    for (const card of data.flashcards) {
      assert.ok(String(card.question).trim(), `${path.basename(file)} :: ${card.id}: وجه فارغ`);
      assert.ok(String(card.answer).trim(), `${card.id}: ظهر فارغ`);
    }
  }
});

test("أقنعة ملء الفراغات مطابقة لمفاتيح الإجابات", () => {
  for (const { file, data } of UNITS) {
    for (const item of data.cloze) {
      const masks = (item.text_with_masks.match(/\{mask\d+\}/g) || []).map((m) =>
        m.replace(/[{}]/g, "")
      );
      assert.deepEqual(
        [...masks].sort(),
        Object.keys(item.answers).sort(),
        `${path.basename(file)} :: ${item.id}: الأقنعة لا تطابق الإجابات`
      );
    }
  }
});

/* ─────────────── الدرس والمراجعة ─────────────── */

test("كل محور درسي له عنوان عربي ومعرّف لاتيني", () => {
  for (const { file, data } of UNITS) {
    for (const section of data.lesson.sections) {
      assert.ok(section.title?.trim(), `${path.basename(file)}: محور بلا عنوان`);
      assert.match(section.key, /^[a-z0-9_]+$/, "المفتاح لاتيني");
      assert.ok(!/[A-Za-z]{3,}/.test(section.title), "العنوان عربي لا إنجليزي");
    }
  }
});

test("«القواعد والضوابط المنهجية» في المراجعة لا في محاور الدرس", () => {
  for (const { file, data } of UNITS) {
    const offenders = data.lesson.sections.filter((s) => s.key.includes("methodolog"));
    assert.deepEqual(offenders, [], `${path.basename(file)}: قسم منهجي داخل الدرس`);
    const labels = walkNodes(data.mindmap.root).map((n) => n.label);
    assert.ok(!labels.some((label) => label.includes("القواعد والضوابط")), "قواعد في الخريطة");
  }

  const withRules = UNITS.filter(({ data }) => data.revision.rules.length > 0);
  assert.ok(withRules.length > 0, "القواعد متاحة في المراجعة");
  for (const { data } of withRules) {
    for (const rule of data.revision.rules) {
      assert.ok(rule.trim().length > 20, "قاعدة منهجية فارغة أو مبتورة");
    }
  }
  assert.match(
    read("components/revision/RevisionSection.tsx"),
    /القواعد والضوابط المنهجية/,
    "عنوان القسم في المراجعة السريعة"
  );
});

test("محتوى المراجعة السريعة كامل لكل وحدة", () => {
  for (const { file, data } of UNITS) {
    assert.ok(data.revision.lastMinute.length > 0, `${path.basename(file)}: لا مراجعة لحظة أخيرة`);
    assert.ok(data.revision.differentiation.length > 0, `${path.basename(file)}: لا مصفوفة فروق`);
    for (const row of data.revision.differentiation) {
      assert.ok(row.termA && row.termB && row.distinction, "صف فروق ناقص");
    }
  }
});

/* ─────────────── قواعد المحتوى الثابتة ─────────────── */

test("لا يُنسب أي نص شرعي إلى رواية معيّنة", () => {
  for (const file of fs.readdirSync(UNITS_DIR).filter((f) => f.endsWith(".json"))) {
    const raw = fs.readFileSync(path.join(UNITS_DIR, file), "utf8");
    assert.ok(!raw.includes("ورش"), `${file}: «ورش» ممنوعة`);
    assert.ok(!raw.includes("WARSH"), `${file}: معرّفات WARSH القديمة ممنوعة`);
  }
});

/* ─────────────── الفيديو ─────────────── */

test("الفيديو اختياري، وإن وُجد فلا يظهر إلا كخطوة داخل مرحلة الاستيعاب", () => {
  const view = read("app/units/[unitId]/UnitClientView.tsx");
  assert.match(view, /steps: \["video", "lesson", "mindmap"\]/, "الفيديو أول خطوة في الاستيعاب");
  assert.match(view, /\.\.\.\(unit\.video/, "الخطوة تُضاف شرطيًا");
  // لوحة العرض نفسها شرطية: وحدة بلا فيديو لا تُصدر أي عنصر فارغ في DOM
  assert.match(
    view,
    /\{unit\.video && \(\s*<div\s+role="tabpanel"\s+id="panel-video"/,
    "لوحة العرض تُركّب شرطيًا"
  );
  assert.match(view, /<VideoLesson video=\{unit\.video\} \/>/, "تُعرض عند وجود فيديو");

  for (const { file, data } of UNITS) {
    if (!data.unit.video) continue;
    assert.ok(data.unit.video.title, `${path.basename(file)}: فيديو بلا عنوان`);
  }
});

test("مكوّن الفيديو: لا يُحمّل طرفًا ثالثًا قبل النقر، ويحترم الخصوصية", () => {
  const video = read("components/lesson/VideoLesson.tsx");
  assert.match(video, /useState/, "حالة تشغيل صريحة (واجهة قبل التحميل)");
  assert.match(video, /youtube-nocookie\.com/, "نطاق يوتيوب بلا كوكيز تتبّع");
  assert.match(video, /loading="lazy"/, "الإطار يُحمّل عند الحاجة");
  assert.match(video, /<track/, "مسار تفريغ للفيديو المحلي");
  assert.match(video, /aspect-video/, "نسبة 16:9 بلا قفز تخطيط");
});

/* ─────────────── أصول الواجهة ─────────────── */

test("صور الخرائط الذهنية موجودة بصيغة webp وخفيفة", () => {
  const publicDir = path.join(ROOT, "public", "lessons");
  for (const id of [1, 2, 3, 4]) {
    const file = path.join(publicDir, `unit0${id}_mindmap.webp`);
    assert.ok(existsSync(file), `الصورة مفقودة: ${file}`);
    const sizeKb = fs.statSync(file).size / 1024;
    assert.ok(sizeKb < 250, `unit0${id} حجمها ${sizeKb.toFixed(0)}KB — يجب أن تبقى تحت 250KB`);
  }
});

test("أيقونات PWA المطلوبة موجودة في المانيفست", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "public", "manifest.json"), "utf8"));
  const sizes = manifest.icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes("192x192"), "أيقونة 192 مفقودة");
  assert.ok(sizes.includes("512x512"), "أيقونة 512 مفقودة");
  assert.ok(
    manifest.icons.some((icon) => icon.purpose === "maskable"),
    "أيقونة maskable مفقودة"
  );
});

/* ─────────────── عامل الخدمة ─────────────── */

test("عامل الخدمة المولَّد يحقن بصمة البناء في اسم الكاش", async () => {
  const { buildServiceWorker } = await import("../../src/lib/service-worker.ts").catch(() => ({}));
  if (!buildServiceWorker) {
    const src = fs.readFileSync(new URL("../../src/lib/service-worker.ts", import.meta.url), "utf8");
    assert.match(src, /export function buildServiceWorker/, "الدالة المولِّدة موجودة");
    assert.match(src, /zady-\\\$\{VERSION\}/, "اسم الكاش مشتق من بصمة البناء");
    assert.match(src, /Promise\.allSettled/, "التحميل المسبق لا يفشل ككتلة واحدة");
    assert.doesNotMatch(
      src,
      /PRECACHE_STATIC[\s\S]{0,200}lessons\/unit0\d_mindmap/,
      "صور الخرائط لا تُحمَّل مسبقًا"
    );
    return;
  }

  assert.match(buildServiceWorker("abc123"), /const VERSION = "abc123"/);
  assert.doesNotMatch(buildServiceWorker("../../evil;drop"), /evil;drop/);
  assert.match(buildServiceWorker(""), /const VERSION = "dev"/);
});

test("لم يبقَ sw.js ثابت في public (يُولَّد من مسار /sw.js)", () => {
  assert.equal(existsSync(path.join(ROOT, "public", "sw.js")), false, "public/sw.js محذوف");
  assert.equal(
    existsSync(path.join(SRC, "app", "sw.js", "route.ts")),
    true,
    "مسار /sw.js المولِّد موجود"
  );
});
