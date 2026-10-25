import type { Metadata, Viewport } from "next";
import { Cairo, Amiri } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/pwa/PwaRegister";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zady.app"),
  title: "زادي | العلوم الإسلامية للبكالوريا",
  description: "تطبيق زادي التفاعلي لمراجعة دروس العلوم الإسلامية لبكالوريا الجزائر - خرائط ذهنية، استرجاع نشط، بطاقات وبنك أسئلة بسلم التنقيط المعتمد.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "زادي",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('zady_theme');if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
