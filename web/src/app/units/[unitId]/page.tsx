import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllUnits, getUnitById } from "@/lib/data-loader";
import { getAdjacentUnits } from "@/lib/units-meta";
import UnitClientView from "./UnitClientView";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * المسارات تُبنى مسبقًا لهذه الوحدات فقط؛ أي معرّف آخر يُرجع 404 حقيقية.
 * سابقًا كانت /units/99 تُرجع HTTP 200 مع صفحة «غير موجودة» (خطأ SEO).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllUnits().map((unit) => ({ unitId: unit.id.toString() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ unitId: string }>;
}): Promise<Metadata> {
  const { unitId } = await params;
  const unit = getUnitById(Number.parseInt(unitId, 10));

  if (!unit) {
    return { title: "الوحدة غير موجودة" };
  }

  const description = `${unit.learningObjective} — مراجعة تفاعلية: خرائط ذهنية، بطاقات حفظ، اختبار QCM، وأسئلة بكالوريا.`;

  return {
    title: unit.title,
    description,
    alternates: { canonical: `/units/${unit.id}` },
    openGraph: {
      type: "article",
      title: unit.title,
      description,
      url: `/units/${unit.id}`,
      images: [
        {
          url: `/og/unit-0${unit.id}.png`,
          width: 1200,
          height: 630,
          alt: unit.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: unit.title,
      description,
      images: [`/og/unit-0${unit.id}.png`],
    },
  };
}

export default async function UnitPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const unit = getUnitById(Number.parseInt(unitId, 10));

  if (!unit) {
    notFound();
  }

  const { prev, next } = getAdjacentUnits(unit.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: unit.title,
    inLanguage: "ar",
    educationalLevel: "secondary",
    about: unit.field,
    description: unit.learningObjective,
    teaches: unit.sections.map((section) => section.title),
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: "زادِي", url: "https://zady.app" },
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--canvas)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main id="main-content" className="u-wrap flex-1 py-6 sm:py-8">
        <UnitClientView unit={unit} previousUnit={prev} nextUnit={next} />

        {/* محتوى خادمي للزحف والقراءة السريعة دون JavaScript */}
        <noscript>
          <section className="mt-8 space-y-4">
            <h2 className="text-title font-bold">{unit.title}</h2>
            <p className="text-body-sm">{unit.learningObjective}</p>
            {unit.sections.map((section) => (
              <article key={section.key}>
                <h3 className="font-bold">{section.title}</h3>
              </article>
            ))}
          </section>
        </noscript>
      </main>
      <Footer />
    </div>
  );
}
