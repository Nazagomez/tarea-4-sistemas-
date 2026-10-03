"use strict";

const db = require("./db");
const { assertMethod, readOptionalId, optionsResponse, jsonResponse, failResponse } = require("./http");

/**
 * Returns the current publishers from the database.
 * @param {{ httpMethod?: string, path?: string }} event
 * @returns {Promise<{ statusCode: number, headers: Record<string, string>, body: string }>}
 */
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  try {
    assertMethod(event, "GET");
    const id = readOptionalId(event, "publishers");
    if (!id) return jsonResponse(await db.listPublishers());
    const publisher = await db.findPublisher(id);
    if (!publisher) return jsonResponse({ message: "Publisher not found" }, 404);
    return jsonResponse(publisher);
  } catch (error) {
    return failResponse(error);
  }
};
