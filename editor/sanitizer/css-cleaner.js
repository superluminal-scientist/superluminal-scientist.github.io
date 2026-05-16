(function(AO3) {
const { LIVE } = AO3;

function cleanCss(css) {
  const rejections = [];
  const out = [];
  let i = 0;

  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) { out.push(css[i]); i++; }
    if (css.startsWith("/*", i)) {
      const end = css.indexOf("*/", i + 2);
      if (end === -1) { out.push(css.slice(i)); break; }
      out.push(css.slice(i, end + 2));
      i = end + 2;
      continue;
    }
    if (i >= css.length) break;

    const ruleStart = i;
    const braceOpen = css.indexOf("{", i);
    if (braceOpen === -1) {
      rejections.push(strayRejection(css, ruleStart, css.length, "Stray text outside any CSS rule. Wrap it in a selector and `{ ... }`."));
      out.push(css.slice(i));
      break;
    }

    const braceClose = findMatchingBrace(css, braceOpen);
    if (braceClose === -1) {
      rejections.push(strayRejection(css, ruleStart, css.length, "Unclosed `{`: no matching `}`."));
      out.push(css.slice(i));
      break;
    }

    const selectorRaw = css.slice(ruleStart, braceOpen);
    const selector = selectorRaw.trim();
    const body = css.slice(braceOpen + 1, braceClose);

    if (/^@font-face\b/i.test(selector)) {
      rejections.push({
        ...positionOf(css, ruleStart),
        length: braceClose - ruleStart + 1,
        original: "@font-face",
        reason: "@font-face is rejected by AO3 (custom fonts not allowed).",
        kind: "selector",
      });
      i = braceClose + 1;
      continue;
    }

    const { cleanedBody, declRejections } = cleanDeclarationBlock(body, css, braceOpen + 1);
    rejections.push(...declRejections);
    out.push(selectorRaw);
    out.push("{");
    out.push(cleanedBody);
    out.push("}");
    i = braceClose + 1;
  }

  return { cleanedCss: out.join(""), rejections };
}

function strayRejection(src, startIdx, endIdx, reason) {
  const slice = src.slice(startIdx, endIdx).trim();
  const display = slice.length > 60 ? slice.slice(0, 60) + "..." : slice;
  return {
    ...positionOf(src, startIdx),
    length: Math.max(1, slice.length),
    original: display || "(empty)",
    reason,
    kind: "stray",
  };
}

function findMatchingBrace(s, openIdx) {
  let depth = 1;
  for (let j = openIdx + 1; j < s.length; j++) {
    if (s[j] === "{") depth++;
    else if (s[j] === "}") { depth--; if (depth === 0) return j; }
  }
  return -1;
}

function positionOf(s, idx) {
  let line = 1, col = 1;
  for (let j = 0; j < idx; j++) {
    if (s[j] === "\n") { line++; col = 1; } else { col++; }
  }
  return { line, col };
}

function cleanDeclarationBlock(body, fullSrc, bodyOffset) {
  const decls = [];
  const rejections = [];
  let depth = 0;
  let start = 0;
  for (let j = 0; j <= body.length; j++) {
    const ch = body[j];
    if (j === body.length || (ch === ";" && depth === 0)) {
      const decl = body.slice(start, j);
      const declStartAbs = bodyOffset + start;
      const cleaned = cleanDeclaration(decl, fullSrc, declStartAbs, rejections);
      if (cleaned !== null) decls.push(cleaned);
      start = j + 1;
    } else if (ch === "(") depth++;
    else if (ch === ")") depth--;
  }
  return { cleanedBody: decls.length ? " " + decls.join("; ") + "; " : " ", declRejections: rejections };
}

function cleanDeclaration(decl, fullSrc, declStartAbs, rejections) {
  const trimmed = decl.trim();
  if (!trimmed) return null;
  const colonIdx = trimmed.indexOf(":");
  if (colonIdx === -1) {
    const offsetInDecl = decl.indexOf(trimmed[0]);
    rejections.push({
      ...positionOf(fullSrc, declStartAbs + (offsetInDecl < 0 ? 0 : offsetInDecl)),
      length: trimmed.length,
      original: trimmed.length > 60 ? trimmed.slice(0, 60) + "..." : trimmed,
      reason: "Malformed declaration: missing `: value`.",
      kind: "declaration",
    });
    return null;
  }

  const prop = trimmed.slice(0, colonIdx).trim().toLowerCase();
  const value = trimmed.slice(colonIdx + 1).trim();
  const lowerDecl = decl.toLowerCase();

  if (!isPropertyAllowed(prop)) {
    rejections.push({
      ...positionOf(fullSrc, declStartAbs + lowerDecl.indexOf(prop)),
      length: prop.length,
      original: prop,
      reason: `Property "${prop}" is not in AO3 allowlist.`,
      kind: "property",
    });
    return null;
  }

  if (!isValueAllowed(prop, value)) {
    rejections.push({
      ...positionOf(fullSrc, declStartAbs + decl.indexOf(value)),
      length: value.length,
      original: value,
      reason: `Value "${value}" is not allowed for "${prop}".`,
      kind: "value",
    });
    return null;
  }

  return `${prop}: ${value}`;
}

function isPropertyAllowed(prop) {
  if (LIVE.cssProps.includes(prop)) return true;
  for (const sh of LIVE.cssShorthands) {
    if (prop.includes(sh)) return true;
  }
  return false;
}

function isValueAllowed(prop, value) {
  const lower = value.toLowerCase();
  if (lower.includes("javascript:")) return false;
  if (lower.includes("expression(")) return false;
  if (lower.includes("@import")) return false;
  const urls = [...value.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)];
  for (const m of urls) {
    const u = m[1].trim().toLowerCase();
    if (!/^(https?:|data:image\/|\/|\.{0,2}\/)/.test(u)) return false;
  }
  if (prop === "font-family") {
    const families = splitTopLevel(value, ",");
    for (const f of families) {
      const t = f.trim();
      if (/^['"].*['"]$/.test(t)) continue;
      if (/^[a-z0-9\- ]+$/i.test(t)) continue;
      return false;
    }
  }
  return true;
}

function splitTopLevel(s, sep) {
  const out = [];
  let depth = 0, buf = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === sep && depth === 0) { out.push(buf); buf = ""; }
    else buf += ch;
  }
  if (buf) out.push(buf);
  return out;
}

AO3.cleanCss = cleanCss;

})(window.AO3);
