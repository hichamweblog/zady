"use client";

import { useState } from "react";
import {
  Zap,
  ListChecks,
  GitCompareArrows,
  NotebookPen,
  FileCheck2,
  AlertTriangle,
  ChevronDown,
  ScrollText,
} from "lucide-react";
import type { RevisionContent } from "@/lib/types";

interface RevisionSectionProps {
  revision: RevisionContent;
}

/**
 * تبويب «المراجعة السريعة»: يعرض محتوى كان مؤلَّفًا في ملفات JSON
 * لكنه غير مرئي في التطبيق (مراجعة اللحظة الأخيرة، مصفوفة الفروق،
 * القواعد المنهجية، ملخص الحفظ، وأسئلة البكالوريا السابقة).
 */
export default function RevisionSection({ revision }: RevisionSectionProps) {
  const { lastMinute, rules, differentiation, summary, previousBac } = revision;
  const isEmpty =
    lastMinute.length === 0 &&
    rules.length === 0 &&
    differentiation.length === 0 &&
    summary.length === 0 &&
    previousBac.length === 0;

  if (isEmpty) {
    return (
      <div className="text-center py-12 u-card p-8">
        <Zap className="w-12 h-12 text-[var(--ink-faint)] mx-auto mb-3" aria-hidden="true" />
        <h3 className="font-semibold text-slate-700 dark:text-slate-200">
          لا يوجد محتوى مراجعة سريعة لهذه الوحدة بعد.
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 border-y border-[var(--rule)] py-4">
        <div className="mt-0.5 shrink-0 text-[var(--ochre)]">
          <Zap className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-title font-semibold text-[var(--ink)]">
            المراجعة السريعة قبل الامتحان
          </h2>
          <p className="mt-1 text-body font-medium leading-relaxed text-[var(--ink-soft)]">
            خلاصة الوحدة في بطاقات مكثفة: ما يجب حفظه حرفيًا، الأخطاء الممنوعة، الفروق بين
            المصطلحات، وأسئلة بكالوريا سابقة مع إجاباتها.
          </p>
        </div>
      </div>

      {/* 1. مراجعة اللحظة الأخيرة */}
      {lastMinute.length > 0 && (
        <section aria-labelledby="last-minute-title" className="space-y-3">
          <SectionHeading
            id="last-minute-title"
            icon={Zap}
            title="مراجعة اللحظة الأخيرة"
            tone="amber"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {lastMinute.map((group) => (
              <article
                key={group.title}
                className="u-card p-5 shadow-[var(--shadow-card)] space-y-3"
              >
                <h3 className="font-semibold text-body-sm text-teal-800 dark:text-teal-300">
                  {group.title}
                </h3>
                <ul className="space-y-2">
                  {group.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-body-sm text-[var(--ink)] leading-relaxed"
                    >
                      <span
                        className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 2. القواعد والضوابط المنهجية (مكانها المراجعة لا الدرس) */}
      {rules.length > 0 && (
        <section aria-labelledby="rules-title" className="space-y-3">
          <SectionHeading
            id="rules-title"
            icon={ListChecks}
            title="القواعد والضوابط المنهجية"
            tone="teal"
          />
          <ol className="space-y-3">
            {rules.map((rule, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-4 sm:p-5 rounded-xl bg-[var(--surface)] shadow-[var(--shadow-card)]"
              >
                <span className="w-7 h-7 rounded-xl bg-teal-700 text-white text-label font-semibold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <p className="text-body-sm text-[var(--ink)] leading-relaxed">{rule}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 3. مصفوفة الفروق */}
      {differentiation.length > 0 && (
        <section aria-labelledby="diff-title" className="space-y-3">
          <SectionHeading
            id="diff-title"
            icon={GitCompareArrows}
            title="فروق يخطئ فيها المترشحون"
            tone="rose"
          />
          <div className="space-y-4">
            {differentiation.map((row) => (
              <article key={row.id} className="u-card p-5 shadow-[var(--shadow-card)] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[var(--brand-soft)] p-3.5">
                    <span className="text-meta font-semibold text-teal-800 dark:text-teal-300 block mb-1">
                      المصطلح الأول
                    </span>
                    <p className="text-body-sm font-semibold text-slate-900 dark:text-slate-100">
                      {row.termA}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[var(--surface-2)] ">
                    <span className="text-meta font-semibold text-[var(--ink-soft)] block mb-1">
                      المصطلح الثاني
                    </span>
                    <p className="text-body-sm font-semibold text-slate-900 dark:text-slate-100">
                      {row.termB}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-meta font-semibold text-[var(--ink-soft)]">
                    وجه التمييز
                  </span>
                  <p className="text-body-sm text-[var(--ink)] leading-relaxed">
                    {row.distinction}
                  </p>
                </div>

                {row.pitfall && (
                  <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 dark:bg-rose-500/10">
                    <AlertTriangle
                      className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <p className="text-body-sm text-rose-900 dark:text-rose-200 leading-relaxed">
                      <span className="font-semibold">الخطأ الشائع: </span>
                      {row.pitfall}
                    </p>
                  </div>
                )}

                {row.examinerWarning && (
                  <p className="text-body-sm text-[var(--ink-soft)]">
                    <span className="font-semibold">تنبيه المصحح: </span>
                    {row.examinerWarning}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 4. ملخص الحفظ */}
      {summary.length > 0 && (
        <section aria-labelledby="summary-title" className="space-y-3">
          <SectionHeading id="summary-title" icon={NotebookPen} title="ملخص الحفظ" tone="teal" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.map((group) => (
              <article
                key={group.title}
                className="u-card p-5 shadow-[var(--shadow-card)] space-y-3"
              >
                <h3 className="font-semibold text-body-sm text-[var(--ink)]">{group.title}</h3>
                <ul className="space-y-2">
                  {group.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-body-sm text-[var(--ink)] leading-relaxed p-2.5 rounded-xl bg-[var(--surface-2)] "
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 5. أسئلة البكالوريا السابقة */}
      {previousBac.length > 0 && (
        <section aria-labelledby="prev-bac-title" className="space-y-3">
          <SectionHeading
            id="prev-bac-title"
            icon={FileCheck2}
            title="أسئلة بكالوريا سابقة مع الإجابات"
            tone="teal"
          />
          <div className="space-y-3">
            {previousBac.map((item, i) => (
              <PreviousBacCard key={`${item.session}-${i}`} item={item} defaultOpen={i === 0} />
            ))}
          </div>
        </section>
      )}

      <p className="text-meta text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-2">
        <ScrollText className="w-3.5 h-3.5" aria-hidden="true" />
      </p>
    </div>
  );
}

function SectionHeading({
  id,
  icon: Icon,
  title,
  tone,
}: {
  id: string;
  icon: typeof Zap;
  title: string;
  tone: "teal" | "amber" | "rose";
}) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
      : tone === "rose"
        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
        : "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300";

  return (
    <h2 id={id} className="flex items-center gap-2.5 text-body font-semibold text-[var(--ink)]">
      <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${toneClass}`}>
        <Icon className="w-4 h-4" aria-hidden="true" />
      </span>
      {title}
    </h2>
  );
}

function PreviousBacCard({
  item,
  defaultOpen,
}: {
  item: { session: string; question: string; answer: string };
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="u-card shadow-[var(--shadow-card)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full p-4 sm:p-5 flex items-start justify-between gap-4 text-right hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
      >
        <div className="space-y-1.5 flex-1">
          <span className="inline-block text-meta font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
            {item.session}
          </span>
          <p className="text-body-sm font-semibold text-[var(--ink)] leading-relaxed">
            {item.question}
          </p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 shrink-0 mt-1 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="px-4 sm:p-5 sm:pt-0 border-t border-[var(--hairline)] pt-4">
          <span className="text-meta font-semibold text-teal-800 dark:text-teal-300 block mb-2">
            الإجابة النموذجية
          </span>
          <p className="text-body-sm text-[var(--ink)] leading-loose whitespace-pre-line">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}
