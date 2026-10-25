"use client";

import { useState, useEffect, useCallback } from "react";

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
  quizAttempts: Record<number, QuizAttempt>;
}

const STORAGE_KEY = "zady_student_progress_v2";

const initialData: ProgressData = {
  flashcardRatings: {},
  masteredQuestions: {},
  readSections: {},
  quizAttempts: {},
};

export function useProgress() {
  const [data, setData] = useState<ProgressData>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData({
          flashcardRatings: parsed.flashcardRatings || {},
          masteredQuestions: parsed.masteredQuestions || {},
          readSections: parsed.readSections || {},
          quizAttempts: parsed.quizAttempts || {},
        });
      }
    } catch (e) {
      console.error("Failed to load progress from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Atomic state updater that avoids stale closures
  const updateStore = useCallback((updater: (prev: ProgressData) => ProgressData) => {
    setData((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save progress to localStorage", e);
      }
      return next;
    });
  }, []);

  // Flashcards methods
  const rateFlashcard = useCallback((unitId: number, cardId: string | number, rating: CardRating) => {
    const key = `u${unitId}_c_${cardId}`;
    updateStore((prev) => ({
      ...prev,
      flashcardRatings: { ...prev.flashcardRatings, [key]: rating },
    }));
  }, [updateStore]);

  const toggleFlashcardMastered = useCallback((unitId: number, cardId: string | number) => {
    const key = `u${unitId}_c_${cardId}`;
    updateStore((prev) => {
      const current = prev.flashcardRatings[key];
      const nextRating = current === "easy" ? "hard" : "easy";
      return {
        ...prev,
        flashcardRatings: { ...prev.flashcardRatings, [key]: nextRating },
      };
    });
  }, [updateStore]);

  const getFlashcardRating = useCallback((unitId: number, cardId: string | number): CardRating | undefined => {
    return data.flashcardRatings[`u${unitId}_c_${cardId}`];
  }, [data.flashcardRatings]);

  const isFlashcardLearned = useCallback((unitId: number, cardId: string | number): boolean => {
    return data.flashcardRatings[`u${unitId}_c_${cardId}`] === "easy";
  }, [data.flashcardRatings]);

  // Questions methods
  const toggleQuestion = useCallback((unitId: number, questionId: string) => {
    const key = `u${unitId}_q_${questionId}`;
    updateStore((prev) => ({
      ...prev,
      masteredQuestions: {
        ...prev.masteredQuestions,
        [key]: !prev.masteredQuestions[key],
      },
    }));
  }, [updateStore]);

  const isQuestionMastered = useCallback((unitId: number, questionId: string): boolean => {
    return !!data.masteredQuestions[`u${unitId}_q_${questionId}`];
  }, [data.masteredQuestions]);

  // Lesson sections methods
  const toggleSectionRead = useCallback((unitId: number, sectionKey: string) => {
    const key = `u${unitId}_s_${sectionKey}`;
    updateStore((prev) => ({
      ...prev,
      readSections: {
        ...prev.readSections,
        [key]: !prev.readSections[key],
      },
    }));
  }, [updateStore]);

  const isSectionRead = useCallback((unitId: number, sectionKey: string): boolean => {
    return !!data.readSections[`u${unitId}_s_${sectionKey}`];
  }, [data.readSections]);

  // Quiz methods
  const saveQuizAttempt = useCallback((unitId: number, score: number, total: number, wrongQuestionIds: string[]) => {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const attempt: QuizAttempt = {
      score,
      total,
      percentage,
      date: new Date().toISOString(),
      wrongQuestionIds,
    };
    updateStore((prev) => ({
      ...prev,
      quizAttempts: {
        ...prev.quizAttempts,
        [unitId]: attempt,
      },
    }));
  }, [updateStore]);

  const getQuizAttempt = useCallback((unitId: number): QuizAttempt | undefined => {
    return data.quizAttempts[unitId];
  }, [data.quizAttempts]);

  // Unit Progress Calculator
  const getUnitStats = useCallback((
    unitId: number,
    cardIds: (string | number)[],
    questionIds: string[],
    sectionKeys: string[],
    totalMcq: number
  ) => {
    // 1. Flashcards mastered
    const learnedCards = cardIds.filter(
      (id) => data.flashcardRatings[`u${unitId}_c_${id}`] === "easy"
    ).length;

    // 2. BAC Questions mastered
    const masteredQuestions = questionIds.filter(
      (id) => !!data.masteredQuestions[`u${unitId}_q_${id}`]
    ).length;

    // 3. Sections read
    const readSectionsCount = sectionKeys.filter(
      (k) => !!data.readSections[`u${unitId}_s_${k}`]
    ).length;

    // 4. Quiz score
    const quizAttempt = data.quizAttempts[unitId];
    const quizPassed = (quizAttempt?.percentage || 0) >= 60;

    // Total weighted calculation:
    // Sections read: 25%, Flashcards: 25%, QCM Quiz: 25%, BAC Questions: 25%
    const secRatio = sectionKeys.length > 0 ? readSectionsCount / sectionKeys.length : 0;
    const cardRatio = cardIds.length > 0 ? learnedCards / cardIds.length : 0;
    const quizRatio = totalMcq > 0 ? (quizAttempt ? quizAttempt.score / totalMcq : 0) : 0;
    const qRatio = questionIds.length > 0 ? masteredQuestions / questionIds.length : 0;

    const progressPercentage = Math.min(
      100,
      Math.round((secRatio * 0.25 + cardRatio * 0.25 + quizRatio * 0.25 + qRatio * 0.25) * 100)
    );

    return {
      learnedCards,
      masteredQuestions,
      readSectionsCount,
      quizAttempt,
      quizPassed,
      progressPercentage,
    };
  }, [data]);

  return {
    isLoaded,
    rateFlashcard,
    toggleFlashcardMastered,
    getFlashcardRating,
    isFlashcardLearned,
    toggleQuestion,
    isQuestionMastered,
    toggleSectionRead,
    isSectionRead,
    saveQuizAttempt,
    getQuizAttempt,
    getUnitStats,
  };
}
