"use strict";

const withRabbit = require("./withRabbit");
const { RESOURCE_PUBLISHER, METHOD_DELETE, METHOD_UPDATE, METHOD_INSERT, consumeQueue } = require("./queue");
const { callBatch, functionsBaseUrl, optionsResponse, okResponse, failResponse } = require("./http");

/**
 * Applies one queued publisher operation by calling its batch function.
 * @param {{ method?: string, id?: number, body?: Record<string, unknown> }} request
 * @returns {Promise<void>}
 */
async function dispatchPublisher(request) {
  const baseUrl = functionsBaseUrl();
  switch (request.method) {
    case METHOD_DELETE:
      await callBatch(baseUrl + "publisherDeleteBatch/" + request.id, { method: "DELETE" });
      break;
    case METHOD_UPDATE:
      await callBatch(baseUrl + "publisherUpdateBatch/" + request.id, { method: "PUT", body: JSON.stringify(request.body) });
      break;
    case METHOD_INSERT:
      await callBatch(baseUrl + "publisherInsertBatch", { method: "POST", body: JSON.stringify(request.body) });
      break;
    default:
      throw new Error("Unsupported publisher method");
  }
}

/**
 * Reads bookstore messages and applies only publisher operations.
 * @param {{ httpMethod?: string }} event
 * @returns {Promise<{ statusCode: number, headers: Record<string, string>, body: string }>}
 */
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  try {
    if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
      throw new Error("GET or POST is required");
    }
    const processed = await withRabbit(async (channel) => consumeQueue(channel, RESOURCE_PUBLISHER, dispatchPublisher));
    console.log("Processed " + processed + " publisher messages");
    return okResponse();
  } catch (error) {
    return failResponse(error);
  }
};
