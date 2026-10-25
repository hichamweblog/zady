# سكربتات صيانة البيانات

سكربتات Node خالصة (بلا تبعيات) تعمل على `src/data/lessons/*.json`.
كلها **idempotent** وتفشل بصوت عالٍ بدل أن تكتب بيانات ناقصة.

| السكربت | الوظيفة |
|---|---|
| `fix-quiz-options.mjs` | يعيد ترتيب خيارات QCM بنمط حتمي متوازن (`2,0,3,1`) بحيث يتوزع موضع الإجابة الصحيحة على المواضع الأربعة بدل أن يكون دائمًا الأول. |
| `enrich-mindmaps.mjs` | يملأ `details`/`proof` لعقد الخرائط الذهنية: استخراج تلقائي من `detailed_explanation` + خريطة شروح مُدققة، ثم يفشل إن بقيت عقدة بلا شرح. |
| `__tests__/data-integrity.test.mjs` | 13 فحص انحدار على البيانات (توزيع إجابات QCM، اكتمال الأسئلة والإجابات، شروح الخرائط، مطابقة أقنعة الفراغات، العناوين العربية، أيقونات PWA، حجم الصور). |

```bash
node scripts/fix-quiz-options.mjs
node scripts/enrich-mindmaps.mjs
node --test "scripts/__tests__/*.test.mjs"
```

## إعادة توليد صور الخرائط

الصور الأصلية في `../../lessons/*.png`. المطلوب عرض 2000px وصيغة WebP:

```bash
# ImageMagick
magick "lessons/NotebookLM Mind Map.png" -resize 2000x -quality 82 web/public/lessons/unit01_mindmap.webp

# أو cwebp
cwebp -q 82 -resize 2000 0 "lessons/NotebookLM Mind Map.png" -o web/public/lessons/unit01_mindmap.webp
```

الحد الأقصى المقبول الذي يفرضه الاختبار: **250KB** لكل صورة.
