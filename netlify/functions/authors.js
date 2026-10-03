"use strict";

const db = require("./db");
const { assertMethod, readOptionalId, optionsResponse, jsonResponse, failResponse } = require("./http");

/**
 * Returns the current authors from the database.
 * @param {{ httpMethod?: string, path?: string }} event
 * @returns {Promise<{ statusCode: number, headers: Record<string, string>, body: string }>}
 */
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  try {
    assertMethod(event, "GET");
    const id = readOptionalId(event, "authors");
    if (!id) return jsonResponse(await db.listAuthors());
    const author = await db.findAuthor(id);
    if (!author) return jsonResponse({ message: "Author not found" }, 404);
    return jsonResponse(author);
  } catch (error) {
    return failResponse(error);
  }
};
