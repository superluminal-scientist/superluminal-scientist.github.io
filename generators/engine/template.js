const escapeHtml = (s) => String(s)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const EFFECTS = [
  { open: "[", close: "]", className: (d) => `crumble crumble-${Math.round(Number(d?.intensity ?? 1) * 10)}`, wrapLetters: true },
  { open: "{", close: "}", className: (d) => `crumble crumble-${Math.round(Number(d?.intensity ?? 1) * 10)} crumble-blur`, wrapLetters: true }
];

function processEffects(text, data) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    let next = null;
    for (const e of EFFECTS) {
      const idx = text.indexOf(e.open, i);
      if (idx !== -1 && (next === null || idx < next.idx)) next = { idx, effect: e };
    }
    if (next === null) { out += escapeHtml(text.slice(i)); break; }
    out += escapeHtml(text.slice(i, next.idx));
    const close = text.indexOf(next.effect.close, next.idx + 1);
    if (close === -1) { out += escapeHtml(text.slice(next.idx)); break; }
    const inner = text.slice(next.idx + 1, close);
    let innerHtml;
    if (next.effect.wrapLetters) {
      innerHtml = "";
      for (const ch of inner) {
        innerHtml += /\s/.test(ch) ? escapeHtml(ch) : `<var>${escapeHtml(ch)}</var>`;
      }
    } else {
      innerHtml = escapeHtml(inner);
    }
    const cls = typeof next.effect.className === "function" ? next.effect.className(data) : next.effect.className;
    if (innerHtml) out += `<span class="${cls}">${innerHtml}</span>`;
    i = close + 1;
  }
  return out;
}

function renderWith(tpl, data, escape) {
  const eachRe = /\{\{#each\s+([\w$]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g;
  let out = tpl.replace(eachRe, (_, name, body) => {
    const list = Array.isArray(data?.[name]) ? data[name] : [];
    return list.map(item => renderWith(body, item, escape)).join("");
  });
  out = out.replace(/\{\{#if\s+([\w$]+)\s*==\s*["']([^"']*)["']\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, name, value, body) => {
    return String(data?.[name] ?? "") === value ? body : "";
  });
  out = out.replace(/\{\{effects\s+([\w$]+)\s*\}\}/g, (_, name) => {
    return processEffects(String(data?.[name] ?? ""), data);
  });
  out = out.replace(/\{\{paragraphs\s+([\w$]+)\s*\}\}/g, (_, name) => {
    return String(data?.[name] ?? "").split(/\n\s*\n/)
      .map(p => p.trim()).filter(p => p.length > 0)
      .map(p => `<p>${escapeHtml(p)}</p>`).join("");
  });
  out = out.replace(/\{\{\s*([\w$]+)\s*\*\s*([\d.]+)\s*\}\}/g, (_, name, factor) => {
    const v = Number(data?.[name]);
    if (isNaN(v)) return "";
    return String(Math.round(v * Number(factor)));
  });
  out = out.replace(/\{\{=([^{}]+?)(?::(\d+))?\}\}/g, (_, expr, precision) => {
    let s = expr;
    s = s.replace(/[A-Za-z_$][\w$]*/g, (id) => {
      const v = data?.[id];
      const n = Number(v);
      return isNaN(n) ? "0" : String(n);
    });
    if (!/^[\d.+\-*/() \t]+$/.test(s)) return "";
    let result;
    try { result = Function(`"use strict";return (${s});`)(); }
    catch { return ""; }
    if (typeof result !== "number" || !isFinite(result)) return "";
    const digits = precision === undefined ? 4 : Number(precision);
    return Number(result.toFixed(digits)).toString();
  });
  out = out.replace(/\{\{\s*([\w$]+)\s*\}\}/g, (_, name) => {
    const v = data?.[name];
    if (v === undefined || v === null) return "";
    return escape ? escapeHtml(v) : String(v);
  });
  return out;
}

export function render(tpl, data) { return renderWith(tpl, data, true); }
export function renderRaw(tpl, data) { return renderWith(tpl, data, false); }
