"use client";

import { useState, useMemo } from "react";
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Award,
  ChevronDown,
  ChevronUp,
  FileCheck,
  BookOpen,
} from "lucide-react";
import { NormalizedQuestion } from "@/lib/types";
import { useProgress } from "@/lib/useProgressStore";
import confetti from "canvas-confetti";

interface BacQuizSectionProps {
  unitId: number;
  questions: NormalizedQuestion[];
}

export default function BacQuizSection({ unitId, questions }: BacQuizSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});

  const { toggleQuestion, isQuestionMastered } = useProgress();

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.category) set.add(q.category);
    });
    return Array.from(set);
  }, [questions]);

  // Filter questions based on category and search
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesCat =
        selectedCategory === "all" || q.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.modelAnswer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
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

  const collapseAll = () => setExpandedAnswers({});

  const handleMasterQuestion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleQuestion(unitId, id);
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 },
      colors: ["#10b981", "#059669", "#34d399"],
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في نصوص الأسئلة والإجابات..."
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Quick Expand / Collapse */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={expandAll}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              كشف جميع الإجابات
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              إخفاء الكل
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === "all"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            جميع الأسئلة ({questions.length})
          </button>
          {categories.map((cat) => {
            const count = questions.filter((q) => q.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-base">
              لا توجد أسئلة تطابق بحثك
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              جرب تغيير كلمات البحث أو اختيار تصنيف آخر.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isExpanded = !!expandedAnswers[q.id];
            const isMastered = isQuestionMastered(unitId, q.id);

            return (
              <div
                key={q.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 shadow-sm overflow-hidden ${
                  isMastered
                    ? "border-emerald-200 dark:border-emerald-900/60"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                {/* Question Header & Toggle */}
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="p-5 sm:p-6 cursor-pointer flex items-start justify-between gap-4 select-none"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {q.category}
                      </span>
                      {q.section && (
                        <span className="text-[11px] font-medium text-slate-400">
                          {q.section}
                        </span>
                      )}
                      {isMastered && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>تم الإتقان</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                      {q.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    <button
                      onClick={(e) => handleMasterQuestion(q.id, e)}
                      className={`p-2 rounded-xl transition-colors ${
                        isMastered
                          ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                      }`}
                      title={isMastered ? "إلغاء وسم الإتقان" : "تحديد السؤال كمتقن"}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <div className="p-2 text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Details / Answer / Rubric / Examiner Notes */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800/80 p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-950/30 space-y-5">
                    {/* Model Answer */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-teal-700 dark:text-teal-400">
                        <FileCheck className="w-4 h-4" />
                        <span>عناصر الإجابة النموذجية</span>
                      </div>
                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-relaxed whitespace-pre-line font-medium shadow-sm">
                        {q.modelAnswer}
                      </div>
                    </div>

                    {/* Scoring Rubric */}
                    {q.scoringRubric && q.scoringRubric.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                          <Award className="w-4 h-4" />
                          <span>سلم التنقيط وتوزيع الدرجات</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 divide-y divide-emerald-200/50 dark:divide-emerald-900/40">
                          {q.scoringRubric.map((r, i) => (
                            <div
                              key={i}
                              className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-sm"
                            >
                              <span className="text-emerald-950 dark:text-emerald-100 font-semibold">
                                {r.criterion}
                              </span>
                              <span className="font-black px-2.5 py-0.5 rounded-lg bg-emerald-200/80 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200">
                                +{r.points} ن
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Examiner Notes */}
                    {q.examinerNotes && (
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-100 text-sm">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-extrabold block text-amber-900 dark:text-amber-300">
                            تنبيه وملاحظة المصحح:
                          </span>
                          <span className="leading-relaxed block">
                            {q.examinerNotes}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
