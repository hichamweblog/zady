"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { celebrate } from "@/lib/celebrate";
import {
  ChevronRight,
  ChevronLeft,
  Shuffle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Flame,
  Award,
  Layers,
  Filter,
} from "lucide-react";
import type { NormalizedFlashcard, NormalizedCloze } from "@/lib/types";
import { useProgress, type CardRating } from "@/lib/useProgressStore";

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
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "flashcards"}
            onClick={() => setActiveTab("flashcards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "cloze"
                ? "bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>تحدي ملء الفراغات ({clozeItems.length})</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium hidden sm:block">
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
        <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
          رائع! لقد أتقنت جميع بطاقات هذه الوحدة!
        </h3>
        <button
          onClick={() => {
            setOnlyUnmastered(false);
            setCurrentIndex(0);
          }}
          className="px-5 py-2.5 rounded-xl bg-teal-700 text-white font-bold text-xs"
        >
          عرض جميع البطاقات مجددًا
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 flex-wrap gap-2">
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs transition-colors ${
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
        aria-label={isFlipped ? "البطاقة مقلوبة على الإجابة — انقر للعودة إلى السؤال" : "اقلب البطاقة لعرض الإجابة"}
        aria-pressed={isFlipped}
        className="w-full h-80 sm:h-96 cursor-pointer perspective-1000 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-3xl"
        onClick={() => setIsFlipped((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsFlipped((prev) => !prev);
          }
        }}
      >
        <div
          className="w-full h-full relative rounded-3xl shadow-xl transform-style-preserve-3d transition-transform duration-500 ease-in-out"
          style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* الوجه: السؤال */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl p-8 sm:p-10 border-2 border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <span>السؤال / المفهوم</span>
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-bold">
                انقر للقلب 🔄
              </span>
            </div>

            <div className="my-auto text-center px-4 overflow-y-auto max-h-52">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-relaxed">
                {currentCard.question}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-bold">
              <span>اضغط Space للقلب</span>
              {currentRating && (
                <span
                  className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                    currentRating === "easy"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                      : currentRating === "medium"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {currentRating === "easy" ? "متقن ✓" : currentRating === "medium" ? "متوسط" : "يحتاج مراجعة"}
                </span>
              )}
            </div>
          </div>

          {/* الظهر: الإجابة */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 rounded-3xl p-8 sm:p-10 text-white border-2 border-teal-500/40 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>الإجابة النموذجية</span>
              </span>
              <span className="text-xs text-teal-200/90 bg-teal-800/40 px-2.5 py-1 rounded-full font-bold">
                شرح معتمد
              </span>
            </div>

            <div className="my-auto px-2 overflow-y-auto max-h-56 text-right">
              <p className="text-lg sm:text-xl font-bold leading-loose text-slate-100 whitespace-pre-line">
                {currentCard.answer}
              </p>
            </div>

            <div className="text-center text-xs text-teal-300/90 font-bold">
              قيّم مستوى حفظك أسفل البطاقة للمتابعة
            </div>
          </div>
        </div>
      </div>

      {/* تقييم ذاتي ثلاثي */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block text-center">
          ما مدى تمكنك من الإجابة؟ (انقر أو اضغط 1، 2، 3)
        </span>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleRate("hard")}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" aria-hidden="true" />
            <span>صعب (1)</span>
          </button>

          <button
            onClick={() => handleRate("medium")}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
            <span>متوسط (2)</span>
          </button>

          <button
            onClick={() => handleRate("easy")}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>أتقنته (3)</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-sm"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          <span>السابق</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-sm"
        >
          <span>التالي</span>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ClozeRecallList({ items }: { items: NormalizedCloze[] }) {
  const [revealedBlanks, setRevealedBlanks] = useState<Record<string, boolean>>({});

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
        <p className="font-bold text-slate-700 dark:text-slate-200">
          لا يوجد تحدي ملء فراغات لهذه الوحدة حاليًا.
        </p>
      </div>
    );
  }

  const toggleBlank = (key: string) => {
    setRevealedBlanks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const revealAll = () => {
    const all: Record<string, boolean> = {};
    items.forEach((item) => {
      Object.keys(item.answers).forEach((k) => {
        all[`${item.id}_${k}`] = true;
      });
    });
    setRevealedBlanks(all);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" aria-hidden="true" />
          <span>تحدي استرجاع المصطلحات الأساسية</span>
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={revealAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>إظهار جميع الفراغات</span>
          </button>
          <button
            onClick={() => setRevealedBlanks({})}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
            <span>إخفاء الكل</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item, idx) => (
          <ClozeCard
            key={item.id}
            item={item}
            index={idx + 1}
            revealedBlanks={revealedBlanks}
            onToggleBlank={toggleBlank}
          />
        ))}
      </div>
    </div>
  );
}

function ClozeCard({
  item,
  index,
  revealedBlanks,
  onToggleBlank,
}: {
  item: NormalizedCloze;
  index: number;
  revealedBlanks: Record<string, boolean>;
  onToggleBlank: (key: string) => void;
}) {
  const parts = item.text_with_masks.split(/(\{mask\d+\})/g);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-xs font-black flex items-center justify-center">
            {index}
          </span>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.concept_title}</h3>
        </div>
        {item.category && (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            {item.category}
          </span>
        )}
      </div>

      <p className="text-base sm:text-lg leading-loose text-slate-800 dark:text-slate-200 font-medium">
        {parts.map((part, i) => {
          const maskMatch = part.match(/\{mask(\d+)\}/);
          if (maskMatch) {
            const maskKey = `mask${maskMatch[1]}`;
            const fullKey = `${item.id}_${maskKey}`;
            const answer = item.answers[maskKey] ?? "—";
            const isRevealed = !!revealedBlanks[fullKey];

            return (
              <button
                key={i}
                onClick={() => onToggleBlank(fullKey)}
                aria-pressed={isRevealed}
                aria-label={isRevealed ? `إخفاء ${answer}` : "كشف المصطلح"}
                className={`inline-flex items-center justify-center px-3 py-1 mx-1 rounded-xl text-sm font-black transition-all align-middle ${
                  isRevealed
                    ? "bg-teal-700 text-white shadow-sm ring-2 ring-teal-400"
                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-dashed border-amber-500 hover:bg-amber-200"
                }`}
              >
                {isRevealed ? answer : "اضغط للكشف ❓"}
              </button>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>

      {item.prohibited_synonyms && item.prohibited_synonyms.length > 0 && (
        <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-300 text-xs sm:text-sm font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
          <p>
            <span className="font-bold">تنبيه منهجي: </span>
            <span>
              تجنب استخدام المترادفات غير الدقيقة: ({item.prohibited_synonyms.join("، ")})، واقتصر
              على المصطلح الاصطلاحي المحدد.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
