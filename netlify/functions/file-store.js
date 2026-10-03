"use strict";

const fs = require("fs");
const path = require("path");
const seed = require("./seed");
const {
  resolveInsertId,
  sortById,
  normalizeBook,
  normalizeAuthor,
  normalizePublisher
} = require("./records");

/**
 * @returns {string}
 */
function storeFilePath() {
  return process.env.STORE_PATH || path.join(__dirname, "../../data/store.json");
}

/**
 * @returns {{ books: Array<Record<string, unknown>>, authors: Array<Record<string, unknown>>, publishers: Array<Record<string, unknown>> }}
 */
function readStore() {
  const filePath = storeFilePath();
  if (!fs.existsSync(filePath)) return structuredClone(seed);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * @param {{ books: unknown[], authors: unknown[], publishers: unknown[] }} store
 * @returns {void}
 */
function writeStore(store) {
  const filePath = storeFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
}

/**
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
async function listBooks() {
  return sortById(readStore().books);
}

/**
 * @param {string | number} id
 * @returns {Promise<Record<string, unknown> | null>}
 */
async function findBook(id) {
  return readStore().books.find((row) => String(row.id) === String(id)) || null;
}

/**
 * @param {Record<string, unknown>} body
 * @returns {Promise<Record<string, unknown>>}
 */
async function insertBook(body) {
  const store = readStore();
  const row = normalizeBook(body, resolveInsertId(store.books, body.id));
  store.books.push(row);
  writeStore(store);
  return row;
}

/**
 * @param {string | number} id
 * @param {Record<string, unknown>} body
 * @returns {Promise<Record<string, unknown>>}
 */
async function updateBook(id, body) {
  const store = readStore();
  const index = store.books.findIndex((row) => String(row.id) === String(id));
  if (index < 0) throw new Error("Book not found");
  const row = normalizeBook(body, id);
  store.books[index] = row;
  writeStore(store);
  return row;
}

/**
 * @param {string | number} id
 * @returns {Promise<void>}
 */
async function deleteBook(id) {
  const store = readStore();
  store.books = store.books.filter((row) => String(row.id) !== String(id));
  writeStore(store);
}

/**
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
async function listAuthors() {
  return sortById(readStore().authors);
}

/**
 * @param {string | number} id
 * @returns {Promise<Record<string, unknown> | null>}
 */
async function findAuthor(id) {
  return readStore().authors.find((row) => String(row.id) === String(id)) || null;
}

/**
 * @param {Record<string, unknown>} body
 * @returns {Promise<Record<string, unknown>>}
 */
async function insertAuthor(body) {
  const store = readStore();
  const row = normalizeAuthor(body, resolveInsertId(store.authors, body.id));
  store.authors.push(row);
  writeStore(store);
  return row;
}

/**
 * @param {string | number} id
 * @param {Record<string, unknown>} body
 * @returns {Promise<Record<string, unknown>>}
 */
async function updateAuthor(id, body) {
  const store = readStore();
  const index = store.authors.findIndex((row) => String(row.id) === String(id));
  if (index < 0) throw new Error("Author not found");
  const row = normalizeAuthor(body, id);
  store.authors[index] = row;
  writeStore(store);
  return row;
}

/**
 * @param {string | number} id
 * @returns {Promise<void>}
 */
async function deleteAuthor(id) {
  const store = readStore();
  store.authors = store.authors.filter((row) => String(row.id) !== String(id));
  writeStore(store);
}

/**
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
async function listPublishers() {
  return sortById(readStore().publishers);
}

/**
 * @param {string | number} id
 * @returns {Promise<Record<string, unknown> | null>}
 */
async function findPublisher(id) {
  return readStore().publishers.find((row) => String(row.id) === String(id)) || null;
}

/**
 * @param {Record<string, unknown>} body
 * @returns {Promise<Record<string, unknown>>}
 */
async function insertPublisher(body) {
  const store = readStore();
  const row = normalizePublisher(body, resolveInsertId(store.publishers, body.id));
  store.publishers.push(row);
  writeStore(store);
  return row;
}

/**
 * @param {string | number} id
 * @param {Record<string, unknown>} body
 * @returns {Promise<Record<string, unknown>>}
 */
async function updatePublisher(id, body) {
  const store = readStore();
  const index = store.publishers.findIndex((row) => String(row.id) === String(id));
  if (index < 0) throw new Error("Publisher not found");
  const row = normalizePublisher(body, id);
  store.publishers[index] = row;
  writeStore(store);
  return row;
}

/**
 * @param {string | number} id
 * @returns {Promise<void>}
 */
async function deletePublisher(id) {
  const store = readStore();
  store.publishers = store.publishers.filter((row) => String(row.id) !== String(id));
  writeStore(store);
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
