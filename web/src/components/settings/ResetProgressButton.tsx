"use client";

import { useState } from "react";
import { RotateCcw, Check } from "lucide-react";
import { useProgress } from "@/lib/useProgressStore";

/** زر تصفير التقدّم — لم يكن موجودًا، فيتعذّر على الطالب البدء من جديد على جهاز مشترك. */
export default function ResetProgressButton() {
  const { resetProgress } = useProgress();
  const [done, setDone] = useState(false);

  const handleReset = () => {
    const confirmed = window.confirm(
      "سيتم حذف كل تقدّمك المحفوظ على هذا الجهاز (تقييم البطاقات، الأسئلة المتقنة، نتائج الاختبارات). هل تريد المتابعة؟"
    );
    if (!confirmed) return;
    resetProgress();
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-800 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
    >
      {done ? (
        <>
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
          <span>تمت التصفير</span>
        </>
      ) : (
        <>
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>تصفير التقدّم</span>
        </>
      )}
    </button>
  );
}
