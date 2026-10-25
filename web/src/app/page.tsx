import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getAllUnits, getUnitTotals } from "@/lib/data-loader";
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowLeft,
  CheckSquare,
  Zap,
  Layers,
  ShieldCheck,
} from "lucide-react";

export default function HomePage() {
  const units = getAllUnits();
  const totals = getUnitTotals();

  const stats = [
    { label: `${totals.units} وحدات`, hint: "مكتملة ومجهّزة بيداغوجيًا", icon: BookOpen, tone: "teal" },
    { label: `${totals.flashcards} بطاقة`, hint: "استرجاع نشط (Active Recall)", icon: Sparkles, tone: "amber" },
    { label: `${totals.quiz} سؤال QCM`, hint: "اختيار من متعدد مع التعليل", icon: CheckSquare, tone: "blue" },
    { label: `${totals.questions} سؤال BAC`, hint: "مع عناصر الإجابة والتنبيهات", icon: HelpCircle, tone: "emerald" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* الواجهة الرئيسية */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 p-8 sm:p-12 text-white border border-teal-500/20 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <p className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>المنهاج الجزائري للعلوم الإسلامية • تحضير بكالوريا 2026</span>
            </p>

            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-white">
              راجع العلوم الإسلامية بطريقة <span className="text-teal-300">تفاعلية</span> ومنظّمة
            </h1>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              يجمع <strong className="text-white">زادِي</strong> أدوات الاستذكار الأربع في مكان
              واحد: خرائط ذهنية تفاعلية، بطاقات حفظ وتحدّي ملء الفراغات، اختبارات
              اختيار من متعدد بتعليل لكل سؤال، وبنك أسئلة بكالوريا مع عناصر الإجابة
              وسلّم التنقيط حين يتوفّر.
            </p>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <Link
                href="/units/1"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-teal-500/30 hover:scale-[1.02]"
              >
                <span>ابدأ الوحدة 01: العقيدة وأثرها</span>
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </Link>

              <span className="text-xs text-teal-200 font-medium">
                ⚡ يعمل دون إنترنت بعد أول زيارة (PWA)
              </span>
            </div>
          </div>
        </section>

        {/* الأرقام */}
        <section aria-label="محتوى التطبيق بالأرقام" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, hint, icon: Icon, tone }) => (
            <div
              key={label}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold mb-2 ${
                  tone === "teal"
                    ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300"
                    : tone === "amber"
                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                      : tone === "blue"
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                        : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{label}</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{hint}</p>
            </div>
          ))}
        </section>

        {/* الوحدات */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              الوحدات التعليمية المتوفرة
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              الكتلة العقدية والفكرية الأساسية لجميع الشعب
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {units.map((unit) => (
              <article
                key={unit.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:border-teal-500/70 transition-all duration-300 flex flex-col justify-between gap-6 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-black border border-teal-200/60 dark:border-teal-900">
                      {unit.badge}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{unit.timeAllocation}</span>
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                    <Link href={`/units/${unit.id}`} className="hover:underline">
                      {unit.title}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {unit.learningObjective}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs font-bold text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-teal-700 dark:text-teal-300">
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{unit.flashcards.length} بطاقة</span>
                    </span>
                    <span className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                      <CheckSquare className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{unit.quizQuestions.length} QCM</span>
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                      <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{unit.questions.length} BAC</span>
                    </span>
                  </div>

                  <Link
                    href={`/units/${unit.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 text-white hover:bg-teal-800 transition-colors"
                  >
                    <span>ابدأ الدراسة</span>
                    <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* طريقة الدراسة */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              مسار الاستذكار داخل كل وحدة
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              ستة أنماط متتابعة، ونسبة الإتقان تُحسب من إنجازك فيها جميعًا
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { n: 1, icon: Layers, title: "الخريطة الذهنية", desc: "فهرس تفاعلي + صورة الخريطة الكاملة للتكبير.", tone: "teal" },
              { n: 2, icon: BookOpen, title: "الدرس المنهجي", desc: "الشرح الرسمي مع الشواهد برواية ورش ومحل الشاهد وزر النسخ.", tone: "teal" },
              { n: 3, icon: Sparkles, title: "الحفظ والاسترجاع", desc: "بطاقات بقلب ثلاثي الأبعاد، تقييم ذاتي، وتحدّي ملء الفراغات.", tone: "amber" },
              { n: 4, icon: CheckSquare, title: "اختبار QCM", desc: "أسئلة بخيارات مخلوطة وتعليل فوري بعد كل إجابة.", tone: "blue" },
              { n: 5, icon: HelpCircle, title: "بنك أسئلة البكالوريا", desc: "أسئلة مباشرة وأسئلة استخراج من النصوص مع عناصر الإجابة.", tone: "emerald" },
              { n: 6, icon: Zap, title: "المراجعة السريعة", desc: "مراجعة اللحظة الأخيرة، القواعد المنهجية، وفروق المصطلحات.", tone: "rose" },
            ].map(({ n, icon: Icon, title, desc, tone }) => (
              <div
                key={n}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                      tone === "teal"
                        ? "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300"
                        : tone === "amber"
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                          : tone === "blue"
                            ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                            : tone === "emerald"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                              : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                    }`}
                  >
                    {n}
                  </span>
                  <Icon className="w-4 h-4 text-slate-500" aria-hidden="true" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{title}</h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ملاحظة الأمانة العلمية */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">ملاحظة: </span>
            المحتوى مُستخرج من الملخصات المنهجية المعتمدة وأسئلة البكالوريا الرسمية، ويُنصح دائمًا
            بمقارنته مع التصحيح الرسمي لسنة الامتحان وبمراجعة أستاذ المادة، خصوصًا في ضبط الشواهد
            القرآنية برواية ورش.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
