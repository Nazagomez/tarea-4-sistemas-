"use strict";

const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { describe, it, beforeEach } = require("node:test");

process.env.USE_FILE_STORE = "true";
process.env.STORE_PATH = path.join(os.tmpdir(), "tarea4-bookstore-test.json");
delete process.env.DATABASE_URL;
delete process.env.CLOUDAMQP_URL;

const { createQueueMessage, consumeQueue, QUEUE_NAME } = require("../netlify/functions/queue");
const books = require("../netlify/functions/books");
const bookUpdate = require("../netlify/functions/bookUpdate");
const bookUpdateBatch = require("../netlify/functions/bookUpdateBatch");
const bookInsertBatch = require("../netlify/functions/bookInsertBatch");
const bookDeleteBatch = require("../netlify/functions/bookDeleteBatch");
const authorUpdateBatch = require("../netlify/functions/authorUpdateBatch");
const authorInsertBatch = require("../netlify/functions/authorInsertBatch");
const publisherInsertBatch = require("../netlify/functions/publisherInsertBatch");
const publisherDeleteBatch = require("../netlify/functions/publisherDeleteBatch");
const authors = require("../netlify/functions/authors");
const publishers = require("../netlify/functions/publishers");

/**
 * @returns {void}
 */
function resetStore() {
  if (fs.existsSync(process.env.STORE_PATH)) fs.unlinkSync(process.env.STORE_PATH);
}

/**
 * @param {Array<Record<string, unknown>>} messages
 * @returns {{ get: Function, sendToQueue: Function, sent: Array<Record<string, unknown>>, calls: Array<Record<string, unknown>> }}
 */
function createFakeChannel(messages) {
  const pending = messages.map((item) => ({ content: Buffer.from(JSON.stringify(item)) }));
  const sent = [];
  const calls = [];
  return {
    sent,
    calls,
    async get(queueName, options) {
      calls.push({ queueName, options });
      return pending.shift() || false;
    },
    async sendToQueue(_queueName, buffer) {
      sent.push(JSON.parse(buffer.toString()));
    }
  };
}

describe("queue messages", () => {
  it("serializes book updates with double quotes and no resource", () => {
    const raw = createQueueMessage({ method: "UPDATE", id: 1, body: { title: "Distributed Systems" } });
    assert.equal(raw.includes("'"), false);
    assert.deepEqual(JSON.parse(raw), { method: "UPDATE", id: 1, body: { title: "Distributed Systems" } });
  });

  it("marks author and publisher messages so bookTasks can tell them apart", () => {
    const authorMessage = JSON.parse(createQueueMessage({ resource: "author", method: "DELETE", id: 2 }));
    const publisherMessage = JSON.parse(createQueueMessage({ resource: "publisher", method: "INSERT", body: { publisher: "UNA" } }));
    assert.equal(authorMessage.resource, "author");
    assert.equal(authorMessage.body, undefined);
    assert.equal(publisherMessage.resource, "publisher");
    assert.equal(publisherMessage.id, undefined);
  });

  it("processes only the messages owned by the invoked task function", async () => {
    const channel = createFakeChannel([
      { method: "UPDATE", id: 1, body: { title: "New title" } },
      { resource: "author", method: "DELETE", id: 2 },
      { resource: "publisher", method: "INSERT", body: { publisher: "UNA" } }
    ]);
    const handled = [];
    const processed = await consumeQueue(channel, "book", async (request) => {
      handled.push(request);
    });
    assert.equal(processed, 1);
    assert.equal(handled.length, 1);
    assert.equal(handled[0].id, 1);
    assert.equal(channel.sent.length, 2);
    assert.equal(channel.sent[0].resource, "author");
    assert.equal(channel.sent[1].resource, "publisher");
    assert.equal(channel.calls[0].queueName, QUEUE_NAME);
    assert.equal(channel.calls[0].options.noAck, true);
  });

  it("returns a failed message to the queue", async () => {
    const channel = createFakeChannel([{ method: "UPDATE", id: 4, body: { title: "Retry" } }]);
    await assert.rejects(
      () => consumeQueue(channel, "book", async () => {
        throw new Error("batch failed");
      }),
      /batch failed/
    );
    assert.equal(channel.sent.length, 1);
    assert.equal(channel.sent[0].id, 4);
  });
});

describe("book batch handlers", () => {
  beforeEach(() => {
    resetStore();
  });

  it("updates, inserts and deletes books in the store", async () => {
    const updateResponse = await bookUpdateBatch.handler({
      httpMethod: "PUT",
      path: "/.netlify/functions/bookUpdateBatch/1",
      body: JSON.stringify({ title: "Operating Systems", edition: "10th", copyright: 2024, language: "ENGLISH", pages: 900, author: "Abraham Silberschatz", author_id: 1, publisher: "John Wiley & Sons", publisher_id: 1 })
    });
    assert.equal(updateResponse.statusCode, 200);
    const listed = JSON.parse((await books.handler({ httpMethod: "GET", path: "/.netlify/functions/books" })).body);
    assert.equal(listed.find((book) => book.id === "1").title, "Operating Systems");
    const insertResponse = await bookInsertBatch.handler({
      httpMethod: "POST",
      path: "/.netlify/functions/bookInsertBatch",
      body: JSON.stringify({ title: "Distributed Systems", edition: "1st", copyright: 2026, language: "SPANISH", pages: 320, author: "New Author", author_id: 3, publisher: "UNA", publisher_id: 3 })
    });
    assert.equal(insertResponse.statusCode, 200);
    const afterInsert = JSON.parse((await books.handler({ httpMethod: "GET", path: "/.netlify/functions/books" })).body);
    assert.equal(afterInsert.some((book) => book.title === "Distributed Systems" && book.id === "5"), true);
    const deleteResponse = await bookDeleteBatch.handler({ httpMethod: "DELETE", path: "/.netlify/functions/bookDeleteBatch/5" });
    assert.equal(deleteResponse.statusCode, 200);
    const afterDelete = JSON.parse((await books.handler({ httpMethod: "GET", path: "/.netlify/functions/books" })).body);
    assert.equal(afterDelete.some((book) => book.id === "5"), false);
  });

  it("rejects a book update without a title", async () => {
    const response = await bookUpdateBatch.handler({
      httpMethod: "PUT",
      path: "/.netlify/functions/bookUpdateBatch/1",
      body: JSON.stringify({ title: " " })
    });
    assert.equal(response.statusCode, 422);
    assert.match(response.body, /title is required/);
  });
});

describe("author and publisher batch handlers", () => {
  beforeEach(() => {
    resetStore();
  });

  it("updates and inserts authors", async () => {
    const updateResponse = await authorUpdateBatch.handler({
      httpMethod: "PUT",
      path: "/.netlify/functions/authorUpdateBatch/1",
      body: JSON.stringify({ author: "A. Silberschatz", nationality: "American", birth_year: 1952, fields: "Databases", books: [{ book_id: 1, title: "Operating System Concepts" }] })
    });
    assert.equal(updateResponse.statusCode, 200);
    const author = JSON.parse((await authors.handler({ httpMethod: "GET", path: "/.netlify/functions/authors/1" })).body);
    assert.equal(author.author, "A. Silberschatz");
    assert.equal(author.books[0].title, "Operating System Concepts");
    const insertResponse = await authorInsertBatch.handler({
      httpMethod: "POST",
      path: "/.netlify/functions/authorInsertBatch",
      body: JSON.stringify({ author: "Leslie Lamport", nationality: "American", birth_year: 1941, fields: "Distributed systems", books: [] })
    });
    assert.equal(insertResponse.statusCode, 200);
    const listed = JSON.parse((await authors.handler({ httpMethod: "GET", path: "/.netlify/functions/authors" })).body);
    assert.equal(listed.some((item) => item.author === "Leslie Lamport"), true);
  });

  it("inserts and deletes publishers", async () => {
    const insertResponse = await publisherInsertBatch.handler({
      httpMethod: "POST",
      path: "/.netlify/functions/publisherInsertBatch",
      body: JSON.stringify({ publisher: "UNED Press", country: "Costa Rica", founded: 1977, genere: "Education", books: [] })
    });
    assert.equal(insertResponse.statusCode, 200);
    const listed = JSON.parse((await publishers.handler({ httpMethod: "GET", path: "/.netlify/functions/publishers" })).body);
    const created = listed.find((item) => item.publisher === "UNED Press");
    assert.ok(created);
    const deleteResponse = await publisherDeleteBatch.handler({ httpMethod: "DELETE", path: "/.netlify/functions/publisherDeleteBatch/" + created.id });
    assert.equal(deleteResponse.statusCode, 200);
    const afterDelete = JSON.parse((await publishers.handler({ httpMethod: "GET", path: "/.netlify/functions/publishers" })).body);
    assert.equal(afterDelete.some((item) => item.publisher === "UNED Press"), false);
  });
});

describe("queue producers", () => {
  it("does not send a book update when CloudAMQP is missing", async () => {
    const response = await bookUpdate.handler({
      httpMethod: "PUT",
      path: "/.netlify/functions/bookUpdate/1",
      body: JSON.stringify({ title: "Queued title" })
    });
    assert.equal(response.statusCode, 422);
    assert.match(response.body, /CLOUDAMQP_URL/);
  });
});
