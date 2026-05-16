(function(AO3) {

const ACTIVE_MARKS = new WeakMap();

function applyWarnings(cm, rejections) {
  const prior = ACTIVE_MARKS.get(cm) || [];
  for (const m of prior) m.clear();

  const marks = [];
  for (const r of rejections) {
    if (!r.line || !r.col || !r.length) continue;
    const from = { line: r.line - 1, ch: r.col - 1 };
    const to   = { line: r.line - 1, ch: r.col - 1 + r.length };
    const mark = cm.markText(from, to, {
      className: "cm-warning",
      title: `${r.reason}${r.replacement ? "\n→ " + r.replacement : ""}`,
    });
    marks.push(mark);
  }
  ACTIVE_MARKS.set(cm, marks);
}

AO3.applyWarnings = applyWarnings;

})(window.AO3);
