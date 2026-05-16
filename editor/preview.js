(function(AO3) {
const { cleanHtml, cleanCss, applyWorkskinPrefix, enrichAll } = AO3;

function renderPreview({ html, css, siteSkinCss, iframe }) {
  const { cleanedHtml, rejections: htmlRej } = cleanHtml(html);
  const { cleanedCss,  rejections: cssRej  } = cleanCss(css);
  const prefixedCss = applyWorkskinPrefix(cleanedCss);
  const baseCss = window.AO3_DEFAULT_SITESKIN || "";
  const siteSkinStyle = siteSkinCss ? `<style>${siteSkinCss}</style>` : "";

  const doc = `<!doctype html>
<html><head><meta charset="utf-8">
<style>${baseCss}</style>
${siteSkinStyle}
<style>${prefixedCss}</style>
</head><body><div id="workskin"><div class="userstuff">${cleanedHtml}</div></div></body></html>`;

  iframe.srcdoc = doc;

  return {
    htmlRejections: enrichAll(htmlRej),
    cssRejections:  enrichAll(cssRej),
  };
}

AO3.renderPreview = renderPreview;

})(window.AO3);
