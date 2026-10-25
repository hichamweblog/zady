export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-teal-600/20 border-2 border-teal-500 flex items-center justify-center animate-pulse">
        <div className="w-6 h-6 rounded-lg bg-teal-600 animate-spin" />
      </div>
      <div className="space-y-2 text-center">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto animate-pulse" />
        <p className="text-xs text-slate-400 font-semibold">جاري تحميل المحتوى التعليمي...</p>
      </div>
    </div>
  );
}
