"use strict";

const db = require("./db");
const { assertMethod, readJsonBody, optionsResponse, okResponse, failResponse } = require("./http");

/**
 * Applies a queued publisher insert to the database.
 * @param {{ httpMethod?: string, body?: string }} event
 * @returns {Promise<{ statusCode: number, headers: Record<string, string>, body: string }>}
 */
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  try {
    assertMethod(event, "POST");
    await db.insertPublisher(readJsonBody(event));
    return okResponse();
  } catch (error) {
    return failResponse(error);
  }
};
