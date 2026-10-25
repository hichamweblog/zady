import {
  NormalizedUnit,
  NormalizedFlashcard,
  NormalizedCloze,
  NormalizedQuestion,
  MindmapNode,
  QuizQuestion,
  StandardUnitData,
  AdvancedUnitData,
} from "./types";

// Unit 1 JSONs
import u1_std from "@/data/lessons/unit01_aqidah_standard.json";
import u1_adv from "@/data/lessons/unit01_aqidah_advanced.json";
import u1_mm from "@/data/lessons/unit01_aqidah_mindmap.json";
import u1_q from "@/data/lessons/unit01_aqidah_questions.json";
import u1_quiz from "@/data/lessons/unit01_aqidah_quiz.json";

// Unit 2 JSONs
import u2_std from "@/data/lessons/unit02_quran_means_standard.json";
import u2_adv from "@/data/lessons/unit02_quran_means_advanced.json";
import u2_mm from "@/data/lessons/unit02_quran_means_mindmap.json";
import u2_q from "@/data/lessons/unit02_quran_means_questions.json";
import u2_quiz from "@/data/lessons/unit02_quran_means_quiz.json";

// Unit 3 JSONs
import u3_std from "@/data/lessons/unit03_islam_messages_standard.json";
import u3_adv from "@/data/lessons/unit03_islam_messages_advanced.json";
import u3_mm from "@/data/lessons/unit03_islam_messages_mindmap.json";
import u3_q from "@/data/lessons/unit03_islam_messages_questions.json";
import u3_quiz from "@/data/lessons/unit03_islam_messages_quiz.json";

// Unit 4 JSONs
import u4_std from "@/data/lessons/unit04_intellect_standard.json";
import u4_adv from "@/data/lessons/unit04_intellect_advanced.json";
import u4_mm from "@/data/lessons/unit04_intellect_mindmap.json";
import u4_q from "@/data/lessons/unit04_intellect_questions.json";
import u4_quiz from "@/data/lessons/unit04_intellect_quiz.json";

function formatModelAnswer(ans: any): string {
  if (typeof ans === "string") return ans;
  if (!ans || typeof ans !== "object") return "";
  return Object.entries(ans)
    .map(([key, val]) => {
      let label = key;
      if (key === "linguistic") label = "التعريف اللغوي";
      else if (key === "idiomatic") label = "التعريف الاصطلاحي";
      else if (key === "relationship") label = "العلاقة بينهما";
      return `• ${label}: ${val}`;
    })
    .join("\n\n");
}

function normalizeUnit1Questions(raw: any): NormalizedQuestion[] {
  const result: NormalizedQuestion[] = [];
  if (raw.categories && Array.isArray(raw.categories)) {
    for (const cat of raw.categories) {
      if (cat.questions && Array.isArray(cat.questions)) {
        for (const q of cat.questions) {
          result.push({
            id: q.question_id || String(Math.random()),
            category: cat.category_name || "أسئلة عامة",
            type: q.type,
            question: q.question_text || q.question || "",
            modelAnswer: formatModelAnswer(q.model_answer || q.answer),
            scoringRubric: q.scoring_rubric,
            examinerNotes: q.examiner_notes,
            ayahText: q.ayah_text,
          });
        }
      }
    }
  }
  return result;
}

function normalizeUnit2Questions(raw: any): NormalizedQuestion[] {
  const result: NormalizedQuestion[] = [];
  if (raw.questions && Array.isArray(raw.questions)) {
    for (const q of raw.questions) {
      result.push({
        id: q.id || String(Math.random()),
        category: q.category || "أسئلة عامة",
        type: q.type,
        question: q.question_text || q.question || "",
        modelAnswer: formatModelAnswer(q.answer || q.model_answer),
        scoringRubric: q.scoring_rubric,
        examinerNotes: q.examiner_notes,
      });
    }
  }
  return result;
}

function normalizeUnit3Questions(raw: any): NormalizedQuestion[] {
  const result: NormalizedQuestion[] = [];
  if (raw.questions && Array.isArray(raw.questions)) {
    for (const q of raw.questions) {
      result.push({
        id: q.question_id || String(Math.random()),
        category: q.category || "أسئلة فهم ومقارنة",
        section: q.section,
        question: q.question || q.question_text || "",
        modelAnswer: formatModelAnswer(q.answer || q.model_answer),
        scoringRubric: q.scoring_rubric,
        examinerNotes: q.examiner_notes,
      });
    }
  }
  return result;
}

function normalizeUnit4Questions(raw: any): NormalizedQuestion[] {
  const result: NormalizedQuestion[] = [];
  const groups: Record<string, string> = {
    questions_group_1_direct: "الأسئلة المباشرة والمفاهيمية",
    questions_group_2_understanding_reasoning: "أسئلة الفهم والاستنتاج",
    questions_group_3_bac_official: "أسئلة البكالوريا الرسمية السابقة",
    questions_group_4_text_extraction_warsh: "تطبيقات الاستخراج وتحليل النصوص",
  };

  for (const [key, catName] of Object.entries(groups)) {
    const list = raw[key];
    if (list && Array.isArray(list)) {
      for (const q of list) {
        result.push({
          id: q.id || String(Math.random()),
          category: catName,
          type: q.type,
          question: q.question_text || q.question || "",
          modelAnswer: formatModelAnswer(q.model_answer || q.answer),
          scoringRubric: q.scoring_rubric,
          examinerNotes: q.examiner_notes,
        });
      }
    }
  }
  return result;
}

function extractFlashcards(rawAdv: any): NormalizedFlashcard[] {
  const rawList =
    rawAdv.all_49_flashcards ||
    rawAdv.all_34_flashcards ||
    rawAdv.all_flashcards ||
    rawAdv.flashcards ||
    [];

  return rawList.map((c: any, index: number) => ({
    id: c.card_id || c.id || `card_${index + 1}`,
    question: c.front || c.q || c.question || "",
    answer: c.back || c.a || c.answer || "",
    section: c.section,
    category: c.category,
  }));
}

function extractCloze(rawAdv: any): NormalizedCloze[] {
  const result: NormalizedCloze[] = [];
  if (rawAdv.concept_nodes && Array.isArray(rawAdv.concept_nodes)) {
    for (const cn of rawAdv.concept_nodes) {
      if (cn.cloze_active_recall) {
        result.push({
          id: cn.concept_id || `cloze_${result.length + 1}`,
          concept_id: cn.concept_id,
          concept_title: cn.concept_title || "",
          text_with_masks: cn.cloze_active_recall.text_with_masks,
          answers: cn.cloze_active_recall.answers || {},
          category: cn.category,
          prohibited_synonyms: cn.prohibited_synonyms,
        });
      }
    }
  }
  return result;
}

export const UNITS: NormalizedUnit[] = [
  {
    id: 1,
    slug: "aqidah",
    title: "الوحدة 01: العقيدة الإسلامية وأثرها على الفرد والمجتمع",
    shortTitle: "العقيدة الإسلامية وأثرها",
    badge: "الوحدة 01",
    field: u1_std.field || "العقيدة والفكر الإسلامي",
    timeAllocation: u1_std.time_allocation || "ساعتان",
    targetAudience: u1_std.target_audience || "جميع الشعب",
    learningObjective: u1_std.learning_objective || "",
    mindmapImage: "/lessons/unit01_mindmap.png",
    mindmapRoot: u1_mm.root as MindmapNode,
    flashcards: extractFlashcards(u1_adv),
    clozeItems: extractCloze(u1_adv),
    questions: normalizeUnit1Questions(u1_q),
    quizQuestions: (u1_quiz.questions as QuizQuestion[]) || [],
    standardData: u1_std as unknown as StandardUnitData,
    advancedData: u1_adv as unknown as AdvancedUnitData,
  },
  {
    id: 2,
    slug: "quran-means",
    title: "الوحدة 02: وسائل القرآن الكريم في تثبيت العقيدة الإسلامية",
    shortTitle: "وسائل القرآن في تثبيت العقيدة",
    badge: "الوحدة 02",
    field: u2_std.field || "القرآن الكريم وعلومه",
    timeAllocation: u2_std.time_allocation || "ساعتان",
    targetAudience: u2_std.target_audience || "جميع الشعب",
    learningObjective: u2_std.learning_objective || "",
    mindmapImage: "/lessons/unit02_mindmap.png",
    mindmapRoot: u2_mm.root as MindmapNode,
    flashcards: extractFlashcards(u2_adv),
    clozeItems: extractCloze(u2_adv),
    questions: normalizeUnit2Questions(u2_q),
    quizQuestions: (u2_quiz.questions as QuizQuestion[]) || [],
    standardData: u2_std as unknown as StandardUnitData,
    advancedData: u2_adv as unknown as AdvancedUnitData,
  },
  {
    id: 3,
    slug: "islam-messages",
    title: "الوحدة 03: الإسلام والرسالات السماوية",
    shortTitle: "الإسلام والرسالات السماوية",
    badge: "الوحدة 03",
    field: u3_std.field || "العقيدة والرسالات",
    timeAllocation: u3_std.time_allocation || "3 ساعات",
    targetAudience: u3_std.target_audience || "جميع الشعب",
    learningObjective: u3_std.learning_objective || "",
    mindmapImage: "/lessons/unit03_mindmap.png",
    mindmapRoot: u3_mm.root as MindmapNode,
    flashcards: extractFlashcards(u3_adv),
    clozeItems: extractCloze(u3_adv),
    questions: normalizeUnit3Questions(u3_q),
    quizQuestions: (u3_quiz.questions as QuizQuestion[]) || [],
    standardData: u3_std as unknown as StandardUnitData,
    advancedData: u3_adv as unknown as AdvancedUnitData,
  },
  {
    id: 4,
    slug: "intellect",
    title: "الوحدة 04: العقل في القرآن الكريم",
    shortTitle: "العقل في القرآن الكريم",
    badge: "الوحدة 04",
    field: u4_std.field || "الفكر الإسلامي ومقاصد الشريعة",
    timeAllocation: u4_std.time_allocation || "ساعتان",
    targetAudience: u4_std.target_audience || "جميع الشعب",
    learningObjective: u4_std.learning_objective || "",
    mindmapImage: "/lessons/unit04_mindmap.png",
    mindmapRoot: u4_mm.root as MindmapNode,
    flashcards: extractFlashcards(u4_adv),
    clozeItems: extractCloze(u4_adv),
    questions: normalizeUnit4Questions(u4_q),
    quizQuestions: (u4_quiz.questions as QuizQuestion[]) || [],
    standardData: u4_std as unknown as StandardUnitData,
    advancedData: u4_adv as unknown as AdvancedUnitData,
  },
];

export function getAllUnits(): NormalizedUnit[] {
  return UNITS;
}

export function getUnitById(id: number): NormalizedUnit | undefined {
  return UNITS.find((u) => u.id === id);
}
