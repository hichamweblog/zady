"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, Copy, Check, CheckCircle2, Lightbulb } from "lucide-react";
import { useProgress } from "@/lib/useProgressStore";
import { resolveSectionTitle, SECTION_TITLES } from "@/lib/section-titles";
import { insightFor, isInsightField } from "@/lib/content-kinds";
import InsightCard from "./InsightCard";
import type { LessonSection } from "@/lib/types";

/**
 * «نصّ الدرس» — بطاقات قراءة مستديرة على ورق كريمي.
 *
 * القواعد الثابتة (من جولات سابقة، لا تُنقض):
 *   - كل نصّ بمقاس واحد (18px) في كل الوحدات؛ لا 16px بجانبه.
 *   - ما ليس عنصرًا مفهوميًا يُعرض في بطاقة مصباح (إضاءة/فائدة) لا كنصّ درس.
 *   - الشاهد الشرعي دليل: اقتباس بحدّ جانبي صنوبري، لا وسم «فائدة».
 *
 * الشكل: كل محور بطاقة مستقلة برأس واضح وزر «علّم كمقروء» حبّوبي، والتعريفات
 * في كتل نعنعية فاتحة، والأرقام في دوائر صغيرة — لا حدود سميكة ولا ظلال ثقيلة.
 */
type Content = Record<string, unknown>;

const isRecord = (v: unknown): v is Content =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const asString = (v: unknown): string => (typeof v === "string" ? v : "");

function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
const arabicNumber = (n: number) =>
  String(n)
    .split("")
    .map((d) => AR_DIGITS[Number(d)] ?? d)
    .join("");

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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [copiedAyah, setCopiedAyah] = useState<string | null>(null);

  const { toggleSectionRead, isSectionRead } = useProgress();

  const isOpen = (key: string) => openSections[key] !== false;

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
      <div className="u-card p-8 text-center">
        <BookOpen className="mx-auto mb-3 h-8 w-8 text-[var(--rule-strong)]" aria-hidden="true" />
        <p className="text-body font-bold text-[var(--ink)]">
          لا يوجد شرح منهجي متاح لهذه الوحدة حاليًا.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[760px] space-y-4 pb-6">
      {/* الكفاءة المستهدفة */}
      {learningObjective && (
        <section className="u-card p-5 sm:p-6" aria-labelledby="objective-title">
          <p className="u-kicker" id="objective-title">
            الكفاءة المستهدفة
          </p>
          <p className="u-measure mt-2 text-body leading-loose font-medium text-[var(--ink-soft)]">
            {learningObjective}
          </p>
        </section>
      )}

      {/* مفتاح العلامات — يُذكر مرة واحدة */}
      <p className="flex items-start gap-2 rounded-xl bg-[var(--amber-soft)] px-4 py-3 text-start text-label leading-relaxed text-[var(--ink)]">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[var(--amber)]" aria-hidden="true" />
        <span>
          بطاقة <span className="font-semibold text-[var(--amber-ink)]">إضاءة</span> أو{" "}
          <span className="font-semibold text-[var(--amber-ink)]">فائدة</span> ليست عنصرًا مفهوميًا
          يُحفظ؛ والخريطة الذهنية للتعريفات والأقسام وحدها.
        </span>
      </p>

      {sections.map((section, idx) => {
        const open = isOpen(section.key);
        const isRead = isSectionRead(unitId, section.key);
        const bodyId = `lesson-section-${section.key}`;

        return (
          <section key={section.key} className="u-card overflow-hidden">
            <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
              <button
                type="button"
                onClick={() => setOpenSections((prev) => ({ ...prev, [section.key]: !open }))}
                aria-expanded={open}
                aria-controls={bodyId}
                className="flex min-w-0 flex-1 items-start gap-3 text-right"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-label font-semibold text-[var(--brand-strong)]">
                  {arabicNumber(idx + 1)}
                </span>
                <span className="min-w-0">
                  <span className="block text-title font-semibold leading-snug text-[var(--ink)]">
                    {section.title}
                  </span>
                  {isRead && (
                    <span className="mt-1 flex items-center gap-1 text-meta font-bold text-[var(--emerald-600)]">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      تمّت قراءته
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={`ms-auto mt-1 h-4 w-4 shrink-0 text-[var(--ink-faint)] transition-transform ${open ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                onClick={() => toggleSectionRead(unitId, section.key)}
                aria-pressed={isRead}
                className={`mt-0.5 shrink-0 rounded-lg px-3 py-1.5 text-meta font-semibold transition-colors ${
                  isRead
                    ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                    : "bg-[var(--surface-2)] text-[var(--ink-soft)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)]"
                }`}
              >
                {isRead ? "مقروء ✓" : "علّم كمقروء"}
              </button>
            </div>

            {open && (
              <div id={bodyId} className="u-measure px-4 pt-1 pb-5 sm:px-5">
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
  "proof_warsh",
  "proof_anchor_phrase",
  "tawheed_categories",
  "effects",
]);

/** محتوى بطاقة المصباح: نصّ، أو وسوم، أو بنية تُعرض بالشرح العادي */
function InsightValue({
  value,
  onCopyAyah,
  copiedAyah,
}: {
  value: unknown;
  onCopyAyah: (text: string, id: string) => void;
  copiedAyah: string | null;
}) {
  if (typeof value === "string") return <p>{value}</p>;

  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return (
      <ul className="flex flex-wrap gap-1.5">
        {value.map((item, idx) => (
          <li
            key={idx}
            className="rounded-full bg-white/70 px-2.5 py-0.5 text-label font-bold text-[var(--ochre)] dark:bg-black/20"
          >
            {String(item)}
          </li>
        ))}
      </ul>
    );
  }

  return <RenderContent data={value} onCopyAyah={onCopyAyah} copiedAyah={copiedAyah} />;
}

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
    return <p className="text-body leading-loose text-[var(--ink-soft)]">{data}</p>;
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return <p className="text-body text-[var(--ink-soft)]">{String(data)}</p>;
  }

  if (Array.isArray(data)) {
    return (
      <ul className="space-y-2">
        {data.map((item, i) => (
          <li
            key={i}
            className="rounded-xl bg-[var(--surface-2)] px-3.5 py-2.5 text-body leading-loose text-[var(--ink-soft)]"
          >
            {isRecord(item) && typeof item.title === "string" && (
              <h4 className="text-body font-bold text-[var(--ink)]">{item.title}</h4>
            )}
            {isRecord(item) || Array.isArray(item) ? (
              <RenderContent data={item} onCopyAyah={onCopyAyah} copiedAyah={copiedAyah} />
            ) : (
              <p>{String(item)}</p>
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (!isRecord(data)) return null;

  const proofText =
    asString(data.quranic_proof_warsh) ||
    asString(data.proof_warsh) ||
    asString(data.quranic_proof) ||
    asString(data.prophetic_proof);
  const proofLabel = asString(data.prophetic_proof) ? "الشاهد الحديثي" : "الشاهد الشرعي";
  const ayahId = proofText ? `ayah_${hashText(proofText)}` : "";

  const definitionBlocks: { label: string; text: string }[] = [
    { label: "التعريف اللغوي", text: asString(data.linguistic_definition) },
    { label: "التعريف الاصطلاحي", text: asString(data.idiomatic_definition) },
    { label: "التعريف", text: asString(data.definition) },
  ].filter((b) => b.text.length > 0);

  return (
    <div className="space-y-4">
      {asString(data.official_title) && (
        <h4 className="text-body font-bold text-[var(--ink)]">{asString(data.official_title)}</h4>
      )}

      {definitionBlocks.map((block) => (
        <div key={block.label} className="rounded-xl bg-[var(--brand-soft)] px-4 py-3">
          <p className="text-meta font-bold text-[var(--pine-deep)]">{block.label}</p>
          <p className="mt-1 text-body font-medium leading-loose text-[var(--ink)]">{block.text}</p>
        </div>
      ))}

      {/* ما يُشار إليه خلال الشرح ولا يُعدّ عنصر درس */}
      {["relationship_linguistic_idiomatic", "core_foundation", "tawheed_categories"].map((key) => {
        const value = data[key];
        if (value === null || value === undefined || value === "") return null;

        if (key === "tawheed_categories" && Array.isArray(value)) {
          return (
            <InsightCard key={key} field={key}>
              <ul className="space-y-2">
                {value.filter(isRecord).map((tc, i) => (
                  <li key={i}>
                    <span className="font-bold">{asString(tc.category)}: </span>
                    <span>{asString(tc.definition)}</span>
                    {asString(tc.example) && (
                      <span className="mt-0.5 block text-meta font-medium opacity-80">
                        مثال: {asString(tc.example)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </InsightCard>
          );
        }

        return (
          <InsightCard key={key} field={key}>
            <InsightValue value={value} onCopyAyah={onCopyAyah} copiedAyah={copiedAyah} />
          </InsightCard>
        );
      })}

      {asString(data.explanation) && (
        <p className="text-body leading-loose text-[var(--ink-soft)]">
          {asString(data.explanation)}
        </p>
      )}

      {/* الشاهد: دليلٌ لا إضاءة */}
      {proofText && (
        <figure className="u-quote">
          <figcaption className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-meta font-bold text-[var(--pine-deep)]">{proofLabel}</span>
            <button
              type="button"
              onClick={() => onCopyAyah(proofText, ayahId)}
              className="flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-meta font-bold text-[var(--pine-deep)] transition-colors hover:bg-white dark:bg-black/20 dark:hover:bg-black/30"
            >
              {copiedAyah === ayahId ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>نُسخ</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>نسخ</span>
                </>
              )}
            </button>
          </figcaption>

          <blockquote className="font-quran mt-2 text-title leading-loose text-[var(--ink)]">
            {proofText}
          </blockquote>

          {asString(data.proof_anchor_phrase) && (
            <p className="mt-2 text-body text-[var(--ink-soft)]">
              <span className="me-2 rounded-full bg-white/60 px-2 py-0.5 text-meta font-bold text-[var(--pine-deep)] dark:bg-black/20">
                محل الشاهد
              </span>
              <span className="font-bold">«{asString(data.proof_anchor_phrase)}»</span>
            </p>
          )}
        </figure>
      )}

      {Array.isArray(data.effects) && (
        <ol className="space-y-3">
          {data.effects.filter(isRecord).map((eff, i) => (
            <li key={i} className="rounded-xl bg-[var(--surface-2)] p-3.5">
              <div className="flex items-baseline gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-meta font-semibold text-[var(--brand-strong)]">
                  {arabicNumber(i + 1)}
                </span>
                <h5 className="text-body font-bold text-[var(--ink)]">
                  {asString(eff.official_title) || asString(eff.title)}
                </h5>
              </div>
              <p className="mt-1.5 text-body leading-loose text-[var(--ink-soft)]">
                {asString(eff.explanation)}
              </p>
              {asString(eff.quranic_proof_warsh) && (
                <p className="font-quran mt-2 rounded-xl bg-[var(--brand-soft)] px-3 py-2 text-title leading-loose text-[var(--ink)]">
                  {asString(eff.quranic_proof_warsh)}
                </p>
              )}
              {Array.isArray(eff.key_extraction_indicators) && (
                <div className="mt-3">
                  <InsightCard tone="illumination" title="مؤشرات الاستخراج">
                    <InsightValue
                      value={eff.key_extraction_indicators}
                      onCopyAyah={onCopyAyah}
                      copiedAyah={copiedAyah}
                    />
                  </InsightCard>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      {/* بقية الحقول غير المفهومية: بطاقة مصباح */}
      {Object.entries(data).map(([key, value]) => {
        const meta = insightFor(key);
        if (!meta || HANDLED_KEYS.has(key) || value === null || value === undefined) return null;
        return (
          <InsightCard key={key} field={key}>
            <InsightValue value={value} onCopyAyah={onCopyAyah} copiedAyah={copiedAyah} />
          </InsightCard>
        );
      })}

      {/* بقية الحقول المفهومية */}
      {Object.entries(data).map(([key, value], index) => {
        if (HANDLED_KEYS.has(key) || isInsightField(key)) return null;
        if (value === null || value === undefined) return null;
        if (typeof value !== "object") return null;

        return (
          <section key={key} className="space-y-1.5">
            <h5 className="text-meta font-bold text-[var(--pine-deep)]">
              {SECTION_TITLES[key] ?? resolveSectionTitle(key, index + 1)}
            </h5>
            <RenderContent data={value} onCopyAyah={onCopyAyah} copiedAyah={copiedAyah} />
          </section>
        );
      })}
    </div>
  );
}
