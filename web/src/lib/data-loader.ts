/**
 * تحميل الوحدات — **ملف واحد لكل وحدة**.
 *
 * قبل ذلك كانت الوحدة موزّعة على خمسة ملفات (standard/advanced/mindmap/quiz/
 * questions) يفهم المُطبّع أشكالها المختلفة، فكانت إضافة وحدة تحتاج خمسة ملفات
 * متزامنة وأربعة مخططات. الآن: `src/data/units/unit-0X.json` واحد يطابق
 * `src/data/schema/unit.schema.json`، والمُطبّع هنا مجرّد «ترطيب» (hydrate)
 * ينقل الحقول إلى أنواع التطبيق — بلا تخمين ولا فروع.
 *
 * ملفات JSON تُستورد خادميًا فقط؛ العميل يتلقّى الناتج المطبّع عبر الخصائص.
 */
import type {
  MindmapNode,
  NormalizedCloze,
  NormalizedFlashcard,
  NormalizedQuestion,
  NormalizedUnit,
  QuizQuestion,
  RevisionContent,
  UnitProof,
  UnitSourceMeta,
  UnitVideo,
  LessonSection,
} from "./types";
import { UNITS_META } from "./units-meta";

import unit01 from "@/data/units/unit-01.json";
import unit02 from "@/data/units/unit-02.json";
import unit03 from "@/data/units/unit-03.json";
import unit04 from "@/data/units/unit-04.json";

/** شكل الملف الواحد كما يعرّفه `src/data/schema/unit.schema.json` */
export interface UnitFile {
  $schema?: string;
  schemaVersion: number;
  source?: UnitSourceMeta;
  unit: {
    id: number;
    slug: string;
    title: string;
    shortTitle: string;
    badge: string;
    field?: string;
    timeAllocation?: string;
    targetAudience?: string;
    learningObjective?: string;
    mindmapImage?: string;
    video?: UnitVideo;
  };
  lesson: { sections: LessonSection[] };
  mindmap: { root: MindmapNode };
  flashcards: NormalizedFlashcard[];
  cloze: NormalizedCloze[];
  quiz: QuizQuestion[];
  questionBank: NormalizedQuestion[];
  revision: RevisionContent;
  proofs?: UnitProof[];
}

const FILES = [unit01, unit02, unit03, unit04] as unknown as UnitFile[];

/** يتحقّق أن الملف يحمل الحدّ الأدنى قبل أن يصبح وحدة معروضة */
function assertUnitFile(file: UnitFile, meta: (typeof UNITS_META)[number]): void {
  const problems: string[] = [];
  if (!file.unit) problems.push("unit مفقود");
  if (file.unit?.id !== meta.id) problems.push(`المعرّف ${file.unit?.id} لا يطابق الفهرس (${meta.id})`);
  if (!file.lesson?.sections?.length) problems.push("لا محاور في lesson.sections");
  if (!file.mindmap?.root) problems.push("لا خريطة في mindmap.root");
  if (!file.quiz?.length) problems.push("لا أسئلة QCM");
  if (!file.questionBank?.length) problems.push("لا أسئلة في questionBank");
  if (problems.length > 0) {
    throw new Error(`ملف الوحدة ${file.unit?.slug ?? "?"} غير صالح:\n- ${problems.join("\n- ")}`);
  }
}

function hydrate(file: UnitFile): NormalizedUnit {
  const meta = UNITS_META.find((u) => u.id === file.unit.id);
  if (!meta) throw new Error(`وحدة غير معرّفة في units-meta: ${file.unit.id}`);
  assertUnitFile(file, meta);

  const u = file.unit;

  return {
    ...meta,
    schemaVersion: file.schemaVersion,
    source: file.source,
    video: u.video,
    proofs: file.proofs,
    field: u.field ?? "العلوم الإسلامية",
    timeAllocation: u.timeAllocation ?? "ساعتان",
    targetAudience: u.targetAudience ?? "جميع الشعب",
    learningObjective: u.learningObjective ?? "",
    mindmapImage: u.mindmapImage ?? `/lessons/unit${String(u.id).padStart(2, "0")}_mindmap.webp`,
    mindmapRoot: file.mindmap.root,
    flashcards: file.flashcards,
    clozeItems: file.cloze,
    questions: file.questionBank,
    quizQuestions: file.quiz,
    sections: file.lesson.sections,
    revision: file.revision,
  };
}

export const UNITS: NormalizedUnit[] = FILES.map(hydrate);

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
