"use client";

import { useMemo, useState } from "react";
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
  AlertCircle,
} from "lucide-react";
import { celebrate } from "@/lib/celebrate";
import type { QuizQuestion } from "@/lib/types";
import { useProgress } from "@/lib/useProgressStore";

interface McqQuizViewerProps {
  unitId: number;
  unitTitle: string;
  questions: QuizQuestion[];
}

/**
 * خلط حتمي للخيارات اعتمادًا على معرّف السؤال.
 * حتمي (لا يستخدم Math.random) لتفادي اختلاف الخادم عن العميل عند الترطيب،
 * ويضمن ألا يكون ترتيب الإجابة الصحيحة ثابتًا حتى لو عادت البيانات القديمة.
 */
function shuffleOptions(options: string[], seed: string): string[] {
  const result = [...options];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  for (let i = result.length - 1; i > 0; i -= 1) {
    hash = (hash * 1103515245 + 12345) | 0;
    const j = Math.abs(hash) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function McqQuizViewer({ unitId, unitTitle, questions }: McqQuizViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [onlyMistakes, setOnlyMistakes] = useState(false);

  const { saveQuizAttempt, getQuizAttempt, getLastQuizAttempt, getQuizAttemptCount } =
    useProgress();
  const bestAttempt = getQuizAttempt(unitId);
  const lastAttempt = getLastQuizAttempt(unitId);
  const attemptCount = getQuizAttemptCount(unitId);

  /** الأسئلة بعد خلط الخيارات (ثابتة خلال الجلسة) */
  const prepared = useMemo(
    () =>
      questions.map((q) => ({
        ...q,
        options: shuffleOptions(q.options, q.question_id),
      })),
    [questions]
  );

  const activeQuestions = useMemo(() => {
    if (!onlyMistakes) return prepared;
    return prepared.filter((q, idx) => {
      const answer = selectedAnswers[idx];
      return answer && answer !== q.correct_answer;
    });
  }, [prepared, onlyMistakes, selectedAnswers]);

  const currentQ = activeQuestions[currentIndex] ?? prepared[0];
  const totalQuestions = activeQuestions.length;

  const realQuestionIndex = useMemo(
    () => prepared.findIndex((q) => q.question_id === currentQ?.question_id),
    [prepared, currentQ]
  );

  const handleSelectOption = (option: string) => {
    if (realQuestionIndex < 0 || selectedAnswers[realQuestionIndex]) return;

    const updated = { ...selectedAnswers, [realQuestionIndex]: option };
    setSelectedAnswers(updated);

    if (option === currentQ.correct_answer) {
      celebrate({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#10b981", "#14b8a6", "#3b82f6"],
      });
    }

    const answeredCount = Object.keys(updated).length;
    if (answeredCount === prepared.length) {
      const correct = prepared.filter((q, idx) => updated[idx] === q.correct_answer).length;
      const wrongIds = prepared
        .filter((q, idx) => updated[idx] !== q.correct_answer)
        .map((q) => q.question_id);
      saveQuizAttempt(unitId, correct, prepared.length, wrongIds);
      setTimeout(() => setQuizFinished(true), 900);
    }
  };

  const correctCount = Object.entries(selectedAnswers).filter(
    ([idx, answer]) => answer === prepared[Number(idx)]?.correct_answer
  ).length;
  const wrongCount = Object.keys(selectedAnswers).length - correctCount;
  const scorePercentage =
    prepared.length > 0 ? Math.round((correctCount / prepared.length) * 100) : 0;

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

  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) setCurrentIndex((prev) => prev + 1);
    else setQuizFinished(true);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  if (prepared.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-600 p-8">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
        <p className="font-bold text-slate-700 dark:text-slate-200">
          لا توجد أسئلة QCM متوفرة لهذه الوحدة حاليًا.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الشريط العلوي */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-600 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div />

        <div className="flex items-center gap-3 text-label font-bold text-slate-700 dark:text-slate-300 flex-wrap">
          {bestAttempt && (
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-meta">
              أفضل نتيجة: {bestAttempt.score}/{bestAttempt.total} ({bestAttempt.percentage}%)
              {attemptCount > 1 ? `· ${attemptCount} محاولات` : ""}
            </span>
          )}
          {lastAttempt && attemptCount > 1 && (
            <span className="hidden md:inline-block px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-meta">
              آخر محاولة: {lastAttempt.percentage}%
            </span>
          )}

          <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900">
            الصحيحة: {correctCount} / {prepared.length}
          </span>
          <button
            onClick={restartQuiz}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>إعادة البدء</span>
          </button>
        </div>
      </div>

      {quizFinished ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-600 p-8 sm:p-12 shadow-sm text-center max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto shadow-[var(--shadow-card)]">
            <Award className="w-10 h-10" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h2 className="text-display font-bold text-slate-900 dark:text-white">
              اكتمل اختبار الـ QCM
            </h2>
            <p className="text-body-sm text-slate-600 dark:text-slate-300">{unitTitle}</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 space-y-3">
            <div className="text-display font-bold text-teal-700 dark:text-teal-300">
              {scorePercentage}%
            </div>
            <p className="text-body-sm font-bold text-slate-800 dark:text-slate-200">
              أجبت بشكل صحيح على {correctCount} من أصل {prepared.length} سؤالًا.
            </p>
            <div
              role="progressbar"
              aria-valuenow={scorePercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="نتيجة الاختبار"
              className="w-full h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden"
            >
              <div style={{ width: `${scorePercentage}%` }} className="h-full bg-[var(--pine)]" />
            </div>
          </div>

          <p className="text-body-sm text-slate-700 dark:text-slate-300">
            {scorePercentage >= 90
              ? "🌟 أداء استثنائي! استيعابك للمفاهيم ممتاز وأنت في المسار الصحيح لنيل 20/20."
              : scorePercentage >= 70
                ? "👏 نتيجة جيدة! راجع الأسئلة التي تعثرت فيها لتثبيت الحفظ بدقة."
                : "💡 بداية طيبة! أعد الاختبار وراجع التعليل المرفق بكل سؤال."}
          </p>

          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            {wrongCount > 0 && (
              <button
                onClick={startMistakesReview}
                className="px-5 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-body-sm transition-all shadow-[var(--shadow-card)] flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                <span>مراجعة الأخطاء فقط ({wrongCount})</span>
              </button>
            )}

            <button
              onClick={restartQuiz}
              className="px-5 py-3 rounded-full bg-teal-700 text-white font-bold text-body-sm hover:bg-teal-800 transition-colors shadow-[var(--shadow-card)] flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>إعادة الاختبار كاملًا</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* شبكة الانتقال بين الأسئلة */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800">
            {prepared.map((q, idx) => {
              const answer = selectedAnswers[idx];
              const isAnswered = !!answer;
              const isCorrect = answer === q.correct_answer;
              const isCurrent = idx === realQuestionIndex;

              let pillColor = "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
              if (isAnswered) {
                pillColor = isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white";
              }

              return (
                <button
                  key={q.question_id || idx}
                  onClick={() => {
                    setOnlyMistakes(false);
                    setCurrentIndex(idx);
                  }}
                  aria-label={`الانتقال إلى السؤال ${idx + 1}${isAnswered ? (isCorrect ? "(صحيح)" : "(خطأ)") : ""}`}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`w-7 h-7 rounded-lg text-label font-bold shrink-0 transition-all ${pillColor} ${
                    isCurrent
                      ? "ring-2 ring-teal-600 ring-offset-2 dark:ring-offset-slate-900 scale-110"
                      : ""
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-600 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-label font-bold px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900">
                سؤال {realQuestionIndex + 1} من {prepared.length}
              </span>

              {currentQ.hint && (
                <button
                  onClick={() =>
                    setRevealedHints((prev) => ({
                      ...prev,
                      [realQuestionIndex]: !prev[realQuestionIndex],
                    }))
                  }
                  aria-expanded={!!revealedHints[realQuestionIndex]}
                  className="flex items-center gap-1.5 text-label font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  <Lightbulb className="w-4 h-4" aria-hidden="true" />
                  <span>{revealedHints[realQuestionIndex] ? "إخفاء التلميح" : "طلب تلميح"}</span>
                </button>
              )}
            </div>

            {revealedHints[realQuestionIndex] && currentQ.hint && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-label text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                <span>{currentQ.hint}</span>
              </div>
            )}

            <h3 className="text-title sm:text-heading font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h3>

            <div className="space-y-3" role="radiogroup" aria-label={currentQ.question}>
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[realQuestionIndex] === option;
                const isAnswered = !!selectedAnswers[realQuestionIndex];
                const isCorrect = option === currentQ.correct_answer;

                let optionStyle =
                  "border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-slate-700";
                if (isAnswered) {
                  if (isCorrect) {
                    optionStyle =
                      "border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-100 font-bold ring-2 ring-emerald-500/20";
                  } else if (isSelected) {
                    optionStyle =
                      "border-2 border-rose-600 bg-rose-50 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 font-bold";
                  } else {
                    optionStyle =
                      "border border-slate-200 dark:border-slate-600 opacity-50 bg-slate-100 dark:bg-slate-700/40 text-slate-700 dark:text-slate-400";
                  }
                }

                return (
                  <button
                    key={idx}
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full p-4 sm:p-5 rounded-2xl border text-right transition-all flex items-center justify-between gap-4 text-body font-bold leading-relaxed ${optionStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && (
                      <span>
                        {isCorrect ? (
                          <CheckCircle2
                            className="w-6 h-6 text-emerald-700 shrink-0"
                            aria-hidden="true"
                          />
                        ) : isSelected ? (
                          <XCircle className="w-6 h-6 text-rose-700 shrink-0" aria-hidden="true" />
                        ) : null}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div aria-live="polite" aria-atomic="true">
              {selectedAnswers[realQuestionIndex] && (
                <div className="p-5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-body-sm space-y-2">
                  <div className="flex items-center gap-2 font-bold text-teal-900 dark:text-teal-300">
                    <Sparkles
                      className="w-5 h-5 text-teal-700 dark:text-teal-400"
                      aria-hidden="true"
                    />
                    <span>
                      {selectedAnswers[realQuestionIndex] === currentQ.correct_answer
                        ? "إجابة صحيحة — التعليل:"
                        : "إجابة غير صحيحة — التعليل:"}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                    {currentQ.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              disabled={currentIndex === 0}
              onClick={handlePrev}
              className="flex items-center gap-2 px-5 py-3 rounded-full border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-body-sm transition-all disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
              <span>السابق</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-teal-700 text-white font-bold text-body-sm hover:bg-teal-800 transition-all shadow-[var(--shadow-card)]"
            >
              <span>
                {currentIndex + 1 === totalQuestions ? "إنهاء الاختبار" : "السؤال التالي"}
              </span>
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
