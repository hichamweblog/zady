"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Layers,
  BookOpen,
  Sparkles,
  HelpCircle,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  CheckSquare,
} from "lucide-react";
import { NormalizedUnit } from "@/lib/types";
import MindmapViewer from "@/components/mindmap/MindmapViewer";
import StandardLessonViewer from "@/components/lesson/StandardLessonViewer";
import FlashcardSection from "@/components/flashcards/FlashcardSection";
import BacQuizSection from "@/components/quiz/BacQuizSection";
import McqQuizViewer from "@/components/quiz/McqQuizViewer";
import { useProgress } from "@/lib/useProgressStore";
import { UNITS } from "@/lib/data-loader";

export default function UnitClientView({ unit }: { unit: NormalizedUnit }) {
  const [activeTab, setActiveTab] = useState<
    "mindmap" | "lesson" | "flashcards" | "mcq" | "quiz"
  >("mindmap");
  const { getUnitStats } = useProgress();

  const sectionKeys = Object.keys(unit.standardData?.detailed_explanation || {});
  const cardIds = unit.flashcards.map((c) => c.id);
  const questionIds = unit.questions.map((q) => q.id);
  const stats = getUnitStats(
    unit.id,
    cardIds,
    questionIds,
    sectionKeys,
    unit.quizQuestions.length
  );

  const prevUnit = UNITS.find((u) => u.id === unit.id - 1);
  const nextUnit = UNITS.find((u) => u.id === unit.id + 1);

  const tabs = [
    {
      id: "mindmap",
      label: "1. الخريطة الذهنية",
      icon: Layers,
      count: unit.mindmapRoot.children?.length || 4,
      unitLabel: "محاور",
    },
    {
      id: "lesson",
      label: "2. الدرس المنهجي",
      icon: BookOpen,
      count: null,
    },
    {
      id: "flashcards",
      label: "3. الحفظ والاسترجاع",
      icon: Sparkles,
      count: unit.flashcards.length,
      unitLabel: "بطاقة",
    },
    {
      id: "mcq",
      label: "4. اختبار الـ QCM",
      icon: CheckSquare,
      count: unit.quizQuestions?.length || 0,
      unitLabel: "سؤال",
    },
    {
      id: "quiz",
      label: "5. بنك أسئلة البكالوريا",
      icon: HelpCircle,
      count: unit.questions.length,
      unitLabel: "سؤال",
    },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link href="/" className="hover:text-teal-600 transition-colors">
          الرئيسية
        </Link>
        <span>/</span>
        <span className="text-teal-600 dark:text-teal-400">{unit.badge}</span>
      </div>

      {/* Unit Hero Card */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/20 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-teal-600 text-white text-xs font-black shadow-sm shadow-teal-600/30">
                {unit.badge}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
                {unit.field}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {unit.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>المدة التقديرية: {unit.timeAllocation}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>المستهدف: {unit.targetAudience}</span>
              </span>
            </div>
          </div>

          {/* Progress widget */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm min-w-[240px] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">نسبة الإتقان للوحدة</span>
              <span className="text-teal-600 dark:text-teal-400 text-sm font-black">
                {stats.progressPercentage}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                style={{ width: `${stats.progressPercentage}%` }}
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1 flex-wrap gap-2">
              <span>{stats.readSectionsCount}/{sectionKeys.length} محاور</span>
              <span>{stats.learnedCards} بطاقة</span>
              <span>{stats.masteredQuestions} سؤال BAC</span>
            </div>
          </div>
        </div>

        {/* 5 Study Mode Tabs Bar */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative shrink-0 flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[500px]">
        {activeTab === "mindmap" && (
          <MindmapViewer
            rootNode={unit.mindmapRoot}
            imageSrc={unit.mindmapImage}
            unitTitle={unit.shortTitle}
          />
        )}

        {activeTab === "lesson" && (
          <StandardLessonViewer unitId={unit.id} standardData={unit.standardData} />
        )}

        {activeTab === "flashcards" && (
          <FlashcardSection
            unitId={unit.id}
            flashcards={unit.flashcards}
            clozeItems={unit.clozeItems}
          />
        )}

        {activeTab === "mcq" && (
          <McqQuizViewer
            unitId={unit.id}
            unitTitle={unit.shortTitle}
            questions={unit.quizQuestions}
          />
        )}

        {activeTab === "quiz" && (
          <BacQuizSection unitId={unit.id} questions={unit.questions} />
        )}
      </div>

      {/* Previous & Next Unit Navigation */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        {prevUnit ? (
          <Link
            href={`/units/${prevUnit.id}`}
            className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-all group"
          >
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 block">الوحدة السابقة</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 transition-colors">
                {prevUnit.shortTitle}
              </span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextUnit ? (
          <Link
            href={`/units/${nextUnit.id}`}
            className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-all group"
          >
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 block">الوحدة الموالية</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 transition-colors">
                {nextUnit.shortTitle}
              </span>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
