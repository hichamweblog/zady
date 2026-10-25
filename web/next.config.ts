import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * ملاحظة معمارية: تم تعطيل `cacheComponents` و`partialPrefetching` لأن كل
   * صفحات هذا التطبيق ثابتة (بيانات محلية، لا طلبات شبكة وقت الطلب)، فلم تكن
   * توفّر أي مكسب، بينما كانت تفرض قيودًا ضارّة — أهمّها أن `dynamicParams`
   * يصبح غير متاح، فتُرجع المسارات غير الموجودة مثل `/units/99` حالة HTTP 200
   * مع صفحة 404 (وهو خطأ حقيقي في الـ SEO). بدونهما تصبح 404 حقيقية.
   */
  cacheComponents: false,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        // أصول ثابتة قابلة للكاش طويلًا (أسماؤها تحمل بصمة المحتوى)
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/lessons/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
