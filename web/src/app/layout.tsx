import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import PwaRegister from "@/components/pwa/PwaRegister";

/**
 * الخطوط محليّة (self-hosted) بدل next/font/google:
 * البناء كان يفشل كليًا إذا تعذّر الوصول إلى fonts.googleapis.com،
 * وكانت الخطوط تُطلب من نطاق خارجي يبطئ العرض على شبكات ضعيفة.
 */
const cairo = localFont({
  src: [
    { path: "./fonts/cairo-arabic.woff2", weight: "200 900", style: "normal" },
    { path: "./fonts/cairo-latin.woff2", weight: "200 900", style: "normal" },
  ],
  variable: "--font-cairo",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
  preload: true,
  adjustFontFallback: false,
});

const amiri = localFont({
  src: [
    { path: "./fonts/amiri-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/amiri-arabic-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-amiri",
  display: "swap",
  fallback: ["Traditional Arabic", "Times New Roman", "serif"],
  preload: false,
});

const SITE_URL = "https://zady.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "زادِي | العلوم الإسلامية للبكالوريا",
    template: "%s | زادِي",
  },
  description:
    "تطبيق زادِي التفاعلي لمراجعة دروس العلوم الإسلامية لبكالوريا الجزائر: خرائط ذهنية، بطاقات حفظ، تحدّي ملء الفراغات، اختبارات QCM، وبنك أسئلة البكالوريا مع عناصر الإجابة.",
  applicationName: "زادِي",
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    url: SITE_URL,
    siteName: "زادِي",
    title: "زادِي | العلوم الإسلامية للبكالوريا",
    description:
      "مراجعة تفاعلية لدروس العلوم الإسلامية: خرائط ذهنية، بطاقات حفظ، اختبارات، وأسئلة بكالوريا.",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "زادِي — العلوم الإسلامية للبكالوريا",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "زادِي | العلوم الإسلامية للبكالوريا",
    description: "مراجعة تفاعلية لدروس العلوم الإسلامية: خرائط ذهنية، بطاقات حفظ، اختبارات.",
    images: ["/og/default.png"],
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "زادِي",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
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
      className={`${cairo.variable} ${amiri.variable}`}
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
      </body>
    </html>
  );
}
