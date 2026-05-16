import { test, assertEqual, assertContains, assertNotContains } from "./test-runner.js";
import { cleanHtml } from "../html-sanitizer.js";

test("html: allows p, span, em, strong", () => {
  const { cleanedHtml, rejections } = cleanHtml("<p>Hello <em>world</em> <strong>!</strong></p>");
  assertContains(cleanedHtml, "<p>");
  assertContains(cleanedHtml, "<em>");
  assertContains(cleanedHtml, "<strong>");
  assertEqual(rejections.length, 0);
});

test("html: strips <script>", () => {
  const { cleanedHtml, rejections } = cleanHtml("<p>ok</p><script>alert(1)</script>");
  assertNotContains(cleanedHtml, "<script");
  assertContains(cleanedHtml, "<p>ok</p>");
  assertEqual(rejections.some(r => r.original === "script"), true);
});

test("html: strips <style>", () => {
  const { cleanedHtml, rejections } = cleanHtml("<style>body{}</style><p>ok</p>");
  assertNotContains(cleanedHtml, "<style");
  assertEqual(rejections.some(r => r.original === "style"), true);
});

test("html: strips disallowed attributes", () => {
  const { cleanedHtml } = cleanHtml(`<p onclick="alert(1)" class="ok">Hi</p>`);
  assertNotContains(cleanedHtml, "onclick");
  assertContains(cleanedHtml, `class="ok"`);
});

test("html: preserves comments", () => {
  const { cleanedHtml } = cleanHtml("<!-- a comment --><p>x</p>");
  assertContains(cleanedHtml, "<!-- a comment -->");
});

test("html: preserves <pre> whitespace", () => {
  const src = "<pre>line1\n  line2\n    line3</pre>";
  const { cleanedHtml } = cleanHtml(src);
  assertContains(cleanedHtml, "line1\n  line2\n    line3");
});

test("html: img allows src/alt/width/height, strips others", () => {
  const { cleanedHtml } = cleanHtml(`<img src="/x.png" alt="x" onerror="bad()">`);
  assertContains(cleanedHtml, `src="/x.png"`);
  assertContains(cleanedHtml, `alt="x"`);
  assertNotContains(cleanedHtml, "onerror");
});

test("html: strips javascript: in href", () => {
  const { cleanedHtml } = cleanHtml(`<a href="javascript:alert(1)">x</a>`);
  assertNotContains(cleanedHtml, "javascript:");
});
