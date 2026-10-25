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
import { resolveSectionTitle, SECTION_TITLES } from "@/lib/section-titles";
import type { LessonSection } from "@/lib/types";

type Content = Record<string, unknown>;

const isRecord = (v: unknown): v is Content =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const asString = (v: unknown): string => (typeof v === "string" ? v : "");

/** معرّف حتمي لنص الشاهد — لا عشوائية داخل العرض */
function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

interface StandardLessonViewerProps {
  unitId: number;
  learningObjective: string;
  sections: LessonSection[];
}

export default function StandardLessonViewer({
  unitId,
  learningObjective,
  sections,
}: StandardLessonViewerProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [copiedAyah, setCopiedAyah] = useState<string | null>(null);

  const { toggleSectionRead, isSectionRead } = useProgress();

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyText = async (text: string, id: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAyah(id);
      setTimeout(() => setCopiedAyah(null), 2000);
    } catch {
      /* المتصفح رفض الوصول إلى الحافظة */
    }
  };

  if (sections.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
        <p className="font-bold text-slate-700 dark:text-slate-200">
          لا يوجد شرح منهجي متاح لهذه الوحدة حاليًا.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الكفاءة المستهدفة */}
      {learningObjective && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent border border-teal-200 dark:border-teal-900/60 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="font-extrabold text-xs uppercase tracking-wider text-teal-800 dark:text-teal-300">
              الكفاءة المستهدفة والمؤشر الختامي للوحدة
            </h2>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {learningObjective}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section, idx) => {
          const isCollapsed = !!collapsedSections[section.key];
          const isRead = isSectionRead(unitId, section.key);
          const bodyId = `lesson-section-${section.key}`;

          return (
            <section
              key={section.key}
              className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 shadow-sm overflow-hidden ${
                isRead
                  ? "border-emerald-300 dark:border-emerald-900/60"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="p-5 sm:p-6 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  aria-expanded={!isCollapsed}
                  aria-controls={bodyId}
                  className="flex items-center gap-3 text-right flex-1 min-w-0"
                >
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border transition-colors ${
                      isRead
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-200/60 dark:border-teal-900"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="min-w-0">
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                      {section.title}
                    </h3>
                    {isRead && (
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                        تمت دراسة هذا المحور ✓
                      </span>
                    )}
                  </span>
                </button>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleSectionRead(unitId, section.key)}
                    aria-pressed={isRead}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isRead
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                    title={isRead ? "إلغاء وسم الإتمام" : "تحديد كمكتمل"}
                  >
                    {isRead ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">مكتمل</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">تمييز كمقروء</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    aria-expanded={!isCollapsed}
                    aria-controls={bodyId}
                    aria-label={isCollapsed ? "توسيع المحور" : "طي المحور"}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <ChevronUp className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div id={bodyId} className="p-6 sm:p-8 space-y-6">
                  <RenderContent
                    data={section.content}
                    onCopyAyah={copyText}
                    copiedAyah={copiedAyah}
                  />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

const HANDLED_KEYS = new Set([
  "title",
  "official_title",
  "linguistic_definition",
  "idiomatic_definition",
  "relationship_linguistic_idiomatic",
  "core_foundation",
  "explanation",
  "definition",
  "quranic_proof_warsh",
  "quranic_proof",
  "prophetic_proof",
  "proof_anchor_phrase",
  "tawheed_categories",
  "effects",
]);

function RenderContent({
  data,
  onCopyAyah,
  copiedAyah,
}: {
  data: unknown;
  onCopyAyah: (text: string, id: string) => void;
  copiedAyah: string | null;
}) {
  if (data === null || data === undefined) return null;

  if (typeof data === "string") {
    return (
      <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed">{data}</p>
    );
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return <p className="text-slate-800 dark:text-slate-200">{String(data)}</p>;
  }

  if (Array.isArray(data)) {
    return (
      <div className="space-y-4">
        {data.map((item, i) =>
          isRecord(item) || Array.isArray(item) ? (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              {isRecord(item) && typeof item.title === "string" && (
                <h4 className="font-extrabold text-base text-teal-800 dark:text-teal-300">
                  {item.title}
                </h4>
              )}
              <RenderContent data={item} onCopyAyah={onCopyAyah} copiedAyah={copiedAyah} />
            </div>
          ) : (
            <div
              key={i}
              className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
            >
              <span
                className="mt-2 w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 shrink-0"
                aria-hidden="true"
              />
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                {String(item)}
              </p>
            </div>
          )
        )}
      </div>
    );
  }

  if (!isRecord(data)) return null;

  const proofText =
    asString(data.quranic_proof_warsh) ||
    asString(data.quranic_proof) ||
    asString(data.prophetic_proof);
  const proofLabel = asString(data.prophetic_proof) ? "الشاهد الحديثي" : "الشاهد الشرعي (رواية ورش)";
  const ayahId = proofText ? `ayah_${hashText(proofText)}` : "";

  const definitionBlocks: { label: string; text: string }[] = [
    { label: "التعريف اللغوي", text: asString(data.linguistic_definition) },
    { label: "التعريف الاصطلاحي", text: asString(data.idiomatic_definition) },
    { label: "التعريف", text: asString(data.definition) },
  ].filter((b) => b.text.length > 0);

  return (
    <div className="space-y-4">
      {asString(data.official_title) && (
        <h4 className="font-extrabold text-base text-teal-800 dark:text-teal-300">
          {asString(data.official_title)}
        </h4>
      )}

      {definitionBlocks.map((block) => (
        <div
          key={block.label}
          className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1.5 shadow-sm"
        >
          <span className="text-sm font-extrabold text-teal-800 dark:text-teal-300">{block.label}:</span>
          <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed font-semibold">
            {block.text}
          </p>
        </div>
      ))}

      {asString(data.relationship_linguistic_idiomatic) && (
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm sm:text-base text-slate-800 dark:text-slate-200">
          <span className="font-extrabold text-slate-900 dark:text-white">العلاقة بين المعنيين: </span>
          <span>{asString(data.relationship_linguistic_idiomatic)}</span>
        </div>
      )}

      {asString(data.core_foundation) && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-base sm:text-lg shadow-sm">
          <span className="font-extrabold text-emerald-800 dark:text-emerald-300">أصل العقيدة الإسلامية: </span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">
            {asString(data.core_foundation)}
          </span>
        </div>
      )}

      {asString(data.explanation) && (
        <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
          {asString(data.explanation)}
        </p>
      )}

      {proofText && (
        <div className="p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border-r-4 border-amber-500 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-300">
              <BookOpen className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span>{proofLabel}:</span>
            </div>

            <button
              type="button"
              onClick={() => onCopyAyah(proofText, ayahId)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-200/70 dark:bg-amber-900/50 text-amber-950 dark:text-amber-100 hover:bg-amber-300 transition-colors"
            >
              {copiedAyah === ayahId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                  <span>تم النسخ ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>نسخ الشاهد</span>
                </>
              )}
            </button>
          </div>

          <div className="font-quran text-xl sm:text-2xl text-amber-950 dark:text-amber-100 leading-loose py-2">
            {proofText}
          </div>

          {asString(data.proof_anchor_phrase) && (
            <div className="pt-2.5 border-t border-amber-200/80 dark:border-amber-900/60 flex items-center gap-2 text-sm text-amber-900 dark:text-amber-300 flex-wrap">
              <span className="font-bold px-2.5 py-1 rounded-lg bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200">
                محل الشاهد:
              </span>
              <span className="font-bold">«{asString(data.proof_anchor_phrase)}»</span>
            </div>
          )}
        </div>
      )}

      {Array.isArray(data.tawheed_categories) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {data.tawheed_categories.filter(isRecord).map((tc, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 space-y-3 shadow-sm"
            >
              <h5 className="font-black text-base sm:text-lg text-teal-800 dark:text-teal-300">
                {asString(tc.category)}
              </h5>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {asString(tc.definition)}
              </p>
              {asString(tc.example) && (
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 pt-2.5 border-t border-slate-100 dark:border-slate-700/80">
                  <span className="font-bold">مثال: </span>
                  <span>{asString(tc.example)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {Array.isArray(data.effects) && (
        <div className="space-y-4 pt-2">
          {data.effects.filter(isRecord).map((eff, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-xs font-black flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <h5 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  {asString(eff.official_title) || asString(eff.title)}
                </h5>
              </div>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {asString(eff.explanation)}
              </p>
              {asString(eff.quranic_proof_warsh) && (
                <div className="font-quran text-base sm:text-lg text-amber-950 dark:text-amber-100 bg-amber-50/80 dark:bg-amber-950/40 p-3.5 rounded-xl border-r-4 border-amber-500 leading-loose">
                  {asString(eff.quranic_proof_warsh)}
                </div>
              )}
              {Array.isArray(eff.key_extraction_indicators) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 py-1">
                    مؤشرات الاستخراج:
                  </span>
                  {eff.key_extraction_indicators.map((ind, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      {String(ind)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* بقية الحقول: تُعرض بعناوين عربية من القاموس */}
      {Object.entries(data).map(([key, value], index) => {
        if (HANDLED_KEYS.has(key)) return null;
        if (value === null || value === undefined) return null;
        const isComplex = typeof value === "object";
        if (!isComplex) return null;

        return (
          <section key={key} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h5 className="font-bold text-sm text-slate-900 dark:text-white">
              {SECTION_TITLES[key] ?? resolveSectionTitle(key, index + 1)}
            </h5>
            <RenderContent data={value} onCopyAyah={onCopyAyah} copiedAyah={copiedAyah} />
          </section>
        );
      })}
    </div>
  );
}
