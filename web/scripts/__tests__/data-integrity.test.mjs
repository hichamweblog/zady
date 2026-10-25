/**
 * حواجز انحدار على البيانات التعليمية.
 *
 * كل فحص هنا يقابل خطأً وقع فعليًا في المشروع:
 *  - 70/70 سؤال QCM إجابته الخيار الأول
 *  - 38 بطاقة سؤال تُعرض بلا نص أو بلا جواب
 *  - 39 عقدة في الخرائط الذهنية بلا شرح
 *  - 90 بطاقة بلا سلم تنقيط
 *  - عناوين إنجليزية داخل واجهة عربية
 *  - تعارض @font-face يُخفي الخط العربي
 *
 * التشغيل: npm run test:data
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";

const DIR = path.join(import.meta.dirname, "..", "..", "src", "data", "lessons");
const read = (file) => JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
const files = fs.readdirSync(DIR);

const QUIZ_FILES = files.filter((f) => f.endsWith("_quiz.json")).sort();
const QUESTION_FILES = files.filter((f) => f.endsWith("_questions.json")).sort();
const MINDMAP_FILES = files.filter((f) => f.endsWith("_mindmap.json")).sort();
const STANDARD_FILES = files.filter((f) => f.endsWith("_standard.json")).sort();
const ADVANCED_FILES = files.filter((f) => f.endsWith("_advanced.json")).sort();

const flatQuestions = (raw) => {
  const out = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node.question_text !== undefined || node.question !== undefined) {
      out.push(node);
      return;
    }
    Object.values(node).forEach(walk);
  };
  walk(raw);
  return out;
};

const leaves = (node, out = []) => {
  if (!(node.children || []).length) out.push(node);
  (node.children || []).forEach((child) => leaves(child, out));
  return out;
};

/* ─────────────── أسئلة QCM ─────────────── */

test("كل ملفات QCM تستخدم الإجابة الصحيحة الموجودة فعلًا بين الخيارات", () => {
  assert.ok(QUIZ_FILES.length === 4, "يجب أن توجد 4 ملفات QCM");
  for (const file of QUIZ_FILES) {
    const data = read(file);
    for (const question of data.questions) {
      assert.ok(
        question.options.includes(question.correct_answer),
        `${file} :: ${question.question_id}: الإجابة الصحيحة ليست ضمن الخيارات`
      );
      assert.equal(
        question.options.length,
        4,
        `${file} :: ${question.question_id}: عدد الخيارات ليس 4`
      );
      assert.ok(question.explanation?.trim(), `${file} :: ${question.question_id}: لا يوجد تعليل`);
      assert.ok(question.question?.trim(), `${file} :: ${question.question_id}: نص السؤال فارغ`);
    }
  }
});

test("موضع الإجابة الصحيحة موزّع على الخيارات الأربعة (لا انحياز للموضع الأول)", () => {
  const totals = [0, 0, 0, 0];
  let all = 0;
  for (const file of QUIZ_FILES) {
    for (const question of read(file).questions) {
      const index = question.options.indexOf(question.correct_answer);
      totals[index] += 1;
      all += 1;
    }
  }
  assert.equal(all, 70, "عدد أسئلة QCM الإجمالي يجب أن يبقى 70");
  for (const [position, count] of totals.entries()) {
    assert.ok(count / all >= 0.15, `الموضع ${position} يحتوي ${count}/${all} فقط — التوزيع منحاز`);
    assert.ok(count / all <= 0.35, `الموضع ${position} يحتوي ${count}/${all} — تركيز مفرط`);
  }
});

test("لا أسئلة QCM مكرّرة داخل الوحدة", () => {
  for (const file of QUIZ_FILES) {
    const seen = new Set();
    for (const question of read(file).questions) {
      const key = question.question.trim();
      assert.ok(!seen.has(key), `${file}: سؤال مكرّر → ${key.slice(0, 60)}`);
      seen.add(key);
    }
  }
});

/* ─────────────── بنك أسئلة البكالوريا ─────────────── */

test("كل سؤال في بنك الأسئلة له نص وجواب غير فارغين", () => {
  for (const file of QUESTION_FILES) {
    const questions = flatQuestions(read(file));
    assert.ok(questions.length > 0, `${file}: لا أسئلة`);
    for (const question of questions) {
      const label = question.question_id || question.id;
      const questionText = question.question_text || question.question;
      const answer =
        question.model_answer ||
        question.answer ||
        question.official_solution ||
        question.solution ||
        question.guidance ||
        (Array.isArray(question.model_answers) && question.model_answers.length > 0 ? "ok" : "");

      // أسئلة الاستخراج تُبنى من النص + المحل، فلا تُشترط فيها صياغة سؤال صريحة
      const hasExtractionContext = Boolean(
        question.text_warsh ||
        question.verse_text ||
        question.ayah_text_warsh ||
        question.text_proof
      );
      assert.ok(
        questionText || hasExtractionContext,
        `${file} :: ${label}: لا نص للسؤال ولا نص شرعي`
      );
      assert.ok(answer, `${file} :: ${label}: لا توجد إجابة`);
    }
  }
});

test("معرّفات الأسئلة موجودة وفريدة داخل كل ملف", () => {
  for (const file of QUESTION_FILES) {
    const ids = flatQuestions(read(file)).map((q) => q.question_id || q.id);
    assert.ok(
      ids.every(Boolean),
      `${file}: توجد أسئلة بلا معرّف (سيولّد معرّفًا عشوائيًا عند العرض)`
    );
    assert.equal(new Set(ids).size, ids.length, `${file}: معرّفات مكرّرة`);
  }
});

/* ─────────────── الخرائط الذهنية ─────────────── */

test("كل عقدة طرفية في الخرائط الذهنية لها شرح", () => {
  for (const file of MINDMAP_FILES) {
    const root = read(file).root;
    const missing = leaves(root).filter((node) => !node.details?.trim());
    assert.deepEqual(
      missing.map((n) => n.id),
      [],
      `${file}: عقد بلا شرح`
    );
  }
});

test("الخريطة الذهنية عناصر مفهومية فقط: لا شواهد ولا كلمات مفتاحية", () => {
  const NON_CONCEPT_KEYS = ["proof", "keywords", "note", "tip", "pedagogical_note"];
  const NOT_CONCEPT_LABEL = [/﴿/, /\[/, /\d+\s*[.)]\s/, /^أول(?:اً|ا)\s*:/, /^القسم\s*\d/];

  for (const file of MINDMAP_FILES) {
    const walk = (node, depth = 0) => {
      for (const key of NON_CONCEPT_KEYS) {
        assert.equal(
          node[key],
          undefined,
          `${file} :: ${node.id}: «${key}» ليس عنصرًا مفهوميًا ومكانه نص الدرس`
        );
      }
      for (const rx of NOT_CONCEPT_LABEL) {
        assert.ok(
          !rx.test(node.label),
          `${file} :: ${node.id}: التسمية «${node.label}» تحمل زخرفة غير مفهومية`
        );
      }
      (node.children || []).forEach((child) => walk(child, depth + 1));
    };
    walk(read(file).root);
  }
});

test("خريطة الوحدة 01 = عناصر التدرّج الرسمي وحدها", () => {
  const root = read("unit01_aqidah_mindmap.json").root;
  const labels = [];
  const walk = (node) => {
    labels.push(node.label);
    (node.children || []).forEach(walk);
  };
  walk(root);

  // «توجيهات خاصة بالأستاذ (ليست عناصر مفاهيمية)» في التدرّج: العلاقة بين
  // المعنيين، أصول العقيدة، أقسام التوحيد — تُذكر في الشرح ولا تكون عناصر درس.
  for (const notAnElement of ["العلاقة بين", "أصول العقيدة", "أقسام التوحيد", "توحيد الربوبية"]) {
    assert.ok(
      !labels.some((label) => label.includes(notAnElement)),
      `«${notAnElement}» ليس عنصرًا مفاهيميًا ولا يدخل الخريطة`
    );
  }

  // البنية الرسمية: التعريف (لغوي + اصطلاحي) ثم آثار الفرد (3) ثم آثار المجتمع (3)
  assert.equal(root.children.length, 3, "ثلاثة محاور فقط");
  assert.deepEqual(
    root.children.map((child) => (child.children || []).length),
    [2, 3, 3],
    "٨ عناصر مفهومية: تعريفان وستة آثار"
  );
});

test("كل عنصر مفهومي في الخريطة له شرح، والشرح نصّ لا قائمة", () => {
  for (const file of MINDMAP_FILES) {
    const walk = (node) => {
      if (node.details !== undefined) {
        assert.equal(typeof node.details, "string", `${file} :: ${node.id}: الشرح ليس نصًّا`);
      }
      (node.children || []).forEach(walk);
    };
    walk(read(file).root);
  }
});

test("معرّفات عقد الخرائط فريدة", () => {
  for (const file of MINDMAP_FILES) {
    const ids = [];
    const walk = (node) => {
      ids.push(node.id);
      (node.children || []).forEach(walk);
    };
    walk(read(file).root);
    assert.equal(new Set(ids).size, ids.length, `${file}: معرّفات عقد مكرّرة`);
  }
});

/* ─────────────── البطاقات وملء الفراغات ─────────────── */

test("كل بطاقة حفظ لها وجه وظهر غير فارغين", () => {
  for (const file of ADVANCED_FILES) {
    const data = read(file);
    const key = Object.keys(data).find((k) => k.includes("flashcards"));
    assert.ok(key, `${file}: لا يوجد مفتاح بطاقات`);
    for (const card of data[key]) {
      assert.ok(
        (card.front || card.q || card.question || "").trim(),
        `${file} :: ${card.card_id || card.id}: وجه فارغ`
      );
      assert.ok(
        (card.back || card.a || card.answer || "").trim(),
        `${file} :: ${card.card_id || card.id}: ظهر فارغ`
      );
    }
  }
});

test("أقنعة ملء الفراغات مطابقة لمفاتيح الإجابات", () => {
  for (const file of ADVANCED_FILES) {
    const data = read(file);
    for (const node of data.concept_nodes || []) {
      const cloze = node.cloze_active_recall;
      if (!cloze) continue;
      const masks = (cloze.text_with_masks.match(/\{mask\d+\}/g) || []).map((m) =>
        m.replace(/[{}]/g, "")
      );
      const keys = Object.keys(cloze.answers || {});
      assert.deepEqual(
        [...masks].sort(),
        [...keys].sort(),
        `${file} :: ${node.concept_id}: الأقنعة لا تطابق مفاتيح الإجابات`
      );
    }
  }
});

/* ─────────────── الدروس المنهجية ─────────────── */

test("كل قسم درسي له عنوان عربي (لا مفاتيح إنجليزية معروضة)", () => {
  // نفس قاموس العناوين المستخدم في العرض
  const titlesSource = fs.readFileSync(
    path.join(DIR, "..", "..", "lib", "section-titles.ts"),
    "utf8"
  );

  for (const file of STANDARD_FILES) {
    const data = read(file);
    for (const [key, section] of Object.entries(data.detailed_explanation || {})) {
      const hasInlineTitle = typeof section?.title === "string" && section.title.trim();
      assert.ok(
        hasInlineTitle || titlesSource.includes(`${key}:`),
        `${file}: المفتاح «${key}» سيُعرض بلا عنوان عربي`
      );
    }
  }
});

test("محتوى المراجعة السريعة موجود لكل وحدة", () => {
  for (const file of ADVANCED_FILES) {
    const data = read(file);
    const lastMinute = data.last_minute_revision_schema;
    assert.ok(lastMinute, `${file}: لا يوجد last_minute_revision_schema`);
    const groups = Object.values(lastMinute).filter(
      (value) => Array.isArray(value) && value.length > 0
    );
    assert.ok(groups.length > 0, `${file}: مراجعة اللحظة الأخيرة فارغة`);

    const matrix = data.differentiation_matrix;
    assert.ok(Array.isArray(matrix) && matrix.length > 0, `${file}: لا توجد مصفوفة فروق`);
    for (const row of matrix) {
      assert.ok(row.term_a && row.term_b && row.key_distinction, `${file}: صف فروق ناقص`);
    }
  }
});

/* ─────────────── القواعد المنهجية: مكانها المراجعة لا الدرس ─────────────── */

test("«القواعد والضوابط المنهجية» ليست محورًا في الخريطة الذهنية ولا في الدرس", () => {
  for (const file of MINDMAP_FILES) {
    const labels = [];
    const walk = (node) => {
      labels.push(node.label ?? "");
      (node.children || []).forEach(walk);
    };
    walk(read(file).root);
    const offenders = labels.filter(
      (label) => label.includes("القواعد والضوابط") || label.includes("قواعد منهجية")
    );
    assert.deepEqual(offenders, [], `${file}: القواعد المنهجية عُرضت كمحور درس`);
  }

  for (const file of STANDARD_FILES) {
    const sections = Object.keys(read(file).detailed_explanation ?? {});
    const offenders = sections.filter((key) => key.includes("methodolog"));
    assert.deepEqual(offenders, [], `${file}: قسم درسي للقواعد المنهجية`);
  }
});

test("نفس القواعد متاحة داخل المراجعة السريعة (معرَّفة للواجهة)", () => {
  const withRules = STANDARD_FILES.map((file) => read(file)).filter(
    (data) =>
      Array.isArray(data.methodology_and_rules?.rules) && data.methodology_and_rules.rules.length
  );
  assert.ok(withRules.length > 0, "لا توجد قواعد منهجية في أي ملف قياسي");
  for (const data of withRules) {
    for (const rule of data.methodology_and_rules.rules) {
      assert.equal(typeof rule, "string");
      assert.ok(rule.trim().length > 20, "قاعدة منهجية فارغة أو مبتورة");
    }
  }

  const section = fs.readFileSync(
    path.join(
      import.meta.dirname,
      "..",
      "..",
      "src",
      "components",
      "revision",
      "RevisionSection.tsx"
    ),
    "utf8"
  );
  assert.match(section, /القواعد والضوابط المنهجية/, "عنوان القسم في المراجعة السريعة");
});

/* ─────────────── أصول الواجهة ─────────────── */

test("صور الخرائط الذهنية موجودة بصيغة webp وخفيفة", () => {
  const publicDir = path.join(DIR, "..", "..", "..", "public", "lessons");
  for (const id of [1, 2, 3, 4]) {
    const file = path.join(publicDir, `unit0${id}_mindmap.webp`);
    assert.ok(fs.existsSync(file), `الصورة مفقودة: ${file}`);
    const sizeKb = fs.statSync(file).size / 1024;
    assert.ok(sizeKb < 250, `unit0${id} حجمها ${sizeKb.toFixed(0)}KB — يجب أن تبقى تحت 250KB`);
  }
});

test("أيقونات PWA المطلوبة موجودة في المانيفست", () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(DIR, "..", "..", "..", "public", "manifest.json"), "utf8")
  );
  const sizes = manifest.icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes("192x192"), "أيقونة 192 مفقودة");
  assert.ok(sizes.includes("512x512"), "أيقونة 512 مفقودة");
  assert.ok(
    manifest.icons.some((icon) => icon.purpose === "maskable"),
    "أيقونة maskable مفقودة"
  );
});

/* ------------------------------------------------------------------ */
/* عامل الخدمة (Service Worker)                                        */
/* ------------------------------------------------------------------ */

test("عامل الخدمة المولَّد يحقن بصمة البناء في اسم الكاش", async () => {
  const { buildServiceWorker } = await import("../../src/lib/service-worker.ts").catch(() => ({}));
  if (!buildServiceWorker) {
    // Node لا يحمّل TS مباشرة: نتحقق من النص المصدري بدل التنفيذ
    const src = fs.readFileSync(
      new URL("../../src/lib/service-worker.ts", import.meta.url),
      "utf8"
    );
    assert.match(src, /export function buildServiceWorker/, "الدالة المولِّدة موجودة");
    assert.match(src, /zady-\\\$\\{VERSION\\}/, "اسم الكاش مشتق من بصمة البناء");
    assert.match(src, /Promise\.allSettled/, "التحميل المسبق لا يفشل ككتلة واحدة");
    assert.doesNotMatch(
      src,
      /PRECACHE_STATIC[\s\S]{0,200}lessons\/unit0\d_mindmap/,
      "صور الخرائط لا تُحمَّل مسبقًا"
    );
    return;
  }

  const withSha = buildServiceWorker("abc123");
  assert.match(withSha, /const VERSION = "abc123"/);
  const sanitized = buildServiceWorker("../../evil;drop");
  assert.doesNotMatch(sanitized, /evil;drop/, "بصمة البناء تُنقّى من المحارف الخطرة");
  assert.match(buildServiceWorker(""), /const VERSION = "dev"/, "قيمة احتياطية آمنة");
});

test("لم يبقَ sw.js ثابت في public (يُولَّد من مسار /sw.js)", () => {
  const publicSw = new URL("../../public/sw.js", import.meta.url);
  assert.equal(existsSync(publicSw), false, "public/sw.js يجب أن يبقى محذوفًا");
  assert.equal(
    existsSync(new URL("../../src/app/sw.js/route.ts", import.meta.url)),
    true,
    "مسار /sw.js المولِّد موجود"
  );
});
