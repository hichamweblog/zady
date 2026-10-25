"use client";

import { useState, useMemo, useEffect } from "react";
import { QuizQuestion } from "@/lib/types";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  RotateCcw,
  Lightbulb,
  Award,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  PlayCircle,
  AlertCircle,
  Shuffle,
  Eye,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useProgress } from "@/lib/useProgressStore";

interface McqQuizViewerProps {
  unitId: number;
  unitTitle: string;
  questions: QuizQuestion[];
}

export default function McqQuizViewer({
  unitId,
  unitTitle,
  questions,
}: McqQuizViewerProps) {
  const [mode, setMode] = useState<"interactive" | "list">("interactive");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [onlyMistakes, setOnlyMistakes] = useState(false);

  const { saveQuizAttempt, getQuizAttempt } = useProgress();
  const pastAttempt = getQuizAttempt(unitId);

  // Active question pool (all or only mistakes)
  const activeQuestions = useMemo(() => {
    if (!onlyMistakes) return questions;
    return questions.filter((q, idx) => {
      const ans = selectedAnswers[idx];
      return ans && ans !== q.correct_answer;
    });
  }, [questions, onlyMistakes, selectedAnswers]);

  const currentQ = activeQuestions[currentIndex] || questions[0];
  const totalQuestions = activeQuestions.length;

  // Real question original index
  const realQuestionIndex = useMemo(() => {
    return questions.findIndex((q) => q.question_id === currentQ?.question_id);
  }, [questions, currentQ]);

  const handleSelectOption = (option: string) => {
    if (selectedAnswers[realQuestionIndex]) return; // already answered

    const updated = { ...selectedAnswers, [realQuestionIndex]: option };
    setSelectedAnswers(updated);

    const isCorrect = option === currentQ.correct_answer;
    if (isCorrect) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#10b981", "#14b8a6", "#3b82f6"],
      });
    }

    // Check if all original questions answered
    const answeredCount = Object.keys(updated).length;
    if (answeredCount === questions.length) {
      const correct = Object.entries(updated).filter(
        ([idx, ans]) => ans === questions[Number(idx)]?.correct_answer
      ).length;
      const wrongIds = questions
        .filter((q, idx) => updated[idx] !== q.correct_answer)
        .map((q) => q.question_id);

      saveQuizAttempt(unitId, correct, questions.length, wrongIds);
      setTimeout(() => {
        setQuizFinished(true);
      }, 900);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleHint = (idx: number) => {
    setRevealedHints((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const restartQuiz = () => {
    setSelectedAnswers({});
    setRevealedHints({});
    setCurrentIndex(0);
    setQuizFinished(false);
    setOnlyMistakes(false);
  };

  const startMistakesReview = () => {
    setOnlyMistakes(true);
    setCurrentIndex(0);
    setQuizFinished(false);
  };

  // Calculate score
  const correctCount = Object.entries(selectedAnswers).filter(
    ([idx, ans]) => ans === questions[Number(idx)]?.correct_answer
  ).length;

  const wrongCount = Object.keys(selectedAnswers).length - correctCount;
  const scorePercentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="font-bold text-slate-700 dark:text-slate-300">
          لا توجد أسئلة QCM متوفرة لهذه الوحدة حالياً.
        </h4>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Toggle */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl" role="tablist">
          <button
            role="tab"
            aria-selected={mode === "interactive"}
            onClick={() => setMode("interactive")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "interactive"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>وضع الاختبار التفاعلي</span>
          </button>
          <button
            role="tab"
            aria-selected={mode === "list"}
            onClick={() => setMode("list")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "list"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>استعراض جميع الأسئلة ({questions.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
          {pastAttempt && (
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px]">
              أفضل نتيجة سابقة: {pastAttempt.score}/{pastAttempt.total} ({pastAttempt.percentage}%)
            </span>
          )}

          <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-900">
            الصحيحة: {correctCount} / {questions.length}
          </span>
          <button
            onClick={restartQuiz}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            title="إعادة بدء الاختبار"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة البدء</span>
          </button>
        </div>
      </div>

      {mode === "interactive" ? (
        quizFinished ? (
          /* Finished Screen with Review Mistakes Option */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm text-center max-w-xl mx-auto space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                اكتمل اختبار الـ QCM بنجاح!
              </h3>
              <p className="text-sm text-slate-500">
                {unitTitle}
              </p>
            </div>

            {/* Score Ring / Bar */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-4xl font-black text-teal-600 dark:text-teal-400">
                {scorePercentage}%
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                أجبت بشكل صحيح على {correctCount} من أصل {questions.length} سؤالاً.
              </p>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  style={{ width: `${scorePercentage}%` }}
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                />
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400">
              {scorePercentage >= 90
                ? "🌟 أداء استثنائي! استيعابك للمفاهيم ممتاز وأنت في المسار الصحيح لنيل 20/20."
                : scorePercentage >= 70
                ? "👏 نتيجة ممتازة! راجع الأسئلة التي تعثرت فيها لتثبيت الحفظ بدقة."
                : "💡 بداية طيبة! يمكنك إعادة الاختبار ومراجعة الشروحات المرفقة بكل سؤال."}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              {wrongCount > 0 && (
                <button
                  onClick={startMistakesReview}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>مراجعة الأخطاء فقط ({wrongCount})</span>
                </button>
              )}

              <button
                onClick={restartQuiz}
                className="px-5 py-3 rounded-2xl bg-teal-600 text-white font-extrabold text-sm hover:bg-teal-700 transition-colors shadow-md shadow-teal-600/20 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة الاختبار كاملاً</span>
              </button>
            </div>
          </div>
        ) : (
          /* Single Interactive Question Card */
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Question Jump Navigator Grid */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {questions.map((q, idx) => {
                const ans = selectedAnswers[idx];
                const isAnswered = !!ans;
                const isCorrect = ans === q.correct_answer;
                const isCurrent = idx === realQuestionIndex;

                let pillColor = "bg-slate-100 dark:bg-slate-800 text-slate-500";
                if (isAnswered) {
                  pillColor = isCorrect
                    ? "bg-emerald-500 text-white"
                    : "bg-rose-500 text-white";
                }

                return (
                  <button
                    key={q.question_id || idx}
                    onClick={() => {
                      setOnlyMistakes(false);
                      setCurrentIndex(idx);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-all ${pillColor} ${
                      isCurrent ? "ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900 scale-110" : ""
                    }`}
                    title={`سؤال ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Question Box */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-900">
                  سؤال {realQuestionIndex + 1} من {questions.length}
                </span>

                {currentQ.hint && (
                  <button
                    onClick={() => toggleHint(realQuestionIndex)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>{revealedHints[realQuestionIndex] ? "إخفاء التلميح" : "طلب تلميح ذكي"}</span>
                  </button>
                )}
              </div>

              {/* Hint Box if revealed */}
              {revealedHints[realQuestionIndex] && currentQ.hint && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>{currentQ.hint}</span>
                </div>
              )}

              {/* Question text */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </h3>

              {/* Options with ARIA roles */}
              <div className="space-y-3" role="radiogroup" aria-label={currentQ.question}>
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedAnswers[realQuestionIndex] === option;
                  const isAnswered = !!selectedAnswers[realQuestionIndex];
                  const isCorrect = option === currentQ.correct_answer;

                  let optionStyle =
                    "border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-slate-700 shadow-xs";

                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle =
                        "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-100 font-black ring-2 ring-emerald-500/20";
                    } else if (isSelected && !isCorrect) {
                      optionStyle =
                        "border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 font-black";
                    } else {
                      optionStyle =
                        "border border-slate-200 dark:border-slate-800 opacity-40 bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(option)}
                      className={`w-full p-4 sm:p-5 rounded-2xl border text-right transition-all flex items-center justify-between gap-4 text-base sm:text-lg font-bold leading-relaxed ${optionStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswered && (
                        <span>
                          {isCorrect ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                          ) : isSelected ? (
                            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card (Appears after answer) */}
              {selectedAnswers[realQuestionIndex] && (
                <div className="p-5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-sm sm:text-base space-y-2">
                  <div className="flex items-center gap-2 font-black text-teal-800 dark:text-teal-300">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    <span>التعليل والتوضيح:</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                    {currentQ.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Question Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all disabled:opacity-40"
              >
                <ChevronRight className="w-5 h-5" />
                <span>السابق</span>
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 text-white font-extrabold text-sm hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20"
              >
                <span>{currentIndex + 1 === totalQuestions ? "إنهاء الاختبار" : "السؤال التالي"}</span>
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        )
      ) : (
        /* Full List Mode */
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.question_id || idx}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-black flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  سؤال {idx + 1} من {questions.length}
                </span>
              </div>

              <h4 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-relaxed">
                {q.question}
              </h4>

              <div className="space-y-2.5">
                {q.options.map((opt, oIdx) => {
                  const isCorrect = opt === q.correct_answer;
                  return (
                    <div
                      key={oIdx}
                      className={`p-4 rounded-xl border text-sm sm:text-base font-bold ${
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{opt}</span>
                        {isCorrect && (
                          <span className="text-xs font-black px-2.5 py-1 rounded-md bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 shrink-0">
                            الإجابة الصحيحة ✓
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                <span className="font-black text-teal-800 dark:text-teal-300">التعليل: </span>
                <span>{q.explanation}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
