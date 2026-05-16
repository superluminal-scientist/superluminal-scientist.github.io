import { test, assertEqual } from "./test-runner.js";
import {
  SUPPORTED_CSS_PROPERTIES,
  SUPPORTED_CSS_SHORTHAND_PROPERTIES,
  ALLOWED_TAGS,
  ALLOWED_ATTRS,
} from "../allowlists.js";

test("allowlists: core CSS properties present", () => {
  assertEqual(SUPPORTED_CSS_PROPERTIES.includes("color"), true);
  assertEqual(SUPPORTED_CSS_PROPERTIES.includes("display"), true);
  assertEqual(SUPPORTED_CSS_PROPERTIES.includes("opacity"), true);
});

test("allowlists: gap is NOT present", () => {
  assertEqual(SUPPORTED_CSS_PROPERTIES.includes("gap"), false);
});

test("allowlists: shorthand list includes background and border", () => {
  assertEqual(SUPPORTED_CSS_SHORTHAND_PROPERTIES.includes("background"), true);
  assertEqual(SUPPORTED_CSS_SHORTHAND_PROPERTIES.includes("border"), true);
  assertEqual(SUPPORTED_CSS_SHORTHAND_PROPERTIES.includes("transform"), true);
});

test("allowlists: ALLOWED_TAGS includes core text tags", () => {
  for (const t of ["p", "span", "div", "a", "em", "strong", "pre", "br", "img"]) {
    assertEqual(ALLOWED_TAGS.has(t), true, `expected tag ${t}`);
  }
});

test("allowlists: ALLOWED_TAGS excludes script and style", () => {
  assertEqual(ALLOWED_TAGS.has("script"), false);
  assertEqual(ALLOWED_TAGS.has("style"), false);
});

test("allowlists: anchor allows href and title", () => {
  assertEqual(ALLOWED_ATTRS.a.has("href"), true);
  assertEqual(ALLOWED_ATTRS.a.has("title"), true);
});
