/**
 * تصنيف محتوى الدرس: ما هو **عنصر مفهومي** وما هو **إضاءة أو فائدة**.
 *
 * القاعدة التي بُني عليها التطبيق:
 *   - الخريطة الذهنية = عناصر مفهومية فقط (تعريف، أقسام، آثار، أسباب، وسائل،
 *     مصادر، خصائص، حدود…). لا تدخلها إرشادات الامتحان ولا الملاحظات المنهجية.
 *   - نص الدرس = المادة الكاملة، وما ليس مفهوميًا يُعرض في بطاقة مصباح صغيرة
 *     بعنوان «إضاءة» أو «فائدة» حتى يعرف الطالب أنه ليس مطلوبًا للحفظ الحرفي.
 *
 * المفاتيح هنا هي أسماء الحقول في ملفات `*_standard.json`؛ وأي حقل جديد
 * ينتهي بـ`_note` أو `_tip` أو `_guidance` يُعامل تلقائيًا كإضاءة.
 */

export type InsightTone = "illumination" | "benefit";

export interface InsightMeta {
  /** العنوان الظاهر على البطاقة */
  label: string;
  tone: InsightTone;
  /** سطر توضيحي قصير: لماذا هذه البطاقة ليست مفهومًا يُحفظ؟ */
  hint: string;
}

export const INSIGHT_FIELDS: Record<string, InsightMeta> = {
  keywords: {
    label: "كلمات مفتاحية",
    tone: "benefit",
    hint: "مفردات تساعدك على التقاط الفكرة داخل النص، وليست تعريفًا تحفظه.",
  },
  extraction_keywords: {
    label: "كلمات الاستخراج",
    tone: "benefit",
    hint: "ألفاظ يبحث عنها المصحّح في جوابك.",
  },
  key_extraction_indicators: {
    label: "مؤشرات الاستخراج",
    tone: "illumination",
    hint: "ما يتحقّق منه المصحّح في إجابتك — إضاءة على طريقة الإجابة لا على المفهوم.",
  },
  relationship_linguistic_idiomatic: {
    label: "العلاقة بين التعريفين",
    tone: "illumination",
    hint: "ربطٌ بين التعريفين يُشار إليه في الشرح، وليس عنصرًا مستقلًا في الدرس.",
  },
  core_foundation: {
    label: "أصل العقيدة الإسلامية",
    tone: "illumination",
    hint: "يُشار إليه داخل شرح التعريف الاصطلاحي، لا كعنصر دراسي قائم بذاته.",
  },
  tawheed_categories: {
    label: "أقسام التوحيد",
    tone: "illumination",
    hint: "تفصيلٌ لِمَا يقتضيه الإيمان، يُذكر في الشرح ولا يُعدّ عنصرًا مفاهيميًا.",
  },
  pedagogical_note: {
    label: "إضاءة",
    tone: "illumination",
    hint: "ملاحظة تعليمية للفهم، لا تُكتب في ورقة الامتحان.",
  },
  pedagogical_guidance: {
    label: "إضاءة منهجية",
    tone: "illumination",
    hint: "توجيه في طريقة الدراسة، لا يُحفظ كنص.",
  },
  note: {
    label: "إضاءة",
    tone: "illumination",
    hint: "ملاحظة جانبية للفهم.",
  },
  tip: {
    label: "فائدة",
    tone: "benefit",
    hint: "معلومة إضافية تُوسّع الفهم.",
  },
  benefit: {
    label: "فائدة",
    tone: "benefit",
    hint: "معلومة إضافية تُوسّع الفهم.",
  },
  common_pitfall: {
    label: "تحذير",
    tone: "illumination",
    hint: "خطأ متكرّر — انتبه له ولا تحفظه كنص.",
  },
  examiner_warning: {
    label: "تحذير المصحّح",
    tone: "illumination",
    hint: "تنبيه على موضع خصم العلامة.",
  },
};

/** أي حقل ينتهي بإحدى هذه اللواحق يُعدّ إضاءة حتى لو لم يكن مذكورًا أعلاه */
const INSIGHT_SUFFIXES = ["_note", "_tip", "_guidance", "_warning", "_pitfall"];

/** وصف الإضاءة إن كان الحقل غير مفهومي، وإلا `null` */
export function insightFor(key: string): InsightMeta | null {
  if (INSIGHT_FIELDS[key]) return INSIGHT_FIELDS[key];
  if (INSIGHT_SUFFIXES.some((suffix) => key.endsWith(suffix))) {
    return {
      label: "إضاءة",
      tone: "illumination",
      hint: "ملاحظة مساعدة، ليست عنصرًا مفهوميًا.",
    };
  }
  return null;
}

export const isInsightField = (key: string): boolean => insightFor(key) !== null;

/**
 * عناوين الحقول المفهومية التي لا تحتاج بطاقة إضاءة ولا عنوانًا عامًا،
 * لأنها تُعرض داخل مكوّن مخصّص في `StandardLessonViewer`.
 */
export const CONCEPT_FIELD_LABELS: Record<string, string> = {
  linguistic_definition: "التعريف اللغوي",
  idiomatic_definition: "التعريف الاصطلاحي",
  definition: "التعريف",
  breakdown: "تفكيك التعريف",
  relation_to_takleef: "علاقة العقل بالتكليف",
  general_meaning: "المعنى العام",
  specific_meaning: "المعنى الخاص",
  unity_of_messages: "وحدة الرسالات",
  unity_sources_and_goals: "وحدة المصدر والغاية",
  distortion_of_previous_messages: "تحريف الرسالات السابقة",
  sources: "المصادر",
  distortions: "الانحرافات",
  factions: "الفرق",
  characteristics: "الخصائص",
  relations_to_previous: "العلاقة بالرسالات السابقة",
  allowed_fields: "المجالات المشروعة",
  forbidden_fields: "المجالات الممنوعة",
  from_positive_aspect: "من جانب الوجود (الإيجاد والتنمية)",
  from_preventive_aspect: "من جانب العدم (الوقاية والحماية)",
  importance: "الأهمية والمكانة",
  role_in_filtering: "دور العقل في التمييز",
  limits: "الحدود والمجالات",
  protection: "حفظ العقل",
  effects: "الآثار",
  causes: "الأسباب",
  means: "الوسائل",
};
