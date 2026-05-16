import { test, assertEqual, assertContains } from "./test-runner.js";
import { applyWorkskinPrefix } from "../paste-modes.js";

test("workskin prefix: adds #workskin to bare selector", () => {
  const out = applyWorkskinPrefix(".foo { color: red; }");
  assertContains(out, "#workskin .foo");
});

test("workskin prefix: leaves already-prefixed selectors alone", () => {
  const out = applyWorkskinPrefix("#workskin .foo { color: red; }");
  assertEqual(out.split("#workskin").length - 1, 1);
});

test("workskin prefix: handles comma-separated selectors", () => {
  const out = applyWorkskinPrefix(".a, .b { color: red; }");
  assertContains(out, "#workskin .a");
  assertContains(out, "#workskin .b");
});
