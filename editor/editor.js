(function() {
const {
  renderPreview, applyWarnings,
  setLiveCssLists, setLiveHtmlLists,
} = window.AO3;

const cmHtml = CodeMirror.fromTextArea(document.getElementById("ed-html"), {
  mode: "htmlmixed", lineNumbers: true, lineWrapping: true,
});
const cmCss = CodeMirror.fromTextArea(document.getElementById("ed-css"), {
  mode: "css", lineNumbers: true, lineWrapping: true,
});

cmHtml.setValue(`<p>Hello AO3.</p>\n<p class="greeting">Try changing the CSS &rarr;</p>`);
cmCss.setValue(`.greeting { color: #c33; }`);

const iframe = document.getElementById("preview-frame");
const rejCount = document.getElementById("rej-count");
const drawerBody = document.getElementById("drawer-body");
const status = document.getElementById("status");

const state = { htmlRejections: [], cssRejections: [] };

let renderTimer = null;
function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(doRender, 150);
}

function doRender() {
  const result = renderPreview({
    html: cmHtml.getValue(),
    css:  cmCss.getValue(),
    iframe,
  });
  state.htmlRejections = result.htmlRejections;
  state.cssRejections  = result.cssRejections;
  applyWarnings(cmHtml, state.htmlRejections);
  applyWarnings(cmCss,  state.cssRejections);
  updateDrawer();
}

function updateDrawer() {
  const all = [
    ...state.htmlRejections.map(r => ({ ...r, source: "html" })),
    ...state.cssRejections.map(r => ({ ...r, source: "css" })),
  ];
  rejCount.textContent = all.length;
  drawerBody.innerHTML = "";
  if (!all.length) {
    drawerBody.innerHTML = `<div style="color:#888;padding:4px 0;">No rejections.</div>`;
    return;
  }
  for (const r of all) {
    const row = document.createElement("div");
    row.className = "rej";
    row.innerHTML =
      `<span class="rej-loc">[${r.source}:${r.line || "?"}]</span> ` +
      `<b>${escapeHtml(r.original)}</b>: ${escapeHtml(r.reason)}` +
      (r.replacement ? `<div class="rej-hint">&rarr; ${escapeHtml(r.replacement)}</div>` : "");
    row.addEventListener("click", () => {
      const cm = r.source === "html" ? cmHtml : cmCss;
      cm.focus();
      if (r.line) cm.setCursor({ line: r.line - 1, ch: (r.col || 1) - 1 });
    });
    drawerBody.appendChild(row);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

cmHtml.on("change", scheduleRender);
cmCss.on("change",  scheduleRender);

document.getElementById("drawer-toggle").addEventListener("click", () => {
  document.getElementById("drawer").classList.toggle("collapsed");
});

document.getElementById("btn-cheatsheet").addEventListener("click", () => window.AO3.openCheatsheet());
document.getElementById("cheatsheet-close").addEventListener("click", () => window.AO3.closeCheatsheet());
document.querySelector("#cheatsheet-modal .modal-backdrop").addEventListener("click", () => window.AO3.closeCheatsheet());
document.addEventListener("keydown", e => {
  if (e.key === "Escape") window.AO3.closeCheatsheet();
});

document.getElementById("btn-refresh-allowlists").addEventListener("click", async () => {
  try {
    status.textContent = "Fetching otwarchive config...";
    const yamlUrl = "https://raw.githubusercontent.com/otwcode/otwarchive/master/config/config.yml";
    const rbUrl   = "https://raw.githubusercontent.com/otwcode/otwarchive/master/config/initializers/gem-plugin_config/sanitizer_config.rb";

    const [yamlText, rbText] = await Promise.all([
      fetch(yamlUrl).then(r => r.text()),
      fetch(rbUrl).then(r => r.text()),
    ]);

    const props = extractYamlList(yamlText, "SUPPORTED_CSS_PROPERTIES");
    const shorthands = extractYamlList(yamlText, "SUPPORTED_CSS_SHORTHAND_PROPERTIES");
    if (!props.length || !shorthands.length) {
      throw new Error(`CSS parser found ${props.length} props / ${shorthands.length} shorthands`);
    }

    const archive = extractRubyArchiveConfig(rbText);
    if (!archive.tags.length) {
      throw new Error("HTML parser found 0 tags, keeping snapshot");
    }

    setLiveCssLists({ props, shorthands });
    setLiveHtmlLists({
      tags: archive.tags,
      globalAttrs: archive.allAttrs,
      perTagAttrs: archive.perTagAttrs,
    });
    status.textContent =
      `Allowlists refreshed (${props.length} props, ${shorthands.length} shorthands, ${archive.tags.length} tags).`;
    doRender();
  } catch (err) {
    status.textContent = `Refresh failed: ${err.message}`;
  }
});

function extractRubyArchiveConfig(rbText) {
  const tags = extractRubyWordArray(rbText, /\belements:\s*%w\[([\s\S]*?)\]/);
  const attrsBody = findRubyBraceBlock(rbText, /\battributes:\s*\{/);
  const allAttrs = attrsBody
    ? extractRubyWordArray(attrsBody, /\ball:\s*%w\[([\s\S]*?)\]/)
    : [];
  const perTagAttrs = attrsBody ? extractRubyPerTagWordArrays(attrsBody) : {};

  const addBody = findRubyBraceBlock(rbText, /\badd_attributes:\s*\{/);
  if (addBody) {
    const re = /"([a-z0-9]+)"\s*=>\s*\{([\s\S]*?)\}/g;
    let m;
    while ((m = re.exec(addBody)) !== null) {
      const tag = m[1];
      const names = [...m[2].matchAll(/"([a-z0-9-]+)"\s*=>/g)].map(x => x[1]);
      if (!names.length) continue;
      perTagAttrs[tag] = [...new Set([...(perTagAttrs[tag] || []), ...names])];
    }
  }
  return { tags, allAttrs, perTagAttrs };
}

function extractRubyWordArray(text, re) {
  const m = text.match(re);
  if (!m) return [];
  return m[1].split(/\s+/).filter(Boolean);
}

function extractRubyPerTagWordArrays(block) {
  const out = {};
  const re = /"([a-z0-9]+)"\s*=>\s*%w\[([\s\S]*?)\]/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    out[m[1]] = m[2].split(/\s+/).filter(Boolean);
  }
  return out;
}

function findRubyBraceBlock(text, prefixRe) {
  const m = text.match(prefixRe);
  if (!m) return null;
  const start = m.index + m[0].length;
  let depth = 1;
  for (let j = start; j < text.length; j++) {
    const c = text[j];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, j);
    }
  }
  return null;
}

function extractYamlList(yamlText, key) {
  const lines = yamlText.split("\n");
  const idx = lines.findIndex(l => l.trim() === key + ":");
  if (idx === -1) return [];
  const out = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!m) {
      if (line.trim() === "") break;
      if (line.startsWith(" ") || line.startsWith("#")) continue;
      break;
    }
    out.push(m[1].replace(/^['"]|['"]$/g, ""));
  }
  return out;
}

const LAYOUT_KEY = "ao3-editor-layout";

function swapPanes(a, b) {
  const sa = a.parentNode;
  const sb = b.parentNode;
  if (sa === sb) return;
  sb.appendChild(a);
  sa.appendChild(b);
  cmHtml.refresh();
  cmCss.refresh();
  doRender();
  saveLayout();
}

function saveLayout() {
  try {
    const slotPaneId = id => document.getElementById(id).querySelector(".pane")?.id;
    const flexGrow = id => parseFloat(document.getElementById(id).style.flex) || null;
    const data = {
      v: 1,
      slots: { a: slotPaneId("slot-a"), b: slotPaneId("slot-b"), c: slotPaneId("slot-c") },
      flex:  { left: flexGrow("left-col"), right: flexGrow("slot-c"),
               top:  flexGrow("slot-a"),   bot:   flexGrow("slot-b") },
    };
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(data));
  } catch {}
}

function loadLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.v !== 1) return;
    for (const [key, paneId] of Object.entries(data.slots || {})) {
      const slot = document.getElementById(`slot-${key}`);
      const pane = document.getElementById(paneId);
      if (slot && pane && pane.parentNode !== slot) slot.appendChild(pane);
    }
    const f = data.flex || {};
    const setFlex = (id, v) => { if (v) document.getElementById(id).style.flex = `${v} 1 0`; };
    setFlex("left-col", f.left);
    setFlex("slot-c",   f.right);
    setFlex("slot-a",   f.top);
    setFlex("slot-b",   f.bot);
    cmHtml.refresh();
    cmCss.refresh();
  } catch {}
}

for (const handle of document.querySelectorAll(".drag-handle")) {
  handle.draggable = true;
  const pane = handle.parentNode;
  handle.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", pane.id);
    e.dataTransfer.effectAllowed = "move";
    iframe.style.pointerEvents = "none";
  });
  handle.addEventListener("dragend", () => { iframe.style.pointerEvents = ""; });
  handle.addEventListener("dragover", e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    handle.classList.add("drop-target");
  });
  handle.addEventListener("dragleave", () => handle.classList.remove("drop-target"));
  handle.addEventListener("drop", e => {
    e.preventDefault();
    handle.classList.remove("drop-target");
    const srcId = e.dataTransfer.getData("text/plain");
    if (!srcId || srcId === pane.id) return;
    const src = document.getElementById(srcId);
    if (src) swapPanes(src, pane);
  });
}

function attachSplitter(handle, axis, before, after) {
  handle.addEventListener("mousedown", e => {
    e.preventDefault();
    const isV = axis === "x";
    const start = isV ? e.clientX : e.clientY;
    const aRect = before.getBoundingClientRect();
    const bRect = after.getBoundingClientRect();
    const aSize = isV ? aRect.width  : aRect.height;
    const bSize = isV ? bRect.width  : bRect.height;
    const total = aSize + bSize;
    handle.classList.add("dragging");
    document.body.style.cursor = isV ? "col-resize" : "row-resize";
    iframe.style.pointerEvents = "none";
    function move(ev) {
      const delta = (isV ? ev.clientX : ev.clientY) - start;
      const aNew = Math.max(60, Math.min(total - 60, aSize + delta));
      const bNew = total - aNew;
      before.style.flex = `${aNew} 1 0`;
      after.style.flex  = `${bNew} 1 0`;
    }
    function up() {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      handle.classList.remove("dragging");
      document.body.style.cursor = "";
      iframe.style.pointerEvents = "";
      cmHtml.refresh();
      cmCss.refresh();
      saveLayout();
    }
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  });
}

attachSplitter(
  document.getElementById("splitter-v"), "x",
  document.getElementById("left-col"),
  document.getElementById("slot-c"),
);
attachSplitter(
  document.getElementById("splitter-h"), "y",
  document.getElementById("slot-a"),
  document.getElementById("slot-b"),
);

document.getElementById("btn-reset-layout").addEventListener("click", () => {
  try { localStorage.removeItem(LAYOUT_KEY); } catch {}
  const defaults = { "slot-a": "pane-html", "slot-b": "pane-css", "slot-c": "pane-preview" };
  for (const [slotId, paneId] of Object.entries(defaults)) {
    const slot = document.getElementById(slotId);
    const pane = document.getElementById(paneId);
    if (slot && pane && pane.parentNode !== slot) slot.appendChild(pane);
  }
  for (const id of ["left-col", "slot-a", "slot-b", "slot-c"]) {
    document.getElementById(id).style.flex = "";
  }
  cmHtml.refresh();
  cmCss.refresh();
  doRender();
});

loadLayout();
doRender();

window._editor = { cmHtml, cmCss, state };

})();
