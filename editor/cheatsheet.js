(function(AO3) {

const CATEGORIES = [
  {
    title: "Layout & box model",
    props: ["display","position","top","right","bottom","left","float","clear",
            "width","height","min-width","min-height","max-width","max-height",
            "margin-top","margin-right","margin-bottom","margin-left",
            "padding-top","padding-right","padding-bottom","padding-left",
            "box-sizing","overflow","overflow-x","overflow-y","overflow-wrap",
            "z-index","visibility","clip","vertical-align"],
  },
  {
    title: "Color & background",
    props: ["color","opacity","background-color","background-image",
            "background-position","background-repeat","background-attachment",
            "background-size"],
  },
  {
    title: "Borders",
    props: ["border-color","border-style","border-width","border-collapse","border-spacing",
            "border-top-color","border-top-style","border-top-width",
            "border-right-color","border-right-style","border-right-width",
            "border-bottom-color","border-bottom-style","border-bottom-width",
            "border-left-color","border-left-style","border-left-width",
            "border-radius","border-top-left-radius","border-top-right-radius",
            "border-bottom-left-radius","border-bottom-right-radius"],
  },
  {
    title: "Text & fonts",
    props: ["font-family","font-size","font-weight","font-style","font-variant",
            "font-stretch","line-height","letter-spacing","word-spacing","word-wrap",
            "text-align","text-decoration","text-indent","text-transform","text-shadow",
            "text-wrap","white-space","direction","unicode-bidi"],
  },
  {
    title: "Lists",
    props: ["list-style-type","list-style-position","list-style-image"],
  },
  {
    title: "Tables",
    props: ["caption-side","empty-cells","table-layout"],
  },
  {
    title: "Effects",
    props: ["box-shadow","filter","transform","transform-origin",
            "transition","transition-delay","transition-duration","transition-property","transition-timing-function"],
  },
  {
    title: "Misc",
    props: ["cursor","content","counter-increment","counter-reset","quotes",
            "outline-color","outline-style","outline-width","widows","orphans",
            "page-break-after","page-break-before","page-break-inside"],
  },
];

const HTML_TAGS = [
  "a","abbr","acronym","address","b","big","blockquote","br","caption","center",
  "cite","code","col","colgroup","dd","del","dfn","div","dl","dt","em","figcaption",
  "figure","h1","h2","h3","h4","h5","h6","hr","i","img","ins","kbd","li","ol","p",
  "pre","q","s","samp","small","span","strike","strong","sub","sup","table","tbody",
  "td","tfoot","th","thead","tr","tt","u","ul","var",
];

function open() {
  const modal = document.getElementById("cheatsheet-modal");
  modal.classList.add("open");
  if (modal.dataset.rendered !== "yes") {
    render(modal.querySelector(".cheatsheet-body"));
    modal.dataset.rendered = "yes";
  }
}

function close() {
  document.getElementById("cheatsheet-modal").classList.remove("open");
}

function render(root) {
  root.innerHTML = "";

  for (const cat of CATEGORIES) {
    appendSection(root, cat.title, body => {
      body.appendChild(propList(cat.props, "css"));
    });
  }

  appendSection(root, "Shorthand families", body => {
    const help = document.createElement("div");
    help.className = "cs-help";
    help.innerHTML = "A property passes if its name contains one of these. <code>border-radius</code> passes because it contains <code>border</code>.";
    body.appendChild(help);
    body.appendChild(propList(AO3.SUPPORTED_CSS_SHORTHAND_PROPERTIES, null));
  });

  appendSection(root, "HTML tags", body => {
    body.appendChild(propList(HTML_TAGS, "html"));
  });
}

function appendSection(root, title, fill) {
  const el = document.createElement("section");
  el.className = "cs-section";
  const h3 = document.createElement("h3");
  h3.textContent = title;
  const body = document.createElement("div");
  body.className = "cs-section-body";
  el.appendChild(h3);
  el.appendChild(body);
  fill(body);
  root.appendChild(el);
}

function propList(items, insertInto) {
  const list = document.createElement("div");
  list.className = "cs-props";
  for (const p of items) {
    const chip = document.createElement("code");
    chip.textContent = p;
    if (insertInto === "css") {
      chip.title = "Click to insert into CSS pane";
      chip.classList.add("cs-clickable");
      chip.addEventListener("click", () => {
        const cm = window._editor.cmCss;
        cm.replaceSelection(p + ": ");
        cm.focus();
        close();
      });
    } else if (insertInto === "html") {
      chip.title = "Click to insert into HTML pane";
      chip.classList.add("cs-clickable");
      chip.addEventListener("click", () => {
        const cm = window._editor.cmHtml;
        const snippet = SELF_CLOSING_TAGS.has(p) ? `<${p}>` : `<${p}></${p}>`;
        cm.replaceSelection(snippet);
        cm.focus();
        close();
      });
    }
    list.appendChild(chip);
  }
  return list;
}

const SELF_CLOSING_TAGS = new Set(["br","hr","img","col"]);

AO3.openCheatsheet = open;
AO3.closeCheatsheet = close;

})(window.AO3);
