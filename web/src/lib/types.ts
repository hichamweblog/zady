/** أنواع البيانات المشتركة بين الخادم والعميل */

/**
 * عقدة في الخريطة الذهنية — **عنصر مفهومي فقط**: تسمية المفهوم وشرحه.
 * لا تحمل شواهد ولا كلمات مفتاحية ولا ملاحظات منهجية؛ فهذه مكانها نص الدرس
 * مع علامة المصباح (إضاءة/فائدة).
 */
export interface MindmapNode {
  id: string;
  label: string;
  color?: string;
  details?: string;
  node_type?: string;
  children?: MindmapNode[];
}

/** شرح مرئي للوحدة — يُعرض كخطوة أولى في مرحلة «استيعاب» */
export interface VideoChapter {
  /** توقيت البداية «mm:ss» */
  at: string;
  title: string;
}

export interface UnitVideo {
  provider: "youtube" | "vimeo" | "file";
  /** معرّف الفيديو عند youtube/vimeo */
  id?: string;
  /** مسار الملف عند provider=file */
  src?: string;
  title: string;
  duration?: string;
  poster?: string;
  /** ملف .vtt للتفريغ بالعربية */
  captions?: string;
  chapters?: VideoChapter[];
}

/** شاهد شرعي محفوظ في بيانات الوحدة (محرّك الشواهد) */
export interface UnitProof {
  id: string;
  surah?: string;
  ayah?: number | string;
  text: string;
  anchor?: string;
  keywords?: string[];
  note?: string;
}

/** أصل المادة العلمية: التدرّج والمراجعة */
export interface UnitSourceMeta {
  curriculum?: string;
  subject?: string;
  reviewedBy?: string | null;
  updatedAt?: string;
  notes?: string;
}

export interface NormalizedFlashcard {
  id: string | number;
  question: string;
  answer: string;
  section?: string;
  category?: string;
}

export interface NormalizedCloze {
  id: string;
  concept_id: string;
  concept_title: string;
  text_with_masks: string;
  answers: Record<string, string>;
  category?: string;
  prohibited_synonyms?: string[];
}

export interface QuestionRubricItem {
  criterion: string;
  points: number;
}

export interface NormalizedQuestion {
  id: string;
  category: string;
  type?: string;
  question: string;
  modelAnswer: string;
  /** بنود سلم التنقيط التفصيلية إن وُجدت في المصدر */
  scoringRubric?: QuestionRubricItem[];
  /** العلامة المخصّصة للسؤال في سلم التنقيط الوزاري (إن وُجدت) */
  officialMarks?: number;
  examinerNotes?: string;
  /** نص الشاهد الشرعي (آية أو حديث) المرفق بالسؤال */
  text?: string;
  /** المرجع: [السورة: الآية] أو مصدر الحديث */
  reference?: string;
  /** محل الشاهد من النص */
  anchor?: string;
  /** مصدر السؤال: «بكالوريا 2024 - الموضوع الأول»… */
  session?: string;
}

export interface QuizQuestion {
  question_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  hint?: string;
  explanation: string;
}

export interface QuizData {
  quiz_metadata: {
    unit_id: string;
    unit_title: string;
    total_questions: number;
    format: string;
    target_exam: string;
  };
  questions: QuizQuestion[];
}

/** قسم من الدرس المنهجي بعد التطبيع */
export interface LessonSection {
  key: string;
  title: string;
  content: unknown;
}

/** بطاقة «وجوب التمييز بين مصطلحين» */
export interface DifferentiationRow {
  id: string;
  termA: string;
  termB: string;
  distinction: string;
  pitfall?: string;
  examinerWarning?: string;
}

/** سؤال بكالوريا سابق جاهز للمراجعة */
export interface PreviousBacItem {
  session: string;
  question: string;
  answer: string;
}

/** محتوى تبويب «المراجعة السريعة» المجمّع من الملفات المتقدمة */
export interface RevisionContent {
  /** مراجعة اللحظة الأخيرة: مجموعات من النقاط المفتاحية */
  lastMinute: { title: string; items: string[] }[];
  /** ملخص الحفظ: مجموعات مفتاح/قيمة أو قوائم */
  summary: { title: string; items: string[] }[];
  /** قواعد منهجية للامتحان */
  rules: string[];
  /** مصفوفة الفروق بين المصطلحات */
  differentiation: DifferentiationRow[];
  /** أسئلة بكالوريا سابقة (من ملف standard) */
  previousBac: PreviousBacItem[];
}

export interface UnitMeta {
  id: number;
  slug: string;
  title: string;
  shortTitle: string;
  badge: string;
}

export interface NormalizedUnit extends UnitMeta {
  /** إصدار مخطط الملف الواحد (2 = الملف الموحّد) */
  schemaVersion?: number;
  source?: UnitSourceMeta;
  video?: UnitVideo;
  proofs?: UnitProof[];
  field: string;
  timeAllocation: string;
  targetAudience: string;
  learningObjective: string;
  mindmapImage: string;
  mindmapRoot: MindmapNode;
  flashcards: NormalizedFlashcard[];
  clozeItems: NormalizedCloze[];
  questions: NormalizedQuestion[];
  quizQuestions: QuizQuestion[];
  sections: LessonSection[];
  revision: RevisionContent;
}

/** ما يمرَّر إلى مكوّنات العميل — بلا تكرار للبيانات الخام */
export type ClientUnit = NormalizedUnit;
