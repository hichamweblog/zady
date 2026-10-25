/**
 * يعيد توزيع موضع الإجابة الصحيحة في أسئلة QCM.
 *
 * المشكلة: كانت الإجابة الصحيحة هي الخيار الأول في 70/70 سؤالاً، فيمكن للطالب
 * الحصول على 100% دون قراءة. هذا السكربت يدوّر الخيارات بحيث يتوزع الصحيح
 * على المواضع الأربعة بالتساوي، بشكل حتمي (لا عشوائية) ليبقى الملف قابلاً للمراجعة.
 *
 * التشغيل: node scripts/fix-quiz-options.mjs
 */
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(import.meta.dirname, "..", "src", "data", "lessons");
const FILES = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith("_quiz.json"))
  .sort();

// نمط حتمي متوازن: كل 4 أسئلة تغطي المواضع الأربعة مرة واحدة.
const PATTERN = [2, 0, 3, 1];

let totalQuestions = 0;

for (const file of FILES) {
  const full = path.join(DIR, file);
  const data = JSON.parse(fs.readFileSync(full, "utf8"));

  data.questions = data.questions.map((q, index) => {
    const currentIndex = q.options.indexOf(q.correct_answer);
    if (currentIndex === -1) {
      throw new Error(`${file}: الإجابة الصحيحة غير موجودة بين الخيارات → ${q.question_id}`);
    }
    const targetIndex = PATTERN[index % PATTERN.length];
    const options = [...q.options];
    // إزاحة دورية: الموضع i ينتقل إلى (i - currentIndex + targetIndex) % n
    const shift = (targetIndex - currentIndex + options.length) % options.length;
    const rotated = options.map((_, i) => options[(i - shift + options.length) % options.length]);

    if (rotated[targetIndex] !== q.correct_answer) {
      throw new Error(`${file}: فشل التدوير في السؤال ${q.question_id}`);
    }
    return { ...q, options: rotated };
  });

  totalQuestions += data.questions.length;

  if (data.quiz_metadata) {
    data.quiz_metadata.total_questions = data.questions.length;
  }

  const distribution = {};
  for (const q of data.questions) {
    const i = q.options.indexOf(q.correct_answer);
    distribution[i] = (distribution[i] ?? 0) + 1;
  }
  fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(
    `${file}: ${data.questions.length} سؤالاً | توزيع المواضع ${JSON.stringify(distribution)}`
  );
}

console.log(`\nتمت معالجة ${totalQuestions} سؤالاً في ${FILES.length} ملفات.`);
