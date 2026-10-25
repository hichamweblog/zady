export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 space-y-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-teal-700/15 border-2 border-teal-600 flex items-center justify-center">
        <div className="w-6 h-6 rounded-lg bg-teal-700 animate-spin" aria-hidden="true" />
      </div>
      <div className="space-y-2 text-center">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto animate-pulse" />
        <p className="text-body-sm text-slate-600 dark:text-slate-300 font-semibold">
          جاري تحميل المحتوى التعليمي...
        </p>
      </div>
    </div>
  );
}
