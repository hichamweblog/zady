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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--canvas)] p-6 text-center">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-[var(--surface)] p-8 shadow-[var(--shadow-float)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-heading font-semibold text-[var(--ink)]">حدث خطأ غير متوقع</h1>
          <p className="text-body-sm leading-relaxed text-[var(--ink-soft)]">
            واجه التطبيق مشكلة أثناء تحميل الصفحة. تقدّمك المحفوظ على جهازك لم يتأثر.
          </p>
          {error.digest && (
            <p className="text-meta text-slate-500 dark:text-slate-400 font-mono">
              رمز الخطأ: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => reset()} className="u-cta">
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>إعادة المحاولة</span>
          </button>

          <Link href="/" className="u-ghost">
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
