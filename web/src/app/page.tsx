import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import ResumeBanner from "@/components/home/ResumeBanner";
import UnitProgressBadge from "@/components/home/UnitProgressBadge";
import Footer from "@/components/layout/Footer";
import { getAllUnits, getUnitTotals } from "@/lib/data-loader";
import { ArrowLeft, BookOpen, Layers, ListChecks, Sparkles, Target } from "lucide-react";

/**
 * الغلاف — واجهة بسيطة وواضحة:
 *   عنوان واحد، سطر شرح، إجراء واحد، ثم الأرقام عارية (بلا صناديق)،
 *   ثم بطاقات الوحدات، ثم مسار التعلّم في ثلاث مراحل.
 *
 * لماذا اختفت الصناديق؟ لأن كل عنصر محاط بإطار يجعل الشاشة شبكة مربّعات
 * متشابهة الأهمية. هنا: عنوان كبير، أرقام بلا حواف، وبطاقة واحدة لكل وحدة.
 */
const STREAMS = ["علوم تجريبية", "رياضيات", "تقني رياضي", "تسيير واقتصاد"];

const STAGES = [
  {
    n: "١",
    title: "استيعاب",
    hint: "اقرأ النصّ كاملًا، ثم ثبّت البنية على الخريطة الذهنية.",
    steps: ["نصّ الدرس", "الخريطة الذهنية"],
    icon: BookOpen,
  },
  {
    n: "٢",
    title: "تثبيت",
    hint: "بطاقات استرجاع وتحدّي فراغات: تستدعي المفهوم قبل أن تراه.",
    steps: ["بطاقات الحفظ", "ملء الفراغات"],
    icon: Layers,
  },
  {
    n: "٣",
    title: "اختبار",
    hint: "QCM فوري، ثم أسئلة بكالوريا بعناصر الإجابة، ثم مراجعة سريعة.",
    steps: ["اختبار QCM", "بنك الأسئلة", "المراجعة"],
    icon: Target,
  },
];

export default function HomePage() {
  const units = getAllUnits();
  const totals = getUnitTotals();

  const numbers = [
    { value: totals.units, label: "وحدات مقرّرة" },
    { value: totals.flashcards, label: "بطاقة استرجاع" },
    { value: totals.quiz, label: "سؤال اختيار" },
    { value: totals.questions, label: "سؤال بكالوريا" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--canvas)]">
      <Navbar />

      <main id="main-content" className="u-wrap flex-1 space-y-12 pt-8 pb-16">
        {/* ── الغلاف ── */}
        <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="u-chip">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              العلوم الإسلامية · بكالوريا ٢٠٢٦
            </span>

            <h1 className="u-display mt-4 text-[clamp(1.6rem,3.6vw,2.25rem)]">
              راجع وحدتك كاملةً، <span className="u-mark">خطوةً بخطوة</span>
            </h1>

            <p className="u-measure mt-3 text-body text-[var(--ink-soft)]">
              النصّ أوّلًا، ثم الخريطة، ثم ما يُحفظ ويُختبر. أربع وحدات مقرّرة، وتقدّمك محفوظ
              تلقائيًا، وكل مفهوم في مكانه.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href="/units/1" className="u-cta">
                <span>ابدأ بالوحدة ٠١</span>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="#units"
                className="text-label font-semibold text-[var(--brand-strong)] underline-offset-4 hover:underline"
              >
                استعرض الوحدات
              </Link>
            </div>

            {/* الأرقام عارية: بلا بطاقات، لأنها معلومة لا إجراء */}
            <dl className="mt-9 flex flex-wrap gap-x-9 gap-y-4">
              {numbers.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="u-num text-[1.35rem] leading-none text-[var(--ink)]">
                    {stat.value}
                  </dd>
                  <dd className="mt-1 text-meta text-[var(--ink-faint)]">{stat.label}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-meta text-[var(--ink-faint)]">
              لكل الشعب: {STREAMS.join(" · ")} وغيرها
            </p>
          </div>

          {/* المنتج قبل الكلام: خريطة الوحدة الأولى الحقيقية */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl bg-[var(--surface)] p-1.5 shadow-[var(--shadow-hover)] ring-1 ring-black/[0.04] dark:ring-white/10">
              <Image
                src="/lessons/unit01_mindmap.webp"
                alt="خريطة الوحدة الأولى: العقيدة الإسلامية وأثرها"
                width={2000}
                height={1023}
                className="h-auto w-full rounded-xl"
                priority
              />
            </div>
            <span className="u-chip absolute -bottom-3 right-4 bg-[var(--surface)] shadow-[var(--shadow-md)]">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              ١١ مفهومًا
            </span>
          </div>
        </section>

        <ResumeBanner />

        {/* ── الوحدات ── */}
        <section id="units" className="scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="u-kicker">الفهرس</p>
              <h2 className="u-display mt-1 text-heading">الوحدات المتوفرة</h2>
            </div>
            <p className="text-label text-[var(--ink-faint)]">
              {units.length} وحدات · الكتلة العقدية والفكرية
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {units.map((unit) => (
              <article
                key={unit.id}
                className="u-card u-card-hover flex flex-col gap-4 p-5 text-start"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-meta font-semibold text-[var(--brand-strong)]">
                      <span className="u-num">{String(unit.id).padStart(2, "0")}</span>
                      <span aria-hidden="true" className="h-1 w-1 rounded-full bg-current" />
                      <span className="truncate">{unit.timeAllocation}</span>
                    </p>
                    <h3 className="mt-1 text-title font-semibold text-[var(--ink)]">
                      {unit.shortTitle}
                    </h3>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>

                <p className="line-clamp-2 text-body-sm text-[var(--ink-soft)]">
                  {unit.learningObjective}
                </p>

                <div className="mt-auto space-y-3 border-t border-[var(--hairline)] pt-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-meta text-[var(--ink-faint)]">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                      {unit.sections.length} محاور
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                      {unit.flashcards.length} بطاقة
                    </span>
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
                    className="group inline-flex items-center gap-1.5 text-label font-semibold text-[var(--brand-strong)] transition-colors hover:text-[var(--primary)]"
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
        <section aria-labelledby="path-title">
          <p className="u-kicker" id="path-title">
            كيف تعمل الوحدة
          </p>
          <h2 className="u-display mt-1 text-heading">ثلاث مراحل، بهذا الترتيب</h2>

          <ol className="mt-5 grid gap-4 sm:grid-cols-3">
            {STAGES.map(({ n, title, hint, steps, icon: Icon }) => (
              <li key={title} className="u-card flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--brand-soft)] text-label font-semibold text-[var(--brand-strong)]">
                    {n}
                  </span>
                  <Icon className="h-4 w-4 text-[var(--ink-faint)]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-title font-semibold text-[var(--ink)]">{title}</h3>
                  <p className="mt-1 text-body-sm text-[var(--ink-soft)]">{hint}</p>
                </div>
                <p className="mt-auto flex flex-wrap gap-1.5">
                  {steps.map((step) => (
                    <span
                      key={step}
                      className="u-chip bg-[var(--surface-2)] text-[var(--ink-soft)]"
                    >
                      {step}
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ol>

          <p className="u-measure mt-4 text-meta text-[var(--ink-faint)]">
            ما يظهر في بطاقة مصباح ليس عنصرًا مفهوميًا: إضاءة للفهم أو فائدة مساعدة، لا يُحفظ كتعريف
            — والخريطة للتعريفات والأقسام وحدها.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
