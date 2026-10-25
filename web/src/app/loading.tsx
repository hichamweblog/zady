export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--canvas)] p-6"
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--brand-soft)]">
        <div className="h-5 w-5 animate-spin rounded-md bg-[var(--brand)]" aria-hidden="true" />
      </div>
      <div className="space-y-2 text-center">
        <div className="mx-auto h-3 w-32 animate-pulse rounded-full bg-[var(--surface-3)]" />
        <p className="text-body-sm font-medium text-[var(--ink-soft)]">
          جاري تحميل المحتوى التعليمي...
        </p>
      </div>
    </div>
  );
}
