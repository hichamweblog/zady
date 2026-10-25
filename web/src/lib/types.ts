export interface MindmapNode {
  id: string;
  label: string;
  color?: string;
  details?: string;
  proof?: string;
  node_type?: string;
  children?: MindmapNode[];
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
  section?: string;
  question: string;
  modelAnswer: string;
  scoringRubric?: QuestionRubricItem[];
  examinerNotes?: string;
  ayahText?: string;
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

export interface StandardUnitData {
  unit_id: number;
  unit_title: string;
  field?: string;
  time_allocation?: string;
  target_audience?: string;
  learning_objective?: string;
  detailed_explanation: Record<string, any>;
}

export interface AdvancedUnitData {
  schema_version?: string;
  architecture_type?: string;
  unit_metadata?: Record<string, any>;
  concept_nodes?: any[];
  [key: string]: any;
}

export interface NormalizedUnit {
  id: number;
  slug: string;
  title: string;
  shortTitle: string;
  badge: string;
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
  standardData: StandardUnitData;
  advancedData: AdvancedUnitData;
}
