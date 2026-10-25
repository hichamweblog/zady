import { buildServiceWorker } from "@/lib/service-worker";

/*
 * يُقدَّم /sw.js من هنا (لا من public/) حتى تُحقن بصمة البناء في اسم الكاش.
 * المسار ثابت ويُولَّد وقت البناء، فلا كلفة على الخادم.
 */
export const dynamic = "force-static";

/**
 * بصمة البناء: تُقرأ مرة واحدة وقت البناء.
 *
 * - على Vercel/CI: بصمة الـcommit (ثابتة لنفس الكود، تتغيّر مع كل تغيير).
 * - خارج CI: طابع زمني بصيغة YYYYMMDDHHmmss، لأن اسم الكاش يجب أن يتغيّر
 *   مع كل نشر وإلا بقي المتصفح يقدّم نسخة قديمة من الصفحة المحفوظة.
 */
const BUILD_ID =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GIT_COMMIT_SHA ||
  new Date().toISOString().replace(/\D/g, "").slice(0, 14);

export function GET() {
  return new Response(buildServiceWorker(BUILD_ID), {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
