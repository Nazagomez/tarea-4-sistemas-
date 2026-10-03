"use strict";

const headers = require("./headersCORS");

/**
 * @param {string} expected
 * @param {{ httpMethod?: string }} event
 * @returns {void}
 */
function assertMethod(event, expected) {
  if (event.httpMethod !== expected) {
    throw new Error(expected + " is required");
  }
}

/**
 * @param {{ body?: string | Record<string, unknown>, isBase64Encoded?: boolean }} event
 * @returns {Record<string, unknown>}
 */
function readJsonBody(event) {
  if (!event.body) return {};
  if (typeof event.body === "object") return event.body;
  const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
  return JSON.parse(raw);
}

/**
 * @param {{ path?: string }} event
 * @returns {number}
 */
function readPathId(event) {
  const segment = String(event.path || "").split("/").filter(Boolean).reverse()[0];
  const id = parseInt(segment, 10);
  if (!Number.isInteger(id)) {
    throw new Error("A numeric id is required");
  }
  return id;
}

/**
 * @param {{ path?: string }} event
 * @param {string} functionName
 * @returns {string | null}
 */
function readOptionalId(event, functionName) {
  const segment = String(event.path || "").split("/").filter(Boolean).reverse()[0];
  if (!segment || segment === functionName) return null;
  return segment;
}

/**
 * @returns {string}
 */
function functionsBaseUrl() {
  if (process.env.FUNCTIONS_BASE_URL) {
    return process.env.FUNCTIONS_BASE_URL.endsWith("/") ? process.env.FUNCTIONS_BASE_URL : process.env.FUNCTIONS_BASE_URL + "/";
  }
  const site = process.env.URL || "http://127.0.0.1:8888";
  return site.replace(/\/$/, "") + "/.netlify/functions/";
}

/**
 * @param {string} url
 * @param {{ method: string, body?: string }} options
 * @returns {Promise<void>}
 */
async function callBatch(url, options) {
  const response = await fetch(url, {
    method: options.method,
    headers: { "Content-type": "application/json" },
    body: options.body
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Batch request failed");
  }
}

/**
 * @returns {{ statusCode: number, headers: Record<string, string>, body: string }}
 */
function optionsResponse() {
  return { statusCode: 200, headers, body: "OK" };
}

/**
 * @returns {{ statusCode: number, headers: Record<string, string>, body: string }}
 */
function okResponse() {
  return { statusCode: 200, headers, body: "OK" };
}

/**
 * @param {unknown} data
 * @param {number} [statusCode]
 * @returns {{ statusCode: number, headers: Record<string, string>, body: string }}
 */
function jsonResponse(data, statusCode = 200) {
  return {
    statusCode,
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(data)
  };
}

/**
 * @param {Error} error
 * @returns {{ statusCode: number, headers: Record<string, string>, body: string }}
 */
function failResponse(error) {
  console.log(error);
  return jsonResponse({ message: error.message || "Unexpected error" }, 422);
}

module.exports = {
  assertMethod,
  readJsonBody,
  readPathId,
  readOptionalId,
  functionsBaseUrl,
  callBatch,
  optionsResponse,
  okResponse,
  jsonResponse,
  failResponse
};
