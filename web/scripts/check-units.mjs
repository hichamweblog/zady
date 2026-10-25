#!/usr/bin/env node
/**
 * تدقيق ملفات الوحدات قبل الالتزام.
 *
 *   npm run data:check          # يفحص كل src/data/units/unit-*.json
 *   npm run data:check -- 02    # وحدة واحدة
 *
 * يطبع جدولًا بالعدّادات + كل خطأ بمكانه، ويخرج بالرمز 1 عند أول ملف غير صالح،
 * حتى يصلح كخطوة في CI أو pre-commit.
 */
import fs from "node:fs";
import path from "node:path";
import { validateUnitFile, summarizeUnitFile } from "./lib/unit-validator.mjs";
import { readUnitsMeta } from "./lib/units-meta.mjs";

const UNITS_DIR = path.join(import.meta.dirname, "..", "src", "data", "units");

const only = process.argv[2];
const meta = readUnitsMeta();
const files = fs
  .readdirSync(UNITS_DIR)
  .filter((f) => /^unit-\d{2}\.json$/.test(f))
  .filter((f) => !only || f.includes(only))
  .sort();

if (files.length === 0) {
  console.error("لا ملفات وحدات مطابقة في", UNITS_DIR);
  process.exit(1);
}

let failed = 0;
console.log("وحدة | محاور | بطاقات | فراغات | QCM | بنك | شواهد | فيديو");
console.log("-----|-------|--------|--------|-----|-----|-------|------");

for (const file of files) {
  const full = path.join(UNITS_DIR, file);
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  const s = summarizeUnitFile(data);
  const errors = validateUnitFile(data, { meta: meta.find((m) => m.id === s.id) });
  console.log(
    `${String(s.id).padStart(4)} | ${String(s.sections).padStart(5)} | ${String(s.cards).padStart(6)} | ${String(s.cloze).padStart(6)} | ${String(s.quiz).padStart(3)} | ${String(s.bank).padStart(3)} | ${String(s.proofs).padStart(5)} | ${s.video}`
  );
  if (errors.length > 0) {
    failed += 1;
    console.error(`\n✗ ${file}`);
    for (const error of errors) console.error(`   - ${error}`);
  }
}

if (failed > 0) {
  console.error(`\n✗ ${failed} ملف غير صالح.`);
  process.exit(1);
}
console.log(`\n✓ ${files.length} ملفات وحدات صالحة.`);
