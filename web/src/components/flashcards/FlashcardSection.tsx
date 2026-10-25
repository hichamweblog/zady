"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { celebrate } from "@/lib/celebrate";
import {
  ChevronRight,
  ChevronLeft,
  Shuffle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  Layers,
  Filter,
} from "lucide-react";
import type { NormalizedFlashcard, NormalizedCloze } from "@/lib/types";
import { useProgress, type CardRating } from "@/lib/useProgressStore";
import { isAnswerCorrect } from "@/lib/arabic";

interface FlashcardSectionProps {
  unitId: number;
  flashcards: NormalizedFlashcard[];
  clozeItems: NormalizedCloze[];
}

export default function FlashcardSection({
  unitId,
  flashcards,
  clozeItems,
}: FlashcardSectionProps) {
  const [activeTab, setActiveTab] = useState<"flashcards" | "cloze">("flashcards");

  return (
    <div className="space-y-5">
      {/* تبويبان لا أكثر: بطاقات، أو فراغات. والعدّاد جزء من الاسم لا شارة منفصلة */}
      <div
        role="tablist"
        aria-label="أنماط الحفظ"
        className="u-tabs w-full sm:w-auto sm:inline-flex"
      >
        <button
          role="tab"
          aria-selected={activeTab === "flashcards"}
          onClick={() => setActiveTab("flashcards")}
          className="u-tab flex-1"
        >
          <Layers className="h-4 w-4" aria-hidden="true" />
          <span>بطاقات الحفظ</span>
          <span className="u-tab-count">{flashcards.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "cloze"}
          onClick={() => setActiveTab("cloze")}
          className="u-tab flex-1"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>ملء الفراغات</span>
          <span className="u-tab-count">{clozeItems.length}</span>
        </button>
      </div>

      {activeTab === "flashcards" ? (
        <FlashcardsDeck unitId={unitId} cards={flashcards} />
      ) : (
        <ClozeRecallList items={clozeItems} />
      )}
    </div>
  );
}

function FlashcardsDeck({ unitId, cards }: { unitId: number; cards: NormalizedFlashcard[] }) {
  const [order, setOrder] = useState<string[]>(() => cards.map((c) => String(c.id)));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [onlyUnmastered, setOnlyUnmastered] = useState(false);

  const { rateFlashcard, getFlashcardRating } = useProgress();

  const byId = useMemo(() => new Map(cards.map((c) => [String(c.id), c])), [cards]);
  const orderedCards = useMemo(
    () => order.map((id) => byId.get(id)).filter((c): c is NormalizedFlashcard => Boolean(c)),
    [order, byId]
  );

  /**
   * الترتيب منفصل عن مصدر البطاقات، فخلط مجموعة مُفلترة
   * لا يُفقد البطاقات المتقنة (كان الخلل السابق يستبدل المجموعة كلها).
   */
  const activeDeck = useMemo(() => {
    if (!onlyUnmastered) return orderedCards;
    return orderedCards.filter((c) => getFlashcardRating(unitId, c.id) !== "easy");
  }, [orderedCards, onlyUnmastered, getFlashcardRating, unitId]);

  const safeIndex = activeDeck.length > 0 ? Math.min(currentIndex, activeDeck.length - 1) : 0;
  const currentCard = activeDeck[safeIndex];
  const currentRating = currentCard ? getFlashcardRating(unitId, currentCard.id) : undefined;

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1 < activeDeck.length ? prev + 1 : 0));
  }, [activeDeck.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : Math.max(activeDeck.length - 1, 0)));
  }, [activeDeck.length]);

  const handleRate = useCallback(
    (rating: CardRating) => {
      if (!currentCard) return;
      rateFlashcard(unitId, currentCard.id, rating);
      if (rating === "easy") {
        celebrate({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.8 },
          colors: ["#10b981", "#14b8a6", "#f59e0b"],
        });
      }
      setTimeout(handleNext, 250);
    },
    [currentCard, handleNext, rateFlashcard, unitId]
  );

  const handleShuffle = () => {
    setOrder((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // اختصارات لوحة المفاتيح — مع احترام الحقول والأزرار المركّزة
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTypingField =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable;
      const isInteractive = tag === "BUTTON" || tag === "A" || tag === "SUMMARY";
      if (isTypingField || isInteractive || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.code === "Space") {
        event.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        handleNext();
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        handlePrev();
      } else if (event.key === "1") {
        handleRate("hard");
      } else if (event.key === "2") {
        handleRate("medium");
      } else if (event.key === "3") {
        handleRate("easy");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, handleRate]);

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 u-card p-8">
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          لا توجد بطاقات حفظ لهذه الوحدة حاليًا.
        </p>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="text-center py-12 u-card p-8 space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" aria-hidden="true" />
        <h3 className="font-semibold text-[var(--ink)] text-title">
          رائع! لقد أتقنت جميع بطاقات هذه الوحدة!
        </h3>
        <button
          onClick={() => {
            setOnlyUnmastered(false);
            setCurrentIndex(0);
          }}
          className="px-5 py-2.5 rounded-xl bg-teal-700 text-white font-semibold text-label"
        >
          عرض جميع البطاقات مجددًا
        </button>
      </div>
    );
  }

  const progressPct = activeDeck.length
    ? Math.round(((safeIndex + 1) / activeDeck.length) * 100)
    : 0;

  return (
    <div className="mx-auto w-full max-w-xl space-y-4">
      {/* رأس صغير: أين أنت، وأداتان لا أكثر */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="u-num text-label font-semibold text-[var(--ink)]">
            بطاقة {safeIndex + 1} من {activeDeck.length}
          </p>
          {currentCard.section && (
            <p className="truncate text-meta text-[var(--ink-faint)]">{currentCard.section}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setOnlyUnmastered((prev) => !prev);
              setCurrentIndex(0);
            }}
            aria-pressed={onlyUnmastered}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-meta font-semibold transition-colors ${
              onlyUnmastered
                ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                : "bg-[var(--surface-2)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{onlyUnmastered ? "الكل" : "غير المتقنة"}</span>
          </button>

          <button
            type="button"
            onClick={handleShuffle}
            aria-label="خلط البطاقات"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[var(--surface-2)] px-2.5 text-meta font-semibold text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
          >
            <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* شريط تقدّم رفيع بدل الأرقام المتناثرة */}
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-[var(--surface-3)]"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-[var(--brand)] transition-[width] duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* البطاقة: 4:3 كما البطاقة الورقية، بلا إطار — الظلّ يفصلها */}
      <div
        role="button"
        tabIndex={0}
        aria-label={
          isFlipped
            ? "البطاقة مقلوبة على الإجابة — انقر للعودة إلى السؤال"
            : "اقلب البطاقة لعرض الإجابة"
        }
        aria-pressed={isFlipped}
        className="perspective-1000 w-full cursor-pointer select-none rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        onClick={() => setIsFlipped((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsFlipped((prev) => !prev);
          }
        }}
      >
        <div
          className="transform-style-preserve-3d relative aspect-[4/3] w-full transition-transform duration-500 ease-in-out"
          style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* الوجه: السؤال */}
          <div className="backface-hidden absolute inset-0 flex flex-col justify-between rounded-2xl bg-[var(--surface)] p-5 shadow-[var(--shadow-hover)] sm:p-7">
            <div className="flex items-center justify-between gap-2">
              <span className="text-meta font-semibold text-[var(--brand-strong)]">السؤال</span>
              <span className="text-meta text-[var(--ink-faint)]">اضغط للقلب</span>
            </div>

            <div className="my-auto overflow-y-auto px-1 text-center">
              <p className="text-heading font-semibold leading-relaxed text-[var(--ink)]">
                {currentCard.question}
              </p>
            </div>

            <div className="flex items-center justify-between text-meta text-[var(--ink-faint)]">
              <span>Space</span>
              {currentRating && (
                <span
                  className={`rounded-full px-2 py-0.5 font-semibold ${
                    currentRating === "easy"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : currentRating === "medium"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                  }`}
                >
                  {currentRating === "easy"
                    ? "متقن"
                    : currentRating === "medium"
                      ? "متوسط"
                      : "يحتاج مراجعة"}
                </span>
              )}
            </div>
          </div>

          {/* الظهر: الإجابة */}
          <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-between rounded-2xl bg-[var(--brand-strong)] p-5 text-white shadow-[var(--shadow-hover)] dark:bg-[var(--surface)] sm:p-7">
            <div className="flex items-center justify-between gap-2">
              <span className="text-meta font-semibold opacity-80">الإجابة</span>
              <CheckCircle2 className="h-4 w-4 opacity-70" aria-hidden="true" />
            </div>

            <div className="my-auto overflow-y-auto px-1 text-start">
              <p className="whitespace-pre-line text-title leading-loose">{currentCard.answer}</p>
            </div>

            <p className="text-center text-meta opacity-70">قيّم حفظك أسفل البطاقة</p>
          </div>
        </div>
      </div>

      {/* التقييم يظهر بعد القلب فقط: قبل ذلك لا معنى لسؤال «هل أتقنته؟» */}
      {isFlipped ? (
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleRate("hard")}
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-rose-50 py-2.5 text-label font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
          >
            <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden="true" />
            صعب
          </button>

          <button
            type="button"
            onClick={() => handleRate("medium")}
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-amber-50 py-2.5 text-label font-semibold text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
            متوسط
          </button>

          <button
            type="button"
            onClick={() => handleRate("easy")}
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2.5 text-label font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            متقن
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setIsFlipped(true)} className="u-cta w-full">
          اقلب البطاقة
        </button>
      )}

      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={handlePrev} className="u-ghost min-h-10">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span>السابق</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="البطاقة التالية"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ClozeRecallList({ items }: { items: NormalizedCloze[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 u-card p-8">
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          لا يوجد تحدي ملء فراغات لهذه الوحدة حاليًا.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-semibold text-title text-[var(--ink)] flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" aria-hidden="true" />
          <span>تحدي استرجاع المصطلحات الأساسية</span>
        </h2>
        <p className="text-body-sm text-[var(--ink-soft)]">
          اكتب المصطلح المناسب في كل فراغ ثم اضغط «تحقّق» لمعرفة النتيجة.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item, idx) => (
          <ClozeCard key={item.id} item={item} index={idx + 1} />
        ))}
      </div>
    </div>
  );
}

type BlankState = {
  value: string;
  checked: boolean;
  correct: boolean;
  revealed: boolean;
};

function ClozeCard({ item, index }: { item: NormalizedCloze; index: number }) {
  const parts = item.text_with_masks.split(/(\{mask\d+\})/g);
  const maskKeys = useMemo(
    () => Array.from(item.text_with_masks.matchAll(/\{mask(\d+)\}/g)).map((m) => `mask${m[1]}`),
    [item.text_with_masks]
  );

  const [blanks, setBlanks] = useState<Record<string, BlankState>>(() =>
    Object.fromEntries(
      maskKeys.map((k) => [k, { value: "", checked: false, correct: false, revealed: false }])
    )
  );

  const [checkedAll, setCheckedAll] = useState(false);
  const correctCount = maskKeys.filter((k) => blanks[k]?.correct).length;

  const updateBlank = (key: string, patch: Partial<BlankState>) => {
    setBlanks((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const checkBlank = (key: string) => {
    const blank = blanks[key];
    const expected = item.answers[key] ?? "";
    if (!blank || !expected) return;
    const correct = isAnswerCorrect(blank.value, expected);
    updateBlank(key, { checked: true, correct });
    if (correct) celebrate();
  };

  const checkAll = () => {
    setCheckedAll(true);
    maskKeys.forEach((k) => checkBlank(k));
  };

  const wrongKeys = maskKeys.filter((k) => blanks[k]?.checked && !blanks[k]?.correct);
  const allCorrect = maskKeys.length > 0 && correctCount === maskKeys.length;

  return (
    <div className="u-card p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--hairline)] gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-label font-semibold flex items-center justify-center">
            {index}
          </span>
          <h3 className="font-semibold text-[var(--ink)] text-body">{item.concept_title}</h3>
        </div>
        {item.category && (
          <span className="text-label px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--ink-soft)] font-medium">
            {item.category}
          </span>
        )}
      </div>

      <p className="text-body leading-loose text-[var(--ink)] font-medium">
        {parts.map((part, i) => {
          const maskMatch = part.match(/\{mask(\d+)\}/);
          if (!maskMatch) return <span key={i}>{part}</span>;

          const maskKey = `mask${maskMatch[1]}`;
          const answer = item.answers[maskKey] ?? "—";
          const blank = blanks[maskKey] ?? {
            value: "",
            checked: false,
            correct: false,
            revealed: false,
          };
          const inputId = `${item.id}-${maskKey}`;

          return (
            <span key={i} className="inline-flex flex-col items-start align-middle mx-1 my-1">
              <span className="inline-flex items-center gap-1.5">
                <label htmlFor={inputId} className="sr-only">
                  الفراغ {maskMatch[1]}
                </label>
                <input
                  id={inputId}
                  type="text"
                  dir="rtl"
                  autoComplete="off"
                  spellCheck={false}
                  value={blank.value}
                  disabled={blank.correct}
                  onChange={(e) => updateBlank(maskKey, { value: e.target.value, checked: false })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      checkBlank(maskKey);
                    }
                  }}
                  aria-invalid={blank.checked && !blank.correct}
                  style={{ width: `${Math.max(5, answer.length + 1)}ch` }}
                  className={`rounded-lg bg-[var(--surface-2)] px-2 py-1 text-center text-body font-semibold outline-none transition-colors focus:ring-2 focus:ring-[var(--ring)] ${
                    blank.correct
                      ? "border-emerald-600 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40"
                      : blank.checked
                        ? "border-rose-500 text-rose-800 dark:text-rose-300"
                        : "bg-[var(--surface-2)] text-[var(--ink)]"
                  } disabled:opacity-100`}
                />
                {blank.checked &&
                  (blank.correct ? (
                    <CheckCircle2
                      className="w-5 h-5 text-emerald-600 shrink-0"
                      aria-label="إجابة صحيحة"
                    />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" aria-label="إجابة خاطئة" />
                  ))}
              </span>

              <span className="min-h-5 mt-1 text-label font-semibold" aria-live="polite">
                {blank.correct && <span className="text-emerald-700">صحيح</span>}
                {blank.checked && !blank.correct && !blank.revealed && (
                  <button
                    type="button"
                    onClick={() => updateBlank(maskKey, { revealed: true })}
                    className="text-rose-700 underline underline-offset-2 hover:text-rose-800"
                  >
                    خطأ — إظهار الإجابة الصحيحة
                  </button>
                )}
                {blank.revealed && (
                  <span className="text-teal-800 dark:text-teal-300">الإجابة: {answer}</span>
                )}
              </span>
            </span>
          );
        })}
      </p>

      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <button
          type="button"
          onClick={checkAll}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-700 text-white font-semibold text-label hover:bg-teal-800 transition-all shadow-[var(--shadow-card)] shadow-teal-700/20"
        >
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          <span>تحقّق</span>
        </button>

        <span className="text-label font-semibold text-[var(--ink-soft)]" aria-live="polite">
          {checkedAll && (
            <span className={allCorrect ? "text-emerald-700" : "text-[var(--ink-soft)]"}>
              {allCorrect
                ? "أحسنت، كل الإجابات صحيحة ✓"
                : `صحيحة ${correctCount} من ${maskKeys.length}` +
                  (wrongKeys.length > 0 ? " — يمكنك إظهار الإجابات الصحيحة" : "")}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
