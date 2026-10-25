"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Check,
  ArrowLeft,
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
  const {
    data: progressData,
    getUnitStats,
    setLastActivity,
    isSectionRead,
    isQuestionMastered,
    isFlashcardLearned,
    getQuizAttemptCount,
  } = useProgress();

  const sectionKeys = unit.sections.map((s) => s.key);
  const cardIds = unit.flashcards.map((c) => c.id);
  const questionIds = unit.questions.map((q) => q.id);
  const stats = getUnitStats(unit.id, cardIds, questionIds, sectionKeys, unit.quizQuestions.length);

  const contentRef = useRef<HTMLDivElement | null>(null);

  const selectTab = useCallback(
    (id: TabId) => {
      setActiveTab(id);
      setMountedTabs((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
      // يتذكّر آخر خطوة فتحها الطالب ليستأنفها من الصفحة الرئيسية
      setLastActivity(unit.id, id);
    },
    [setLastActivity, unit.id]
  );

  /**
   * تبديل الخطوة بيد الطالب: نُعيده إلى بداية المحتوى الجديد.
   * بدونه يبقى في منتصف خطوة طويلة فيرى خطوة أخرى «فارغة» أو يظن أن الضغط لم يعمل.
   */
  const selectTabAndScroll = useCallback(
    (id: TabId) => {
      selectTab(id);
      window.requestAnimationFrame(() => {
        const el = contentRef.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        if (top < 64 || top > window.innerHeight * 0.5) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    },
    [selectTab]
  );

  /** إتمام كل خطوة — يُعرض كعلامة ✓ على التبويب (لا تخمين: مدعوم ببيانات التقدّم) */
  const stepDone = useMemo<Record<TabId, boolean>>(
    () => ({
      mindmap: sectionKeys.length > 0 && sectionKeys.every((key) => isSectionRead(unit.id, key)),
      lesson: sectionKeys.length > 0 && sectionKeys.every((key) => isSectionRead(unit.id, key)),
      flashcards: cardIds.length > 0 && cardIds.every((id) => isFlashcardLearned(unit.id, id)),
      mcq: getQuizAttemptCount(unit.id) > 0,
      quiz: questionIds.length > 0 && questionIds.every((id) => isQuestionMastered(unit.id, id)),
      revision: false,
    }),
    [
      cardIds,
      getQuizAttemptCount,
      isFlashcardLearned,
      isQuestionMastered,
      isSectionRead,
      questionIds,
      sectionKeys,
      unit.id,
    ]
  );

  const tabs = useMemo<{ id: TabId; label: string; icon: typeof Layers; count: number | null }[]>(
    () => [
      { id: "mindmap", label: "الخريطة الذهنية", icon: Layers, count: null },
      { id: "lesson", label: "الدرس المنهجي", icon: BookOpen, count: null },
      {
        id: "flashcards",
        label: "الحفظ والاسترجاع",
        icon: Sparkles,
        count: unit.flashcards.length,
      },
      { id: "mcq", label: "اختبار QCM", icon: CheckSquare, count: unit.quizQuestions.length },
      { id: "quiz", label: "بنك الأسئلة", icon: HelpCircle, count: unit.questions.length },
      { id: "revision", label: "المراجعة السريعة", icon: Zap, count: null },
    ],
    [unit]
  );

  /**
   * استئناف آخر خطوة عند العودة إلى نفس الوحدة.
   * يقرأ من التخزين المحلي مرة واحدة عند التركيب — لا يحدث اختلاف
   * خادم/عميل لأن القراءة داخل effect بعد hydration.
   */
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const last = progressData.lastActivity;
    const candidate =
      last && last.unitId === unit.id && tabs.some((tab) => tab.id === last.tab)
        ? (last.tab as TabId)
        : activeTab;
    if (candidate !== activeTab) {
      // استثناء مقصود: مزامنة حالة الواجهة مع مصدر خارجي (localStorage) مرة واحدة
      // eslint-disable-next-line react-hooks/set-state-in-effect
      selectTab(candidate);
    }
    setLastActivity(unit.id, candidate);
  }, [activeTab, progressData.lastActivity, selectTab, setLastActivity, tabs, unit.id]);

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);
  const nextTab = activeIndex >= 0 && activeIndex < tabs.length - 1 ? tabs[activeIndex + 1] : null;
  const doneCount = tabs.filter((tab) => stepDone[tab.id]).length;

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
      const tab = tabs[nextIndex];
      selectTab(tab.id);
      tabListRef.current?.querySelector<HTMLButtonElement>(`#tab-${tab.id}`)?.focus();
    },
    [activeTab, tabs, selectTab]
  );

  return (
    <div className="space-y-6">
      {/* مسار التتبّع */}
      <nav
        aria-label="مسار التصفح"
        className="flex items-center gap-2 text-label font-semibold text-slate-600 dark:text-slate-400"
      >
        <Link href="/" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
          الرئيسية
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-teal-800 dark:text-teal-300">{unit.badge}</span>
      </nav>

      {/*
 رأس الوحدة: قلّصنا ما يُعرض قبل المحتوى.
 كان: شارتا تصنيف + عنوان + معلومتان + لوحة تقدّم بأربعة أسطر + 6 تبويبات
 بأرقامها وعدّاداتها. صار: عنوان + سطر معلومة واحد + شريط تقدّم واحد.
 التفاصيل الكاملة (المستهدف، عدّادات كل خطوة) انتقلت إلى مكانها الطبيعي.
 */}
      <header className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-label font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-teal-700 text-white">{unit.badge}</span>
              <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {unit.timeAllocation}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                {unit.targetAudience}
              </span>
            </div>
            <h1 className="text-title sm:text-heading font-bold text-slate-900 dark:text-white leading-tight">
              {unit.title}
            </h1>
          </div>

          {/* شريط التقدّم: سطر واحد بدل بطاقة كاملة */}
          <div className="w-full sm:w-64 shrink-0 space-y-1.5">
            <div className="flex items-center justify-between text-label font-bold">
              <span className="text-slate-700 dark:text-slate-300">
                الإتقان · {doneCount}/6 خطوات
              </span>
              <span className="text-teal-800 dark:text-teal-300 text-body-sm font-bold">
                {stats.progressPercentage}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={stats.progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`نسبة إتقان ${unit.shortTitle}`}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
            >
              <div
                style={{ width: `${stats.progressPercentage}%` }}
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </header>

      {/*
        شريط الخطوات — مصمَّم للهاتف أولًا.

        المشكلة قبله: كان صفًّا أفقيًا بـ`overflow-x-auto` بلا أي دليل على وجود
        تمرير، فتُقطع التبويبات على الهاتف ولا يرى الطالب بقيتها.
        الآن: صفّ يلتف (flex-wrap). على الهاتف ثلاث خطوات في السطر الأول
        وثلاث في الثاني، بأسمائها كاملة بلا قطع ولا تمرير أفقي، ثم صفّ واحد
        على الشاشات الأكبر.
        ويبقى ملتصقًا أعلى الصفحة في متناول الإبهام أثناء التمرير.
      */}
      <div className="z-30 -mx-4 border-b sm:sticky sm:top-16 border-slate-200/80 bg-[var(--background)]/95 px-3 py-2 backdrop-blur-md dark:border-slate-800/80 sm:mx-0 sm:rounded-2xl sm:border sm:px-2">
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="أنماط الدراسة في الوحدة"
          onKeyDown={onTabsKeyDown}
          className="flex flex-wrap items-center gap-1.5"
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const isDone = stepDone[tab.id];
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
                onClick={() => selectTabAndScroll(tab.id)}
                title={tab.label}
                className={`relative flex min-w-0 flex-1 basis-[calc(50%-0.4rem)] items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 transition-all sm:basis-auto sm:flex-none sm:gap-2 sm:px-3.5 ${
                  isActive
                    ? "bg-teal-700 text-white shadow-sm shadow-teal-700/25"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="relative shrink-0">
                  <Icon className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
                  {isDone && (
                    <span
                      className={`absolute -end-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                        isActive ? "bg-white text-teal-800" : "bg-emerald-600 text-white"
                      }`}
                      aria-hidden="true"
                    >
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </span>

                <span className="whitespace-nowrap text-label font-bold">
                  <span className="me-1 hidden text-meta opacity-70 sm:inline">{index + 1}.</span>
                  {tab.label}
                </span>

                {tab.count !== null && (
                  <span
                    className={`hidden rounded-full px-1.5 py-0.5 text-meta font-bold tabular-nums sm:inline ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                <span className="sr-only">
                  {tab.label}
                  {isDone ? " — خطوة مكتملة" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* المحتوى */}
      <div ref={contentRef} className="min-h-[500px] scroll-mt-36">
        <div
          role="tabpanel"
          id="panel-mindmap"
          aria-labelledby="tab-mindmap"
          hidden={activeTab !== "mindmap"}
          className={activeTab === "mindmap" ? "" : "hidden"}
        >
          <MindmapViewer
            rootNode={unit.mindmapRoot}
            imageSrc={unit.mindmapImage}
            unitTitle={unit.shortTitle}
          />
        </div>

        <div
          role="tabpanel"
          id="panel-lesson"
          aria-labelledby="tab-lesson"
          hidden={activeTab !== "lesson"}
          className={activeTab === "lesson" ? "" : "hidden"}
        >
          <StandardLessonViewer
            unitId={unit.id}
            learningObjective={unit.learningObjective}
            sections={unit.sections}
          />
        </div>

        <div
          role="tabpanel"
          id="panel-flashcards"
          aria-labelledby="tab-flashcards"
          hidden={activeTab !== "flashcards"}
          className={activeTab === "flashcards" ? "" : "hidden"}
        >
          {mountedTabs.has("flashcards") && (
            <FlashcardSection
              unitId={unit.id}
              flashcards={unit.flashcards}
              clozeItems={unit.clozeItems}
            />
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-mcq"
          aria-labelledby="tab-mcq"
          hidden={activeTab !== "mcq"}
          className={activeTab === "mcq" ? "" : "hidden"}
        >
          {mountedTabs.has("mcq") && (
            <McqQuizViewer
              unitId={unit.id}
              unitTitle={unit.shortTitle}
              questions={unit.quizQuestions}
            />
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-quiz"
          aria-labelledby="tab-quiz"
          hidden={activeTab !== "quiz"}
          className={activeTab === "quiz" ? "" : "hidden"}
        >
          {mountedTabs.has("quiz") && (
            <BacQuizSection unitId={unit.id} questions={unit.questions} />
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-revision"
          aria-labelledby="tab-revision"
          hidden={activeTab !== "revision"}
          className={activeTab === "revision" ? "" : "hidden"}
        >
          {mountedTabs.has("revision") && <RevisionSection revision={unit.revision} />}
        </div>
      </div>

      {/*
 «الخطوة التالية»: إجراء واحد واضح أسفل كل نمط دراسة.
 الفكرة: الطالب لا يسأل «ما التالي؟» — التطبيق هو من يقترح الخطوة.
 */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-label font-bold text-slate-600 dark:text-slate-300">
          الخطوة {activeIndex + 1} من {tabs.length}
          {nextTab ? (
            <span className="text-slate-900 dark:text-white">
              {"·"}التالي: {nextTab.label}
            </span>
          ) : (
            <span className="text-emerald-700 dark:text-emerald-300">
              {"·"}هذه آخر خطوة — أعد الاختبار أو راجع الوحدة التالية
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {nextTab ? (
            <button
              type="button"
              onClick={() => {
                selectTab(nextTab.id);
                tabListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-label font-bold text-white transition-colors hover:bg-teal-800"
            >
              <span>{nextTab.label}</span>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            nextUnit && (
              <Link
                href={`/units/${nextUnit.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-label font-bold text-white transition-colors hover:bg-teal-800"
              >
                <span>الوحدة التالية: {nextUnit.shortTitle}</span>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
            )
          )}
        </div>
      </div>

      {/* التنقّل بين الوحدات */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        {previousUnit ? (
          <Link
            href={`/units/${previousUnit.id}`}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-all group"
          >
            <ChevronRight
              className="w-5 h-5 text-slate-500 group-hover:text-teal-700 transition-colors"
              aria-hidden="true"
            />
            <div className="text-right">
              <span className="text-meta font-bold text-slate-600 dark:text-slate-400 block">
                الوحدة السابقة
              </span>
              <span className="text-body-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
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
            className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-all group"
          >
            <div className="text-left">
              <span className="text-meta font-bold text-slate-600 dark:text-slate-400 block">
                الوحدة الموالية
              </span>
              <span className="text-body-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                {nextUnit.shortTitle}
              </span>
            </div>
            <ChevronLeft
              className="w-5 h-5 text-slate-500 group-hover:text-teal-700 transition-colors"
              aria-hidden="true"
            />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
