"use strict";

const db = require("./db");
const { assertMethod, readOptionalId, optionsResponse, jsonResponse, failResponse } = require("./http");

/**
 * Returns the current books from the database.
 * @param {{ httpMethod?: string, path?: string }} event
 * @returns {Promise<{ statusCode: number, headers: Record<string, string>, body: string }>}
 */
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  try {
    assertMethod(event, "GET");
    const id = readOptionalId(event, "books");
    if (!id) return jsonResponse(await db.listBooks());
    const book = await db.findBook(id);
    if (!book) return jsonResponse({ message: "Book not found" }, 404);
    return jsonResponse(book);
  } catch (error) {
    return failResponse(error);
  }
};
