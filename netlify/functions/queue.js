"use strict";

const QUEUE_NAME = "bookstore";
const RESOURCE_BOOK = "book";
const RESOURCE_AUTHOR = "author";
const RESOURCE_PUBLISHER = "publisher";
const METHOD_UPDATE = "UPDATE";
const METHOD_INSERT = "INSERT";
const METHOD_DELETE = "DELETE";

/**
 * Builds a JSON message with double quotes so the consumer can parse it.
 * @param {{ resource?: string, method: string, id?: number, body?: Record<string, unknown> }} payload
 * @returns {string}
 */
function createQueueMessage(payload) {
  const message = {};
  if (payload.resource) {
    message.resource = payload.resource;
  }
  message.method = payload.method;
  if (payload.id !== undefined && payload.id !== null) {
    message.id = payload.id;
  }
  if (payload.body !== undefined) {
    message.body = payload.body;
  }
  return JSON.stringify(message);
}

/**
 * Book messages omit resource. Author and publisher messages set it.
 * @param {{ resource?: string }} request
 * @param {string} owner
 * @returns {boolean}
 */
function ownsMessage(request, owner) {
  const resource = request.resource || RESOURCE_BOOK;
  return resource === owner;
}

/**
 * Reads every pending message. Foreign messages are published again after the drain.
 * @param {{ get: Function, sendToQueue: Function }} channel
 * @param {string} owner
 * @param {(request: Record<string, unknown>) => Promise<void>} dispatch
 * @returns {Promise<number>}
 */
async function consumeQueue(channel, owner, dispatch) {
  const deferred = [];
  const failures = [];
  let processed = 0;
  let message = await channel.get(QUEUE_NAME, { noAck: true });
  while (message) {
    let request = null;
    try {
      request = JSON.parse(message.content.toString());
    } catch (error) {
      failures.push(error.message);
      message = await channel.get(QUEUE_NAME, { noAck: true });
      continue;
    }
    if (!ownsMessage(request, owner)) {
      deferred.push(request);
    } else {
      try {
        await dispatch(request);
        processed += 1;
      } catch (error) {
        failures.push(error.message);
        deferred.push(request);
      }
    }
    message = await channel.get(QUEUE_NAME, { noAck: true });
  }
  for (const request of deferred) {
    await channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(request)));
  }
  if (failures.length > 0) {
    throw new Error(failures.join("; "));
  }
  return processed;
}

module.exports = {
  QUEUE_NAME,
  RESOURCE_BOOK,
  RESOURCE_AUTHOR,
  RESOURCE_PUBLISHER,
  METHOD_UPDATE,
  METHOD_INSERT,
  METHOD_DELETE,
  createQueueMessage,
  ownsMessage,
  consumeQueue
};
