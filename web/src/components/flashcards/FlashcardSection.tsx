"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
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
  Check,
} from "lucide-react";
import { NormalizedFlashcard, NormalizedCloze } from "@/lib/types";
import { useProgress, CardRating } from "@/lib/useProgressStore";

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
      {/* Tab Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "flashcards"}
            onClick={() => setActiveTab("flashcards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "flashcards"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>بطاقات الحفظ السريع ({flashcards.length})</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "cloze"}
            onClick={() => setActiveTab("cloze")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "cloze"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>تحدي ملء الفراغات (Active Recall)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          {activeTab === "flashcards"
            ? "💡 اضغط Space للقلب، والأرقام (1=صعب، 2=متوسط، 3=متقن)"
            : "🎯 انقر فوق الفراغ لكشف المصطلح المطلوب بدقة"}
        </div>
      </div>

      {activeTab === "flashcards" ? (
        <FlashcardsDeck unitId={unitId} cards={flashcards} />
      ) : (
        <ClozeRecallList items={clozeItems} />
      )}
    </div>
  );
}

function FlashcardsDeck({
  unitId,
  cards,
}: {
  unitId: number;
  cards: NormalizedFlashcard[];
}) {
  const [deck, setDeck] = useState<NormalizedFlashcard[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [onlyUnmastered, setOnlyUnmastered] = useState(false);

  const { rateFlashcard, getFlashcardRating } = useProgress();

  // Filter deck if only unmastered selected
  const activeDeck = useMemo(() => {
    if (!onlyUnmastered) return deck;
    return deck.filter((c) => getFlashcardRating(unitId, c.id) !== "easy");
  }, [deck, onlyUnmastered, getFlashcardRating, unitId]);

  const currentCard = activeDeck[currentIndex] || activeDeck[0];
  const currentRating = currentCard ? getFlashcardRating(unitId, currentCard.id) : undefined;

  const flipCard = () => setIsFlipped((prev) => !prev);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1 < activeDeck.length ? prev + 1 : 0));
  }, [activeDeck.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : activeDeck.length - 1));
  }, [activeDeck.length]);

  const handleShuffle = () => {
    const shuffled = [...activeDeck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRate = (rating: CardRating) => {
    if (!currentCard) return;
    rateFlashcard(unitId, currentCard.id, rating);

    if (rating === "easy") {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.8 },
        colors: ["#10b981", "#14b8a6", "#f59e0b"],
      });
    }

    setTimeout(handleNext, 250);
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        flipCard();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "1") {
        handleRate("hard");
      } else if (e.key === "2") {
        handleRate("medium");
      } else if (e.key === "3") {
        handleRate("easy");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, currentCard]);

  if (!currentCard) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
        <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">
          رائع! لقد أتقنت جميع بطاقات هذه الوحدة!
        </h4>
        <button
          onClick={() => setOnlyUnmastered(false)}
          className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
        >
          عرض جميع البطاقات مجدداً
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Deck Stats & Controls */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900">
            بطاقة {currentIndex + 1} من {activeDeck.length}
          </span>
          {currentCard.section && (
            <span className="truncate max-w-[180px] text-slate-400">
              {currentCard.section}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setOnlyUnmastered(!onlyUnmastered);
              setCurrentIndex(0);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs transition-colors ${
              onlyUnmastered
                ? "bg-teal-600 text-white border-teal-600"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{onlyUnmastered ? "عرض الكل" : "غير المتقنة فقط"}</span>
          </button>

          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="ترتيب عشوائي للبطاقات"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>خلط</span>
          </button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        role="button"
        tabIndex={0}
        aria-label="اقلب البطاقة"
        className="w-full h-80 sm:h-96 cursor-pointer perspective-1000 select-none focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-3xl"
        onClick={flipCard}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            flipCard();
          }
        }}
      >
        <motion.div
          className="w-full h-full relative rounded-3xl shadow-xl transform-style-preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        >
          {/* FRONT OF CARD (Question) */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl p-8 sm:p-10 border-2 border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>السؤال / المفهوم</span>
              </span>
              <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-bold">
                انقر للقلب 🔄
              </span>
            </div>

            <div className="my-auto text-center px-4">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-relaxed">
                {currentCard.question}
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>اضغط Space للقلب</span>
              {currentRating && (
                <span
                  className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                    currentRating === "easy"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : currentRating === "medium"
                      ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                      : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {currentRating === "easy" ? "متقن ✓" : currentRating === "medium" ? "متوسط" : "يحتاج مراجعة"}
                </span>
              )}
            </div>
          </div>

          {/* BACK OF CARD (Answer) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 rounded-3xl p-8 sm:p-10 text-white border-2 border-teal-500/40 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>الإجابة النموذجية</span>
              </span>
              <span className="text-xs text-teal-200/80 bg-teal-800/40 px-2.5 py-1 rounded-full font-bold">
                شرح معتمد
              </span>
            </div>

            <div className="my-auto px-2 overflow-y-auto max-h-56 text-right">
              <p className="text-lg sm:text-xl font-bold leading-loose text-slate-100 whitespace-pre-line">
                {currentCard.answer}
              </p>
            </div>

            <div className="text-center text-xs text-teal-300/80 font-bold">
              قيّم مستوى حفظك أسفل البطاقة للمتابعة
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3-Level Self-Rating Buttons */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <span className="text-xs font-bold text-slate-400 block text-center">
          ما مدى تمكنك من الإجابة؟ (انقر أو اضغط 1، 2، 3)
        </span>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleRate("hard")}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>صعب (1)</span>
          </button>

          <button
            onClick={() => handleRate("medium")}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>متوسط (2)</span>
          </button>

          <button
            onClick={() => handleRate("easy")}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>أتقنته (3)</span>
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
          <span>السابق</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-sm"
        >
          <span>التالي</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ClozeRecallList({ items }: { items: NormalizedCloze[] }) {
  const [revealedBlanks, setRevealedBlanks] = useState<Record<string, boolean>>({});

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

  const hideAll = () => setRevealedBlanks({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>تحدي استرجاع المصطلحات الأساسية (Active Recall)</span>
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={revealAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>إظهار جميع الفراغات</span>
          </button>
          <button
            onClick={hideAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" />
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
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 text-xs font-black flex items-center justify-center">
            {index}
          </span>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            {item.concept_title}
          </h4>
        </div>
        {item.category && (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
            {item.category}
          </span>
        )}
      </div>

      {/* Render text with interactive masks */}
      <div className="text-base sm:text-lg leading-loose text-slate-800 dark:text-slate-200 font-medium">
        {parts.map((part, i) => {
          const maskMatch = part.match(/\{mask(\d+)\}/);
          if (maskMatch) {
            const maskKey = `mask${maskMatch[1]}`;
            const fullKey = `${item.id}_${maskKey}`;
            const answer = item.answers[maskKey];
            const isRevealed = !!revealedBlanks[fullKey];

            return (
              <button
                key={i}
                onClick={() => onToggleBlank(fullKey)}
                className={`inline-flex items-center justify-center px-3 py-1 mx-1 rounded-xl text-sm font-black transition-all ${
                  isRevealed
                    ? "bg-teal-600 text-white shadow-sm ring-2 ring-teal-400"
                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-dashed border-amber-400 hover:bg-amber-200"
                }`}
                title={isRevealed ? "انقر للإخفاء" : "انقر للكشف عن الكلمة"}
              >
                {isRevealed ? answer : "اضغط للكشف ❓"}
              </button>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>

      {/* Prohibited Synonyms Warning */}
      {item.prohibited_synonyms && item.prohibited_synonyms.length > 0 && (
        <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div>
            <span className="font-bold">تنبيه منهجي: </span>
            <span>تجنب استخدام المترادفات غير الدقيقة: ({item.prohibited_synonyms.join("، ")})، واقتصر على المصطلح الاصطلاحي المحدد.</span>
          </div>
        </div>
      )}
    </div>
  );
}
