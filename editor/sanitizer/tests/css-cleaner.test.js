import { test, assertEqual, assertContains, assertNotContains } from "./test-runner.js";
import { cleanCss } from "../css-cleaner.js";

test("css-cleaner: accepts a simple allowed declaration", () => {
  const { cleanedCss, rejections } = cleanCss("p { color: red; }");
  assertContains(cleanedCss, "color: red");
  assertEqual(rejections.length, 0);
});

test("css-cleaner: rejects 'gap' property", () => {
  const { cleanedCss, rejections } = cleanCss("p { gap: 10px; color: red; }");
  assertNotContains(cleanedCss, "gap");
  assertContains(cleanedCss, "color: red");
  assertEqual(rejections.length, 1);
  assertEqual(rejections[0].original, "gap");
});

test("css-cleaner: allows border-radius via shorthand-substring match", () => {
  const { cleanedCss, rejections } = cleanCss("p { border-radius: 4px; }");
  assertContains(cleanedCss, "border-radius");
  assertEqual(rejections.length, 0);
});

test("css-cleaner: allows text-align via shorthand-substring match", () => {
  const { cleanedCss, rejections } = cleanCss("p { text-align: center; }");
  assertContains(cleanedCss, "text-align");
  assertEqual(rejections.length, 0);
});

test("css-cleaner: rejects @font-face entirely", () => {
  const css = `@font-face { font-family: foo; src: url(x); } p { color: red; }`;
  const { cleanedCss, rejections } = cleanCss(css);
  assertNotContains(cleanedCss, "@font-face");
  assertContains(cleanedCss, "color: red");
  assertEqual(rejections[0].reason.includes("@font-face"), true);
});

test("css-cleaner: rejection records carry line numbers", () => {
  const css = "p {\n  gap: 10px;\n  color: red;\n}";
  const { rejections } = cleanCss(css);
  assertEqual(rejections.length, 1);
  assertEqual(rejections[0].line, 2);
});

test("css-cleaner: font-family downcased before allowing", () => {
  const { cleanedCss, rejections } = cleanCss("p { font-family: 'Courier New'; }");
  assertContains(cleanedCss, "Courier New");
  assertEqual(rejections.length, 0);
});

test("css-cleaner: rejects javascript: in url()", () => {
  const css = `p { background-image: url("javascript:alert(1)"); }`;
  const { rejections } = cleanCss(css);
  assertEqual(rejections.length >= 1, true);
});

test("css-cleaner: accepts linear-gradient()", () => {
  const { cleanedCss, rejections } = cleanCss("p { background-image: linear-gradient(red, blue); }");
  assertContains(cleanedCss, "linear-gradient");
  assertEqual(rejections.length, 0);
});
