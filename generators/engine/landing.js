const listEl = document.getElementById("gen-list");

renderList().catch((e) => {
  console.error(e);
  listEl.innerHTML = '<li class="error">Failed to load registry.json</li>';
});

async function renderList() {
  const entries = await fetch("registry.json").then((r) => r.json());
  if (!Array.isArray(entries) || entries.length === 0) {
    listEl.innerHTML = "<li>No generators registered yet.</li>";
    return;
  }
  const probed = await Promise.all(entries.map(async (e) => {
    const ok = await fetch(`${e.id}/config.json`, { method: "HEAD" })
      .then((r) => r.ok).catch(() => false);
    return { ...e, available: ok };
  }));
  listEl.innerHTML = "";
  for (const e of probed) {
    listEl.appendChild(renderEntry(e));
  }
}

function renderEntry(e) {
  const li = document.createElement("li");
  if (!e.available) li.classList.add("disabled");
  const link = document.createElement(e.available ? "a" : "span");
  if (e.available) link.href = `generator.html?gen=${encodeURIComponent(e.id)}`;
  link.textContent = e.title ?? e.id;
  li.appendChild(link);
  if (e.blurb || !e.available) {
    const blurb = document.createElement("div");
    blurb.className = "blurb";
    blurb.textContent = e.available ? (e.blurb ?? "") : `${e.blurb ?? ""} (not yet built)`.trim();
    li.appendChild(blurb);
  }
  return li;
}
