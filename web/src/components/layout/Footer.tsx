import { BookOpen, Heart, GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            تطبيق زادِي - نحو العلامة الكاملة 20/20 في العلوم الإسلامية
          </span>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <span>مبني خصيصاً لطلبة البكالوريا وفق المنهاج الجزائري الرسمي المعتمد</span>
        </div>

        <div className="text-xs text-slate-400">
          نسخة محلية تفاعلية (Offline PWA) • 2026
        </div>
      </div>
    </footer>
  );
}
