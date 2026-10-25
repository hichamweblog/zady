"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, Copy, Check } from "lucide-react";
import { useProgress } from "@/lib/useProgressStore";
import { resolveSectionTitle, SECTION_TITLES } from "@/lib/section-titles";
import { insightFor, isInsightField } from "@/lib/content-kinds";
import InsightCard from "./InsightCard";
import type { LessonSection } from "@/lib/types";

/**
 * «نص الدرس» — ورقة قراءة لا لوحة بطاقات.
 *
 * المبدأ: الصفحة مثل صفحة كتاب. مسطرة رأس، رقم المحور في الهامش، نصّ بعرض
 * 62 محرفًا، وخطوط شعرية تفصل المحاور. لا إطار حول كل كتلة، ولا ظلّ، ولا
 * لون يزاحم الحبر — لأن الطالب يقرأ هنا مدة أطول مما ينقر.
 *
 * وتُحفظ فيه قاعدتان ثابتتان من جولات سابقة:
 *   - ما ليس عنصرًا مفهوميًا يُعرض في بطاقة مصباح (إضاءة/فائدة)، لا كنصّ درس.
 *   - الشاهد الشرعي ليس إضاءة ولا فائدة، بل دليل: اقتباس بخطّ جانبي.
 */
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

/** أرقام عربية-هندية للهامش */
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
      <div className="border-t border-[var(--rule)] py-12 text-center">
        <BookOpen className="mx-auto mb-3 h-8 w-8 text-[var(--rule-strong)]" aria-hidden="true" />
        <p className="text-body font-bold text-[var(--ink)]">
          لا يوجد شرح منهجي متاح لهذه الوحدة حاليًا.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] pb-10">
      {/* الكفاءة المستهدفة: مقدّمة الكتاب، بلا صندوق */}
      {learningObjective && (
        <section aria-labelledby="objective-title" className="pt-7">
          <h2 id="objective-title" className="z-kicker">
            الكفاءة المستهدفة
          </h2>
          <p className="mt-2 text-body font-medium leading-loose text-[var(--ink-soft)]">
            {learningObjective}
          </p>
        </section>
      )}

      {/* مفتاح العلامات: يُذكر مرة واحدة فقط */}
      <p className="mt-5 flex items-start gap-2 border-t border-[var(--rule)] pt-4 text-meta font-medium leading-relaxed text-[var(--ink-faint)]">
        <span aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--ochre)]">
          ◐
        </span>
        <span>
          بطاقة <span className="font-bold text-[var(--ochre)]">إضاءة</span> أو{" "}
          <span className="font-bold text-[var(--ochre)]">فائدة</span> ليست عنصرًا مفهوميًا يُحفظ؛
          والخريطة الذهنية للتعريفات والأقسام وحدها.
        </span>
      </p>

      <div>
        {sections.map((section, idx) => {
          const open = isOpen(section.key);
          const isRead = isSectionRead(unitId, section.key);
          const bodyId = `lesson-section-${section.key}`;

          return (
            <section key={section.key} className="border-t border-[var(--rule-strong)] first:mt-8">
              <div className="flex items-start justify-between gap-4 py-4">
                <button
                  type="button"
                  onClick={() => setOpenSections((prev) => ({ ...prev, [section.key]: !open }))}
                  aria-expanded={open}
                  aria-controls={bodyId}
                  className="group flex min-w-0 flex-1 items-baseline gap-3 text-right"
                >
                  <span className="z-num shrink-0 pt-1 text-meta" aria-hidden="true">
                    {arabicNumber(idx + 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-title font-bold leading-snug text-[var(--ink)]">
                      {section.title}
                    </span>
                    {isRead && (
                      <span className="mt-1 block text-meta font-bold text-[var(--pine)]">
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
                  className={`mt-0.5 shrink-0 border px-2.5 py-1.5 text-meta font-bold transition-colors ${
                    isRead
                      ? "border-[var(--pine)] bg-[var(--pine)] text-[var(--paper)]"
                      : "border-[var(--rule-strong)] text-[var(--ink-soft)] hover:bg-[var(--sunken)]"
                  }`}
                >
                  {isRead ? "مقروء ✓" : "علّم كمقروء"}
                </button>
              </div>

              {open && (
                <div id={bodyId} className="z-measure pb-8">
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
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {value.map((item, idx) => (
          <li key={idx} className="text-label font-bold">
            {String(item)}
            {idx < value.length - 1 && <span aria-hidden="true"> ·</span>}
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
      <ul className="space-y-0">
        {data.map((item, i) => (
          <li key={i} className="border-b border-[var(--rule)] py-3 last:border-b-0 first:pt-0">
            {isRecord(item) && typeof item.title === "string" && (
              <h4 className="text-body font-bold text-[var(--ink)]">{item.title}</h4>
            )}
            {isRecord(item) || Array.isArray(item) ? (
              <RenderContent data={item} onCopyAyah={onCopyAyah} copiedAyah={copiedAyah} />
            ) : (
              <p className="text-body leading-loose text-[var(--ink-soft)]">{String(item)}</p>
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
    <div className="space-y-5">
      {asString(data.official_title) && (
        <h4 className="text-body font-bold text-[var(--ink)]">{asString(data.official_title)}</h4>
      )}

      {definitionBlocks.map((block) => (
        <div key={block.label}>
          <p className="z-kicker">{block.label}</p>
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

      {/* الشاهد: اقتباس بخطّ جانبي — دليلٌ لا إضاءة */}
      {proofText && (
        <figure className="z-quote border-[var(--ochre)]/50">
          <figcaption className="flex flex-wrap items-center justify-between gap-2">
            <span className="z-kicker text-[var(--ochre)]">{proofLabel}</span>
            <button
              type="button"
              onClick={() => onCopyAyah(proofText, ayahId)}
              className="flex items-center gap-1.5 text-meta font-bold text-[var(--ink-faint)] transition-colors hover:text-[var(--ink)]"
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
              <span className="z-kicker me-2">محل الشاهد</span>
              <span className="font-bold">«{asString(data.proof_anchor_phrase)}»</span>
            </p>
          )}
        </figure>
      )}

      {Array.isArray(data.effects) && (
        <ol className="space-y-0">
          {data.effects.filter(isRecord).map((eff, i) => (
            <li key={i} className="border-b border-[var(--rule)] py-4 first:pt-0 last:border-b-0">
              <div className="flex items-baseline gap-2.5">
                <span className="z-num shrink-0">{arabicNumber(i + 1)}</span>
                <h5 className="text-body font-bold text-[var(--ink)]">
                  {asString(eff.official_title) || asString(eff.title)}
                </h5>
              </div>
              <p className="mt-1 text-body leading-loose text-[var(--ink-soft)]">
                {asString(eff.explanation)}
              </p>
              {asString(eff.quranic_proof_warsh) && (
                <p className="font-quran z-quote mt-2 border-[var(--ochre)]/40 text-title leading-loose text-[var(--ink)]">
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

      {/* بقية الحقول المفهومية: عنوان تحريري + قيمة */}
      {Object.entries(data).map(([key, value], index) => {
        if (HANDLED_KEYS.has(key) || isInsightField(key)) return null;
        if (value === null || value === undefined) return null;
        if (typeof value !== "object") return null;

        return (
          <section key={key} className="border-t border-[var(--rule)] pt-4">
            <h5 className="z-kicker">
              {SECTION_TITLES[key] ?? resolveSectionTitle(key, index + 1)}
            </h5>
            <div className="mt-1.5">
              <RenderContent data={value} onCopyAyah={onCopyAyah} copiedAyah={copiedAyah} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
