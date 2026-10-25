/**
 * اختبارات هندسة «خريطة التركيز».
 *
 * الخريطة ترسم العقدة المركّزة في المركز وأبناءها على مدار حولها، وأي خطأ
 * في الحساب يعني عنصرًا خارج الحاوية أو متراكبًا مع عنصر آخر. هذه الاختبارات
 * تتحقق من الهندسة بلا متصفح.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildFocusLayout,
  countMindmapNodes,
  findMindmapNode,
  findNodePath,
} from "../../src/lib/mindmap-layout.ts";

const DIR = path.join(import.meta.dirname, "..", "..", "src", "data", "lessons");
const MINDMAP_FILES = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith("_mindmap.json"))
  .sort();

const roots = MINDMAP_FILES.map((file) => ({
  file,
  root: JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")).root,
}));

const walk = (node, out = []) => {
  out.push(node);
  (node.children ?? []).forEach((child) => walk(child, out));
  return out;
};

test("عنصر واحد لكل ابن، ولا عناصر زائدة", () => {
  for (const { file, root } of roots) {
    const branches = root.children ?? [];
    const ring = buildFocusLayout(branches);
    assert.equal(ring.length, branches.length, `${file}: عدد عناصر المدار`);
    assert.deepEqual(
      ring.map((item) => item.id),
      branches.map((child) => child.id),
      `${file}: الترتيب يطابق ترتيب البيانات`
    );
  }
});

test("كل العناصر داخل الحاوية (لا خروج أفقي أو رأسي)", () => {
  for (const { file, root } of roots) {
    for (const node of walk(root)) {
      for (const item of buildFocusLayout(node.children ?? [])) {
        assert.ok(item.x > 0.03 && item.x < 0.97, `${file}: x=${item.x} خارج الحاوية`);
        assert.ok(item.y > 0.04 && item.y < 0.96, `${file}: y=${item.y} خارج الحاوية`);
      }
    }
  }
});

test("لا تراكب بين عنصري مدار متجاورين (مسافة كافية)", () => {
  for (const { file, root } of roots) {
    for (const node of walk(root)) {
      const ring = buildFocusLayout(node.children ?? []);
      for (let i = 0; i < ring.length; i += 1) {
        for (let j = i + 1; j < ring.length; j += 1) {
          const dx = ring[i].x - ring[j].x;
          const dy = ring[i].y - ring[j].y;
          assert.ok(
            Math.hypot(dx, dy) > 0.12,
            `${file}: «${ring[i].id}» و«${ring[j].id}» متقاربان جدًا`
          );
        }
      }
    }
  }
});

test("الاتجاه RTL: العنصر الوحيد يسار المركز، والمدار متوزّع بانتظام", () => {
  const single = buildFocusLayout([{ id: "a", label: "عنصر" }]);
  assert.equal(single.length, 1);
  assert.ok(single[0].x < 0.5, "العنصر الوحيد يتفرّع إلى اليسار");

  const five = buildFocusLayout(
    Array.from({ length: 5 }, (_, i) => ({ id: `n${i}`, label: `عنصر ${i}` }))
  );
  const angles = five.map((item) => item.angle);
  assert.equal(new Set(angles).size, 5, "لا تكرار في الزوايا");
  const gaps = angles.slice(1).map((angle, i) => ((angles[i] - angle + 360) % 360).toFixed(2));
  assert.equal(new Set(gaps).size, 1, "التوزيع متساوٍ حول المركز");
});

test("التخطيط حتمي (نفس المُدخل ⇒ نفس المُخرج)", () => {
  for (const { root } of roots) {
    const branches = root.children ?? [];
    assert.equal(
      JSON.stringify(buildFocusLayout(branches)),
      JSON.stringify(buildFocusLayout(branches))
    );
  }
});

test("شجرة بلا أبناء تُنتج مدارًا فارغًا", () => {
  assert.deepEqual(buildFocusLayout([]), []);
});

test("مسار التتبّع يصل من الجذر إلى أي عقدة، والبحث يجدها", () => {
  for (const { file, root } of roots) {
    const all = walk(root);
    for (const target of all) {
      const trail = findNodePath(root, target.id);
      assert.ok(trail.length > 0, `${file}: مسار «${target.id}» مفقود`);
      assert.equal(trail[0].id, root.id, `${file}: المسار يبدأ من الجذر`);
      assert.equal(trail[trail.length - 1].id, target.id, `${file}: المسار ينتهي بالهدف`);
      assert.equal(findMindmapNode(root, target.id)?.label, target.label, `${file}: البحث`);
    }
    assert.deepEqual(findNodePath(root, "غير-موجود"), [], `${file}: معرّف مجهول`);
    assert.equal(countMindmapNodes(root), all.length, `${file}: عدد العقد`);
  }
});

/* ------------------------------------------------------------------ */
/* هندسة الشاشة الكبيرة: البطاقات لا تتراكب ولا تخرج من الحاوية        */
/* ------------------------------------------------------------------ */

const overlaps = (a, b) =>
  Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;

test("على الشاشات الكبيرة: لا تراكب بين بطاقات المدار ولا مع البطاقة المركزية", () => {
  const PILL = { w: 176, h: 76 }; // lg:w-44
  const CENTER = { w: 240, h: 132 }; // lg:w-60
  const CANVAS = { w: 1024, h: 600 };

  for (const { file, root } of roots) {
    for (const node of walk(root)) {
      const ring = buildFocusLayout(node.children ?? []);
      const boxes = ring.map((item) => ({
        id: item.id,
        x: item.x * CANVAS.w,
        y: item.y * CANVAS.h,
        ...PILL,
      }));

      for (const box of boxes) {
        assert.ok(
          box.x - PILL.w / 2 >= 0 && box.x + PILL.w / 2 <= CANVAS.w,
          `${file}: «${box.id}» يخرج أفقيًا من الحاوية`
        );
        assert.ok(
          box.y - PILL.h / 2 >= 0 && box.y + PILL.h / 2 <= CANVAS.h,
          `${file}: «${box.id}» يخرج رأسيًا من الحاوية`
        );
        assert.ok(
          !overlaps(box, { x: CANVAS.w / 2, y: CANVAS.h / 2, ...CENTER }),
          `${file}: «${box.id}» يتراكب مع البطاقة المركزية`
        );
      }

      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          assert.ok(
            !overlaps(boxes[i], boxes[j]),
            `${file}: «${boxes[i].id}» يتراكب مع «${boxes[j].id}»`
          );
        }
      }
    }
  }
});
