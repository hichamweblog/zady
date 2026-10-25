/**
 * اختبارات هندسة الخريطة الذهنية التفاعلية.
 *
 * الخريطة تُرسم على قماش React Flow بمواضع محسوبة يدويًا، وأي خطأ في الحساب
 * يظهر كعقد متراكبة أو وصلات معلّقة. هذه الاختبارات تتحقق من الهندسة بلا
 * متصفح: لا تراكب، اتجاه RTL صحيح، وصلات سليمة، وتخطيط حتمي.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildMindmapLayout } from "../../src/lib/mindmap-layout.ts";

const DIR = path.join(import.meta.dirname, "..", "..", "src", "data", "lessons");
const MINDMAP_FILES = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith("_mindmap.json"))
  .sort();

const flatten = (node, depth = 0, out = []) => {
  out.push({ node, depth });
  (node.children ?? []).forEach((c) => flatten(c, depth + 1, out));
  return out;
};

const layouts = MINDMAP_FILES.map((file) => {
  const raw = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
  return { file, root: raw.root, layout: buildMindmapLayout(raw.root) };
});

test("كل عقدة في الشجرة صار لها موضع واحد فريد", () => {
  for (const { file, root, layout } of layouts) {
    const expected = flatten(root).length;
    assert.equal(layout.nodes.length, expected, `${file}: عدد العقد`);
    const ids = new Set(layout.nodes.map((n) => n.id));
    assert.equal(ids.size, layout.nodes.length, `${file}: معرّفات فريدة`);
  }
});

test("الوصلات: عددها = العقد − 1 وكل طرف موجود", () => {
  for (const { file, layout } of layouts) {
    assert.equal(layout.edges.length, layout.nodes.length - 1, `${file}: عدد الوصلات`);
    const ids = new Set(layout.nodes.map((n) => n.id));
    for (const edge of layout.edges) {
      assert.ok(ids.has(edge.source), `${file}: مصدر ${edge.source} موجود`);
      assert.ok(ids.has(edge.target), `${file}: هدف ${edge.target} موجود`);
      assert.notEqual(edge.source, edge.target, `${file}: لا وصلة ذاتية`);
    }
  }
});

test("الاتجاه RTL: الجذر أقصى اليمين والأبناء يسارًا", () => {
  for (const { file, layout } of layouts) {
    const root = layout.nodes.find((n) => n.depth === 0);
    assert.ok(root, `${file}: الجذر موجود`);
    for (const node of layout.nodes) {
      if (node.id === root.id) continue;
      assert.ok(
        node.x < root.x,
        `${file}: العقدة «${node.label}» يجب أن تكون يسار الجذر`
      );
    }
    // كل ابن يسار أبيه
    const byId = new Map(layout.nodes.map((n) => [n.id, n]));
    for (const edge of layout.edges) {
      const parent = byId.get(edge.source);
      const child = byId.get(edge.target);
      assert.ok(
        child.x + child.width <= parent.x + 1,
        `${file}: الابن «${child.label}» يجب أن ينتهي قبل بداية أبيه`
      );
    }
  }
});

test("لا تراكب بين عقد العمود نفسه", () => {
  for (const { file, layout } of layouts) {
    const byDepth = new Map();
    for (const node of layout.nodes) {
      if (!byDepth.has(node.depth)) byDepth.set(node.depth, []);
      byDepth.get(node.depth).push(node);
    }
    for (const [depth, column] of byDepth) {
      const sorted = [...column].sort((a, b) => a.y - b.y);
      for (let i = 1; i < sorted.length; i += 1) {
        const prev = sorted[i - 1];
        const cur = sorted[i];
        assert.ok(
          cur.y - cur.height / 2 >= prev.y + prev.height / 2 - 0.5,
          `${file}: تراكب في العمق ${depth} بين «${prev.label}» و«${cur.label}»`
        );
      }
    }
  }
});

test("الأب في منتصف أبنائه رأسيًا", () => {
  for (const { file, layout } of layouts) {
    const byId = new Map(layout.nodes.map((n) => [n.id, n]));
    const childrenOf = new Map();
    for (const edge of layout.edges) {
      if (!childrenOf.has(edge.source)) childrenOf.set(edge.source, []);
      childrenOf.get(edge.source).push(byId.get(edge.target));
    }
    for (const [parentId, kids] of childrenOf) {
      const parent = byId.get(parentId);
      const expected = (kids[0].y + kids[kids.length - 1].y) / 2;
      assert.ok(
        Math.abs(parent.y - expected) < 0.001,
        `${file}: مركز «${parent.label}» غير مطابق لمنتصف أبنائه`
      );
    }
  }
});

test("التخطيط حتمي (نفس المُدخل ⇒ نفس المُخرج)", () => {
  for (const { root } of layouts) {
    const a = JSON.stringify(buildMindmapLayout(root));
    const b = JSON.stringify(buildMindmapLayout(root));
    assert.equal(a, b);
  }
});

test("شجرة بعقدة واحدة لا تُنتج وصلات وأبعادًا موجبة", () => {
  const layout = buildMindmapLayout({ id: "root", label: "محور وحيد" });
  assert.equal(layout.nodes.length, 1);
  assert.equal(layout.edges.length, 0);
  assert.ok(layout.width > 0 && layout.height > 0);
});
