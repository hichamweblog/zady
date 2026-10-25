"use client";

import { useCallback, useSyncExternalStore } from "react";

export type CardRating = "easy" | "medium" | "hard";

export interface QuizAttempt {
  score: number;
  total: number;
  percentage: number;
  date: string;
  wrongQuestionIds: string[];
}

export interface ProgressData {
  flashcardRatings: Record<string, CardRating>;
  masteredQuestions: Record<string, boolean>;
  readSections: Record<string, boolean>;
  /** أفضل محاولة لكل وحدة */
  quizAttempts: Record<number, QuizAttempt>;
  /** آخر محاولة لكل وحدة */
  quizLastAttempts: Record<number, QuizAttempt>;
  /** عدد المحاولات لكل وحدة */
  quizAttemptCounts: Record<number, number>;
  /**
   * آخر مكان كان فيه الطالب — يُستخدم لزر «تابع من حيث توقفت».
   * بلا هذا الحقل يضطر الطالب إلى تذكّر الوحدة والتبويب الذي تركه.
   */
  lastActivity: { unitId: number; tab: string; at: number } | null;
}

const STORAGE_KEY = "zady_student_progress_v3";
const LEGACY_KEYS = ["zady_student_progress_v2"];

const EMPTY: ProgressData = {
  flashcardRatings: {},
  masteredQuestions: {},
  readSections: {},
  quizAttempts: {},
  quizLastAttempts: {},
  quizAttemptCounts: {},
  lastActivity: null,
};

/**
 * مخزن تقدّم واحد مشترك بين كل المكوّنات.
 *
 * سبب إعادة الكتابة: كان `useProgress` يخزّن الحالة في `useState` داخل كل
 * مكوّن، فكانت نسبة الإتقان في رأس صفحة الوحدة لا تتحدّث أبدًا بعد إتقان
 * بطاقة أو سؤال، وكان كل مكوّن يكتب نسخة كاملة من كائن التقدّم فوق غيره.
 * هنا الحالة وحدة واحدة على مستوى الوحدة النمطية (module) مع
 * `useSyncExternalStore`، فكل المكوّنات تقرأ نفس اللقطة وتتحدّث فورًا.
 */
let state: ProgressData = EMPTY;
let hasHydrated = false;
const listeners = new Set<() => void>();

function normalize(raw: unknown): ProgressData {
  if (!raw || typeof raw !== "object") return EMPTY;
  const parsed = raw as Partial<ProgressData> & {
    quizAttempts?: Record<string, QuizAttempt>;
  };
  return {
    flashcardRatings: parsed.flashcardRatings ?? {},
    masteredQuestions: parsed.masteredQuestions ?? {},
    readSections: parsed.readSections ?? {},
    quizAttempts: (parsed.quizAttempts ?? {}) as Record<number, QuizAttempt>,
    quizLastAttempts: (parsed.quizLastAttempts ?? {}) as Record<number, QuizAttempt>,
    quizAttemptCounts: (parsed.quizAttemptCounts ?? {}) as Record<number, number>,
    lastActivity:
      parsed.lastActivity && typeof parsed.lastActivity.unitId === "number"
        ? parsed.lastActivity
        : null,
  };
}

function readStorage(): ProgressData {
  if (typeof window === "undefined") return EMPTY;
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current) return normalize(JSON.parse(current));
    // ترحيل تلقائي من الإصدار السابق
    for (const legacy of LEGACY_KEYS) {
      const old = window.localStorage.getItem(legacy);
      if (old) {
        const migrated = normalize(JSON.parse(old));
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch (error) {
    console.error("تعذّر قراءة تقدّم الطالب من التخزين المحلي", error);
  }
  return EMPTY;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function persist(next: ProgressData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.error("تعذّر حفظ تقدّم الطالب في التخزين المحلي", error);
  }
}

function setState(next: ProgressData) {
  state = next;
  persist(next);
  emit();
}

function mutate(updater: (prev: ProgressData) => ProgressData) {
  setState(updater(state));
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // مزامنة بين تبويبات المتصفح
  if (typeof window !== "undefined") {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        state = readStorage();
        emit();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      listeners.delete(listener);
    };
  }

  return () => listeners.delete(listener);
}

function getSnapshot(): ProgressData {
  if (!hasHydrated) {
    state = readStorage();
    hasHydrated = true;
  }
  return state;
}

function getServerSnapshot(): ProgressData {
  return EMPTY;
}

/**
 * صيغة نسبة الإتقان الواحدة المشتركة.
 * كانت مكرّرة داخل `getUnitStats` وحدها، فأي مكان آخر يحتاج النسبة (مثل شريط
 * التقدّم على بطاقة الوحدة في الرئيسية) كان سيعيد حسابها بصيغة قد تختلف.
 */
export function weightedProgress(input: {
  sectionsDone: number;
  sectionsTotal: number;
  cardsDone: number;
  cardsTotal: number;
  quizScore: number;
  quizTotal: number;
  quizAttempted: boolean;
  questionsDone: number;
  questionsTotal: number;
}): number {
  const ratio = (done: number, total: number) => (total > 0 ? done / total : 0);
  const quizRatio = input.quizAttempted ? ratio(input.quizScore, input.quizTotal) : 0;
  return Math.min(
    100,
    Math.round(
      (ratio(input.sectionsDone, input.sectionsTotal) * 0.25 +
        ratio(input.cardsDone, input.cardsTotal) * 0.25 +
        quizRatio * 0.25 +
        ratio(input.questionsDone, input.questionsTotal) * 0.25) *
        100
    )
  );
}

const cardKey = (unitId: number, cardId: string | number) => `u${unitId}_c_${cardId}`;
const questionKey = (unitId: number, questionId: string) => `u${unitId}_q_${questionId}`;
const sectionKey = (unitId: number, key: string) => `u${unitId}_s_${key}`;

export function useProgress() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const rateFlashcard = useCallback(
    (unitId: number, cardId: string | number, rating: CardRating) => {
      mutate((prev) => ({
        ...prev,
        flashcardRatings: { ...prev.flashcardRatings, [cardKey(unitId, cardId)]: rating },
      }));
    },
    []
  );

  const toggleFlashcardMastered = useCallback((unitId: number, cardId: string | number) => {
    mutate((prev) => {
      const key = cardKey(unitId, cardId);
      const current = prev.flashcardRatings[key];
      return {
        ...prev,
        flashcardRatings: {
          ...prev.flashcardRatings,
          [key]: current === "easy" ? "hard" : "easy",
        },
      };
    });
  }, []);

  const toggleQuestion = useCallback((unitId: number, questionId: string) => {
    mutate((prev) => {
      const key = questionKey(unitId, questionId);
      return {
        ...prev,
        masteredQuestions: { ...prev.masteredQuestions, [key]: !prev.masteredQuestions[key] },
      };
    });
  }, []);

  const toggleSectionRead = useCallback((unitId: number, key: string) => {
    mutate((prev) => {
      const storageKey = sectionKey(unitId, key);
      return {
        ...prev,
        readSections: { ...prev.readSections, [storageKey]: !prev.readSections[storageKey] },
      };
    });
  }, []);

  const saveQuizAttempt = useCallback(
    (unitId: number, score: number, total: number, wrongQuestionIds: string[]) => {
      const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
      const attempt: QuizAttempt = {
        score,
        total,
        percentage,
        date: new Date().toISOString(),
        wrongQuestionIds,
      };
      mutate((prev) => {
        const previousBest = prev.quizAttempts[unitId];
        const isBetter = !previousBest || percentage >= previousBest.percentage;
        return {
          ...prev,
          quizAttempts: isBetter ? { ...prev.quizAttempts, [unitId]: attempt } : prev.quizAttempts,
          quizLastAttempts: { ...prev.quizLastAttempts, [unitId]: attempt },
          quizAttemptCounts: {
            ...prev.quizAttemptCounts,
            [unitId]: (prev.quizAttemptCounts[unitId] ?? 0) + 1,
          },
        };
      });
    },
    []
  );

  const resetProgress = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key));
      } catch {
        /* تجاهل */
      }
    }
    state = EMPTY;
    hasHydrated = true;
    emit();
  }, []);

  // ─── قراءات ───
  const getFlashcardRating = useCallback(
    (unitId: number, cardId: string | number): CardRating | undefined =>
      data.flashcardRatings[cardKey(unitId, cardId)],
    [data.flashcardRatings]
  );

  const isFlashcardLearned = useCallback(
    (unitId: number, cardId: string | number): boolean =>
      data.flashcardRatings[cardKey(unitId, cardId)] === "easy",
    [data.flashcardRatings]
  );

  const isQuestionMastered = useCallback(
    (unitId: number, questionId: string): boolean =>
      !!data.masteredQuestions[questionKey(unitId, questionId)],
    [data.masteredQuestions]
  );

  const isSectionRead = useCallback(
    (unitId: number, key: string): boolean => !!data.readSections[sectionKey(unitId, key)],
    [data.readSections]
  );

  const setLastActivity = useCallback((unitId: number, tab: string) => {
    const previous = state.lastActivity;
    // لا نكتب في التخزين عند كل رسم — فقط عند تغيّر الوحدة أو التبويب
    if (previous && previous.unitId === unitId && previous.tab === tab) return;
    mutate((prev) => ({ ...prev, lastActivity: { unitId, tab, at: Date.now() } }));
  }, []);

  const getQuizAttempt = useCallback(
    (unitId: number): QuizAttempt | undefined => data.quizAttempts[unitId],
    [data.quizAttempts]
  );

  const getLastQuizAttempt = useCallback(
    (unitId: number): QuizAttempt | undefined => data.quizLastAttempts[unitId],
    [data.quizLastAttempts]
  );

  const getQuizAttemptCount = useCallback(
    (unitId: number): number => data.quizAttemptCounts[unitId] ?? 0,
    [data.quizAttemptCounts]
  );

  const getUnitStats = useCallback(
    (
      unitId: number,
      cardIds: (string | number)[],
      questionIds: string[],
      sectionKeys: string[],
      totalMcq: number
    ) => {
      const learnedCards = cardIds.filter(
        (id) => data.flashcardRatings[cardKey(unitId, id)] === "easy"
      ).length;

      const masteredQuestions = questionIds.filter(
        (id) => !!data.masteredQuestions[questionKey(unitId, id)]
      ).length;

      const readSectionsCount = sectionKeys.filter(
        (key) => !!data.readSections[sectionKey(unitId, key)]
      ).length;

      const quizAttempt = data.quizAttempts[unitId];
      const quizPassed = (quizAttempt?.percentage ?? 0) >= 60;

      const progressPercentage = weightedProgress({
        sectionsDone: readSectionsCount,
        sectionsTotal: sectionKeys.length,
        cardsDone: learnedCards,
        cardsTotal: cardIds.length,
        quizScore: quizAttempt?.score ?? 0,
        quizTotal: totalMcq,
        quizAttempted: Boolean(quizAttempt),
        questionsDone: masteredQuestions,
        questionsTotal: questionIds.length,
      });

      return {
        learnedCards,
        masteredQuestions,
        readSectionsCount,
        quizAttempt,
        quizPassed,
        progressPercentage,
      };
    },
    [data]
  );

  return {
    isLoaded: true,
    data,
    rateFlashcard,
    toggleFlashcardMastered,
    getFlashcardRating,
    isFlashcardLearned,
    toggleQuestion,
    isQuestionMastered,
    toggleSectionRead,
    isSectionRead,
    saveQuizAttempt,
    setLastActivity,
    getQuizAttempt,
    getLastQuizAttempt,
    getQuizAttemptCount,
    getUnitStats,
    resetProgress,
  };
}
