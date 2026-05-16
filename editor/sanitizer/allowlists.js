window.AO3 = window.AO3 || {};
(function(AO3) {

const SUPPORTED_CSS_PROPERTIES = [
  "azimuth","background-attachment","background-color","background-image","background-position","background-repeat","background-size",
  "border-collapse","border-color","border-spacing","border-style","border-width",
  "border-top-color","border-top-style","border-top-width","border-right-color","border-right-style","border-right-width",
  "border-bottom-color","border-bottom-style","border-bottom-width","border-left-color","border-left-style","border-left-width",
  "border-radius","border-top-left-radius","border-top-right-radius","border-bottom-left-radius","border-bottom-right-radius",
  "bottom","box-shadow","box-sizing","caption-side","clear","clip","color","content","counter-increment","counter-reset",
  "cue-after","cue-before","cursor","direction","display","elevation","empty-cells",
  "filter","float","font-family","font-size","font-stretch","font-style","font-variant","font-weight",
  "height","left","letter-spacing","line-height","list-style-image","list-style-position","list-style-type",
  "margin-bottom","margin-left","margin-right","margin-top","max-height","max-width","min-height","min-width",
  "opacity","orphans","outline-color","outline-style","outline-width",
  "overflow","overflow-x","overflow-y","overflow-wrap",
  "padding-bottom","padding-left","padding-right","padding-top",
  "page-break-after","page-break-before","page-break-inside",
  "pause-after","pause-before","pitch","pitch-range","play-during","position",
  "quotes","right","richness","speak","speak-header","speak-numeral","speak-punctuation","speech-rate","stress",
  "table-layout","text-align","text-decoration","text-indent","text-shadow","text-transform","text-wrap",
  "top","transform","transform-origin","transition","transition-delay","transition-duration","transition-property","transition-timing-function",
  "unicode-bidi","vertical-align","visibility","voice-family","volume","white-space","widows","width","word-spacing","word-wrap","z-index",
];

const SUPPORTED_CSS_SHORTHAND_PROPERTIES = [
  "background","border","column","cue","flex","font","layer-background","layout-grid",
  "list-style","margin","marker","outline","overflow","padding","page-break","pause",
  "scrollbar","text","transform","transition",
];

const ALLOWED_TAGS = new Set([
  "a","abbr","acronym","address","b","big","blockquote","br","caption","center",
  "cite","code","col","colgroup","dd","del","dfn","div","dl","dt","em","figcaption",
  "figure","h1","h2","h3","h4","h5","h6","hr","i","img","ins","kbd","li","ol","p",
  "pre","q","s","samp","small","span","strike","strong","sub","sup","table","tbody",
  "td","tfoot","th","thead","tr","tt","u","ul","var",
]);

const GLOBAL_ATTRS = new Set([
  "class","id","title","dir","lang","style",
]);

function withGlobal(...extras) {
  const s = new Set(GLOBAL_ATTRS);
  for (const a of extras) s.add(a);
  return s;
}

const ALLOWED_ATTRS = {
  a:           withGlobal("href","hreflang","name","rel"),
  abbr:        withGlobal(),
  acronym:     withGlobal(),
  blockquote:  withGlobal("cite"),
  col:         withGlobal("span","width","align","valign"),
  colgroup:    withGlobal("span","width","align","valign"),
  del:         withGlobal("cite","datetime"),
  img:         withGlobal("alt","src","height","width"),
  ins:         withGlobal("cite","datetime"),
  q:           withGlobal("cite"),
  table:       withGlobal("border","cellpadding","cellspacing","summary"),
  td:          withGlobal("abbr","colspan","headers","rowspan","scope","align","valign"),
  th:          withGlobal("abbr","colspan","headers","rowspan","scope","align","valign"),
  tr:          withGlobal("align","valign"),
};

for (const tag of ALLOWED_TAGS) {
  if (!(tag in ALLOWED_ATTRS)) {
    ALLOWED_ATTRS[tag] = withGlobal();
  }
}

const HTML_GLOBAL_ATTR_FLOOR = ["class", "id", "style", "lang"];

const LIVE = {
  cssProps: SUPPORTED_CSS_PROPERTIES.slice(),
  cssShorthands: SUPPORTED_CSS_SHORTHAND_PROPERTIES.slice(),
  htmlTags: new Set(ALLOWED_TAGS),
  htmlAttrs: cloneAttrMap(ALLOWED_ATTRS),
};

function cloneAttrMap(map) {
  const out = {};
  for (const k of Object.keys(map)) out[k] = new Set(map[k]);
  return out;
}

function setLiveCssLists({ props, shorthands }) {
  if (Array.isArray(props) && props.length > 0) LIVE.cssProps = props;
  if (Array.isArray(shorthands) && shorthands.length > 0) LIVE.cssShorthands = shorthands;
}

function setLiveHtmlLists({ tags, globalAttrs, perTagAttrs }) {
  if (!Array.isArray(tags) || tags.length === 0) return;
  const globals = new Set([...(globalAttrs || []), ...HTML_GLOBAL_ATTR_FLOOR]);
  const perTag = perTagAttrs || {};
  const newTags = new Set(tags);
  const newAttrs = {};
  for (const tag of newTags) {
    const set = new Set(globals);
    const extras = perTag[tag];
    if (Array.isArray(extras)) for (const a of extras) set.add(a);
    newAttrs[tag] = set;
  }
  LIVE.htmlTags = newTags;
  LIVE.htmlAttrs = newAttrs;
}

AO3.SUPPORTED_CSS_PROPERTIES = SUPPORTED_CSS_PROPERTIES;
AO3.SUPPORTED_CSS_SHORTHAND_PROPERTIES = SUPPORTED_CSS_SHORTHAND_PROPERTIES;
AO3.ALLOWED_TAGS = ALLOWED_TAGS;
AO3.ALLOWED_ATTRS = ALLOWED_ATTRS;
AO3.LIVE = LIVE;
AO3.setLiveCssLists = setLiveCssLists;
AO3.setLiveHtmlLists = setLiveHtmlLists;

})(window.AO3);
