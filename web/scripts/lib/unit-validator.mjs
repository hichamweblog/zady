/**
 * مدقّق ملفات الوحدات — مصدر الحقيقة القابل للتنفيذ.
 *
 * يفحص `src/data/units/unit-*.json` مقابل عقد `src/data/schema/unit.schema.json`
 * بلا مكتبة خارجية (لا ajv): الفحوص هنا مقصودة لأنها تشرح *لماذا* كل قاعدة
 * موجودة، وتعمل في الاختبارات وفي سطر الأوامر معًا.
 *
 * الاستعمال: `npm run data:check` أو من الاختبارات مباشرة.
 */

const NON_CONCEPT_KEYS = ["proof", "keywords", "note", "tip", "pedagogical_note", "guidance"];
const ARABIC_MARK_DECORATION = [/﴿/, /﴾/, /\[/, /^\d+\s*[.)]\s/];

const isRec = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v) => typeof v === "string" && v.trim().length > 0;

/** يزيل بادئة/لاحقة «{}» من الأقنعة */
const masksOf = (text) => (String(text).match(/\{mask\d+\}/g) || []).map((m) => m.replace(/[{}]/g, ""));

const timeToSeconds = (at) => {
  const [m, s] = String(at).split(":").map(Number);
  return m * 60 + s;
};

function walkMindmap(node, visit, out = []) {
  out.push(node);
  visit(node);
  for (const child of node.children || []) walkMindmap(child, visit, out);
  return out;
}

function leaves(node, out = []) {
  if (!(node.children || []).length) out.push(node);
  for (const child of node.children || []) leaves(child, out);
  return out;
}

/**
 * @param {any} file محتوى ملف الوحدة
 * @param {{meta?: {id:number, slug:string, title:string, shortTitle:string, badge:string}}} [options]
 * @returns {string[]} قائمة الأخطاء (فارغة = ملف صالح)
 */
export function validateUnitFile(file, options = {}) {
  const errors = [];
  const fail = (msg) => errors.push(msg);

  if (!isRec(file)) return ["الملف ليس كائن JSON"];

  /* ── 1) الغلاف ── */
  if (file.schemaVersion !== 2) fail("schemaVersion يجب أن يكون 2");
  for (const key of [
    "unit",
    "lesson",
    "mindmap",
    "flashcards",
    "cloze",
    "quiz",
    "questionBank",
    "revision",
  ]) {
    if (!(key in file)) fail(`القسم «${key}» مفقود`);
  }
  if (errors.length > 0) return errors;

  /* ── 2) البيانات الوصفية ── */
  const u = file.unit;
  if (!Number.isInteger(u.id) || u.id < 1) fail("unit.id ليس عددًا صحيحًا موجبًا");
  if (!/^[a-z0-9-]+$/.test(u.slug ?? "")) fail("unit.slug يجب أن يكون لاتينيًا صغيرًا (a-z0-9-)");
  if (!isStr(u.title)) fail("unit.title فارغ");
  if (!isStr(u.shortTitle)) fail("unit.shortTitle فارغ");
  if (u.badge !== `الوحدة ${String(u.id).padStart(2, "0")}`) fail("unit.badge يجب أن يكون «الوحدة 01» شكلًا");
  if (u.mindmapImage && !/^\/lessons\/.+\.webp$/.test(u.mindmapImage)) {
    fail("unit.mindmapImage يجب أن يكون مسار webp داخل /lessons");
  }
  if (u.learningObjective !== undefined && String(u.learningObjective).length < 20) {
    fail("unit.learningObjective أقصر من أن يكون كفاءة مستهدفة");
  }

  if (options.meta) {
    const m = options.meta;
    if (m.id !== u.id) fail(`unit.id (${u.id}) لا يطابق units-meta (${m.id})`);
    for (const key of ["slug", "title", "shortTitle", "badge"]) {
      if (m[key] !== u[key]) fail(`unit.${key} لا يطابق units-meta («${u[key]}» ≠ «${m[key]}»)`);
    }
  }

  /* ── 3) الفيديو (اختياري) ── */
  if (u.video !== undefined) {
    const v = u.video;
    if (!["youtube", "vimeo", "file"].includes(v?.provider)) {
      fail("video.provider يجب أن يكون youtube أو vimeo أو file");
    } else {
      if (v.provider === "file") {
        if (!isStr(v.src)) fail("video.src مطلوب عند provider=file");
        if (!isStr(v.title)) fail("video.title مطلوب");
        if (!isStr(v.captions)) fail("video.captions مطلوب عند provider=file (تفريغ عربي)");
      } else {
        if (!isStr(v.id)) fail(`video.id مطلوب عند provider=${v.provider}`);
        if (!isStr(v.title)) fail("video.title مطلوب");
      }
    }
    if (v?.duration && !/^\d{1,2}:\d{2}$/.test(v.duration)) fail("video.duration بصيغة mm:ss");
    if (v?.chapters) {
      let previous = -1;
      for (const chapter of v.chapters) {
        if (!isStr(chapter?.title)) fail("فصل فيديو بلا عنوان");
        if (!/^\d{1,2}:\d{2}$/.test(chapter?.at ?? "")) {
          fail(`فصل فيديو بتوقيت غير صالح: ${chapter?.at}`);
          continue;
        }
        const seconds = timeToSeconds(chapter.at);
        if (seconds <= previous) fail(`فصول الفيديو غير مرتّبة أو مكرّرة عند ${chapter.at}`);
        previous = seconds;
      }
      if (v.duration && v.chapters.length > 0) {
        const last = timeToSeconds(v.chapters.at(-1).at);
        if (last >= timeToSeconds(v.duration)) fail("آخر فصل يقع بعد نهاية الفيديو");
      }
    }
  }

  /* ── 4) نصّ الدرس ── */
  const sections = file.lesson?.sections;
  if (!Array.isArray(sections) || sections.length === 0) {
    fail("lesson.sections فارغة");
  } else {
    const keys = new Set();
    for (const section of sections) {
      if (!/^[a-z0-9_]+$/.test(section?.key ?? "")) fail(`مفتاح محور غير صالح: ${section?.key}`);
      if (keys.has(section?.key)) fail(`مفتاح محور مكرّر: ${section?.key}`);
      keys.add(section?.key);
      if (!isStr(section?.title)) fail(`محور «${section?.key}» بلا عنوان عربي`);
      if (section?.content === undefined || section?.content === null) {
        fail(`محور «${section?.key}» بلا محتوى`);
      }
      if (String(section?.key).includes("methodolog")) {
        fail(`«${section.key}» قواعد منهجية: مكانها المراجعة السريعة لا محاور الدرس`);
      }
    }
  }

  /* ── 5) الخريطة الذهنية ── */
  const root = file.mindmap?.root;
  if (!isRec(root)) {
    fail("mindmap.root مفقود");
  } else {
    const all = walkMindmap(root, () => {});
    if (new Set(all.map((n) => n.id)).size !== all.length) fail("معرّفات عقد الخريطة غير فريدة");
    for (const node of all) {
      if (!isStr(node.id) || !isStr(node.label)) fail("عقدة خريطة بلا معرّف أو تسمية");
      for (const key of NON_CONCEPT_KEYS) {
        if (node[key] !== undefined) {
          fail(`عقدة «${node.id}» تحمل «${key}»: الخريطة عناصر مفهومية فقط`);
        }
      }
      for (const rx of ARABIC_MARK_DECORATION) {
        if (rx.test(node.label ?? "")) fail(`تسمية العقدة «${node.label}» تحمل زخرفة/ترقيمًا`);
      }
      if (node.details !== undefined && typeof node.details !== "string") {
        fail(`شرح العقدة «${node.id}» ليس نصًّا`);
      }
    }
    for (const leaf of leaves(root)) {
      if (!isStr(leaf.details)) fail(`العقدة الطرفية «${leaf.id}» بلا شرح`);
    }
  }

  /* ── 6) البطاقات ── */
  const cards = file.flashcards;
  if (!Array.isArray(cards) || cards.length === 0) fail("flashcards فارغة");
  else {
    const ids = new Set();
    for (const card of cards) {
      if (!isStr(String(card?.id ?? ""))) fail("بطاقة بلا معرّف");
      if (ids.has(String(card?.id))) fail(`معرّف بطاقة مكرّر: ${card?.id}`);
      ids.add(String(card?.id));
      if (!isStr(card?.question)) fail(`البطاقة ${card?.id}: وجه فارغ`);
      if (!isStr(card?.answer)) fail(`البطاقة ${card?.id}: ظهر فارغ`);
    }
  }

  /* ── 7) ملء الفراغات ── */
  if (!Array.isArray(file.cloze)) fail("cloze ليست قائمة");
  else {
    for (const item of file.cloze) {
      if (!isStr(item?.concept_title)) fail(`فراغ «${item?.id}» بلا عنوان مفهوم`);
      const masks = masksOf(item?.text_with_masks ?? "");
      if (masks.length === 0) fail(`فراغ «${item?.id}» بلا أقنعة {maskN}`);
      const keys = Object.keys(item?.answers ?? {});
      const same = masks.slice().sort().join() === keys.slice().sort().join();
      if (!same) fail(`فراغ «${item?.id}»: الأقنعة لا تطابق مفاتيح الإجابات`);
      for (const key of keys) {
        if (!isStr(item.answers[key])) fail(`فراغ «${item?.id}»: إجابة ${key} فارغة`);
      }
    }
  }

  /* ── 8) اختبار QCM ── */
  const quiz = file.quiz;
  if (!Array.isArray(quiz) || quiz.length === 0) fail("quiz فارغ");
  else {
    const ids = new Set();
    const texts = new Set();
    for (const q of quiz) {
      if (!isStr(q?.question_id)) fail("سؤال QCM بلا معرّف");
      if (ids.has(q?.question_id)) fail(`معرّف QCM مكرّر: ${q?.question_id}`);
      ids.add(q?.question_id);
      if (texts.has(q?.question)) fail(`سؤال QCM مكرّر: ${String(q?.question).slice(0, 40)}`);
      texts.add(q?.question);
      if (!Array.isArray(q?.options) || q.options.length !== 4) {
        fail(`QCM ${q?.question_id}: يجب أربعة خيارات`);
      } else {
        if (!q.options.includes(q.correct_answer)) {
          fail(`QCM ${q?.question_id}: الإجابة الصحيحة ليست بين الخيارات`);
        }
        if (new Set(q.options).size !== q.options.length) {
          fail(`QCM ${q?.question_id}: خيار مكرّر`);
        }
      }
      if (!isStr(q?.explanation)) fail(`QCM ${q?.question_id}: بلا تعليل`);
    }
  }

  /* ── 9) بنك الأسئلة ── */
  const bank = file.questionBank;
  if (!Array.isArray(bank) || bank.length === 0) fail("questionBank فارغ");
  else {
    const ids = new Set();
    for (const q of bank) {
      if (!isStr(q?.id)) fail("سؤال بنك بلا معرّف");
      if (ids.has(q?.id)) fail(`معرّف سؤال مكرّر: ${q?.id}`);
      ids.add(q?.id);
      if (!isStr(q?.question)) fail(`سؤال ${q?.id}: بلا نص`);
      if (!isStr(q?.modelAnswer)) fail(`سؤال ${q?.id}: بلا عناصر إجابة`);
      if (!isStr(q?.category)) fail(`سؤال ${q?.id}: بلا تصنيف داخلي`);
      for (const item of q?.scoringRubric ?? []) {
        if (!isStr(item?.criterion) || typeof item?.points !== "number") {
          fail(`سؤال ${q?.id}: بند سلم تنقيط غير صالح`);
        }
      }
    }
  }

  /* ── 10) المراجعة السريعة ── */
  const revision = file.revision;
  if (!isRec(revision)) fail("revision مفقودة");
  else {
    for (const groupKey of ["lastMinute", "summary"]) {
      const groups = revision[groupKey];
      if (!Array.isArray(groups)) fail(`revision.${groupKey} ليست قائمة`);
      else {
        for (const group of groups) {
          if (!isStr(group?.title)) fail(`revision.${groupKey}: مجموعة بلا عنوان`);
          if (!Array.isArray(group?.items) || group.items.length === 0) {
            fail(`revision.${groupKey} :: ${group?.title}: بلا بنود`);
          }
        }
      }
    }
    if (!Array.isArray(revision.rules)) fail("revision.rules ليست قائمة");
    else {
      for (const rule of revision.rules) {
        if (!isStr(rule) || rule.length < 10) fail("قاعدة منهجية فارغة أو مبتورة");
      }
    }
    for (const row of revision.differentiation ?? []) {
      if (!isStr(row?.termA) || !isStr(row?.termB) || !isStr(row?.distinction)) {
        fail(`revision.differentiation :: ${row?.id}: صف ناقص`);
      }
    }
    for (const item of revision.previousBac ?? []) {
      if (!isStr(item?.session) || !isStr(item?.question) || !isStr(item?.answer)) {
        fail("revision.previousBac: عنصر ناقص");
      }
    }
  }

  /* ── 11) الشواهد ── */
  for (const proof of file.proofs ?? []) {
    if (!isStr(proof?.id)) fail("شاهد بلا معرّف");
    if (!isStr(proof?.text)) fail(`شاهد ${proof?.id}: بلا نص`);
  }

  /* ── 12) قواعد المحتوى الثابتة ── */
  const raw = JSON.stringify(file);
  if (raw.includes("ورش")) fail("الملف يحمل «ورش» — نُسب نصّ شرعي إلى رواية، وهو ممنوع");
  if (/[A-Za-z]{4,}/.test(u.title ?? "")) fail("unit.title يحمل نصًّا لاتينيًا داخل واجهة عربية");

  return errors;
}

/** ملخّص عددي لعرضه في الطرفية */
export function summarizeUnitFile(file) {
  return {
    id: file?.unit?.id,
    sections: file?.lesson?.sections?.length ?? 0,
    cards: file?.flashcards?.length ?? 0,
    cloze: file?.cloze?.length ?? 0,
    quiz: file?.quiz?.length ?? 0,
    bank: file?.questionBank?.length ?? 0,
    proofs: file?.proofs?.length ?? 0,
    video: file?.unit?.video?.provider ?? "—",
  };
}
