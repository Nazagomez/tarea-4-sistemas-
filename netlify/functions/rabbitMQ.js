"use strict";

const amqp = require("amqplib");
const { QUEUE_NAME } = require("./queue");

/**
 * Opens a channel to CloudAMQP and ensures the bookstore queue exists.
 * @returns {Promise<import("amqplib").Channel>}
 */
async function connectRabbit() {
  if (!process.env.CLOUDAMQP_URL) {
    throw new Error("CLOUDAMQP_URL is not configured");
  }
  const connection = await amqp.connect(process.env.CLOUDAMQP_URL);
  const channel = await connection.createChannel();
  channel.amqpConnection = connection;
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  return channel;
}

module.exports = connectRabbit;
