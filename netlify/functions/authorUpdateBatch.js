"use strict";

const db = require("./db");
const { assertMethod, readJsonBody, readPathId, optionsResponse, okResponse, failResponse } = require("./http");

/**
 * Applies a queued author update to the database.
 * @param {{ httpMethod?: string, path?: string, body?: string }} event
 * @returns {Promise<{ statusCode: number, headers: Record<string, string>, body: string }>}
 */
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  try {
    assertMethod(event, "PUT");
    await db.updateAuthor(readPathId(event), readJsonBody(event));
    return okResponse();
  } catch (error) {
    return failResponse(error);
  }
};
