"use strict";

const operations = [
  "listBooks", "findBook", "insertBook", "updateBook", "deleteBook",
  "listAuthors", "findAuthor", "insertAuthor", "updateAuthor", "deleteAuthor",
  "listPublishers", "findPublisher", "insertPublisher", "updatePublisher", "deletePublisher"
];

/**
 * @returns {Record<string, Function>}
 */
function repository() {
  if (process.env.DATABASE_URL) return require("./sql-store");
  if (process.env.USE_FILE_STORE === "true") return require("./file-store");
  throw new Error("DATABASE_URL is not configured");
}

const db = {};
for (const name of operations) {
  db[name] = (...args) => repository()[name](...args);
}

module.exports = db;
