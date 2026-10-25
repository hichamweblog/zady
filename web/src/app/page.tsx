import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ResumeBanner from "@/components/home/ResumeBanner";
import UnitProgressBadge from "@/components/home/UnitProgressBadge";
import Footer from "@/components/layout/Footer";
import { getAllUnits, getUnitTotals } from "@/lib/data-loader";
import { ArrowLeft } from "lucide-react";

/**
 * الصفحة الرئيسية — **غلاف كتاب وفهرسه**، لا لوحة تحكّم.
 *
 * الاتجاه: ورق وحبر. لا تدرّج، لا زجاج، لا بطاقة مستديرة، ولا أيقونة زائدة.
 * الغلاف يقول ثلاثة أشياء فقط: ما هذا، لمن هو، ومن أين تبدأ. ثم يأتي الفهرس
 * في صفوف مسطّرة: رقم الوحدة في الهامش، عنوانها وهدفها، وزمنها، وسهم.
 *
 * لماذا لا شبكة بطاقات؟ لأن أربع وحدات ليست أربعة منتجات تُقارن، بل فصولًا
 * تُقرأ بالترتيب؛ والقائمة المرقّمة تُظهر الترتيب، والبطاقات تُخفيه.
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
  { n: 1, title: "نص الدرس", hint: "الشرح والشواهد" },
  { n: 2, title: "الخريطة", hint: "المفاهيم وحدها" },
  { n: 3, title: "الحفظ", hint: "بطاقات وفراغات" },
  { n: 4, title: "QCM", hint: "اختبار سريع" },
  { n: 5, title: "بنك الأسئلة", hint: "عناصر الإجابة" },
  { n: 6, title: "المراجعة", hint: "قبل الامتحان" },
];

export default function HomePage() {
  const units = getAllUnits();
  const totals = getUnitTotals();

  const colophon = [
    { value: `${totals.units}`, label: "وحدات مقرّرة" },
    { value: `${totals.flashcards}`, label: "بطاقة استرجاع" },
    { value: `${totals.quiz}`, label: "سؤال اختيار" },
    { value: `${totals.questions}`, label: "سؤال بكالوريا" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main id="main-content" className="mx-auto w-full max-w-[1180px] flex-1 px-5 sm:px-8">
        {/* ── الغلاف ── */}
        <section className="z-grid border-b border-[var(--rule)] pt-10 pb-12 sm:pt-16 sm:pb-16">
          <div className="md:col-span-8">
            <p className="z-kicker">العلوم الإسلامية · السنة الثالثة ثانوي · بكالوريا ٢٠٢٦</p>

            <h1 className="z-display mt-4 text-[clamp(2.15rem,6.4vw,3.9rem)]">
              أربعُ وحدات،
              <br />
              مقروءةً كما يُقرأ الكتاب.
            </h1>

            <p className="z-measure mt-6 text-body font-medium text-[var(--ink-soft)]">
              النصّ أولًا ثم الخريطة، ثم ما يُحفظ ويُختبر. بلا خطوات مبعثرة ولا تبويبات تسبق الفهم:
              صفحتك تُفتح حيث توقّفت، والمفهومُ وحده يدخل الخريطة.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/units/1" className="z-btn">
                <span>ابدأ بالوحدة ٠١</span>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="#units" className="z-link text-label font-bold">
                فهرس الوحدات
              </Link>
            </div>
          </div>

          {/* بيانات الكتاب — في الهامش، كصفحة حقوق النشر */}
          <aside className="md:col-span-4 md:border-s md:border-[var(--rule)] md:ps-6">
            <p className="z-kicker md:hidden">المحتوى بالأرقام</p>
            <dl className="md:mt-1">
              {colophon.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-baseline justify-between gap-3 py-3 ${
                    i === 0 ? "" : "border-t border-[var(--rule)]"
                  }`}
                >
                  <dt className="text-label font-medium text-[var(--ink-soft)]">{row.label}</dt>
                  <dd className="z-num text-title">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-meta font-medium text-[var(--ink-faint)]">
              لكل الشعب: {STREAMS.join(" · ")}
            </p>
          </aside>
        </section>

        <section aria-label="متابعة الدراسة" className="pt-6">
          <ResumeBanner />
        </section>

        {/* ── الفهرس ── */}
        <section id="units" className="scroll-mt-24 pt-8 pb-4">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--rule-strong)] pb-2">
            <h2 className="z-kicker">الفهرس</h2>
            <span className="z-num">٠١ — ٠{units.length}</span>
          </div>

          <ol>
            {units.map((unit, index) => (
              <li key={unit.id} className="border-b border-[var(--rule)]">
                <Link
                  href={`/units/${unit.id}`}
                  className="group grid grid-cols-[2.5rem_1fr] items-start gap-x-3 gap-y-2 py-5 transition-colors hover:bg-[var(--sunken)] sm:grid-cols-[3rem_1fr_auto] sm:gap-x-5 sm:px-2"
                >
                  <span className="z-num pt-1 text-title tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-title font-bold text-[var(--ink)] group-hover:underline group-hover:decoration-[var(--pine)] group-hover:underline-offset-4">
                      {unit.title}
                    </span>
                    <span className="mt-1 block text-body font-medium text-[var(--ink-soft)]">
                      {unit.learningObjective}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta font-medium text-[var(--ink-faint)]">
                      <span>{unit.timeAllocation}</span>
                      <span aria-hidden="true">·</span>
                      <span>{unit.sections.length} محاور</span>
                      <span aria-hidden="true">·</span>
                      <span>{unit.flashcards.length} بطاقة</span>
                      <span aria-hidden="true">·</span>
                      <span>{unit.quizQuestions.length} اختيار</span>
                    </span>
                    <span className="mt-3 block max-w-56">
                      <UnitProgressBadge
                        unitId={unit.id}
                        totals={{
                          sections: unit.sections.length,
                          cards: unit.flashcards.length,
                          questions: unit.questions.length,
                          mcq: unit.quizQuestions.length,
                        }}
                      />
                    </span>
                  </span>

                  <span className="col-start-2 mt-1 inline-flex items-center gap-1.5 text-label font-bold text-[var(--pine)] sm:col-start-3 sm:mt-2 sm:self-start">
                    <span>افتح</span>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* ── المسار: سطر واحد، بلا صناديق ── */}
        <section aria-labelledby="path-title" className="py-10 sm:py-14">
          <h2 id="path-title" className="z-kicker">
            ترتيب الاستذكار داخل الوحدة
          </h2>
          <ol className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-2">
            {PATH.map(({ n, title, hint }) => (
              <li key={n} className="flex items-baseline gap-2">
                <span className="z-num">{n}</span>
                <span className="text-body font-bold text-[var(--ink)]">{title}</span>
                <span className="text-meta font-medium text-[var(--ink-faint)]">{hint}</span>
                {n < PATH.length && (
                  <span aria-hidden="true" className="text-[var(--rule-strong)]">
                    /
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-5 max-w-[60ch] text-meta font-medium text-[var(--ink-faint)]">
            ما يظهر في بطاقة مصباح ليس عنصرًا مفهوميًا: إضاءةٌ للفهم أو فائدةٌ مساعدة، لا يُحفظ
            كتعريف — والخريطة للتعريفات والأقسام وحدها.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
