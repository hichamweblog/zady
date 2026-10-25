/**
 * أدوات نص عربية مساعدة.
 *
 * الغرض: مقارنة إجابة الطالب المكتوبة بالإجابة النموذجية بعد تجاهل الفروق
 * الشكلية التي لا تغيّر المعنى (التشكيل، التطويل، رسم الألف والهمزة،
 * التاء المربوطة/الهاء، الألف المقصورة/الياء، المسافات الزائدة).
 */

const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;

/** يوحّد شكل النص العربي لتسهيل المقارنة. لا يُستخدم للعرض. */
export function normalizeArabicAnswer(input: string): string {
  return input
    .replace(DIACRITICS, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[«»"'’‘“”()\[\]{}]/g, "")
    .replace(/[.,،؛;:!؟?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * هل إجابة الطالب مطابقة للإجابة النموذجية؟
 * يقبل أيضًا الإجابات التي تفصل بينها "/" أو "،" أو "أو" في البيانات.
 */
export function isAnswerCorrect(studentAnswer: string, expected: string): boolean {
  const student = normalizeArabicAnswer(studentAnswer);
  if (!student) return false;

  const accepted = expected
    .split(/\s*(?:\/|،|,|\||أو)\s*/g)
    .map(normalizeArabicAnswer)
    .filter(Boolean);

  return (accepted.length > 0 ? accepted : [normalizeArabicAnswer(expected)]).includes(student);
}
