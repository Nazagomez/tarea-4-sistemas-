"use strict";

const { neon } = require("@neondatabase/serverless");
const {
  resolveInsertId,
  sortById,
  normalizeBook,
  normalizeAuthor,
  normalizePublisher,
  mapBook,
  mapAuthor,
  mapPublisher
} = require("./records");

/**
 * @returns {ReturnType<typeof neon>}
 */
function getSql() {
  return neon(process.env.DATABASE_URL);
}

/**
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
async function listBooks() {
  const rows = await getSql()`SELECT * FROM books`;
  return sortById(rows.map(mapBook));
}

/**
 * @param {string | number} id
 * @returns {Promise<Record<string, unknown> | null>}
 */
async function findBook(id) {
  const rows = await getSql()`SELECT * FROM books WHERE id = ${String(id)}`;
  return rows[0] ? mapBook(rows[0]) : null;
}

/**
 * @param {Record<string, unknown>} body
 * @returns {Promise<Record<string, unknown>>}
 */
async function insertBook(body) {
  const sql = getSql();
  const existing = await sql`SELECT id FROM books`;
  const row = normalizeBook(body, resolveInsertId(existing, body.id));
  await sql`INSERT INTO books (id, title, edition, copyright, language, pages, author, author_id, publisher, publisher_id)
    VALUES (${row.id}, ${row.title}, ${row.edition}, ${row.copyright}, ${row.language}, ${row.pages}, ${row.author}, ${row.author_id}, ${row.publisher}, ${row.publisher_id})`;
  return row;
}

/**
 * @param {string | number} id
 * @param {Record<string, unknown>} body
 * @returns {Promise<Record<string, unknown>>}
 */
async function updateBook(id, body) {
  const row = normalizeBook(body, id);
  const updated = await getSql()`UPDATE books SET title = ${row.title}, edition = ${row.edition}, copyright = ${row.copyright},
    language = ${row.language}, pages = ${row.pages}, author = ${row.author}, author_id = ${row.author_id},
    publisher = ${row.publisher}, publisher_id = ${row.publisher_id}
    WHERE id = ${row.id} RETURNING id`;
  if (updated.length === 0) throw new Error("Book not found");
  return row;
}

/**
 * @param {string | number} id
 * @returns {Promise<void>}
 */
async function deleteBook(id) {
  await getSql()`DELETE FROM books WHERE id = ${String(id)}`;
}

/**
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
async function listAuthors() {
  const rows = await getSql()`SELECT * FROM authors`;
  return sortById(rows.map(mapAuthor));
}

/**
 * @param {string | number} id
 * @returns {Promise<Record<string, unknown> | null>}
 */
async function findAuthor(id) {
  const rows = await getSql()`SELECT * FROM authors WHERE id = ${String(id)}`;
  return rows[0] ? mapAuthor(rows[0]) : null;
}

/**
 * @param {Record<string, unknown>} body
 * @returns {Promise<Record<string, unknown>>}
 */
async function insertAuthor(body) {
  const sql = getSql();
  const existing = await sql`SELECT id FROM authors`;
  const row = normalizeAuthor(body, resolveInsertId(existing, body.id));
  await sql`INSERT INTO authors (id, author, nationality, birth_year, fields, books)
    VALUES (${row.id}, ${row.author}, ${row.nationality}, ${row.birth_year}, ${row.fields}, ${JSON.stringify(row.books)})`;
  return row;
}

/**
 * @param {string | number} id
 * @param {Record<string, unknown>} body
 * @returns {Promise<Record<string, unknown>>}
 */
async function updateAuthor(id, body) {
  const row = normalizeAuthor(body, id);
  const updated = await getSql()`UPDATE authors SET author = ${row.author}, nationality = ${row.nationality},
    birth_year = ${row.birth_year}, fields = ${row.fields}, books = ${JSON.stringify(row.books)}
    WHERE id = ${row.id} RETURNING id`;
  if (updated.length === 0) throw new Error("Author not found");
  return row;
}

/**
 * @param {string | number} id
 * @returns {Promise<void>}
 */
async function deleteAuthor(id) {
  await getSql()`DELETE FROM authors WHERE id = ${String(id)}`;
}

/**
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
async function listPublishers() {
  const rows = await getSql()`SELECT * FROM publishers`;
  return sortById(rows.map(mapPublisher));
}

/**
 * @param {string | number} id
 * @returns {Promise<Record<string, unknown> | null>}
 */
async function findPublisher(id) {
  const rows = await getSql()`SELECT * FROM publishers WHERE id = ${String(id)}`;
  return rows[0] ? mapPublisher(rows[0]) : null;
}

/**
 * @param {Record<string, unknown>} body
 * @returns {Promise<Record<string, unknown>>}
 */
async function insertPublisher(body) {
  const sql = getSql();
  const existing = await sql`SELECT id FROM publishers`;
  const row = normalizePublisher(body, resolveInsertId(existing, body.id));
  await sql`INSERT INTO publishers (id, publisher, country, founded, genere, books)
    VALUES (${row.id}, ${row.publisher}, ${row.country}, ${row.founded}, ${row.genere}, ${JSON.stringify(row.books)})`;
  return row;
}

/**
 * @param {string | number} id
 * @param {Record<string, unknown>} body
 * @returns {Promise<Record<string, unknown>>}
 */
async function updatePublisher(id, body) {
  const row = normalizePublisher(body, id);
  const updated = await getSql()`UPDATE publishers SET publisher = ${row.publisher}, country = ${row.country},
    founded = ${row.founded}, genere = ${row.genere}, books = ${JSON.stringify(row.books)}
    WHERE id = ${row.id} RETURNING id`;
  if (updated.length === 0) throw new Error("Publisher not found");
  return row;
}

/**
 * @param {string | number} id
 * @returns {Promise<void>}
 */
async function deletePublisher(id) {
  await getSql()`DELETE FROM publishers WHERE id = ${String(id)}`;
}

module.exports = {
  listBooks,
  findBook,
  insertBook,
  updateBook,
  deleteBook,
  listAuthors,
  findAuthor,
  insertAuthor,
  updateAuthor,
  deleteAuthor,
  listPublishers,
  findPublisher,
  insertPublisher,
  updatePublisher,
  deletePublisher
};
