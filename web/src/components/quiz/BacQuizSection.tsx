"use client";

import { useMemo, useState } from "react";
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  Award,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  BookOpen,
  Quote,
  Target,
} from "lucide-react";
import { celebrate } from "@/lib/celebrate";
import type { NormalizedQuestion } from "@/lib/types";
import { shortCategory } from "@/lib/labels";
import { useProgress } from "@/lib/useProgressStore";

interface BacQuizSectionProps {
  unitId: number;
  questions: NormalizedQuestion[];
}

export default function BacQuizSection({ unitId, questions }: BacQuizSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});

  const { toggleQuestion, isQuestionMastered } = useProgress();

  const categories = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.category) set.add(q.category);
    });
    return Array.from(set);
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return questions.filter((q) => {
      const matchesCategory = selectedCategory === "all" || q.category === selectedCategory;
      const matchesSearch =
        query.length === 0 ||
        q.question.toLowerCase().includes(query) ||
        q.modelAnswer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [questions, selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    filteredQuestions.forEach((q) => {
      all[q.id] = true;
    });
    setExpandedAnswers(all);
  };

  const masteredCount = questions.filter((q) => isQuestionMastered(unitId, q.id)).length;

  const handleMasterQuestion = (id: string) => {
    const wasMastered = isQuestionMastered(unitId, id);
    toggleQuestion(unitId, id);
    if (!wasMastered) {
      celebrate({
        particleCount: 24,
        spread: 45,
        origin: { y: 0.8 },
        colors: ["#10b981", "#14b8a6", "#0d9488"],
      });
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
        <p className="font-bold text-slate-700 dark:text-slate-200">
          لا توجد أسئلة بكالوريا لهذه الوحدة حاليًا.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900">
              {questions.length} سؤالًا
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900">
              متقن: {masteredCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              كشف جميع الإجابات
            </button>
            <button
              onClick={() => setExpandedAnswers({})}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              إخفاء الكل
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="البحث في نصوص الأسئلة والإجابات"
            placeholder="ابحث في نصوص الأسئلة والإجابات..."
            className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setSelectedCategory("all")}
            aria-pressed={selectedCategory === "all"}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === "all"
                ? "bg-teal-700 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            جميع الأسئلة ({questions.length})
          </button>
          {categories.map((category) => {
            const count = questions.filter((q) => q.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
                title={category}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === category
                    ? "bg-teal-700 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span className="sm:hidden">{shortCategory(category)} ({count})</span>
                <span className="hidden sm:inline">{category} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base">
              لا توجد أسئلة تطابق بحثك
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              جرّب تغيير كلمات البحث أو اختيار تصنيف آخر.
            </p>
          </div>
        ) : (
          filteredQuestions.map((question, idx) => {
            const isExpanded = !!expandedAnswers[question.id];
            const isMastered = isQuestionMastered(unitId, question.id);
            const bodyId = `bac-answer-${question.id}`;

            return (
              <article
                key={question.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 shadow-sm overflow-hidden ${
                  isMastered
                    ? "border-emerald-300 dark:border-emerald-900/60"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => toggleExpand(question.id)}
                    aria-expanded={isExpanded}
                    aria-controls={bodyId}
                    className="space-y-2 flex-1 text-right"
                  >
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {question.category}
                      </span>
                      {question.session && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300">
                          {question.session}
                        </span>
                      )}
                      {typeof question.officialMarks === "number" && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {question.officialMarks} ن
                        </span>
                      )}
                      {isMastered && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                          <span>تم الإتقان</span>
                        </span>
                      )}
                    </span>

                    <span className="block text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                      {question.question}
                    </span>

                    {question.text && (
                      <span className="block mt-2 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border-r-4 border-amber-500 font-quran text-sm sm:text-base text-amber-950 dark:text-amber-100 leading-loose">
                        {question.text}
                        {question.reference && (
                          <span className="font-sans text-[11px] font-bold text-amber-800 dark:text-amber-300 ms-1">
                            {question.reference}
                          </span>
                        )}
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    <button
                      onClick={() => handleMasterQuestion(question.id)}
                      aria-pressed={isMastered}
                      aria-label={isMastered ? "إلغاء وسم الإتقان" : "تحديد السؤال كمتقن"}
                      className={`p-2 rounded-xl transition-colors ${
                        isMastered
                          ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    </button>

                    <button
                      onClick={() => toggleExpand(question.id)}
                      aria-expanded={isExpanded}
                      aria-controls={bodyId}
                      aria-label={isExpanded ? "إخفاء الإجابة" : "عرض الإجابة"}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    id={bodyId}
                    className="border-t border-slate-100 dark:border-slate-800/80 p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-950/30 space-y-5"
                  >
                    {question.anchor && (
                      <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <Target className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="text-sm text-slate-800 dark:text-slate-200">
                          <span className="font-bold">محل الشاهد: </span>
                          <span className="font-quran text-base">«{question.anchor}»</span>
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-teal-800 dark:text-teal-400">
                        <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                        <span>عناصر الإجابة النموذجية</span>
                      </div>
                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-relaxed whitespace-pre-line font-medium shadow-sm">
                        {question.modelAnswer}
                      </div>
                    </div>

                    {question.scoringRubric && question.scoringRubric.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 dark:text-emerald-400">
                          <Award className="w-4 h-4" aria-hidden="true" />
                          <span>سلم التنقيط وتوزيع الدرجات</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 divide-y divide-emerald-200/60 dark:divide-emerald-900/40">
                          {question.scoringRubric.map((item, i) => (
                            <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-sm">
                              <span className="text-emerald-950 dark:text-emerald-100 font-semibold">
                                {item.criterion}
                              </span>
                              <span className="font-black px-2.5 py-0.5 rounded-lg bg-emerald-200/80 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200 shrink-0">
                                +{item.points} ن
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.examinerNotes && (
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-100 text-sm">
                        <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="space-y-1">
                          <span className="font-extrabold block text-amber-900 dark:text-amber-300">
                            تنبيه وملاحظة المصحح:
                          </span>
                          <span className="leading-relaxed block">{question.examinerNotes}</span>
                        </div>
                      </div>
                    )}

                    {!question.scoringRubric && typeof question.officialMarks !== "number" && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                        لم يُرفق سلم تنقيط تفصيلي بهذا السؤال — اعتمد على عناصر الإجابة أعلاه.
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
        <Quote className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
        الأسئلة والأجوبة مستخرجة من الملخصات المنهجية المعتمدة وأسئلة البكالوريا الرسمية — يُنصح
        بمقارنتها مع التصحيح الرسمي لسنة الامتحان.
      </p>
    </div>
  );
}
