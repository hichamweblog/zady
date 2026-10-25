"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Layers,
  BookOpen,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  CheckSquare,
  Zap,
  ArrowLeft,
} from "lucide-react";
import type { ClientUnit, UnitMeta } from "@/lib/types";
import MindmapViewer from "@/components/mindmap/MindmapViewer";
import StandardLessonViewer from "@/components/lesson/StandardLessonViewer";
import ReadingRule from "@/components/lesson/ReadingRule";
import FlashcardSection from "@/components/flashcards/FlashcardSection";
import BacQuizSection from "@/components/quiz/BacQuizSection";
import McqQuizViewer from "@/components/quiz/McqQuizViewer";
import RevisionSection from "@/components/revision/RevisionSection";
import { useProgress } from "@/lib/useProgressStore";

type TabId = "mindmap" | "lesson" | "flashcards" | "mcq" | "quiz" | "revision";

/**
 * مسار التعلّم: ثلاث مراحل لا ستّة أزرار متساوية.
 * «استيعاب» = اقرأ وشاهد، «تثبيت» = احفظ واسترجع، «اختبار» = قِس نفسك.
 * إسناد كل خطوة إلى مرحلتها هو ما يجعل الشريط يقول للطالب أين هو.
 */
const STAGES: { id: string; label: string; steps: TabId[] }[] = [
  { id: "absorb", label: "استيعاب", steps: ["lesson", "mindmap"] },
  { id: "anchor", label: "تثبيت", steps: ["flashcards"] },
  { id: "test", label: "اختبار", steps: ["mcq", "quiz", "revision"] },
];

interface UnitClientViewProps {
  unit: ClientUnit;
  previousUnit?: UnitMeta;
  nextUnit?: UnitMeta;
}

export default function UnitClientView({ unit, previousUnit, nextUnit }: UnitClientViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("lesson");
  /**
   * التبويبات تُركَّب عند أول زيارة ثم تبقى مركّبة (keep-alive):
   * - تبديل التبويب لم يعد يمحو تقدّم الجلسة (إجابات QCM، موضع البطاقة…)
   * - التبويبات الثقيلة لا تُصيَّر في HTML الأولي فيبقى حجم الصفحة معقولًا
   * - «نص الدرس» و«الخريطة» مصيَّران خادميًا لأنهما محتوى المادة القابل للفهرسة
   * - الترتيب: نص الدرس أولًا (المادة الأصلية) ثم الخريطة (ملخّصها البصري)
   */
  const [mountedTabs, setMountedTabs] = useState<Set<TabId>>(
    () => new Set<TabId>(["lesson", "mindmap"])
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
      { id: "lesson", label: "نص الدرس", icon: BookOpen, count: null },
      { id: "mindmap", label: "الخريطة الذهنية", icon: Layers, count: null },
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

  const activeStage = useMemo(
    () => STAGES.find((stage) => stage.steps.includes(activeTab)) ?? STAGES[0],
    [activeTab]
  );
  const visibleTabs = useMemo(
    () => tabs.filter((tab) => activeStage.steps.includes(tab.id)),
    [activeStage, tabs]
  );

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);
  const nextTab = activeIndex >= 0 && activeIndex < tabs.length - 1 ? tabs[activeIndex + 1] : null;
  const doneCount = tabs.filter((tab) => stepDone[tab.id]).length;

  /** تنقّل لوحة المفاتيح بين التبويبات (RTL: يمين = السابق) */
  const onTabsKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const currentIndex = visibleTabs.findIndex((t) => t.id === activeTab);
      let nextIndex = currentIndex < 0 ? 0 : currentIndex;
      if (event.key === "ArrowRight") {
        nextIndex = (currentIndex - 1 + visibleTabs.length) % visibleTabs.length;
      }
      if (event.key === "ArrowLeft") {
        nextIndex = (currentIndex + 1) % visibleTabs.length;
      }
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = visibleTabs.length - 1;
      const tab = visibleTabs[nextIndex];
      if (!tab) return;
      selectTab(tab.id);
      tabListRef.current?.querySelector<HTMLButtonElement>(`#tab-${tab.id}`)?.focus();
    },
    [activeTab, visibleTabs, selectTab]
  );

  return (
    <div className="space-y-5">
      {/* مسار التتبّع — سطر صغير أعلى العنوان */}
      <nav aria-label="مسار التصفح" className="flex items-center gap-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-meta font-semibold text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
        >
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span>كل الوحدات</span>
        </Link>
        <span aria-hidden="true" className="text-[var(--ink-faint)]">
          /
        </span>
        <span className="u-num text-meta text-[var(--ink-faint)]">{unit.badge}</span>
      </nav>

      {/*
        رأس الوحدة: عنوان + سطر معلومة + قرص تقدّم.
        القرص يقول «كم بقي» في ثانية واحدة، ويحلّ محلّ شريط أفقي وعدّاد نصي.
      */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="u-display text-display sm:text-[1.75rem]">{unit.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-label font-medium text-[var(--ink-soft)]">
            <span>{unit.targetAudience}</span>
            <span aria-hidden="true" className="text-[var(--ink-faint)]">
              ·
            </span>
            <span>{unit.timeAllocation}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-start rounded-2xl bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-card)] sm:self-auto">
          <div
            className="relative h-11 w-11 shrink-0"
            role="progressbar"
            aria-valuenow={stats.progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`نسبة إتقان ${unit.shortTitle}`}
          >
            <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90" aria-hidden="true">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="var(--surface-3)"
                strokeWidth="4"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="4"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${stats.progressPercentage} 100`}
              />
            </svg>
            <span
              aria-hidden="true"
              className="u-num absolute inset-0 grid place-items-center text-meta text-[var(--ink)]"
            >
              {stats.progressPercentage}%
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-label font-semibold text-[var(--ink)]">تقدّمك في الوحدة</p>
            <p className="text-meta text-[var(--ink-faint)]">
              {doneCount} من {tabs.length} خطوات مكتملة
            </p>
          </div>
        </div>
      </header>

      {/*
        مسار الوحدة: ثلاث مراحل (استيعاب ← تثبيت ← اختبار) ثم خطوات المرحلة
        الحالية فقط. السبب: ستة أهداف جنبًا إلى جنب لا تقول للطالب من أين
        يبدأ؛ أما المرحلة فتقول «أين أنت» في كلمة واحدة، والخطوات تحتها
        لا تتجاوز ثلاثًا. والشريط يلتصق أعلى الصفحة أثناء التمرير.
      */}
      <div className="sticky top-14 z-30 -mx-5 border-y border-[var(--hairline)] bg-[var(--canvas)]/92 px-5 py-2.5 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border-0 sm:px-3 sm:shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-1" role="group" aria-label="مراحل الوحدة">
          {STAGES.map((stage, stageIndex) => {
            const stageTabs = tabs.filter((tab) => stage.steps.includes(tab.id));
            const stageDone = stageTabs.filter((tab) => stepDone[tab.id]).length;
            const isActiveStage = activeStage.id === stage.id;
            return (
              <div key={stage.id} className="flex min-w-0 flex-1 items-center gap-1">
                {stageIndex > 0 && (
                  <span
                    aria-hidden="true"
                    className={`h-px w-2 shrink-0 sm:w-3 ${
                      isActiveStage ? "bg-[var(--brand)]" : "bg-[var(--hairline-strong)]"
                    }`}
                  />
                )}
                <button
                  type="button"
                  aria-current={isActiveStage ? "step" : undefined}
                  onClick={() => selectTabAndScroll(stage.steps[0])}
                  className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1.5 text-start transition-colors ${
                    isActiveStage
                      ? "bg-[var(--surface)] shadow-[var(--shadow-sm)]"
                      : "hover:bg-[var(--surface-2)]"
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-meta font-semibold ${
                      isActiveStage
                        ? "bg-[var(--brand-strong)] text-white dark:text-[var(--brand-ink)]"
                        : stageDone === stageTabs.length
                          ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                          : "bg-[var(--surface-3)] text-[var(--ink-soft)]"
                    }`}
                    aria-hidden="true"
                  >
                    {stageIndex + 1}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-label font-semibold ${
                        isActiveStage ? "text-[var(--ink)]" : "text-[var(--ink-soft)]"
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="u-num block text-meta text-[var(--ink-faint)]">
                      {stageDone}/{stageTabs.length}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <div
          ref={tabListRef}
          role="tablist"
          aria-label={`خطوات مرحلة ${activeStage.label}`}
          onKeyDown={onTabsKeyDown}
          className="u-tabs mt-2"
        >
          {visibleTabs.map((tab, index) => {
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
                className="u-tab relative flex-1"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.count !== null && <span className="u-tab-count">{tab.count}</span>}
                {isDone && (
                  <span
                    className="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--brand)]"
                    aria-hidden="true"
                  />
                )}
                <span className="sr-only">
                  {index + 1}. {isDone ? "خطوة مكتملة" : "غير مكتملة"}
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
          id="panel-lesson"
          aria-labelledby="tab-lesson"
          hidden={activeTab !== "lesson"}
          className={activeTab === "lesson" ? "" : "hidden"}
        >
          <ReadingRule />
          <StandardLessonViewer
            unitId={unit.id}
            learningObjective={unit.learningObjective}
            sections={unit.sections}
          />
        </div>

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
        لا صندوق حوله: خطّان شعريان ورقم الخطوة في الهامش يقولان كل شيء.
      */}
      <div className="u-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="flex flex-wrap items-baseline gap-2 text-label font-medium text-[var(--ink-soft)]">
          <span className="u-chip">
            الخطوة {activeIndex + 1} من {tabs.length}
          </span>
          {nextTab ? (
            <span>
              التالي: <span className="font-bold text-[var(--ink)]">{nextTab.label}</span>
            </span>
          ) : (
            <span>آخر خطوة — أعد الاختبار أو انتقل إلى الوحدة الموالية</span>
          )}
        </p>

        {nextTab ? (
          <button
            type="button"
            onClick={() => {
              selectTab(nextTab.id);
              tabListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="u-cta shrink-0"
          >
            <span>{nextTab.label}</span>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          nextUnit && (
            <Link href={`/units/${nextUnit.id}`} className="u-cta shrink-0">
              <span>الوحدة الموالية: {nextUnit.shortTitle}</span>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          )
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {previousUnit ? (
          <Link
            href={`/units/${previousUnit.id}`}
            className="u-card u-card-hover flex items-center gap-3 p-4"
          >
            <ChevronRight className="h-5 w-5 shrink-0 text-[var(--pine)]" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-meta font-bold text-[var(--ink-faint)]">
                الوحدة السابقة
              </span>
              <span className="block truncate text-label font-bold text-[var(--ink)]">
                {previousUnit.shortTitle}
              </span>
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}

        {nextUnit && (
          <Link
            href={`/units/${nextUnit.id}`}
            className="u-card u-card-hover flex items-center justify-end gap-3 p-4 text-end"
          >
            <span className="min-w-0">
              <span className="block text-meta font-bold text-[var(--ink-faint)]">
                الوحدة الموالية
              </span>
              <span className="block truncate text-label font-bold text-[var(--ink)]">
                {nextUnit.shortTitle}
              </span>
            </span>
            <ChevronLeft className="h-5 w-5 shrink-0 text-[var(--pine)]" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
