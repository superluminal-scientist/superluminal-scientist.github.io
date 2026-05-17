export function defaultsFromFields(fields) {
  const data = {};
  for (const f of fields) data[f.name] = defaultForField(f);
  return data;
}

function defaultForField(f) {
  if ("default" in f) return clone(f.default);
  switch (f.type) {
    case "number": return 0;
    case "color":  return "#000000";
    case "select": {
      const first = f.options && f.options[0];
      if (first === undefined) return "";
      return (typeof first === "object") ? first.value : first;
    }
    case "list":   return [];
    case "range":  return f.min ?? 0;
    default:       return "";
  }
}

function clone(v) {
  if (v === null || typeof v !== "object") return v;
  return JSON.parse(JSON.stringify(v));
}

function defaultListItem(itemFields) {
  const item = {};
  for (const f of itemFields) item[f.name] = defaultForField(f);
  return item;
}

export function buildForm(fields, initialData, onChange) {
  let data = clone(initialData);

  const root = document.createElement("form");
  root.addEventListener("submit", (e) => e.preventDefault());

  function emit() {
    onChange(clone(data));
  }

  function rebuild() {
    root.innerHTML = "";
    for (const f of fields) root.appendChild(renderField(f, data, () => { emit(); }, rebuild));
  }

  rebuild();

  return {
    element: root,
    getData: () => clone(data),
    setData: (next) => { data = clone(next); rebuild(); emit(); }
  };
}

function renderField(field, parentData, onValueChange, onStructureChange) {
  const wrap = document.createElement("div");
  wrap.className = "field";

  if (field.type === "list") {
    const list = parentData[field.name] = Array.isArray(parentData[field.name]) ? parentData[field.name] : [];
    const label = document.createElement("label");
    label.textContent = field.label ?? field.name;
    wrap.appendChild(label);

    const container = document.createElement("div");
    container.className = "list-field";
    wrap.appendChild(container);

    list.forEach((item, idx) => {
      const itemBox = document.createElement("div");
      itemBox.className = "list-item";

      const header = document.createElement("div");
      header.className = "list-item-header";
      const title = document.createElement("span");
      title.className = "title";
      title.textContent = `${field.label ?? field.name} #${idx + 1}`;
      header.appendChild(title);

      const controls = document.createElement("span");
      const upBtn = button("↑", () => {
        if (idx === 0) return;
        [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
        onStructureChange();
        onValueChange();
      });
      const downBtn = button("↓", () => {
        if (idx === list.length - 1) return;
        [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
        onStructureChange();
        onValueChange();
      });
      const rmBtn = button("×", () => {
        list.splice(idx, 1);
        onStructureChange();
        onValueChange();
      });
      controls.appendChild(upBtn);
      controls.appendChild(downBtn);
      controls.appendChild(rmBtn);
      header.appendChild(controls);
      itemBox.appendChild(header);

      for (const subField of field.itemFields) {
        itemBox.appendChild(renderField(subField, item, onValueChange, onStructureChange));
      }
      container.appendChild(itemBox);
    });

    const addBtn = button(`+ Add ${field.label ?? field.name}`, () => {
      list.push(defaultListItem(field.itemFields));
      onStructureChange();
      onValueChange();
    });
    container.appendChild(addBtn);
    return wrap;
  }

  const label = document.createElement("label");
  label.textContent = field.label ?? field.name;
  wrap.appendChild(label);

  let input;
  if (field.type === "textarea") {
    input = document.createElement("textarea");
    input.value = parentData[field.name] ?? "";
    const autosize = () => {
      input.style.height = "auto";
      const border = input.offsetHeight - input.clientHeight;
      input.style.height = (input.scrollHeight + border) + "px";
    };
    input.addEventListener("input", () => {
      parentData[field.name] = input.value;
      autosize();
      onValueChange();
    });
    requestAnimationFrame(autosize);
  } else if (field.type === "select") {
    input = document.createElement("select");
    const opts = field.options ?? [];
    for (const opt of opts) {
      const o = document.createElement("option");
      if (typeof opt === "object") { o.value = opt.value; o.textContent = opt.label; }
      else { o.value = opt; o.textContent = opt; }
      input.appendChild(o);
    }
    const firstValue = opts[0] === undefined ? "" : (typeof opts[0] === "object" ? opts[0].value : opts[0]);
    input.value = parentData[field.name] ?? firstValue;
    input.addEventListener("change", () => { parentData[field.name] = input.value; onValueChange(); });
  } else if (field.type === "range") {
    input = document.createElement("div");
    input.className = "range-wrap";
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = field.min ?? 0;
    slider.max = field.max ?? 1;
    slider.step = field.step ?? 0.01;
    slider.value = parentData[field.name] ?? field.default ?? slider.min;
    const display = document.createElement("span");
    display.className = "range-value";
    display.textContent = slider.value;
    slider.addEventListener("input", () => {
      parentData[field.name] = Number(slider.value);
      display.textContent = slider.value;
      onValueChange();
    });
    input.appendChild(slider);
    input.appendChild(display);
  } else {
    input = document.createElement("input");
    input.type = (field.type === "number" || field.type === "color") ? field.type : "text";
    input.value = parentData[field.name] ?? (field.type === "number" ? 0 : field.type === "color" ? "#000000" : "");
    input.addEventListener("input", () => {
      parentData[field.name] = field.type === "number" ? Number(input.value) : input.value;
      onValueChange();
    });
  }
  wrap.appendChild(input);
  return wrap;
}

function button(text, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = text;
  b.addEventListener("click", onClick);
  return b;
}
