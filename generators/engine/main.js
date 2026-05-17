import { render, renderRaw } from "./template.js";
import { buildForm, defaultsFromFields } from "./form.js";
import { updatePreview } from "./preview.js";
import { attachCopyButton } from "./copy.js";
import * as storage from "./storage.js";

const content = document.getElementById("content");
const params = new URLSearchParams(location.search);
const id = params.get("gen");

if (!id) {
  showError("No generator specified. Pick one from the home page.");
} else {
  loadGenerator(id).catch((e) => {
    console.error(e);
    showError(`Generator "${id}" not found.`);
  });
}

async function loadGenerator(id) {
  const [config, templateHtml, styleCss] = await Promise.all([
    fetch(`${id}/config.json`).then((r) => { if (!r.ok) throw new Error("config.json"); return r.json(); }),
    fetch(`${id}/template.html`).then((r) => { if (!r.ok) throw new Error("template.html"); return r.text(); }),
    fetch(`${id}/style.css`).then((r) => { if (!r.ok) throw new Error("style.css"); return r.text(); })
  ]);
  renderUI(id, config, templateHtml, styleCss);
}

function renderUI(id, config, templateHtml, styleCss) {
  content.innerHTML = "";

  const h1 = document.createElement("h1");
  h1.textContent = config.title ?? id;
  content.appendChild(h1);

  if (config.blurb) {
    const p = document.createElement("p");
    p.textContent = config.blurb;
    content.appendChild(p);
  }

  const settingsHeading = document.createElement("h2");
  settingsHeading.textContent = "Settings";
  content.appendChild(settingsHeading);

  const formHost = document.createElement("div");
  content.appendChild(formHost);

  const previewHeading = document.createElement("h2");
  previewHeading.textContent = "Preview";
  content.appendChild(previewHeading);

  const widthWrap = document.createElement("div");
  widthWrap.className = "preview-width range-wrap";
  const widthLabel = document.createElement("span");
  widthLabel.className = "preview-width-label";
  widthLabel.textContent = "Width";
  const widthSlider = document.createElement("input");
  widthSlider.type = "range";
  widthSlider.min = 280;
  widthSlider.max = 1024;
  widthSlider.step = 10;
  const savedWidth = storage.load("_preview-width");
  widthSlider.value = (savedWidth && typeof savedWidth.px === "number") ? savedWidth.px : 900;
  const widthDisplay = document.createElement("span");
  widthDisplay.className = "range-value";
  widthDisplay.textContent = widthSlider.value + "px";
  widthWrap.appendChild(widthLabel);
  widthWrap.appendChild(widthSlider);
  widthWrap.appendChild(widthDisplay);
  content.appendChild(widthWrap);

  const iframe = document.createElement("iframe");
  iframe.className = "preview";
  iframe.setAttribute("sandbox", "allow-same-origin");
  iframe.style.width = widthSlider.value + "px";
  content.appendChild(iframe);

  widthSlider.addEventListener("input", () => {
    widthDisplay.textContent = widthSlider.value + "px";
    iframe.style.width = widthSlider.value + "px";
    storage.save("_preview-width", { px: Number(widthSlider.value) });
  });

  const htmlBox = makeOutputBox("HTML (paste into chapter body)");
  content.appendChild(htmlBox.wrap);

  const cssBox = makeOutputBox("CSS (paste into Work Skin)");
  content.appendChild(cssBox.wrap);

  const resetLink = document.createElement("a");
  resetLink.href = "#";
  resetLink.className = "reset-link";
  resetLink.textContent = "Reset to defaults";
  content.appendChild(resetLink);

  const defaults = defaultsFromFields(config.fields ?? []);
  const stored = storage.load(id);
  const initial = stored ? { ...defaults, ...stored } : defaults;

  let debounceTimer = null;
  const form = buildForm(config.fields ?? [], initial, (data) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => updateAll(data), 100);
  });
  formHost.appendChild(form.element);

  function updateAll(data) {
    const htmlOut = render(templateHtml, data);
    const cssOut = renderRaw(styleCss, data);
    updatePreview(iframe, htmlOut, cssOut);
    htmlBox.textarea.value = htmlOut;
    cssBox.textarea.value = cssOut;
    autosizeTextarea(htmlBox.textarea);
    autosizeTextarea(cssBox.textarea);
    storage.save(id, data);
  }

  attachCopyButton(htmlBox.button, () => htmlBox.textarea.value);
  attachCopyButton(cssBox.button, () => cssBox.textarea.value);

  resetLink.addEventListener("click", (e) => {
    e.preventDefault();
    storage.clear(id);
    form.setData(defaultsFromFields(config.fields ?? []));
  });

  updateAll(form.getData());
}

function makeOutputBox(headingText) {
  const wrap = document.createElement("div");

  const h2 = document.createElement("h2");
  h2.textContent = headingText;
  wrap.appendChild(h2);

  const box = document.createElement("div");
  box.className = "output-box";

  const textarea = document.createElement("textarea");
  textarea.readOnly = true;
  box.appendChild(textarea);

  const button = document.createElement("button");
  button.className = "copy-btn";
  button.type = "button";
  button.textContent = "Copy";
  box.appendChild(button);

  wrap.appendChild(box);
  return { wrap, textarea, button };
}

function autosizeTextarea(ta) {
  ta.style.height = "auto";
  const border = ta.offsetHeight - ta.clientHeight;
  ta.style.height = (ta.scrollHeight + border) + "px";
}

function showError(msg) {
  content.innerHTML = "";
  const div = document.createElement("div");
  div.className = "error";
  div.textContent = msg;
  content.appendChild(div);
}
