"use client";

import { useRef, useState } from "react";
import { Play, Clock, ListOrdered, Captions } from "lucide-react";
import type { UnitVideo } from "@/lib/types";

/**
 * الشرح المرئي للوحدة.
 *
 * لماذا واجهة تشغيل مخصّصة بدل إطار مضمَّن مباشر؟
 *   - إطار YouTube المباشر يحمّل ~1MB من سكربتات الطرف الثالث في كل فتح للدرس،
 *     حتى لو لم يشاهد الطالب الفيديو. هنا لا يُحمَّل شيء قبل النقر.
 *   - الإطار الأسود الفارغ يبدو كخطأ تحميل؛ الغلاف + زرّ التشغيل يقولان
 *     «هذا فيديو، اضغط» بلا التباس.
 *   - الفصول تُعرض نصًّا للفيديو المستضاف، وتصبح أزرار انتقال للملف المحلي.
 */
export default function VideoLesson({ video }: { video: UnitVideo }) {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const fileRef = useRef<HTMLVideoElement | null>(null);

  const chapters = video.chapters ?? [];
  const isFile = video.provider === "file";

  const embedSrc =
    video.provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`
      : video.provider === "vimeo"
        ? `https://player.vimeo.com/video/${video.id}?autoplay=1`
        : "";

  const seek = (at: string) => {
    const [m, s] = at.split(":").map((n) => Number.parseInt(n, 10) || 0);
    if (!fileRef.current) return;
    fileRef.current.currentTime = m * 60 + s;
    void fileRef.current.play();
  };

  return (
    <div className="space-y-4">
      <div className="u-card overflow-hidden p-0">
        <div className="relative aspect-video w-full bg-[var(--surface-2)]">
          {started ? (
            isFile ? (
              <video
                ref={fileRef}
                className="h-full w-full bg-black"
                controls
                autoPlay
                playsInline
                preload="metadata"
                poster={video.poster}
                aria-label={video.title}
              >
                <source src={video.src} type="video/mp4" />
                {video.captions && (
                  <track
                    kind="captions"
                    src={video.captions}
                    srcLang="ar"
                    label="العربية"
                    default
                  />
                )}
              </video>
            ) : (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={embedSrc}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )
          ) : (
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="group flex h-full w-full flex-col items-center justify-center gap-3 px-5 text-center"
              aria-label={`تشغيل: ${video.title}`}
            >
              {video.poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={video.poster}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-[var(--surface)] text-[var(--brand-strong)] shadow-[var(--shadow-hover)] transition-transform group-hover:scale-105">
                <Play className="ms-0.5 h-6 w-6" aria-hidden="true" fill="currentColor" />
              </span>
              <span className="relative z-10 max-w-md text-label font-semibold text-[var(--ink)]">
                {video.title}
              </span>
              {video.duration && (
                <span className="u-num relative z-10 rounded-full bg-[var(--surface)] px-2 py-0.5 text-meta text-[var(--ink-soft)]">
                  {video.duration}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-meta text-[var(--ink-faint)]">
        {video.duration && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="u-num">{video.duration}</span>
          </span>
        )}
        {video.captions && (
          <span className="inline-flex items-center gap-1.5">
            <Captions className="h-3.5 w-3.5" aria-hidden="true" />
            تفريغ نصّي متوفّر
          </span>
        )}
        <span>الشرح المرئي مرافق للقراءة، لا بديلًا عنها.</span>
      </div>

      {chapters.length > 0 && (
        <div className="u-card p-4">
          <p className="flex items-center gap-2 text-label font-semibold text-[var(--ink)]">
            <ListOrdered className="h-4 w-4 text-[var(--brand-strong)]" aria-hidden="true" />
            فصول الفيديو
          </p>
          <ol className="mt-2 space-y-0.5">
            {chapters.map((chapter, index) => (
              <li key={chapter.at}>
                {isFile ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrent(index);
                      seek(chapter.at);
                    }}
                    aria-current={index === current ? "true" : undefined}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-start text-label text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                  >
                    <span className="u-num text-meta text-[var(--brand-strong)]">{chapter.at}</span>
                    <span className="min-w-0 truncate">{chapter.title}</span>
                  </button>
                ) : (
                  <p className="flex items-center gap-3 px-2 py-2 text-label text-[var(--ink-soft)]">
                    <span className="u-num text-meta text-[var(--brand-strong)]">{chapter.at}</span>
                    <span className="min-w-0 truncate">{chapter.title}</span>
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
