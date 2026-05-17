const KEY = (id) => `ao3gen:${id}`;

export function load(id) {
  try {
    const raw = localStorage.getItem(KEY(id));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function save(id, data) {
  try { localStorage.setItem(KEY(id), JSON.stringify(data)); }
  catch {}
}

export function clear(id) {
  try { localStorage.removeItem(KEY(id)); }
  catch {}
}
