(function(AO3) {
const { LIVE } = AO3;

function cleanHtml(src) {
  const rejections = [];
  const doc = new DOMParser().parseFromString(
    `<!doctype html><html><body>${src}</body></html>`,
    "text/html"
  );

  unwrapRedundantWrappers(doc.body);
  walk(doc.body, rejections);
  const cleanedHtml = doc.body.innerHTML;
  return { cleanedHtml, rejections };
}

function unwrapRedundantWrappers(body) {
  for (let i = 0; i < 3; i++) {
    if (body.children.length !== 1) return;
    const only = body.children[0];
    const tag = only.tagName.toLowerCase();
    const isRedundantWorkskin = tag === "div" && only.id === "workskin";
    const isRedundantBody = tag === "body";
    if (!isRedundantWorkskin && !isRedundantBody) return;
    body.replaceChildren(...only.childNodes);
  }
}

function walk(node, rejections) {
  const children = [...node.childNodes];
  for (const child of children) {
    if (child.nodeType === Node.COMMENT_NODE) continue;
    if (child.nodeType === Node.TEXT_NODE) continue;
    if (child.nodeType !== Node.ELEMENT_NODE) {
      child.remove();
      continue;
    }
    const tag = child.tagName.toLowerCase();
    if (!LIVE.htmlTags.has(tag)) {
      rejections.push({
        line: 0, col: 0, length: tag.length,
        original: tag,
        reason: `Tag <${tag}> is not allowed by AO3.`,
        kind: "tag",
      });
      child.remove();
      continue;
    }
    cleanAttributes(child, rejections);
    walk(child, rejections);
  }
}

function cleanAttributes(el, rejections) {
  const tag = el.tagName.toLowerCase();
  const allowed = LIVE.htmlAttrs[tag] || new Set();
  const toRemove = [];
  for (const attr of el.attributes) {
    const name = attr.name.toLowerCase();
    if (!allowed.has(name)) {
      rejections.push({
        line: 0, col: 0, length: name.length,
        original: `${tag}.${name}`,
        reason: `Attribute "${name}" not allowed on <${tag}>.`,
        kind: "attribute",
      });
      toRemove.push(attr.name);
      continue;
    }
    if ((name === "href" || name === "src") && /^\s*javascript:/i.test(attr.value)) {
      rejections.push({
        line: 0, col: 0, length: attr.value.length,
        original: attr.value,
        reason: `Disallowed URL scheme in ${name}.`,
        kind: "url-scheme",
      });
      toRemove.push(attr.name);
    }
  }
  for (const n of toRemove) el.removeAttribute(n);
}

AO3.cleanHtml = cleanHtml;

})(window.AO3);
