/**
 * مصدر عامل الخدمة (Service Worker).
 *
 * لماذا مولَّد هنا بدل `public/sw.js`؟
 * لأن اسم الكاش يجب أن يتغيّر مع كل بناء، وإلا بقي المتصفح يقدّم الصفحات
 * القديمة بعد كل نشر. الملف الثابت في `public/` لا يمكن حقن بصمة البناء فيه،
 * لذلك صار يُولَّد من مسار ثابت (`/sw.js`) يحقن `buildId` وقت البناء.
 *
 * إصلاحات عن النسخة السابقة (v2):
 *  - `addAll` (كل شيء أو لا شيء) ← `Promise.allSettled` على كل ملف منفردًا،
 *    ففشل ملف واحد لم يعد يُسقط التثبيت كله ويُبقي الطالب بلا وضع أوفلاين.
 *  - صور الخرائط (2.8MB) لم تعد تُحمَّل مسبقًا لكل زائر، بل عند أول استخدام.
 *  - اسم الكاش مبني على بصمة البناء، فتنظيف الكاش القديم صار فعليًا.
 *  - الصفحات: الشبكة أولًا (محتوى محدَّث دائمًا)، والكاش احتياطًا عند الانقطاع.
 */
export function buildServiceWorker(buildId: string): string {
  const version = buildId.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 40) || "dev";

  return `/*
 * زادِي — Service Worker
 * مولَّد آليًا من src/lib/service-worker.ts — لا تُحرّره مباشرة.
 * بصمة البناء: ${version}
 */
const VERSION = ${JSON.stringify(version)};
const CACHE_NAME = \`zady-\${VERSION}\`;

/** الصفحات الأساسية: تُخزَّن لتعمل دون اتصال من أول زيارة */
const PRECACHE_PAGES = ["/", "/units/1", "/units/2", "/units/3", "/units/4"];

/** أصول صغيرة لا غنى عنها لشكل التطبيق */
const PRECACHE_STATIC = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // كل ملف على حدة: فشل واحد لا يُسقط التثبيت كله
      await Promise.allSettled(
        [...PRECACHE_PAGES, ...PRECACHE_STATIC].map((url) =>
          cache.add(new Request(url, { cache: "reload" }))
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname.startsWith("/og/") ||
  url.pathname.startsWith("/lessons/") ||
  /\\.(?:png|jpe?g|webp|avif|svg|ico|woff2?|css|js)$/.test(url.pathname);

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // لا نتدخّل في طلبات RSC/بيانات Next حتى لا نكسر التنقّل بين الصفحات
  if (url.searchParams.has("_rsc")) return;

  // الأصول الثابتة: من الكاش أولًا (أسماؤها تحمل بصمة المحتوى)، ثم الشبكة
  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response && response.status === 200 && response.type === "basic") {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          return new Response("", { status: 504, statusText: "offline" });
        }
      })()
    );
    return;
  }

  // الصفحات: الشبكة أولًا ثم الكاش ثم الصفحة الرئيسية ثم رسالة انقطاع
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response && response.status === 200 && response.type === "basic") {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        const fallback = await caches.match("/");
        if (fallback) return fallback;
        return new Response(
          "<!doctype html><html lang='ar' dir='rtl'><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>غير متصل — زادِي</title><body style='font-family:system-ui,sans-serif;padding:2.5rem 1.5rem;text-align:center;line-height:1.9;background:#f8fafc;color:#0f172a'><h1 style='font-size:1.4rem'>لا يوجد اتصال بالإنترنت</h1><p>افتح هذه الوحدة مرة واحدة وأنت متصل لتُحفظ وتعمل دون إنترنت.</p><p><a href='/' style='display:inline-block;margin-top:1rem;padding:.6rem 1.2rem;border-radius:.75rem;background:#0f766e;color:#fff;text-decoration:none;font-weight:700'>العودة إلى الرئيسية</a></p></body></html>",
          { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
    })()
  );
});
`;
}
