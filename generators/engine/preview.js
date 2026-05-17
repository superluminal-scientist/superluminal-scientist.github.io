export function updatePreview(iframe, html, css) {
  iframe.srcdoc =
    `<!doctype html><html><head>` +
    `<meta charset="utf-8">` +
    `<style>${css}</style>` +
    `</head><body><div id="workskin">${html}</div></body></html>`;
}
