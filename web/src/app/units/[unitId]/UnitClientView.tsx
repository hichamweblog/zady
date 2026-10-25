"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
  CheckSquare,
  Zap,
} from "lucide-react";
import type { ClientUnit, UnitMeta } from "@/lib/types";
import MindmapViewer from "@/components/mindmap/MindmapViewer";
import StandardLessonViewer from "@/components/lesson/StandardLessonViewer";
import FlashcardSection from "@/components/flashcards/FlashcardSection";
import BacQuizSection from "@/components/quiz/BacQuizSection";
import McqQuizViewer from "@/components/quiz/McqQuizViewer";
import RevisionSection from "@/components/revision/RevisionSection";
import { useProgress } from "@/lib/useProgressStore";

type TabId = "mindmap" | "lesson" | "flashcards" | "mcq" | "quiz" | "revision";

interface UnitClientViewProps {
  unit: ClientUnit;
  previousUnit?: UnitMeta;
  nextUnit?: UnitMeta;
}

export default function UnitClientView({ unit, previousUnit, nextUnit }: UnitClientViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("mindmap");
  /**
   * التبويبات تُركَّب عند أول زيارة ثم تبقى مركّبة (keep-alive):
   * - تبديل التبويب لم يعد يمحو تقدّم الجلسة (إجابات QCM، موضع البطاقة…)
   * - التبويبات الثقيلة لا تُصيَّر في HTML الأولي فيبقى حجم الصفحة معقولًا
   * - «الخريطة» و«الدرس» مصيَّران خادميًا لأنهما محتوى المادة القابل للفهرسة
   */
  const [mountedTabs, setMountedTabs] = useState<Set<TabId>>(
    () => new Set<TabId>(["mindmap", "lesson"])
  );
  const tabListRef = useRef<HTMLDivElement>(null);
  const { getUnitStats } = useProgress();

  const sectionKeys = unit.sections.map((s) => s.key);
  const cardIds = unit.flashcards.map((c) => c.id);
  const questionIds = unit.questions.map((q) => q.id);
  const stats = getUnitStats(
    unit.id,
    cardIds,
    questionIds,
    sectionKeys,
    unit.quizQuestions.length
  );

  const selectTab = useCallback((id: TabId) => {
    setActiveTab(id);
    setMountedTabs((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const tabs = useMemo<{ id: TabId; label: string; icon: typeof Layers; count: number | null }[]>(
    () => [
      { id: "mindmap", label: "الخريطة الذهنية", icon: Layers, count: unit.mindmapRoot.children?.length ?? 0 },
      { id: "lesson", label: "الدرس المنهجي", icon: BookOpen, count: unit.sections.length },
      { id: "flashcards", label: "الحفظ والاسترجاع", icon: Sparkles, count: unit.flashcards.length },
      { id: "mcq", label: "اختبار QCM", icon: CheckSquare, count: unit.quizQuestions.length },
      { id: "quiz", label: "بنك أسئلة البكالوريا", icon: HelpCircle, count: unit.questions.length },
      {
        id: "revision",
        label: "المراجعة السريعة",
        icon: Zap,
        count:
          unit.revision.lastMinute.length +
          unit.revision.differentiation.length +
          unit.revision.previousBac.length,
      },
    ],
    [unit]
  );

  /** تنقّل لوحة المفاتيح بين التبويبات (RTL: يمين = السابق) */
  const onTabsKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      let nextIndex = currentIndex;
      if (event.key === "ArrowRight") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (currentIndex + 1) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      const nextTab = tabs[nextIndex];
      selectTab(nextTab.id);
      tabListRef.current?.querySelector<HTMLButtonElement>(`#tab-${nextTab.id}`)?.focus();
    },
    [activeTab, tabs, selectTab]
  );

  return (
    <div className="space-y-8">
      {/* مسار التتبّع */}
      <nav aria-label="مسار التصفح" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
          الرئيسية
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-teal-700 dark:text-teal-300">{unit.badge}</span>
      </nav>

      {/* بطاقة الوحدة */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/20 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-teal-700 text-white text-xs font-black shadow-sm shadow-teal-700/30">
                {unit.badge}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold">
                {unit.field}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {unit.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                <span>المدة التقديرية: {unit.timeAllocation}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                <span>المستهدف: {unit.targetAudience}</span>
              </span>
            </div>
          </div>

          {/* نسبة الإتقان — تتحدّث فورًا بفضل المخزن المشترك */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm min-w-[240px] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-200">نسبة الإتقان للوحدة</span>
              <span className="text-teal-700 dark:text-teal-300 text-sm font-black">
                {stats.progressPercentage}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={stats.progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`نسبة إتقان ${unit.shortTitle}`}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
            >
              <div
                style={{ width: `${stats.progressPercentage}%` }}
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium pt-1 flex-wrap gap-2">
              <span>{stats.readSectionsCount}/{sectionKeys.length} محاور</span>
              <span>{stats.learnedCards} بطاقة</span>
              <span>{stats.masteredQuestions} سؤال BAC</span>
            </div>
          </div>
        </div>

        {/* شريط التبويبات الستة */}
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="أنماط الدراسة في الوحدة"
          onKeyDown={onTabsKeyDown}
          className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none"
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectTab(tab.id)}
                className={`relative shrink-0 flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all ${
                  isActive
                    ? "bg-teal-700 text-white shadow-md shadow-teal-700/20"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700/60"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>
                  <span className="text-slate-600 dark:text-slate-400 font-bold me-1">{index + 1}.</span>
                  {tab.label}
                </span>
                {tab.count !== null && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
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

      {/*
        كل التبويبات تبقى مركّبة ويُخفى غير النشط بـ CSS.
        سابقًا كانت تُركّب شرطيًا فكان تبديل التبويب يمحو تقدّم الجلسة
        (إجابات QCM، موضع البطاقة، بحث بنك الأسئلة…).
      */}
      <div className="min-h-[500px]">
        <div role="tabpanel" id="panel-mindmap" aria-labelledby="tab-mindmap" hidden={activeTab !== "mindmap"} className={activeTab === "mindmap" ? "" : "hidden"}>
          <MindmapViewer
            rootNode={unit.mindmapRoot}
            imageSrc={unit.mindmapImage}
            unitTitle={unit.shortTitle}
          />
        </div>

        <div role="tabpanel" id="panel-lesson" aria-labelledby="tab-lesson" hidden={activeTab !== "lesson"} className={activeTab === "lesson" ? "" : "hidden"}>
          <StandardLessonViewer
            unitId={unit.id}
            learningObjective={unit.learningObjective}
            sections={unit.sections}
          />
        </div>

        <div role="tabpanel" id="panel-flashcards" aria-labelledby="tab-flashcards" hidden={activeTab !== "flashcards"} className={activeTab === "flashcards" ? "" : "hidden"}>
          {mountedTabs.has("flashcards") && (
            <FlashcardSection
              unitId={unit.id}
              flashcards={unit.flashcards}
              clozeItems={unit.clozeItems}
            />
          )}
        </div>

        <div role="tabpanel" id="panel-mcq" aria-labelledby="tab-mcq" hidden={activeTab !== "mcq"} className={activeTab === "mcq" ? "" : "hidden"}>
          {mountedTabs.has("mcq") && (
            <McqQuizViewer
              unitId={unit.id}
              unitTitle={unit.shortTitle}
              questions={unit.quizQuestions}
            />
          )}
        </div>

        <div role="tabpanel" id="panel-quiz" aria-labelledby="tab-quiz" hidden={activeTab !== "quiz"} className={activeTab === "quiz" ? "" : "hidden"}>
          {mountedTabs.has("quiz") && (
            <BacQuizSection unitId={unit.id} questions={unit.questions} />
          )}
        </div>

        <div role="tabpanel" id="panel-revision" aria-labelledby="tab-revision" hidden={activeTab !== "revision"} className={activeTab === "revision" ? "" : "hidden"}>
          {mountedTabs.has("revision") && <RevisionSection revision={unit.revision} />}
        </div>
      </div>

      {/* التنقّل بين الوحدات */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        {previousUnit ? (
          <Link
            href={`/units/${previousUnit.id}`}
            className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-all group"
          >
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-700 transition-colors" aria-hidden="true" />
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">الوحدة السابقة</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                {previousUnit.shortTitle}
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
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">الوحدة الموالية</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                {nextUnit.shortTitle}
              </span>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-teal-700 transition-colors" aria-hidden="true" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
