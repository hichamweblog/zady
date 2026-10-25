import type {
  DifferentiationRow,
  LessonSection,
  MindmapNode,
  NormalizedCloze,
  NormalizedFlashcard,
  NormalizedQuestion,
  NormalizedUnit,
  PreviousBacItem,
  QuizQuestion,
  RevisionContent,
} from "./types";
import { UNITS_META } from "./units-meta";
import { resolveSectionTitle } from "./section-titles";

// ─── ملفات الوحدات (خادمية فقط: لا تُستورد في مكوّنات العميل) ───
import u1_std from "@/data/lessons/unit01_aqidah_standard.json";
import u1_adv from "@/data/lessons/unit01_aqidah_advanced.json";
import u1_mm from "@/data/lessons/unit01_aqidah_mindmap.json";
import u1_q from "@/data/lessons/unit01_aqidah_questions.json";
import u1_quiz from "@/data/lessons/unit01_aqidah_quiz.json";

import u2_std from "@/data/lessons/unit02_quran_means_standard.json";
import u2_adv from "@/data/lessons/unit02_quran_means_advanced.json";
import u2_mm from "@/data/lessons/unit02_quran_means_mindmap.json";
import u2_q from "@/data/lessons/unit02_quran_means_questions.json";
import u2_quiz from "@/data/lessons/unit02_quran_means_quiz.json";

import u3_std from "@/data/lessons/unit03_islam_messages_standard.json";
import u3_adv from "@/data/lessons/unit03_islam_messages_advanced.json";
import u3_mm from "@/data/lessons/unit03_islam_messages_mindmap.json";
import u3_q from "@/data/lessons/unit03_islam_messages_questions.json";
import u3_quiz from "@/data/lessons/unit03_islam_messages_quiz.json";

import u4_std from "@/data/lessons/unit04_intellect_standard.json";
import u4_adv from "@/data/lessons/unit04_intellect_advanced.json";
import u4_mm from "@/data/lessons/unit04_intellect_mindmap.json";
import u4_q from "@/data/lessons/unit04_intellect_questions.json";
import u4_quiz from "@/data/lessons/unit04_intellect_quiz.json";

/* ─────────────────────────── أدوات مساعدة ─────────────────────────── */

type Raw = Record<string, unknown>;
type UnknownRecord = Record<string, unknown>;

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** أول نص غير فارغ من القائمة */
function pickString(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return "";
}

/** يحوّل أي شكل (نص / مصفوفة / كائن) إلى قائمة نصوص */
function toStringList(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (typeof value === "number") return [String(value)];
  if (Array.isArray(value)) return value.flatMap(toStringList);
  if (isRecord(value)) return Object.values(value).flatMap(toStringList);
  return [];
}

/**
 * الإجابة النموذجية: كانت الأسئلة تستخدم 6 مفاتيح مختلفة
 * (model_answer / answer / model_answers / official_solution / solution / guidance)
 * وكان المُطبّع القديم يقرأ اثنين فقط، فظهرت 24 بطاقة بجواب فارغ.
 * كما أن `model_answer` قد يكون كائنًا بمفاتيح عربية الدلالة
 * (linguistic / idiomatic / concept / rule …) لا نصًّا.
 */
const ANSWER_LABELS: Record<string, string> = {
  linguistic: "التعريف اللغوي",
  idiomatic: "التعريف الاصطلاحي",
  relationship: "العلاقة بين المعنيين",
  concept: "المفهوم",
  rule: "الضابط المنهجي",
  definition: "التعريف",
  explanation: "الشرح",
  effect: "الأثر",
  classification: "التصنيف",
  evidence: "الدليل",
};

function formatAnswerValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        const text = formatAnswerValue(item);
        return text ? `${index + 1}. ${text}` : "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, nested]) => {
        const text = formatAnswerValue(nested);
        const label = ANSWER_LABELS[key] ?? key;
        return text ? `${label}: ${text}` : "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function formatModelAnswer(raw: Raw): string {
  // 1) نص مباشر
  for (const key of ["model_answer", "answer", "official_solution", "solution"] as const) {
    const value = raw[key];
    const text = typeof value === "string" ? value.trim() : value ? formatAnswerValue(value) : "";
    if (text) return text;
  }

  // 2) سؤال بمعيار متعدد مضمّن في البيانات (model_answers كمصفوفة)
  if (Array.isArray(raw.model_answers)) {
    const lines = raw.model_answers
      .map((item, i) => {
        if (typeof item === "string") return `${i + 1}. ${item}`;
        if (!isRecord(item)) return "";
        const title =
          pickString(item.effect, item.answer, item.text) || `الخيار ${item.option ?? i + 1}`;
        const anchor = pickString(item.anchor_phrase);
        return `${i + 1}. ${title}${anchor ? `\n   محل الشاهد: ${anchor}` : ""}`;
      })
      .filter(Boolean);
    if (lines.length > 0) return lines.join("\n");
  }

  if (isRecord(raw.model_answers)) {
    return formatAnswerValue(raw.model_answers);
  }

  return "";
}

/** هل البطاقة سؤال استخراج من نص شرعي؟ */
function isExtractionQuestion(raw: Raw): boolean {
  return Boolean(
    raw.text_warsh || raw.verse_text || raw.ayah_text_warsh || raw.target_effect || raw.target_means
  );
}

/** يبني إجابة موضوعية لأسئلة الاستخراج التي لا تحمل جوابًا صريحًا */
function buildExtractionAnswer(raw: Raw): string {
  const lines: string[] = [];
  const target = pickString(raw.target_effect, raw.target_means);
  if (target) lines.push(`الفائدة / الأثر المستخرج: ${target}`);

  const classification = pickString(raw.category);
  if (classification && /الفرد|المجتمع/.test(classification) && classification.length < 60) {
    lines.push(`التصنيف: ${classification}`);
  }

  const anchor = pickString(raw.anchor_phrase);
  if (anchor) lines.push(`محل الشاهد: ${anchor}`);

  const keywords = asArray(raw.keywords).filter((k): k is string => typeof k === "string");
  if (keywords.length > 0) lines.push(`الكلمات المفتاحية: ${keywords.join("، ")}`);

  const guidance = pickString(raw.guidance);
  if (guidance) lines.push(`توجيه الإجابة: ${guidance}`);

  return lines.join("\n");
}

function buildReference(raw: Raw): string {
  const surah = pickString(raw.surah);
  const ayah = raw.ayah_number;
  if (surah && (typeof ayah === "number" || typeof ayah === "string")) {
    return `[${surah}: ${String(ayah)}]`;
  }
  return surah ? `[${surah}]` : "";
}

function normalizeRubric(value: unknown): NormalizedQuestion["scoringRubric"] {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .filter(isRecord)
    .map((r) => ({
      criterion: pickString(r.criterion, r.item, r.label),
      points: typeof r.points === "number" ? r.points : Number(r.points) || 0,
    }))
    .filter((r) => r.criterion.length > 0);
  return items.length > 0 ? items : undefined;
}

/** يطبّع سؤالًا واحدًا أيًّا كان مخطط ملفه الأصلي */
function normalizeQuestion(
  raw: Raw,
  fallbackCategory: string,
  index: number,
  extractionPrompt: string
): NormalizedQuestion {
  const text = pickString(raw.text_proof, raw.text_warsh, raw.verse_text, raw.ayah_text_warsh);
  const reference = buildReference(raw);
  const explicitQuestion = pickString(raw.question_text, raw.question);

  // أسئلة الاستخراج لا تحمل نص سؤال: نبني سؤالًا محايدًا لا يكشف الإجابة
  const question = explicitQuestion || (text ? extractionPrompt : "سؤال من بنك الوحدة");

  // أسئلة الاستخراج: نبني إجابة تركيبية (الفائدة + التصنيف + محل الشاهد) ولا نكتفي بـ guidance
  const composedAnswer = isExtractionQuestion(raw) ? buildExtractionAnswer(raw) : "";
  const modelAnswer = composedAnswer || formatModelAnswer(raw);

  const officialMarks =
    typeof raw.official_marks === "number"
      ? raw.official_marks
      : typeof raw.official_marks === "string" && raw.official_marks.trim() !== ""
        ? Number(raw.official_marks)
        : undefined;

  // في أسئلة الاستخراج يعني حقل category «التصنيف» (على الفرد/المجتمع) وليس تصنيف البنك
  const rawCategory = pickString(raw.category);
  const categoryIsClassification =
    isExtractionQuestion(raw) && /الفرد|المجتمع/.test(rawCategory) && rawCategory.length < 60;

  return {
    id: pickString(raw.question_id, raw.id) || `${fallbackCategory}-${index + 1}`,
    category: categoryIsClassification ? fallbackCategory : rawCategory || fallbackCategory,
    type: pickString(raw.type) || undefined,
    question,
    modelAnswer: modelAnswer || "لم تُرفَق إجابة نموذجية لهذا السؤال بعد.",
    scoringRubric: normalizeRubric(raw.scoring_rubric),
    officialMarks: Number.isFinite(officialMarks) ? officialMarks : undefined,
    examinerNotes: pickString(raw.examiner_notes) || undefined,
    text: text || undefined,
    reference: reference || undefined,
    anchor: pickString(raw.anchor_phrase) || undefined,
    session: pickString(raw.session) || undefined,
  };
}

/** يستخرج الأسئلة من أي مخطط: تصنيفات متداخلة أو مصفوفة مسطحة أو مجموعات مسماة */
function normalizeQuestions(raw: unknown, extractionPrompt: string): NormalizedQuestion[] {
  if (!isRecord(raw)) return [];
  const out: NormalizedQuestion[] = [];

  const pushList = (list: unknown, category: string) => {
    asArray(list).forEach((q, i) => {
      if (isRecord(q)) out.push(normalizeQuestion(q, category, i, extractionPrompt));
    });
  };

  // 1) مخطط «categories → questions» (الوحدة 01)
  if (Array.isArray(raw.categories)) {
    for (const cat of raw.categories) {
      if (!isRecord(cat)) continue;
      pushList(cat.questions, pickString(cat.category_name) || "أسئلة عامة");
    }
  }

  // 2) مخطط «questions» مسطّح (الوحدتان 02 و03)
  if (Array.isArray(raw.questions)) {
    pushList(raw.questions, "أسئلة عامة");
  }

  // 3) مجموعات مسماة (الوحدة 04)
  const GROUP_LABELS: Record<string, string> = {
    questions_group_1_direct: "الأسئلة المباشرة والمفاهيمية",
    questions_group_2_understanding_reasoning: "أسئلة الفهم والاستنتاج",
    questions_group_3_bac_official: "أسئلة البكالوريا الرسمية السابقة",
    questions_group_4_text_extraction_warsh: "تطبيقات الاستخراج وتحليل النصوص",
  };
  for (const [key, label] of Object.entries(GROUP_LABELS)) {
    if (Array.isArray(raw[key])) pushList(raw[key], label);
  }

  // إزالة التكرار مع الحفاظ على الترتيب
  const seen = new Set<string>();
  return out.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}

function extractFlashcards(rawAdv: unknown): NormalizedFlashcard[] {
  if (!isRecord(rawAdv)) return [];
  const key = Object.keys(rawAdv).find((k) => k.includes("flashcards"));
  const list = key ? asArray(rawAdv[key]) : [];
  return list
    .filter(isRecord)
    .map((c, index) => ({
      id:
        (typeof c.card_id === "string" && c.card_id) ||
        (typeof c.id === "string" && c.id) ||
        `card_${index + 1}`,
      question: pickString(c.front, c.q, c.question),
      answer: pickString(c.back, c.a, c.answer),
      section: pickString(c.section) || undefined,
      category: pickString(c.category) || undefined,
    }))
    .filter((c) => c.question.length > 0 && c.answer.length > 0);
}

function extractCloze(rawAdv: unknown): NormalizedCloze[] {
  if (!isRecord(rawAdv)) return [];
  const nodes = asArray(rawAdv.concept_nodes).filter(isRecord);
  const result: NormalizedCloze[] = [];
  for (const node of nodes) {
    const cloze = node.cloze_active_recall;
    if (!isRecord(cloze)) continue;
    const text = pickString(cloze.text_with_masks);
    if (!text) continue;
    const answers: Record<string, string> = {};
    if (isRecord(cloze.answers)) {
      for (const [k, v] of Object.entries(cloze.answers)) {
        if (typeof v === "string") answers[k] = v;
      }
    }
    result.push({
      id: pickString(node.concept_id) || `cloze_${result.length + 1}`,
      concept_id: pickString(node.concept_id),
      concept_title: pickString(node.concept_title, node.official_term) || "مفهوم أساسي",
      text_with_masks: text,
      answers,
      category: pickString(node.category) || undefined,
      prohibited_synonyms: asArray(node.prohibited_synonyms).filter(
        (s): s is string => typeof s === "string"
      ),
    });
  }
  return result;
}

/* ─────────────────────────── التبويبات الجديدة ─────────────────────────── */

const SUMMARY_LABELS: Record<string, string> = {
  definitions: "التعريفات الأساسية",
  tawheed_types: "أقسام التوحيد",
  effects_on_individual_list: "آثار العقيدة على الفرد",
  effects_on_society_list: "آثار العقيدة على المجتمع",
  causes_summary: "أسباب الانحراف (ملخص)",
  means_summary: "وسائل تثبيت العقيدة (ملخص)",
  islam_definitions: "تعريف الإسلام (عام / خاص)",
  judaism_summary: "الرسالة اليهودية (ملخص)",
  christianity_summary: "الرسالة النصرانية (ملخص)",
  final_message_summary: "الرسالة الخاتمة (ملخص)",
  definition: "التعريف",
  importance: "الأهمية والمكانة",
  role_in_filtering: "دور العقل في التمييز",
  limits: "الحدود والمجالات",
  protection: "حفظ العقل",
};

const LAST_MINUTE_LABELS: Record<string, string> = {
  unit_summary_in_60_seconds: "ملخص الوحدة في 60 ثانية",
  top_3_golden_rules_for_bac: "القواعد الذهبية الثلاث للبكالوريا",
  must_know_means: "وسائل لا بد من حفظها",
  must_know_definitions: "تعريفات لا بد من حفظها",
  prohibited_mistakes: "أخطاء يمنع الوقوع فيها",
};

function buildRevision(std: unknown, adv: unknown): RevisionContent {
  const s = isRecord(std) ? std : {};
  const a = isRecord(adv) ? adv : {};

  const lastMinuteRaw = isRecord(a.last_minute_revision_schema)
    ? a.last_minute_revision_schema
    : {};
  const lastMinute = Object.entries(lastMinuteRaw)
    .map(([key, value], i) => ({
      title: LAST_MINUTE_LABELS[key] ?? `محور المراجعة ${i + 1}`,
      items: toStringList(value),
    }))
    .filter((group) => group.items.length > 0);

  const summaryRaw = isRecord(s.summary_for_memorization) ? s.summary_for_memorization : {};
  const summary = Object.entries(summaryRaw)
    .map(([key, value], i) => ({
      title: SUMMARY_LABELS[key] ?? `ملخص ${i + 1}`,
      items: toStringList(value),
    }))
    .filter((group) => group.items.length > 0);

  const methodology = isRecord(s.methodology_and_rules) ? s.methodology_and_rules : {};
  /**
   * «القواعد والضوابط المنهجية» ليست محورًا دراسيًا؛ مكانها الطبيعي هنا في
   * المراجعة السريعة. والنص في البيانات يبدأ بـ«⚠️ قاعدة 1:» بينما الواجهة
   * ترقّم القواعد بنفسها ⇒ ننزع البادئة والرمز لتفادي الترقيم المزدوج.
   */
  const rules = Array.isArray(methodology.rules)
    ? toStringList(methodology.rules)
    : toStringList(methodology);
  const cleanedRules = rules.map((rule) =>
    rule
      .replace(/^\s*\u26A0\uFE0F?\s*/u, "")
      .replace(/^\s*(?:القاعدة|قاعدة)\s*\d+\s*[:.)\-–]\s*/u, "")
      .trim()
  );

  const differentiation: DifferentiationRow[] = asArray(a.differentiation_matrix)
    .filter(isRecord)
    .map((row, i) => ({
      id: pickString(row.diff_id) || `diff_${i + 1}`,
      termA: pickString(row.term_a),
      termB: pickString(row.term_b),
      distinction: pickString(row.key_distinction),
      pitfall: pickString(row.pitfall, row.common_pitfall) || undefined,
      examinerWarning: pickString(row.examiner_warning) || undefined,
    }))
    .filter((row) => row.termA && row.termB && row.distinction);

  const previousBac: PreviousBacItem[] = asArray(s.previous_bac_questions)
    .filter(isRecord)
    .map((q) => ({
      session: pickString(q.bac_year) || "بكالوريا سابقة",
      question: pickString(q.question),
      answer: pickString(q.answer),
    }))
    .filter((q) => q.question && q.answer);

  return {
    lastMinute,
    summary,
    rules: cleanedRules.filter((rule) => rule.length > 0),
    differentiation,
    previousBac,
  };
}

function buildSections(std: unknown): LessonSection[] {
  const s = isRecord(std) ? std : {};
  const detailed = isRecord(s.detailed_explanation) ? s.detailed_explanation : {};
  return Object.entries(detailed).map(([key, content], i) => ({
    key,
    title: resolveSectionTitle(key, i + 1, isRecord(content) ? content.title : undefined),
    content,
  }));
}

/* ─────────────────────────── بناء الوحدات ─────────────────────────── */

interface UnitSource {
  id: number;
  std: unknown;
  adv: unknown;
  mm: unknown;
  questions: unknown;
  quiz: unknown;
  mindmapImage: string;
  extractionPrompt: string;
}

const SOURCES: UnitSource[] = [
  {
    id: 1,
    std: u1_std,
    adv: u1_adv,
    mm: u1_mm,
    questions: u1_q,
    quiz: u1_quiz,
    mindmapImage: "/lessons/unit01_mindmap.webp",
    extractionPrompt:
      "استخرج من النص الشرعي التالي أثر العقيدة الإسلامية الوارد فيه، ثم صنّفه (أثر على الفرد / أثر على المجتمع)، مع تحديد محل الشاهد.",
  },
  {
    id: 2,
    std: u2_std,
    adv: u2_adv,
    mm: u2_mm,
    questions: u2_q,
    quiz: u2_quiz,
    mindmapImage: "/lessons/unit02_mindmap.webp",
    extractionPrompt:
      "استخرج من النص الشرعي التالي وسيلة القرآن الكريم في تثبيت العقيدة الإسلامية، مع تحديد محل الشاهد والكلمات المفتاحية الدالة عليها.",
  },
  {
    id: 3,
    std: u3_std,
    adv: u3_adv,
    mm: u3_mm,
    questions: u3_q,
    quiz: u3_quiz,
    mindmapImage: "/lessons/unit03_mindmap.webp",
    extractionPrompt:
      "استخرج من النص الشرعي التالي الفائدة المتعلقة بالرسالات السماوية، مع تحديد محل الشاهد.",
  },
  {
    id: 4,
    std: u4_std,
    adv: u4_adv,
    mm: u4_mm,
    questions: u4_q,
    quiz: u4_quiz,
    mindmapImage: "/lessons/unit04_mindmap.webp",
    extractionPrompt: "استخرج من النص الشرعي التالي فائدة تخص العقل، مع تحديد محل الشاهد.",
  },
];

function buildUnit(src: UnitSource): NormalizedUnit {
  const meta = UNITS_META.find((u) => u.id === src.id);
  if (!meta) throw new Error(`وحدة غير معرّفة في units-meta: ${src.id}`);

  const std = isRecord(src.std) ? src.std : {};
  const mm = isRecord(src.mm) ? src.mm : {};
  const quiz = isRecord(src.quiz) ? src.quiz : {};

  return {
    ...meta,
    field: pickString(std.field) || "العلوم الإسلامية",
    timeAllocation: pickString(std.time_allocation) || "ساعتان",
    targetAudience: pickString(std.target_audience) || "جميع الشعب",
    learningObjective: pickString(std.learning_objective),
    mindmapImage: src.mindmapImage,
    mindmapRoot: mm.root as MindmapNode,
    flashcards: extractFlashcards(src.adv),
    clozeItems: extractCloze(src.adv),
    questions: normalizeQuestions(src.questions, src.extractionPrompt),
    quizQuestions: asArray(quiz.questions) as QuizQuestion[],
    sections: buildSections(src.std),
    revision: buildRevision(src.std, src.adv),
  };
}

export const UNITS: NormalizedUnit[] = SOURCES.map(buildUnit);

export function getAllUnits(): NormalizedUnit[] {
  return UNITS;
}

export function getUnitById(id: number): NormalizedUnit | undefined {
  return UNITS.find((u) => u.id === id);
}

export function getUnitTotals() {
  return UNITS.reduce(
    (acc, u) => ({
      units: acc.units + 1,
      flashcards: acc.flashcards + u.flashcards.length,
      cloze: acc.cloze + u.clozeItems.length,
      questions: acc.questions + u.questions.length,
      quiz: acc.quiz + u.quizQuestions.length,
    }),
    { units: 0, flashcards: 0, cloze: 0, questions: 0, quiz: 0 }
  );
}
