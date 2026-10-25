import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import PwaRegister from "@/components/pwa/PwaRegister";
import MobileTabBar from "@/components/layout/MobileTabBar";

/**
 * الخطوط محليّة (self-hosted) بدل next/font/google:
 * البناء كان يفشل كليًا إذا تعذّر الوصول إلى fonts.googleapis.com،
 * وكانت الخطوط تُطلب من نطاق خارجي يبطئ العرض على شبكات ضعيفة.
 */
/**
 * الخطوط — نظام من عائلتين فقط:
 *
 * 1. **Noto Naskh Arabic** لكل نص: المتن والعناوين وواجهة الاستخدام.
 * خط نَسخي مصمَّم للقراءة على الشاشة (خلف Droid Arabic Naskh)، وحروفه
 * أوضح من الخطوط الهندسية في الفقرات العربية الطويلة — وهذا جوهر التطبيق:
 * نصوص شرعية وتعريفات وشرح. أربعة أوزان متاحة، نستخدم 400 و700 فقط
 * (106KB) بدل تحميل العائلة كاملة.
 *
 * 2. **Amiri** للشواهد القرآنية فقط (`.font-quran`): نَسخي متقن الضبط،
 * يحترم مواضع الوقف والتشكيل الكامل.
 *
 * ملاحظة عن الحجم: المتن 17px لا 16px، ولا شيء أصغر من 13px. النص العربي
 * يحتاج مقاسًا أكبر من نظيره اللاتيني ليُقرأ على الهاتف دون تكبير.
 */
const naskh = localFont({
 src: [
 { path:"./fonts/noto-naskh-400.woff2", weight:"400", style:"normal"},
 { path:"./fonts/noto-naskh-700.woff2", weight:"700", style:"normal"},
 ],
 variable:"--font-body",
 display:"swap",
 fallback: [
"Noto Naskh Arabic",
"Traditional Arabic",
"Segoe UI",
"Arial",
"sans-serif",
 ],
 preload: true,
 adjustFontFallback: false,
});

/**
 * اللاتينية والأرقام (QCM · BAC · 20/5): مقطع منفصل من نفس العائلة.
 * عائلة مستقلة لتفادي تعارض `@font-face`، وتُستدعى بعد العربية في السلسلة
 * فتُستخدم لحروفها فقط (الاحتياط للحرف الواحد يعمل في CSS تلقائيًا).
 */
const naskhLatin = localFont({
  src: [{ path: "./fonts/noto-naskh-latin-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-latin",
  display: "swap",
  fallback: ["Segoe UI", "Arial", "sans-serif"],
  preload: false,
  adjustFontFallback: false,
});

const amiri = localFont({
 src: [
 { path:"./fonts/amiri-arabic-400-normal.woff2", weight:"400", style:"normal"},
 { path:"./fonts/amiri-arabic-700-normal.woff2", weight:"700", style:"normal"},
 ],
 variable:"--font-amiri",
 display:"swap",
 fallback: ["Traditional Arabic","Times New Roman","serif"],
 preload: false,
});

const SITE_URL ="https://zady.app";

export const metadata: Metadata = {
 metadataBase: new URL(SITE_URL),
 title: {
 default:"زادِي | العلوم الإسلامية للبكالوريا",
 template:"%s | زادِي",
 },
 description:
"تطبيق زادِي التفاعلي لمراجعة دروس العلوم الإسلامية لبكالوريا الجزائر: خرائط ذهنية، بطاقات حفظ، تحدّي ملء الفراغات، اختبارات QCM، وبنك أسئلة البكالوريا مع عناصر الإجابة.",
 applicationName:"زادِي",
 manifest:"/manifest.json",
 alternates: { canonical:"/"},
 openGraph: {
 type:"website",
 locale:"ar_DZ",
 url: SITE_URL,
 siteName:"زادِي",
 title:"زادِي | العلوم الإسلامية للبكالوريا",
 description:
"مراجعة تفاعلية لدروس العلوم الإسلامية: خرائط ذهنية، بطاقات حفظ، اختبارات، وأسئلة بكالوريا.",
 images: [
 {
 url:"/og/default.png",
 width: 1200,
 height: 630,
 alt:"زادِي — العلوم الإسلامية للبكالوريا",
 },
 ],
 },
 twitter: {
 card:"summary_large_image",
 title:"زادِي | العلوم الإسلامية للبكالوريا",
 description:"مراجعة تفاعلية لدروس العلوم الإسلامية: خرائط ذهنية، بطاقات حفظ، اختبارات.",
 images: ["/og/default.png"],
 },
 robots: { index: true, follow: true },
 appleWebApp: {
 capable: true,
 statusBarStyle: "default",
 title:"زادِي",
 },
 formatDetection: { telephone: false },
};

export const viewport: Viewport = {
 themeColor: [
 { media:"(prefers-color-scheme: light)", color:"#f8fafc"},
 { media:"(prefers-color-scheme: dark)", color:"#0b1120"},
 ],
 width:"device-width",
 initialScale: 1,
 maximumScale: 5,
 colorScheme:"light dark",
};

/* الثيم الافتراضي فاتح (كما كان) ويُطبَّق قبل الرسم لمنع الوميض */
const THEME_SCRIPT = `(function(){try{if(localStorage.getItem('zady_theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html
 lang="ar"
 dir="rtl"
 className={`${naskh.variable} ${naskhLatin.variable} ${amiri.variable}`}
 suppressHydrationWarning
 >
 <head>
 <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
 </head>
 <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col selection:bg-teal-600 selection:text-white">
 <a
 href="#main-content"
 className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-teal-700 focus:text-white focus:font-bold"
 >
 تخطَّ إلى المحتوى الرئيسي
 </a>
 <PwaRegister />
 {children}
        <MobileTabBar />
 </body>
 </html>
 );
}
