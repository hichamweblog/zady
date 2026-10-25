"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useProgress } from "@/lib/useProgressStore";

import { StandardUnitData } from "@/lib/types";

interface StandardLessonViewerProps {
  unitId: number;
  standardData: StandardUnitData;
}

export default function StandardLessonViewer({
  unitId,
  standardData,
}: StandardLessonViewerProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [copiedAyah, setCopiedAyah] = useState<string | null>(null);

  const { toggleSectionRead, isSectionRead } = useProgress();
  const detailedExp = standardData.detailed_explanation || {};

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyText = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedAyah(id);
      setTimeout(() => setCopiedAyah(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Learning Objective Box */}
      {standardData.learning_objective && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent border border-teal-200 dark:border-teal-900/60 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-teal-800 dark:text-teal-300">
              الكفاءة المستهدفة والمؤشر الختامي للوحدة
            </h4>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {standardData.learning_objective}
            </p>
          </div>
        </div>
      )}

      {/* Sections rendering */}
      <div className="space-y-4">
        {Object.entries(detailedExp).map(([secKey, secValue]: [string, any], idx) => {
          const isCollapsed = !!collapsedSections[secKey];
          const isRead = isSectionRead(unitId, secKey);
          const title =
            typeof secValue === "object" && secValue.title
              ? secValue.title
              : formatSectionTitle(secKey, idx + 1);

          return (
            <div
              key={secKey}
              className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 shadow-sm overflow-hidden ${
                isRead
                  ? "border-emerald-200 dark:border-emerald-900/50"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {/* Section Header */}
              <div
                onClick={() => toggleSection(secKey)}
                className="p-5 sm:p-6 cursor-pointer flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border transition-colors ${
                      isRead
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                        : "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200/50 dark:border-teal-900"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                      {title}
                    </h3>
                    {isRead && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        تمت دراسة هذا المحور ✓
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSectionRead(unitId, secKey);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      isRead
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                    title={isRead ? "إلغاء وسم الإتمام" : "تحديد كمكتمل"}
                  >
                    {isRead ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>مكتمل</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-slate-400" />
                        <span>تمييز كمقروء</span>
                      </>
                    )}
                  </button>

                  <div className="text-slate-400">
                    {isCollapsed ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronUp className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Section Body */}
              {!isCollapsed && (
                <div className="p-6 sm:p-8 space-y-6">
                  <RenderContentItem
                    data={secValue}
                    onCopyAyah={copyText}
                    copiedAyah={copiedAyah}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatSectionTitle(key: string, num: number): string {
  const map: Record<string, string> = {
    causes_of_deviation: "أسباب الانحراف عن العقيدة الإسلامية",
    quran_means_to_establish_aqidah: "وسائل القرآن الكريم في تثبيت العقيدة الإسلامية",
    concept_of_intellect: "مفهوم العقل في القرآن ومناط التكليف",
    importance_and_status: "أهمية العقل ومكانته في التشريع الإسلامي",
    role_in_filtering_ideas: "دور العقل في تمحيص الأفكار والموروثات",
    limits_of_intellect: "حدود إعمال العقل ومجالاته",
    preservation_of_intellect: "وجوب المحافظة على العقل وتجريمه",
    section_1_definition: "أولاً: تعريف العقيدة الإسلامية وأصولها",
    section_2_effects_on_individual: "ثانياً: آثار العقيدة الإسلامية على الفرد",
    section_3_effects_on_society: "ثالثاً: آثار العقيدة الإسلامية على المجتمع",
    section_4_methodological_rules: "رابعاً: القواعد والضوابط المنهجية",
    section_1_islam_one_religion: "أولاً: الدين عند الله الإسلام ووحدة الرسالات",
    section_2_judaism: "ثانياً: الرسالة اليهودية ومصادرها وانحرافاتها",
    section_3_christianity: "ثالثاً: الرسالة النصرانية ومصادرها وانحرافاتها",
    section_4_islam_final_message: "رابعاً: خصائص الرسالة الخاتمة وعلاقتها بالرسالات السابقة",
  };
  return map[key] || `المحور ${num}: ${key.replace(/_/g, " ")}`;
}

function RenderContentItem({
  data,
  onCopyAyah,
  copiedAyah,
}: {
  data: any;
  onCopyAyah: (text: string, id: string) => void;
  copiedAyah: string | null;
}) {
  if (!data) return null;

  if (typeof data === "string") {
    return <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{data}</p>;
  }

  if (Array.isArray(data)) {
    return (
      <div className="space-y-4">
        {data.map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2"
          >
            {typeof item === "string" ? (
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                • {item}
              </p>
            ) : (
              <RenderContentItem
                data={item}
                onCopyAyah={onCopyAyah}
                copiedAyah={copiedAyah}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  const ayahText = data.quranic_proof_warsh || data.quranic_proof || data.prophetic_proof;
  const ayahId = `ayah_${ayahText?.slice(0, 15) || Math.random()}`;

  return (
    <div className="space-y-4">
      {/* Title if present */}
      {data.official_title && (
        <h4 className="font-extrabold text-base text-teal-800 dark:text-teal-300">
          {data.official_title}
        </h4>
      )}

      {/* Definitions */}
      {data.linguistic_definition && (
        <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1.5 shadow-sm">
          <span className="text-sm font-extrabold text-teal-800 dark:text-teal-300">التعريف اللغوي:</span>
          <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed font-semibold">
            {data.linguistic_definition}
          </p>
        </div>
      )}

      {data.idiomatic_definition && (
        <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1.5 shadow-sm">
          <span className="text-sm font-extrabold text-teal-800 dark:text-teal-300">التعريف الاصطلاحي:</span>
          <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed font-semibold">
            {data.idiomatic_definition}
          </p>
        </div>
      )}

      {data.relationship_linguistic_idiomatic && (
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm sm:text-base text-slate-800 dark:text-slate-200">
          <span className="font-extrabold text-slate-900 dark:text-white">العلاقة بين المعنيين: </span>
          <span>{data.relationship_linguistic_idiomatic}</span>
        </div>
      )}

      {data.core_foundation && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-base sm:text-lg shadow-sm">
          <span className="font-extrabold text-emerald-800 dark:text-emerald-300">أصل العقيدة الإسلامية: </span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">{data.core_foundation}</span>
        </div>
      )}

      {/* Explanation */}
      {data.explanation && (
        <div className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
          {data.explanation}
        </div>
      )}

      {/* Quranic Proof with Copy Feature */}
      {ayahText && (
        <div className="p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border-r-4 border-amber-500 dark:border-amber-400 space-y-2.5 relative group shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>الشاهد الشرعي (رواية ورش):</span>
            </div>

            <button
              onClick={() => onCopyAyah(ayahText, ayahId)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-200/70 dark:bg-amber-900/50 text-amber-950 dark:text-amber-100 hover:bg-amber-300 transition-colors"
              title="نسخ الشاهد القرآني"
            >
              {copiedAyah === ayahId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تم النسخ ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الشاهد</span>
                </>
              )}
            </button>
          </div>

          <div className="font-quran text-xl sm:text-2xl text-amber-950 dark:text-amber-100 leading-loose py-2">
            {ayahText}
          </div>

          {data.proof_anchor_phrase && (
            <div className="pt-2.5 border-t border-amber-200/80 dark:border-amber-900/60 flex items-center gap-2 text-sm text-amber-900 dark:text-amber-300">
              <span className="font-bold px-2.5 py-1 rounded-lg bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200">
                محل الشاهد:
              </span>
              <span className="font-bold">«{data.proof_anchor_phrase}»</span>
            </div>
          )}
        </div>
      )}

      {/* Tawheed Categories */}
      {data.tawheed_categories && Array.isArray(data.tawheed_categories) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {data.tawheed_categories.map((tc: any, i: number) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 space-y-3 shadow-sm hover:border-teal-500 transition-colors"
            >
              <h5 className="font-black text-base sm:text-lg text-teal-700 dark:text-teal-300">
                {tc.category}
              </h5>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {tc.definition}
              </p>
              {tc.example && (
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-2.5 border-t border-slate-100 dark:border-slate-700/80">
                  <span className="font-bold text-slate-700 dark:text-slate-200">مثال: </span>
                  <span>{tc.example}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Effects */}
      {data.effects && Array.isArray(data.effects) && (
        <div className="space-y-4 pt-2">
          {data.effects.map((eff: any, i: number) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-xs font-black flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <h5 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  {eff.official_title || eff.title}
                </h5>
              </div>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {eff.explanation}
              </p>
              {eff.quranic_proof_warsh && (
                <div className="font-quran text-base sm:text-lg text-amber-900 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/40 p-3.5 rounded-xl border-r-4 border-amber-500 leading-loose">
                  {eff.quranic_proof_warsh}
                </div>
              )}
              {eff.key_extraction_indicators && Array.isArray(eff.key_extraction_indicators) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 py-1">مؤشرات الاستخراج:</span>
                  {eff.key_extraction_indicators.map((ind: string, idx: number) => (
                    <span key={idx} className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {ind}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sub-keys */}
      {Object.entries(data).map(([k, v]) => {
        if (
          [
            "title",
            "official_title",
            "linguistic_definition",
            "idiomatic_definition",
            "relationship_linguistic_idiomatic",
            "core_foundation",
            "explanation",
            "quranic_proof_warsh",
            "quranic_proof",
            "prophetic_proof",
            "proof_anchor_phrase",
            "tawheed_categories",
            "effects",
          ].includes(k)
        ) {
          return null;
        }

        if (typeof v === "object" && v !== null) {
          return (
            <div key={k} className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                {formatSectionTitle(k, 1)}
              </h5>
              <RenderContentItem
                data={v}
                onCopyAyah={onCopyAyah}
                copiedAyah={copiedAyah}
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
