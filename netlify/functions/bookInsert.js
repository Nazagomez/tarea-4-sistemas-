"use strict";

const withRabbit = require("./withRabbit");
const { QUEUE_NAME, METHOD_INSERT, createQueueMessage } = require("./queue");
const { assertMethod, readJsonBody, optionsResponse, okResponse, failResponse } = require("./http");

/**
 * Enqueues a deferred book insert. The database changes when bookTasks runs.
 * @param {{ httpMethod?: string, body?: string }} event
 * @returns {Promise<{ statusCode: number, headers: Record<string, string>, body: string }>}
 */
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  try {
    assertMethod(event, "POST");
    const body = readJsonBody(event);
    const request = createQueueMessage({ method: METHOD_INSERT, body });
    await withRabbit(async (channel) => {
      await channel.sendToQueue(QUEUE_NAME, Buffer.from(request));
    });
    return okResponse();
  } catch (error) {
    return failResponse(error);
  }
};
