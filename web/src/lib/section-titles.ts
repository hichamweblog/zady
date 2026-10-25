/**
 * عناوين عربية لمفاتيح أقسام الدرس المنهجي.
 *
 * سبب وجود هذا الملف: كانت بعض المفاتيح غير مترجمة فتُعرض بالإنجليزية داخل
 * واجهة عربية («المحور 2: quranic means»). كل مفتاح مستخدم في ملفات
 * `*_standard.json` له عنوان عربي هنا، وأي مفتاح جديد يسقط إلى عنوان عام مقروء.
 */
export const SECTION_TITLES: Record<string, string> = {
  // ── عناوين أقسام كاملة ──
  section_1_definition: "أولاً: تعريف العقيدة الإسلامية (لغة واصطلاحاً)",
  section_2_effects_on_individual: "ثانياً: آثار العقيدة الإسلامية على الفرد",
  section_3_effects_on_society: "ثالثاً: آثار العقيدة الإسلامية على المجتمع",
  // عنوان احتياطي فقط: «القواعد والضوابط المنهجية» ليست محورًا دراسيًا، ومكانها
  // تبويب «المراجعة السريعة» (revise.rules). أُبقي العنوان هنا لئلا يظهر مفتاح
  // إنجليزي لو وردت في بيانات قديمة.
  section_4_methodological_rules: "رابعاً: القواعد والضوابط المنهجية",
  causes_of_deviation: "أولاً: أسباب الانحراف عن العقيدة الإسلامية",
  quranic_means: "ثانياً: وسائل القرآن الكريم في تثبيت العقيدة الإسلامية",
  section_1_islam_one_religion: "أولاً: الدين عند الله الإسلام ووحدة الرسالات",
  section_2_judaism: "ثانياً: الرسالة اليهودية ومصادرها وانحرافاتها",
  section_3_christianity: "ثالثاً: الرسالة النصرانية ومصادرها وانحرافاتها",
  section_4_islam_final_message: "رابعاً: خصائص الرسالة الخاتمة وعلاقتها بالرسالات السابقة",
  concept_of_intellect: "أولاً: مفهوم العقل ومناط التكليف",
  importance_and_status: "ثانياً: أهمية العقل ومكانته في التشريع الإسلامي",
  role_in_filtering_ideas: "ثالثاً: دور العقل في تمحيص الأفكار والموروثات",
  limits_of_intellect: "رابعاً: حدود إعمال العقل ومجالاته",
  preservation_of_intellect: "خامساً: وجوب المحافظة على العقل",
  protection_of_intellect: "خامساً: مقصد حفظ العقل ورعايته",

  // ── حقول فرعية داخل الأقسام ──
  definition: "التعريف",
  linguistic_definition: "التعريف اللغوي",
  idiomatic_definition: "التعريف الاصطلاحي",
  relationship_linguistic_idiomatic: "العلاقة بين التعريفين",
  core_foundation: "أصل العقيدة الإسلامية",
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
  effects: "الآثار",
  tawheed_categories: "أقسام التوحيد",
  quranic_proof_warsh: "الشاهد القرآني",
  quranic_proof: "الشاهد القرآني",
  prophetic_proof: "الشاهد الحديثي",
  proof_anchor_phrase: "محل الشاهد",
};

export function resolveSectionTitle(key: string, index: number, dataTitle?: unknown): string {
  if (typeof dataTitle === "string" && dataTitle.trim().length > 0) return dataTitle;
  const mapped = SECTION_TITLES[key];
  if (mapped) return mapped;
  // لا نعرض مفاتيح إنجليزية أبدًا: عنوان عام مقروء بدلًا منها
  return `المحور ${index}`;
}
