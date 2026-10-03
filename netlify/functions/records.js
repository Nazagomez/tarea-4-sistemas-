"use strict";

/**
 * @param {unknown} value
 * @param {string} fieldName
 * @returns {string}
 */
function requireText(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(fieldName + " is required");
  }
  return value.trim();
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function readText(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

/**
 * @param {unknown} value
 * @returns {number | null}
 */
function readInteger(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  if (!Number.isInteger(number)) {
    throw new Error("Expected an integer value");
  }
  return number;
}

/**
 * @param {unknown} value
 * @returns {Array<{ book_id: number, title: string }>}
 */
function readBookList(value) {
  if (value === undefined || value === null || value === "") return [];
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(parsed)) {
    throw new Error("books must be an array");
  }
  return parsed.map((book) => ({
    book_id: Number(book.book_id),
    title: readText(book.title)
  }));
}

/**
 * @param {Array<{ id: string | number }>} rows
 * @returns {number}
 */
function nextNumericId(rows) {
  return rows.reduce((highest, row) => Math.max(highest, parseInt(row.id, 10) || 0), 0) + 1;
}

/**
 * @param {Array<{ id: string | number }>} rows
 * @param {unknown} requestedId
 * @returns {number}
 */
function resolveInsertId(rows, requestedId) {
  if (requestedId === undefined || requestedId === null || requestedId === "") {
    return nextNumericId(rows);
  }
  const id = parseInt(requestedId, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("id must be a positive integer");
  }
  const exists = rows.some((row) => String(row.id) === String(id));
  if (exists) {
    throw new Error("id already exists");
  }
  return id;
}

/**
 * @param {Array<{ id: string | number }>} rows
 * @returns {Array<{ id: string | number }>}
 */
function sortById(rows) {
  return [...rows].sort((left, right) => Number(left.id) - Number(right.id));
}

/**
 * @param {Record<string, unknown>} body
 * @param {string | number} id
 * @returns {Record<string, unknown>}
 */
function normalizeBook(body, id) {
  return {
    id: String(id),
    title: requireText(body.title, "title"),
    edition: readText(body.edition),
    copyright: readInteger(body.copyright),
    language: readText(body.language),
    pages: readInteger(body.pages),
    author: readText(body.author),
    author_id: readInteger(body.author_id),
    publisher: readText(body.publisher),
    publisher_id: readInteger(body.publisher_id)
  };
}

/**
 * @param {Record<string, unknown>} body
 * @param {string | number} id
 * @returns {Record<string, unknown>}
 */
function normalizeAuthor(body, id) {
  return {
    id: String(id),
    author: requireText(body.author, "author"),
    nationality: readText(body.nationality),
    birth_year: readInteger(body.birth_year),
    fields: readText(body.fields),
    books: readBookList(body.books)
  };
}

/**
 * @param {Record<string, unknown>} body
 * @param {string | number} id
 * @returns {Record<string, unknown>}
 */
function normalizePublisher(body, id) {
  return {
    id: String(id),
    publisher: requireText(body.publisher, "publisher"),
    country: readText(body.country),
    founded: readInteger(body.founded),
    genere: readText(body.genere),
    books: readBookList(body.books)
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {Record<string, unknown>}
 */
function mapAuthor(row) {
  return {
    id: String(row.id),
    author: row.author,
    nationality: row.nationality,
    birth_year: row.birth_year === null ? null : Number(row.birth_year),
    fields: row.fields,
    books: readBookList(row.books)
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {Record<string, unknown>}
 */
function mapPublisher(row) {
  return {
    id: String(row.id),
    publisher: row.publisher,
    country: row.country,
    founded: row.founded === null ? null : Number(row.founded),
    genere: row.genere,
    books: readBookList(row.books)
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {Record<string, unknown>}
 */
function mapBook(row) {
  return {
    id: String(row.id),
    title: row.title,
    edition: row.edition,
    copyright: row.copyright === null ? null : Number(row.copyright),
    language: row.language,
    pages: row.pages === null ? null : Number(row.pages),
    author: row.author,
    author_id: row.author_id === null ? null : Number(row.author_id),
    publisher: row.publisher,
    publisher_id: row.publisher_id === null ? null : Number(row.publisher_id)
  };
}

module.exports = {
  resolveInsertId,
  sortById,
  normalizeBook,
  normalizeAuthor,
  normalizePublisher,
  mapAuthor,
  mapPublisher,
  mapBook
};
