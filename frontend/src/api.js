const apiBase = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

/**
 * @param {string} name
 * @returns {string}
 */
function functionUrl(name) {
  return apiBase + "/.netlify/functions/" + name;
}

export const endpoints = {
  books: functionUrl("books"),
  bookInsert: functionUrl("bookInsert"),
  bookUpdate: (id) => functionUrl("bookUpdate/" + id),
  bookDelete: (id) => functionUrl("bookDelete/" + id),
  bookTasks: functionUrl("bookTasks"),
  authors: functionUrl("authors"),
  authorInsert: functionUrl("authorInsert"),
  authorUpdate: (id) => functionUrl("authorUpdate/" + id),
  authorDelete: (id) => functionUrl("authorDelete/" + id),
  authorTasks: functionUrl("authorTasks"),
  publishers: functionUrl("publishers"),
  publisherInsert: functionUrl("publisherInsert"),
  publisherUpdate: (id) => functionUrl("publisherUpdate/" + id),
  publisherDelete: (id) => functionUrl("publisherDelete/" + id),
  publisherTasks: functionUrl("publisherTasks")
};

/**
 * @param {Response} response
 * @returns {Promise<string>}
 */
async function readError(response) {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text);
    return parsed.message || text;
  } catch {
    return text || response.statusText;
  }
}

/**
 * @param {string} url
 * @returns {Promise<unknown>}
 */
export async function readJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

/**
 * @param {string} url
 * @param {string} method
 * @param {Record<string, unknown>} [body]
 * @returns {Promise<void>}
 */
export async function enqueue(url, method, body) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  if (!response.ok) throw new Error(await readError(response));
}

/**
 * @param {string} url
 * @returns {Promise<void>}
 */
export async function runTasks(url) {
  const response = await fetch(url, { method: "POST" });
  if (!response.ok) throw new Error(await readError(response));
}
