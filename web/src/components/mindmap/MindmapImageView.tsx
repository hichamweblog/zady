"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ChevronRight, ExternalLink, Maximize2, Minus, Plus } from "lucide-react";
import { useSheetA11y } from "./useSheetA11y";

interface MindmapImageViewProps {
  src: string;
  unitTitle: string;
}

/**
 * «المصورة» — خريطة الوحدة كصورة واحدة.
 *
 * الصورة بعرض 2000px، فقراءتها على شاشة الهاتف مستحيلة بحجمها المصغّر؛
 * لذلك: معاينة سريعة، ثم عارض كامل الشاشة بزرّي تكبير وتصغير وتحريك
 * بالإصبع داخل العارض. لا تكبير تلقائي ولا حركة زائدة.
 */
export default function MindmapImageView({ src, unitTitle }: MindmapImageViewProps) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setZoom(1);
  }, []);

  useSheetA11y(open, close, closeRef);

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-sm dark:bg-slate-900 sm:p-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="تكبير الخريطة المصوّرة"
        className="group relative block w-full overflow-hidden rounded-2xl"
      >
        <Image
          src={src}
          alt={`الخريطة المصوّرة لوحدة ${unitTitle}`}
          width={2000}
          height={1400}
          sizes="(max-width: 768px) 100vw, 1100px"
          className="h-auto w-full"
          priority={false}
        />
        <span className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-900/80 px-3.5 py-1.5 text-meta font-bold text-white backdrop-blur transition-colors group-hover:bg-teal-700">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          اضغط للتكبير
        </span>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-3">
        <p className="text-meta font-medium text-slate-500 dark:text-slate-400">
          الصورة مضغوطة على الهاتف — كبّرها لقراءة التفاصيل.
        </p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-label font-bold text-teal-700 hover:underline dark:text-teal-300"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          فتح في تبويب جديد
        </a>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950/95">
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-white">
            <p className="min-w-0 truncate text-label font-bold">الخريطة المصوّرة — {unitTitle}</p>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-label font-bold text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span>رجوع</span>
            </button>
          </div>

          <div
            className="min-h-0 flex-1 overflow-auto px-2"
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <Image
              src={src}
              alt={`الخريطة المصوّرة لوحدة ${unitTitle} — عرض مكبَّر`}
              width={2000}
              height={1400}
              sizes="100vw"
              style={{ width: `${zoom * 100}%` }}
              className="mx-auto h-auto max-w-none rounded-xl"
              priority={false}
            />
          </div>

          <div className="flex items-center justify-center gap-2 px-3 py-3">
            <button
              type="button"
              onClick={() => setZoom((value) => Math.max(1, Number((value - 0.5).toFixed(1))))}
              disabled={zoom <= 1}
              aria-label="تصغير"
              className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 disabled:opacity-40"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="min-w-14 rounded-full bg-white/10 px-3 py-1.5 text-center text-label font-bold text-white tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((value) => Math.min(4, Number((value + 0.5).toFixed(1))))}
              disabled={zoom >= 4}
              aria-label="تكبير"
              className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
