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
      <div className="text-center py-12 u-card p-8">
        <HelpCircle className="w-12 h-12 text-[var(--ink-faint)] mx-auto mb-3" aria-hidden="true" />
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          لا توجد أسئلة QCM متوفرة لهذه الوحدة حاليًا.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الاختبار: عدّاد وشريط تقدّم فقط — لا صناديق */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-meta">
          <p className="font-semibold text-[var(--ink)]">
            سؤال {Math.min(realQuestionIndex + 1, prepared.length)} من {prepared.length}
            <span className="mx-1.5 text-[var(--ink-faint)]">·</span>
            <span className="font-medium text-[var(--ink-soft)]">الصحيحة {correctCount}</span>
          </p>
          <div className="flex items-center gap-2">
            {bestAttempt && (
              <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[var(--ink-soft)]">
                أفضل نتيجة {bestAttempt.percentage}%
                {attemptCount > 1 ? ` · ${attemptCount} محاولات` : ""}
              </span>
            )}
            {lastAttempt && attemptCount > 1 && (
              <span className="hidden rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[var(--ink-faint)] sm:inline">
                آخر محاولة {lastAttempt.percentage}%
              </span>
            )}
            <button
              type="button"
              onClick={restartQuiz}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>إعادة</span>
            </button>
          </div>
        </div>

        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={prepared.length}
          aria-valuenow={Object.keys(selectedAnswers).length}
          aria-label="تقدّم الاختبار"
        >
          <div
            className="h-full rounded-full bg-[var(--brand)] transition-[width] duration-300"
            style={{ width: `${(Object.keys(selectedAnswers).length / prepared.length) * 100}%` }}
          />
        </div>
      </div>

      {quizFinished ? (
        <div className="u-card p-8 sm:p-12 shadow-[var(--shadow-card)] text-center max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto shadow-[var(--shadow-card)]">
            <Award className="w-10 h-10" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h2 className="text-display font-semibold text-[var(--ink)]">اكتمل اختبار الـ QCM</h2>
            <p className="text-body-sm text-[var(--ink-soft)]">{unitTitle}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--surface-2)] space-y-3">
            <div className="text-display font-semibold text-teal-700 dark:text-teal-300">
              {scorePercentage}%
            </div>
            <p className="text-body-sm font-semibold text-[var(--ink)]">
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

          <p className="text-body-sm text-[var(--ink-soft)]">
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
                className="px-5 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-body-sm transition-all shadow-[var(--shadow-card)] flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                <span>مراجعة الأخطاء فقط ({wrongCount})</span>
              </button>
            )}

            <button
              onClick={restartQuiz}
              className="px-5 py-3 rounded-full bg-teal-700 text-white font-semibold text-body-sm hover:bg-teal-800 transition-colors shadow-[var(--shadow-card)] flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>إعادة الاختبار كاملًا</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-5">
          {/* بطاقة السؤال */}
          <div className="u-card space-y-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="u-chip">سؤال {realQuestionIndex + 1}</span>

              {currentQ.hint && (
                <button
                  type="button"
                  onClick={() =>
                    setRevealedHints((prev) => ({
                      ...prev,
                      [realQuestionIndex]: !prev[realQuestionIndex],
                    }))
                  }
                  aria-expanded={!!revealedHints[realQuestionIndex]}
                  className="inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-meta font-semibold text-[var(--amber-ink)] transition-colors hover:bg-[var(--amber-soft)]"
                >
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{revealedHints[realQuestionIndex] ? "إخفاء التلميح" : "تلميح"}</span>
                </button>
              )}
            </div>

            {revealedHints[realQuestionIndex] && currentQ.hint && (
              <div className="flex items-start gap-2 rounded-xl bg-[var(--amber-soft)] p-3 text-label text-[var(--ink)]">
                <Lightbulb
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--amber)]"
                  aria-hidden="true"
                />
                <span>{currentQ.hint}</span>
              </div>
            )}

            <h3 className="text-title font-semibold leading-relaxed text-[var(--ink)] sm:text-heading">
              {currentQ.question}
            </h3>

            <div className="space-y-2.5" role="radiogroup" aria-label={currentQ.question}>
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[realQuestionIndex] === option;
                const isAnswered = !!selectedAnswers[realQuestionIndex];
                const isCorrect = option === currentQ.correct_answer;

                let optionStyle =
                  "bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--surface-3)]";
                if (isAnswered) {
                  if (isCorrect) {
                    optionStyle =
                      "bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-100";
                  } else if (isSelected) {
                    optionStyle =
                      "bg-rose-50 text-rose-900 ring-2 ring-rose-500 dark:bg-rose-500/10 dark:text-rose-100";
                  } else {
                    optionStyle = "bg-[var(--surface-2)] text-[var(--ink-faint)] opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(option)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl p-3.5 text-start text-body font-medium leading-relaxed transition-colors sm:p-4 ${optionStyle}`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-meta font-semibold ${
                          isAnswered && isCorrect
                            ? "bg-emerald-600 text-white"
                            : isAnswered && isSelected
                              ? "bg-rose-600 text-white"
                              : "bg-[var(--surface)] text-[var(--ink-soft)] shadow-[var(--shadow-xs)]"
                        }`}
                        aria-hidden="true"
                      >
                        {String.fromCharCode(1571 + idx)}
                      </span>
                      <span>{option}</span>
                    </span>
                    {isAnswered && isCorrect && (
                      <CheckCircle2
                        className="h-5 w-5 shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>

            <div aria-live="polite" aria-atomic="true">
              {selectedAnswers[realQuestionIndex] && (
                <div className="space-y-1.5 rounded-xl bg-[var(--brand-soft)] p-4 text-body-sm">
                  <p className="flex items-center gap-2 font-semibold text-[var(--brand-strong)]">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {selectedAnswers[realQuestionIndex] === currentQ.correct_answer
                        ? "إجابة صحيحة — التعليل"
                        : "إجابة غير صحيحة — التعليل"}
                    </span>
                  </p>
                  <p className="leading-relaxed text-[var(--ink)]">{currentQ.explanation}</p>
                </div>
              )}
            </div>
          </div>

          {/* التنقّل: زرّ أساسي واحد، والباقي هادئ */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrev}
              className="u-ghost min-h-10 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span>السابق</span>
            </button>

            <button type="button" onClick={handleNext} className="u-cta min-h-10">
              <span>
                {currentIndex + 1 === totalQuestions ? "إنهاء الاختبار" : "السؤال التالي"}
              </span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* خريطة الأسئلة: صغيرة أسفل البطاقة، للقفز لا للعرض */}
          <div className="space-y-2 pt-1">
            <p className="text-meta font-medium text-[var(--ink-faint)]">خريطة الأسئلة</p>
            <div className="flex flex-wrap gap-1.5">
              {prepared.map((q, idx) => {
                const answer = selectedAnswers[idx];
                const isAnswered = !!answer;
                const isCorrect = answer === q.correct_answer;
                const isCurrent = idx === realQuestionIndex;

                let pillColor =
                  "bg-[var(--surface-2)] text-[var(--ink-soft)] hover:bg-[var(--surface-3)]";
                if (isAnswered) {
                  pillColor = isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white";
                }

                return (
                  <button
                    key={q.question_id || idx}
                    type="button"
                    onClick={() => {
                      setOnlyMistakes(false);
                      setCurrentIndex(idx);
                    }}
                    aria-label={`الانتقال إلى السؤال ${idx + 1}${isAnswered ? (isCorrect ? "(صحيح)" : "(خطأ)") : ""}`}
                    aria-current={isCurrent ? "true" : undefined}
                    className={`u-num h-7 w-7 rounded-lg text-meta font-semibold transition-all ${pillColor} ${
                      isCurrent
                        ? "ring-2 ring-[var(--brand)] ring-offset-2 ring-offset-[var(--canvas)]"
                        : ""
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
