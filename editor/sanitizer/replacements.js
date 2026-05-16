(function(AO3) {

const RULES = [
  {
    match: r => r.kind === "property" && r.original === "gap",
    hint: "AO3 strips `gap`. Use `margin` on the children.",
  },
  {
    match: r => r.kind === "selector" && /@font-face/i.test(r.original),
    hint: "Custom fonts are rejected. Pick a system font (Georgia, Courier New, etc).",
  },
  {
    match: r => r.kind === "value" && /repeating-linear-gradient/i.test(r.original),
    hint: "Production AO3 often rejects `repeating-linear-gradient`. Use a solid color or non-repeating gradient.",
  },
];

function enrichRejection(r) {
  for (const rule of RULES) {
    if (rule.match(r)) return { ...r, replacement: rule.hint };
  }
  return r;
}

function enrichAll(rejections) {
  return rejections.map(enrichRejection);
}

AO3.enrichRejection = enrichRejection;
AO3.enrichAll = enrichAll;

})(window.AO3);
