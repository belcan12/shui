const BASE = import.meta.env.VITE_API_BASE_URL;
console.log("[Shui] API BASE =", BASE);

async function handle(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function fetchMessages({ username = "", sort = "desc" } = {}) {
  const url = new URL(`/messages`, BASE);
  if (username) url.searchParams.set("username", username);
  if (sort) url.searchParams.set("sort", sort);
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  return handle(res);
}

export async function createMessage({ username, text }) {
  const res = await fetch(`${BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, text }),
  });
  return handle(res);
}

export async function updateMessage(id, { text }) {
  const res = await fetch(`${BASE}/messages/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return handle(res);
}
