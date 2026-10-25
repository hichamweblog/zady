import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllUnits, getUnitById } from "@/lib/data-loader";
import UnitClientView from "./UnitClientView";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export function generateStaticParams() {
  const units = getAllUnits();
  return units.map((u) => ({
    unitId: u.id.toString(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ unitId: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const unitId = parseInt(resolvedParams.unitId, 10);
  const unit = getUnitById(unitId);

  if (!unit) {
    return {
      title: "الوحدة غير موجودة | زادِي",
    };
  }

  return {
    title: `${unit.title} | زادِي للعلوم الإسلامية`,
    description: `${unit.learningObjective} - مراجعة تفاعلية، بطاقات استرجاع، خريطة ذهنية، واختبارات معتمدة.`,
    openGraph: {
      title: `${unit.title} | زادِي`,
      description: unit.learningObjective,
      images: [unit.mindmapImage],
    },
  };
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const resolvedParams = await params;
  const unitId = parseInt(resolvedParams.unitId, 10);
  const unit = getUnitById(unitId);

  if (!unit) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UnitClientView unit={unit} />
      </main>
      <Footer />
    </div>
  );
}
