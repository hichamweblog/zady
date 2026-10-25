# زادِي — العلوم الإسلامية للبكالوريا

تطبيق مراجعة تفاعلي لمادة العلوم الإسلامية (بكالوريا الجزائر)، مبني على **Next.js 16 + React 19**
ويعمل **بالكامل على جهاز الطالب**: لا حسابات، لا خادم بيانات، لا تتبّع. كل التقدّم يُحفظ في
`localStorage`، ويعمل التطبيق دون إنترنت بعد أول زيارة (PWA).

---

## 1. التشغيل

```bash
cd web
pnpm install          # المشروع يستخدم pnpm (pnpm-lock.yaml)
pnpm dev              # http://localhost:3000
```

أوامر الجودة:

```bash
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint (0 أخطاء)
pnpm test:data        # اختبارات سلامة البيانات التعليمية
pnpm verify           # الثلاثة معًا
pnpm build            # بناء إنتاجي
```

> **مهم:** `next build` في Next 16 لا يشغّل ESLint ولا الاختبارات. لذلك أي تعديل على البيانات
> يجب أن يمرّ عبر `pnpm verify` (وهو ما تفعله CI).

---

## 2. بنية المشروع

```
web/
├── src/app/
│   ├── layout.tsx              # الخطوط المحلية، الميتاداتا، سكربت الثيم
│   ├── globals.css             # Tailwind 4 + متغيّرات الثيم
│   ├── page.tsx                # الصفحة الرئيسية (خادمية)
│   ├── units/[unitId]/         # صفحة الوحدة + الواجهة التفاعلية
│   ├── fonts/                  # Cairo + Amiri (self-hosted .woff2)
│   ├── icon.png / apple-icon.png
│   ├── sitemap.ts / robots.ts  # مولّدان برمجيًا
├── src/components/
│   ├── layout/                 # Navbar, Footer
│   ├── mindmap/                # 3 أوضاع: شجري · خريطة تفاعلية (React Flow) · صورة HD
│   ├── lesson/                 # الدرس المنهجي
│   ├── flashcards/             # بطاقات + ملء الفراغات
│   ├── quiz/                   # QCM + بنك أسئلة البكالوريا
│   ├── revision/               # المراجعة السريعة (جديد)
│   ├── settings/               # تصفير التقدّم
│   └── pwa/                    # تسجيل عامل الخدمة + شارة عدم الاتصال
├── src/lib/
│   ├── units-meta.ts           # بيانات خفيفة للوحدات (آمنة للعميل)
│   ├── mindmap-layout.ts       # تخطيط شجرة الخريطة (دالة خالصة مختبرة)
│   ├── useTheme.ts             # حالة الثيم من كلاس <html>
│   ├── data-loader.ts          # تحميل الوحدات وتطبيعها (خادمي فقط)
│   ├── types.ts                # الأنواع المشتركة
│   ├── section-titles.ts       # عناوين عربية لمفاتيح الدروس
│   └── useProgressStore.ts     # مخزن تقدّم واحد (useSyncExternalStore)
├── src/data/lessons/           # المصدر الوحيد لبيانات الدروس (JSON)
├── public/                     # الأيقونات، صور الخرائط (webp)، og، sw.js
└── scripts/                    # أدوات صيانة البيانات + اختباراتها
```

### قاعدة ذهبية للبيانات

**لا تستورد `data-loader.ts` في مكوّن عميل أبدًا.** سيؤدي ذلك إلى شحن كل ملفات JSON
(~350KB) إلى المتصفح. للواجهة استخدم `units-meta.ts`، وللمحتوى مرّره كـprop من مكوّن خادمي.

---

## 3. إضافة وحدة جديدة

1. أضف 5 ملفات إلى `web/src/data/lessons/`:
   `unit05_<slug>_standard.json` · `_advanced.json` · `_mindmap.json` · `_questions.json` · `_quiz.json`
2. أضف بطاقة الوحدة إلى `src/lib/units-meta.ts` (المعرّف، العنوان، الشارة).
3. أضف مصدرها في `SOURCES` داخل `src/lib/data-loader.ts` + مسار صورة الخريطة.
4. أضف صورة الخريطة: `public/lessons/unit05_mindmap.webp` (عرض ≤ 2000px، تحت 250KB).
5. أضف صورة معاينة: `public/og/unit-05.png` (1200×630).
6. شغّل `pnpm verify` — الاختبارات ستكشف أي سؤال بلا جواب أو عقدة بلا شرح أو عنوان غير مترجم.

### مخططات الملفات

| الملف | ما يُقرأ منه فعليًا |
|---|---|
| `standard` | `field`, `time_allocation`, `learning_objective`, `detailed_explanation`, `summary_for_memorization`, `methodology_and_rules`, `previous_bac_questions` |
| `advanced` | `all_*_flashcards`, `concept_nodes[].cloze_active_recall`, `last_minute_revision_schema`, `differentiation_matrix` |
| `mindmap` | `root` (شجرة: `label`, `details`, `proof`, `children`) |
| `questions` | `categories/[]` أو `questions/[]` أو `questions_group_*` — كل أشكال الاستجابة مدعومة |
| `quiz` | `questions[].{question_id,question,options,correct_answer,explanation,hint}` |

**الإجابات** تُقرأ من أي من: `model_answer` (نص أو كائن) · `answer` · `model_answers`
· `official_solution` · `solution` · وأسئلة الاستخراج تُبنى من `target_effect` /
`target_means` + `anchor_phrase` + `keywords` + `guidance`.

---

## 4. سكربتات صيانة البيانات

```bash
node scripts/fix-quiz-options.mjs   # يعيد توزيع موضع الإجابة الصحيحة (حتمي، متوازن)
node scripts/enrich-mindmaps.mjs    # يملأ شروح عقد الخرائط الذهنية ويفشل إن بقيت عقدة بلا شرح
```

كلاهما idempotent ويفشل بصوت عالٍ عند وجود بيانات ناقصة — لا يكتبان بيانات وهمية صامتة.

---

## 5. قرارات معمارية موثّقة

| القرار | السبب |
|---|---|
| `cacheComponents` معطّل | كان يجعل `dynamicParams` غير متاح، فتُرجع `/units/99` حالة **200** مع صفحة 404. كل الصفحات ثابتة أصلًا فلا مكسب في PPR. |
| خطوط محلية (`next/font/local`) | `next/font/google` كان يُفشل البناء كاملًا عند تعذّر الوصول إلى Google Fonts. |
| `useSyncExternalStore` للتقدّم | الحالة في `useState` داخل كل مكوّن كانت تمنع تحديث «نسبة الإتقان» وتسبب تعارض الكتابة في `localStorage`. |
| تبويبات keep-alive | التركيب الشرطي كان يمحو تقدّم الجلسة عند كل تبديل تبويب (إجابات QCM، موضع البطاقة…). |
| `dynamicParams = false` | 404 حقيقية للمعرّفات غير الموجودة. |
| خلط خيارات QCM عند العرض + في البيانات | كانت الإجابة الصحيحة هي الخيار الأول في 70/70 سؤالًا. |
| React Flow للخريطة التفاعلية — تحميل كسول | تفاعل حقيقي (سحب/تكبير/نقر) دون تحميل ~58KB على كل زائر: الحزمة تُطلب فقط عند فتح وضع «الخريطة التفاعلية»، ويبقى «المخطط الشجري» هو الافتراضي لأنه يعمل بلوحة المفاتيح وبلا JavaScript. |
| تخطيط الشجرة مكتوب يدويًا (`mindmap-layout.ts`) | شجرة ≤40 عقدة لا تحتاج `dagre`/`elk` (+40KB) لأجل تخطيط هرمي ثابت؛ والدالة خالصة فتُختبر بلا متصفح. |

---

## 6. الخريطة الذهنية بثلاثة أوضاع

| الوضع | التقنية | لماذا |
|---|---|---|
| **المخطط الشجري** (الافتراضي) | HTML/CSS + خادم | يعمل بلوحة المفاتيح وقارئ الشاشة وبلا JavaScript، ومحتواه مُصيَّر خادميًا (SEO). |
| **الخريطة التفاعلية** | [React Flow](https://reactflow.dev) (`@xyflow/react`) | سحب وتكبير وتنقّل بين العقد، مع لوحة شرح مرتبطة بالنقر. تُحمَّل عند الطلب. |
| **الخريطة البصرية** | `next/image` + WebP | الصورة الأصلية عالية الدقة لمن يفضّل الشكل المرسوم. |

كيف تُبنى الخريطة التفاعلية:

1. `src/lib/mindmap-layout.ts` يحوّل شجرة `*_mindmap.json` إلى مواضع (تخطيط «tidy tree»
   من اليمين إلى اليسار: الجذر يمينًا والأوراق يسارًا). لا React ولا DOM ⇒ مختبر في
   `scripts/__tests__/mindmap-layout.test.mjs` (تراكب، اتجاه، وصلات، حتمية).
2. `MindmapGraph.tsx` يحوّل المواضع إلى عقد React Flow مخصّصة (بطاقات عربية RTL مع
   شارات «شرح» و«شاهد» وعدد الفروع)، والوصلات `smoothstep`.
3. `MindmapViewer.tsx` يستورد المكوّن بـ`next/dynamic({ ssr: false })` فلا يدخل حزمة
   التحميل الأول، ويعرض معه `MindmapDetailsPanel` المشتركة بين الوضعين.

> ⚠️ عند تعديل `@xyflow/react`: تحقّق أن حزمته **لم تدخل** قائمة
> `/_next/static/chunks/*.js` في HTML صفحة الوحدة؛ إن ظهرت فالعودة إلى تحميل كسول مكسورة.

## 7. النشر

المشروع ثابت بالكامل — يمكن نشره على Vercel أو أي استضافة Node:

```bash
pnpm build && pnpm start
```

تأكد من تحديث `SITE_URL` في `src/app/layout.tsx` و`src/app/sitemap.ts` و`src/app/robots.ts`
عند تغيير النطاق، وأعد توليد `sw.js` (أو غيّر `VERSION` فيه) عند تغيير قائمة التحميل المسبق.

---

## 8. تنبيه علمي

المحتوى تعليمي مساعد، مستخرج من ملخصات منهجية وأسئلة بكالوريا سابقة. **يُراجَع مع أستاذ
المادة** قبل الاعتماد عليه، خصوصًا ضبط الشواهد القرآنية برواية ورش وسلّم التنقيط الوزاري.
