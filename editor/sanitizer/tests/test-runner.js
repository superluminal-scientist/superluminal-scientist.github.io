const _tests = [];
export function test(name, fn) { _tests.push({ name, fn }); }

export function assertEqual(actual, expected, msg) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${msg || "assertEqual"}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
  }
}

export function assertContains(haystack, needle, msg) {
  if (typeof haystack !== "string" || !haystack.includes(needle)) {
    throw new Error(`${msg || "assertContains"}\n  expected to contain: ${needle}\n  in: ${haystack}`);
  }
}

export function assertNotContains(haystack, needle, msg) {
  if (typeof haystack === "string" && haystack.includes(needle)) {
    throw new Error(`${msg || "assertNotContains"}\n  expected NOT to contain: ${needle}\n  in: ${haystack}`);
  }
}

export function runAll(rootEl) {
  let pass = 0, fail = 0;
  for (const { name, fn } of _tests) {
    const row = document.createElement("div");
    row.className = "test-row";
    try {
      fn();
      row.classList.add("pass");
      row.textContent = `PASS  ${name}`;
      pass++;
    } catch (err) {
      row.classList.add("fail");
      row.textContent = `FAIL  ${name}\n${err.message}`;
      fail++;
    }
    rootEl.appendChild(row);
  }
  const summary = document.createElement("div");
  summary.className = "summary";
  summary.textContent = `${pass} passed, ${fail} failed`;
  rootEl.prepend(summary);
}
