import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { UNITS } from "@/lib/data-loader";
import {
  BookOpen,
  Sparkles,
  Layers,
  HelpCircle,
  Clock,
  ArrowLeft,
  CheckSquare,
} from "lucide-react";

export default function HomePage() {
  const totalFlashcards = UNITS.reduce((acc, u) => acc + u.flashcards.length, 0);
  const totalQuestions = UNITS.reduce((acc, u) => acc + u.questions.length, 0);
  const totalMcqQuizzes = UNITS.reduce((acc, u) => acc + u.quizQuestions.length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 p-8 sm:p-12 text-white border border-teal-500/20 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>المنهاج الجزائري الرسمي المعتمد • بكالوريا 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-white">
              طريقك نحو العلامة الكاملة <span className="text-teal-400">20/20</span> في العلوم الإسلامية
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              تطبيق <strong className="text-white">زادِي</strong> يمنحك تجربة استذكار متكاملة تجمع بين **الخرائط الذهنية التفاعلية**، **بطاقات الحفظ**، **اختبارات الـ QCM**، و**أسئلة البكالوريا** مع سلم التنقيط وتوجيهات الإجابة.
            </p>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <Link
                href="/units/1"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-teal-500/30 hover:scale-105"
              >
                <span>ابدأ الوحدة 01: العقيدة وأثرها</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <span className="text-xs text-teal-200/80 font-medium">
                ⚡ يعمل محلياً بالكامل وبدون الحاجة لإنترنت (Offline PWA)
              </span>
            </div>
          </div>
        </section>

        {/* QUICK STATS METRICS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {UNITS.length} وحدات
            </div>
            <p className="text-xs text-slate-500 font-medium">مكتملة ومجهزة بيداغوجياً</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalFlashcards} بطاقة
            </div>
            <p className="text-xs text-slate-500 font-medium">استرجاع نشط (Active Recall)</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-2">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalMcqQuizzes} سؤال QCM
            </div>
            <p className="text-xs text-slate-500 font-medium">اختيار من متعدد مع التعليل</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-2">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalQuestions} سؤال BAC
            </div>
            <p className="text-xs text-slate-500 font-medium">مع سلم التنقيط المعتمد</p>
          </div>
        </section>

        {/* 4 UNITS PROGRESS GRID */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                الوحدات التعليمية الأربع الأولى
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                الكتلة العقدية والفكرية الأساسية لجميع الشعب
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {UNITS.map((u) => (
              <div
                key={u.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:border-teal-500/50 transition-all duration-300 flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-black border border-teal-200/50 dark:border-teal-900">
                      {u.badge}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{u.timeAllocation}</span>
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {u.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {u.learningObjective}
                  </p>
                </div>

                {/* Sub features pills */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{u.flashcards.length} بطاقة</span>
                    </span>
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{u.quizQuestions.length} QCM</span>
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{u.questions.length} سؤال</span>
                    </span>
                  </div>

                  <Link
                    href={`/units/${u.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black hover:bg-teal-600 dark:hover:bg-teal-400 dark:hover:text-slate-950 transition-colors shadow-sm"
                  >
                    <span>دخول الوحدة</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5-STAGE PEDAGOGICAL ROADMAP */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              منهجية المذاكرة الذكية داخل زادِي
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              دورة تعلّم متكاملة من 5 خطوات صممت خصيصاً لضمان عدم نسيان أي معلومة حتى يوم الامتحان
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-black text-xs">
                1
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                الخريطة الذهنية
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                استيعاب الصورة الكلية والروابط المنطقية بين عناصر الوحدة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-xs">
                2
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                الدرس المنهجي
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                قراءة الشرح المنهجي بدقة وضبط الآيات برواية ورش ومحل الشاهد.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                3
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                الاسترجاع النشط
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                تثبيت الحفظ عبر بطاقات الفلاش ثلاثية الأبعاد وتحدي ملء الفراغات.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-xs">
                4
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                اختبار الـ QCM
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                اختبار الفهم السريع مع التلميحات الذكية والتفسير الفوري لكل خيار.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-xs">
                5
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                محاكي البكالوريا
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                حل الأسئلة والاطلاع على سلم التنقيط وتنبيهات المصححين.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
