"use strict";

const connectRabbit = require("./rabbitMQ");

/**
 * Runs queue work and always closes the AMQP connection.
 * Netlify would otherwise wait until the function times out.
 * @param {(channel: import("amqplib").Channel) => Promise<unknown>} task
 * @returns {Promise<unknown>}
 */
async function withRabbit(task) {
  const channel = await connectRabbit();
  try {
    return await task(channel);
  } finally {
    const connection = channel.amqpConnection;
    await channel.close();
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = withRabbit;
