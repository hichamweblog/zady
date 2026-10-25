"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("خطأ أثناء العرض:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-600 p-8 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900">
          <AlertCircle className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-title font-bold text-slate-900 dark:text-white">حدث خطأ غير متوقع</h1>
          <p className="text-body-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            واجه التطبيق مشكلة أثناء تحميل الصفحة. تقدّمك المحفوظ على جهازك لم يتأثر.
          </p>
          {error.digest && (
            <p className="text-meta text-slate-500 dark:text-slate-400 font-mono">
              رمز الخطأ: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 text-white font-bold text-label hover:bg-teal-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>إعادة المحاولة</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 font-bold text-label text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
