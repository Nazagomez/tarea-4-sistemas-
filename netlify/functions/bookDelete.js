"use strict";

const withRabbit = require("./withRabbit");
const { QUEUE_NAME, METHOD_DELETE, createQueueMessage } = require("./queue");
const { assertMethod, readPathId, optionsResponse, okResponse, failResponse } = require("./http");

/**
 * Enqueues a deferred book delete. The database changes when bookTasks runs.
 * @param {{ httpMethod?: string, path?: string }} event
 * @returns {Promise<{ statusCode: number, headers: Record<string, string>, body: string }>}
 */
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  try {
    assertMethod(event, "DELETE");
    const id = readPathId(event);
    const request = createQueueMessage({ method: METHOD_DELETE, id });
    await withRabbit(async (channel) => {
      await channel.sendToQueue(QUEUE_NAME, Buffer.from(request));
    });
    return okResponse();
  } catch (error) {
    return failResponse(error);
  }
};
