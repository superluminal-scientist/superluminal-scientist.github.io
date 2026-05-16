(function(AO3) {

function applyWorkskinPrefix(css) {
  let out = "";
  let i = 0;
  while (i < css.length) {
    if (css.startsWith("/*", i)) {
      const end = css.indexOf("*/", i + 2);
      if (end === -1) { out += css.slice(i); break; }
      out += css.slice(i, end + 2);
      i = end + 2;
      continue;
    }
    while (i < css.length && /\s/.test(css[i])) { out += css[i]; i++; }
    if (i >= css.length) break;

    if (css[i] === "@") {
      const braceOpen = css.indexOf("{", i);
      if (braceOpen === -1) { out += css.slice(i); break; }
      const braceClose = matchBrace(css, braceOpen);
      const inner = css.slice(braceOpen + 1, braceClose);
      out += css.slice(i, braceOpen + 1) + applyWorkskinPrefix(inner) + "}";
      i = braceClose + 1;
      continue;
    }

    const braceOpen = css.indexOf("{", i);
    if (braceOpen === -1) { out += css.slice(i); break; }
    const braceClose = matchBrace(css, braceOpen);
    if (braceClose === -1) { out += css.slice(i); break; }
    const selectorList = css.slice(i, braceOpen);
    const prefixed = selectorList.split(",").map(sel => {
      const trimmed = sel.trim();
      if (!trimmed) return sel;
      if (/^#workskin\b/.test(trimmed)) return sel;
      const leadingWs = sel.match(/^\s*/)[0];
      const trailingWs = sel.match(/\s*$/)[0];
      return `${leadingWs}#workskin ${trimmed}${trailingWs}`;
    }).join(",");
    out += prefixed + css.slice(braceOpen, braceClose + 1);
    i = braceClose + 1;
  }
  return out;
}

function matchBrace(s, openIdx) {
  let depth = 1;
  for (let j = openIdx + 1; j < s.length; j++) {
    if (s[j] === "{") depth++;
    else if (s[j] === "}") { depth--; if (depth === 0) return j; }
  }
  return s.length - 1;
}

AO3.applyWorkskinPrefix = applyWorkskinPrefix;

})(window.AO3);
