import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import PwaRegister from "@/components/pwa/PwaRegister";
import MobileTabBar from "@/components/layout/MobileTabBar";

/**
 * خطوط دراية v4.1 (مستضافة محليًا — SIL Open Font License):
 * - Readex Pro (400/500/600): متن الواجهة والدروس (18px واجهة، 20px درس)
 * - Tajawal (500/700/800): العناوين
 * - Amiri (400/700): النصوص الشرعية
 * - Amiri Quran (400): الشواهد القرآنية
 */
const readexPro = localFont({
  src: [
    { path: "./fonts/readex-pro-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/readex-pro-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/readex-pro-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-ui",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
  preload: true,
  adjustFontFallback: false,
});

const tajawal = localFont({
  src: [
    { path: "./fonts/tajawal-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/tajawal-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/tajawal-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-heading",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
  preload: true,
  adjustFontFallback: false,
});

const amiri = localFont({
  src: [
    { path: "./fonts/amiri-diraya-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/amiri-diraya-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-amiri",
  display: "swap",
  fallback: ["Traditional Arabic", "Times New Roman", "serif"],
  preload: false,
});

const amiriQuran = localFont({
  src: [{ path: "./fonts/amiri-quran-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-quran",
  display: "swap",
  fallback: ["Amiri", "Traditional Arabic", "serif"],
  preload: false,
});

const SITE_URL = "https://diraya.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "دراية | العلوم الإسلامية للبكالوريا",
    template: "%s | دراية",
  },
  description:
    "منصة دراية التفاعلية لمراجعة دروس العلوم الإسلامية لبكالوريا الجزائر: خرائط ذهنية، بطاقات حفظ، تحدّي ملء الفراغات، اختبارات QCM، وبنك أسئلة مع عناصر الإجابة.",
  applicationName: "دراية",
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    url: SITE_URL,
    siteName: "دراية",
    title: "دراية | العلوم الإسلامية للبكالوريا",
    description:
      "مراجعة تفاعلية لدروس العلوم الإسلامية: خرائط ذهنية، بطاقات حفظ، اختبارات، وأسئلة بكالوريا.",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "دراية — العلوم الإسلامية للبكالوريا",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "دراية | العلوم الإسلامية للبكالوريا",
    description: "مراجعة تفاعلية لدروس العلوم الإسلامية: خرائط ذهنية، بطاقات حفظ، اختبارات.",
    images: ["/og/default.png"],
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "دراية",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#3157B7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

/* المظهر الافتراضي فاتح وفق سياسة دراية v4.1 (لا وضع داكن تلقائي) */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('diraya_theme')||localStorage.getItem('zady_theme');if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${readexPro.variable} ${tajawal.variable} ${amiri.variable} ${amiriQuran.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col selection:bg-[var(--brand-blue)] selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--brand-blue)] focus:text-white focus:font-semibold"
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
