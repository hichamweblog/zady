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
  Flame,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div
          className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl"
          role="tablist"
        >
          <button
            role="tab"
            aria-selected={activeTab === "flashcards"}
            onClick={() => setActiveTab("flashcards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-label font-bold transition-all ${
              activeTab === "flashcards"
                ? "bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" aria-hidden="true" />
            <span>بطاقات الحفظ السريع ({flashcards.length})</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "cloze"}
            onClick={() => setActiveTab("cloze")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-label font-bold transition-all ${
              activeTab === "cloze"
                ? "bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>تحدي ملء الفراغات ({clozeItems.length})</span>
          </button>
        </div>

        <p className="text-body-sm text-slate-600 dark:text-slate-300 font-medium hidden sm:block">
          {activeTab === "flashcards"
            ? "💡 اضغط Space للقلب، والأرقام (1=صعب، 2=متوسط، 3=متقن)"
            : "🎯 انقر فوق الفراغ لكشف المصطلح المطلوب بدقة"}
        </p>
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
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
        <p className="font-bold text-slate-700 dark:text-slate-200">
          لا توجد بطاقات حفظ لهذه الوحدة حاليًا.
        </p>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" aria-hidden="true" />
        <h3 className="font-bold text-slate-900 dark:text-white text-title">
          رائع! لقد أتقنت جميع بطاقات هذه الوحدة!
        </h3>
        <button
          onClick={() => {
            setOnlyUnmastered(false);
            setCurrentIndex(0);
          }}
          className="px-5 py-2.5 rounded-xl bg-teal-700 text-white font-bold text-label"
        >
          عرض جميع البطاقات مجددًا
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-label font-bold text-slate-600 dark:text-slate-300 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900">
            بطاقة {safeIndex + 1} من {activeDeck.length}
          </span>
          {currentCard.section && (
            <span className="truncate max-w-[180px] text-slate-600 dark:text-slate-300">
              {currentCard.section}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setOnlyUnmastered((prev) => !prev);
              setCurrentIndex(0);
            }}
            aria-pressed={onlyUnmastered}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-label transition-colors ${
              onlyUnmastered
                ? "bg-teal-700 text-white border-teal-700"
                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{onlyUnmastered ? "عرض الكل" : "غير المتقنة فقط"}</span>
          </button>

          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>خلط</span>
          </button>
        </div>
      </div>

      {/* البطاقة ثلاثية الأبعاد — CSS خالص بدل مكتبة حركة كاملة */}
      <div
        role="button"
        tabIndex={0}
        aria-label={
          isFlipped
            ? "البطاقة مقلوبة على الإجابة — انقر للعودة إلى السؤال"
            : "اقلب البطاقة لعرض الإجابة"
        }
        aria-pressed={isFlipped}
        className="w-full min-h-[22rem] cursor-pointer perspective-1000 select-none rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:min-h-[26rem]"
        onClick={() => setIsFlipped((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === "") {
            event.preventDefault();
            setIsFlipped((prev) => !prev);
          }
        }}
      >
        <div
          className="relative flex min-h-[22rem] w-full flex-col rounded-3xl shadow-xl transform-style-preserve-3d sm:min-h-[26rem] transition-transform duration-500 ease-in-out"
          style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* الوجه: السؤال */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl p-5 sm:p-10 border-2 border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <span className="text-label font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <span>السؤال / المفهوم</span>
              </span>
              <span className="text-label text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-bold">
                انقر للقلب 🔄
              </span>
            </div>

            <div className="my-auto text-center px-4 overflow-y-auto max-h-52">
              <p className="text-display sm:text-heading font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentCard.question}
              </p>
            </div>

            <div className="flex items-center justify-between text-label text-slate-600 dark:text-slate-300 font-bold">
              <span>اضغط Space للقلب</span>
              {currentRating && (
                <span
                  className={`px-2.5 py-1 rounded-lg font-bold text-label ${
                    currentRating === "easy"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                      : currentRating === "medium"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {currentRating === "easy"
                    ? "متقن ✓"
                    : currentRating === "medium"
                      ? "متوسط"
                      : "يحتاج مراجعة"}
                </span>
              )}
            </div>
          </div>

          {/* الظهر: الإجابة */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 rounded-3xl p-5 sm:p-10 text-white border-2 border-teal-500/40 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between gap-2">
              <span className="text-label font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>الإجابة النموذجية</span>
              </span>
              <span className="text-label text-teal-200/90 bg-teal-800/40 px-2.5 py-1 rounded-full font-bold">
                شرح معتمد
              </span>
            </div>

            <div className="my-auto px-2 overflow-y-auto max-h-56 text-right">
              <p className="text-title font-bold leading-loose text-slate-100 whitespace-pre-line">
                {currentCard.answer}
              </p>
            </div>

            <div className="text-center text-label text-teal-300/90 font-bold">
              قيّم مستوى حفظك أسفل البطاقة للمتابعة
            </div>
          </div>
        </div>
      </div>

      {/* تقييم ذاتي ثلاثي */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <span className="text-label font-bold text-slate-600 dark:text-slate-300 block text-center">
          ما مدى تمكنك من الإجابة؟ (انقر أو اضغط 1، 2، 3)
        </span>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleRate("hard")}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 font-bold text-label hover:bg-rose-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" aria-hidden="true" />
            <span>صعب (1)</span>
          </button>

          <button
            onClick={() => handleRate("medium")}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 font-bold text-label hover:bg-amber-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
            <span>متوسط (2)</span>
          </button>

          <button
            onClick={() => handleRate("easy")}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold text-label hover:bg-emerald-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>أتقنته (3)</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-label transition-all shadow-sm"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          <span>السابق</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-label transition-all shadow-sm"
        >
          <span>التالي</span>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ClozeRecallList({ items }: { items: NormalizedCloze[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
        <p className="font-bold text-slate-700 dark:text-slate-200">
          لا يوجد تحدي ملء فراغات لهذه الوحدة حاليًا.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-bold text-title text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" aria-hidden="true" />
          <span>تحدي استرجاع المصطلحات الأساسية</span>
        </h2>
        <p className="text-body-sm text-slate-600 dark:text-slate-300">
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
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-label font-bold flex items-center justify-center">
            {index}
          </span>
          <h3 className="font-bold text-slate-900 dark:text-white text-body">
            {item.concept_title}
          </h3>
        </div>
        {item.category && (
          <span className="text-label px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            {item.category}
          </span>
        )}
      </div>

      <p className="text-body leading-loose text-slate-800 dark:text-slate-200 font-medium">
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
                  className={`text-body font-bold text-center px-2 py-1 rounded-xl border-2 bg-white dark:bg-slate-800 outline-none transition-colors focus:ring-2 focus:ring-teal-500/40 ${
                    blank.correct
                      ? "border-emerald-600 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40"
                      : blank.checked
                        ? "border-rose-500 text-rose-800 dark:text-rose-300"
                        : "border-dashed border-slate-400 dark:border-slate-600 text-slate-900 dark:text-white"
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

              <span className="min-h-5 mt-1 text-label font-bold" aria-live="polite">
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-700 text-white font-bold text-label hover:bg-teal-800 transition-all shadow-sm shadow-teal-700/20"
        >
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          <span>تحقّق</span>
        </button>

        <span
          className="text-label font-bold text-slate-600 dark:text-slate-300"
          aria-live="polite"
        >
          {checkedAll && (
            <span
              className={allCorrect ? "text-emerald-700" : "text-slate-700 dark:text-slate-300"}
            >
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
