"use strict";

const db = require("./db");
const { assertMethod, readPathId, optionsResponse, okResponse, failResponse } = require("./http");

/**
 * Applies a queued publisher delete to the database.
 * @param {{ httpMethod?: string, path?: string }} event
 * @returns {Promise<{ statusCode: number, headers: Record<string, string>, body: string }>}
 */
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  try {
    assertMethod(event, "DELETE");
    await db.deletePublisher(readPathId(event));
    return okResponse();
  } catch (error) {
    return failResponse(error);
  }
};
