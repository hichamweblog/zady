import Link from "next/link";
import { BookOpen, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200 dark:border-teal-900">
          <BookOpen className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            404 - غير موجودة
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            الوحدة أو الصفحة المطلوبة غير متوفرة
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            تأكد من رقم الوحدة أو عد إلى لوحة التحكم لاختيار إحدى الوحدات المعتمدة.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 text-white font-extrabold text-sm hover:bg-teal-700 transition-colors shadow-md shadow-teal-600/20"
          >
            <Home className="w-4 h-4" />
            <span>العودة للوحة التحكم الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
