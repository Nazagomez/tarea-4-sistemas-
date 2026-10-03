"use strict";

const withRabbit = require("./withRabbit");
const { QUEUE_NAME, METHOD_UPDATE, createQueueMessage } = require("./queue");
const { assertMethod, readJsonBody, readPathId, optionsResponse, okResponse, failResponse } = require("./http");

/**
 * Enqueues a deferred book update. The database changes when bookTasks runs.
 * @param {{ httpMethod?: string, path?: string, body?: string }} event
 * @returns {Promise<{ statusCode: number, headers: Record<string, string>, body: string }>}
 */
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  try {
    assertMethod(event, "PUT");
    const id = readPathId(event);
    const body = readJsonBody(event);
    const request = createQueueMessage({ method: METHOD_UPDATE, id, body });
    await withRabbit(async (channel) => {
      await channel.sendToQueue(QUEUE_NAME, Buffer.from(request));
    });
    return okResponse();
  } catch (error) {
    return failResponse(error);
  }
};
