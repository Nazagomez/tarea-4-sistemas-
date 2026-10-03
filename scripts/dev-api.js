"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8888);

loadEnvFile();
if (!process.env.DATABASE_URL) {
  process.env.USE_FILE_STORE = process.env.USE_FILE_STORE || "true";
}

const handlers = loadHandlers();

/**
 * Reads a local .env file without overriding variables already set in the shell.
 * @returns {void}
 */
function loadEnvFile() {
  const envPath = path.join(__dirname, "../.env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 0) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

/**
 * @returns {Record<string, Function>}
 */
function loadHandlers() {
  const directory = path.join(__dirname, "../netlify/functions");
  const map = {};
  for (const fileName of fs.readdirSync(directory)) {
    if (!fileName.endsWith(".js")) continue;
    const loaded = require(path.join(directory, fileName));
    if (typeof loaded.handler === "function") {
      map[fileName.replace(/\.js$/, "")] = loaded.handler;
    }
  }
  return map;
}

/**
 * @param {import("http").IncomingMessage} request
 * @returns {Promise<string>}
 */
function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

/**
 * @param {import("http").ServerResponse} response
 * @param {{ statusCode?: number, headers?: Record<string, string>, body?: string }} result
 * @returns {void}
 */
function writeResult(response, result) {
  const headers = { ...(result.headers || {}) };
  response.writeHead(result.statusCode || 200, headers);
  response.end(result.body || "");
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://127.0.0.1:" + PORT);
  const match = url.pathname.match(/^\/\.netlify\/functions\/([A-Za-z0-9]+)(\/.*)?$/);
  if (!match || !handlers[match[1]]) {
    writeResult(response, { statusCode: 404, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "Function not found" }) });
    return;
  }
  try {
    const body = await readRequestBody(request);
    const result = await handlers[match[1]]({
      httpMethod: request.method,
      path: url.pathname,
      body,
      isBase64Encoded: false
    });
    writeResult(response, result);
  } catch (error) {
    writeResult(response, { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: error.message }) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("API listening on http://127.0.0.1:" + PORT);
});
