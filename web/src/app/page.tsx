import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import ResumeBanner from "@/components/home/ResumeBanner";
import UnitProgressBadge from "@/components/home/UnitProgressBadge";
import Footer from "@/components/layout/Footer";
import { getAllUnits, getUnitTotals } from "@/lib/data-loader";
import { ArrowLeft, BookOpen, Layers, Lightbulb, ListChecks } from "lucide-react";

/**
 * الغلاف — لوحة الإلهام العربية: شريط نعنعي دافئ، عنوان كبير بتمييز ذهبي،
 * صورة داخل إطار مستدير، ثم بطاقات مستديرة بيضاء على ورق كريمي.
 *
 * لماذا هذا الشكل؟
 *   - الطالب يفتح التطبيق ليعرف «ما هذا وأين أبدأ» في ثانيتين: عنوان واحد،
 *     سطر شرح، إجراء واحد.
 *   - الشريط النعنعي يفصل الغلاف عن بقية الصفحة بلا صندوق إضافي.
 *   - الصورة ليست زينة: هي خريطة الوحدة الأولى الحقيقية، فيرى الطالب المنتج
 *     قبل أن يقرأ عنه.
 */
const STREAMS = [
  "علوم تجريبية",
  "رياضيات",
  "تقني رياضي",
  "تسيير واقتصاد",
  "آداب وفلسفة",
  "لغات أجنبية",
];

const PATH = [
  { n: 1, title: "نص الدرس", hint: "الشرح والشواهد", icon: BookOpen },
  { n: 2, title: "الخريطة", hint: "المفاهيم وحدها", icon: Layers },
  { n: 3, title: "الحفظ", hint: "بطاقات وفراغات", icon: ListChecks },
  { n: 4, title: "QCM", hint: "اختبار سريع", icon: ListChecks },
  { n: 5, title: "بنك الأسئلة", hint: "عناصر الإجابة", icon: BookOpen },
  { n: 6, title: "المراجعة", hint: "قبل الامتحان", icon: Lightbulb },
];

export default function HomePage() {
  const units = getAllUnits();
  const totals = getUnitTotals();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main id="main-content" className="u-wrap flex-1 space-y-10 pb-14 sm:space-y-14">
        {/* ── الغلاف ── */}
        <section className="u-band relative overflow-hidden px-5 pt-8 pb-10 sm:px-9 sm:pt-12 sm:pb-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/45 blur-2xl"
          />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="u-chip bg-white/80 dark:bg-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--pine)]" aria-hidden="true" />
                العلوم الإسلامية · بكالوريا ٢٠٢٦
              </p>

              <h1 className="u-display mt-4 text-[clamp(1.9rem,5vw,3.15rem)]">
                راجع وحدتك كاملة،
                <br />
                <span className="u-mark">خطوةً بخطوة</span> بلا تشتّت.
              </h1>

              <p className="u-measure mt-4 text-body font-medium text-[var(--ink-soft)]">
                النصّ أولًا ثم الخريطة، ثم ما يُحفظ ويُختبر. أربع وحدات مقرّرة، وتقدّمك محفوظ، وكل
                مفهوم في مكانه.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/units/1" className="u-cta">
                  <span>ابدأ بالوحدة ٠١</span>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="#units" className="u-ghost">
                  استعرض الوحدات
                </Link>
              </div>

              <p className="mt-4 text-meta font-medium text-[var(--ink-faint)]">
                لكل الشعب: {STREAMS.slice(0, 4).join(" · ")} وغيرها
              </p>
            </div>

            {/* خريطة الوحدة الأولى — المنتج قبل الكلام */}
            <div className="relative hidden lg:block">
              <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[var(--shadow-lift)] dark:border-[var(--rule)] dark:bg-[var(--sheet)]">
                <Image
                  src="/lessons/unit01_mindmap.webp"
                  alt="خريطة الوحدة الأولى: العقيدة الإسلامية وأثرها"
                  width={2000}
                  height={1023}
                  className="h-auto w-full"
                  priority
                />
              </div>
              <span className="u-chip absolute -bottom-3 right-5 bg-white shadow-sm dark:bg-[var(--sheet)]">
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                ١١ مفهومًا
              </span>
              <span className="u-chip u-chip-warm absolute -top-3 left-5 bg-white shadow-sm dark:bg-[var(--band-warm)]">
                <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                إضاءات في الهامش
              </span>
            </div>
          </div>
        </section>

        <section aria-label="متابعة الدراسة">
          <ResumeBanner />
        </section>

        {/* ── الأرقام ── */}
        <section aria-label="المحتوى بالأرقام" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: totals.units, label: "وحدات مقرّرة" },
            { value: totals.flashcards, label: "بطاقة استرجاع" },
            { value: totals.quiz, label: "سؤال اختيار" },
            { value: totals.questions, label: "سؤال بكالوريا" },
          ].map((stat) => (
            <div key={stat.label} className="u-card px-4 py-4 text-center sm:px-5">
              <div className="u-num text-[clamp(1.6rem,4vw,2.1rem)] text-[var(--pine)]">
                {stat.value}
              </div>
              <p className="mt-0.5 text-meta font-bold text-[var(--ink-faint)]">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* ── الوحدات ── */}
        <section id="units" className="scroll-mt-24 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="u-kicker">الفهرس</p>
              <h2 className="u-display mt-1 text-title sm:text-heading">الوحدات المتوفرة</h2>
            </div>
            <p className="text-label font-medium text-[var(--ink-faint)]">
              {units.length} وحدات · الكتلة العقدية والفكرية
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {units.map((unit) => (
              <article key={unit.id} className="u-card u-card-hover flex flex-col gap-4 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--pine-soft)] text-title font-bold text-[var(--pine-deep)]">
                    {String(unit.id).padStart(2, "0")}
                  </span>
                  <span className="u-chip">{unit.timeAllocation}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-title font-bold leading-snug text-[var(--ink)]">
                    {unit.title}
                  </h3>
                  <p className="text-body leading-relaxed font-medium text-[var(--ink-soft)]">
                    {unit.learningObjective}
                  </p>
                </div>

                <div className="mt-auto space-y-3 border-t border-[var(--rule)] pt-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-meta font-bold text-[var(--ink-faint)]">
                    <span>{unit.sections.length} محاور</span>
                    <span>{unit.flashcards.length} بطاقة</span>
                    <span>{unit.quizQuestions.length} اختيار</span>
                    <span>{unit.questions.length} سؤال</span>
                  </div>

                  <UnitProgressBadge
                    unitId={unit.id}
                    totals={{
                      sections: unit.sections.length,
                      cards: unit.flashcards.length,
                      questions: unit.questions.length,
                      mcq: unit.quizQuestions.length,
                    }}
                  />

                  <Link
                    href={`/units/${unit.id}`}
                    className="group inline-flex items-center gap-1.5 text-label font-bold text-[var(--pine)] transition-colors hover:text-[var(--pine-deep)]"
                    aria-label={`افتح ${unit.title}`}
                  >
                    <span>افتح الوحدة</span>
                    <ArrowLeft
                      className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── المسار ── */}
        <section aria-labelledby="path-title" className="u-band px-5 py-7 sm:px-8 sm:py-9">
          <p className="u-kicker" id="path-title">
            داخل كل وحدة
          </p>
          <h2 className="u-display mt-1 text-title sm:text-heading">ستّ خطوات بهذا الترتيب</h2>

          <ol className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {PATH.map(({ n, title, hint, icon: Icon }) => (
              <li
                key={n}
                className="rounded-2xl bg-[var(--sheet)] px-3 py-3 shadow-[var(--shadow-xs)]"
              >
                <span className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-[var(--pine)]" aria-hidden="true" />
                  <span className="u-num text-meta text-[var(--ink-faint)]">٠{n}</span>
                </span>
                <span className="mt-2 block text-label font-bold text-[var(--ink)]">{title}</span>
                <span className="block text-meta font-medium text-[var(--ink-faint)]">{hint}</span>
              </li>
            ))}
          </ol>

          <p className="u-measure mt-4 text-meta font-medium text-[var(--ink-faint)]">
            ما يظهر في بطاقة مصباح ليس عنصرًا مفهوميًا: إضاءة للفهم أو فائدة مساعدة، لا يُحفظ كتعريف
            — والخريطة للتعريفات والأقسام وحدها.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
