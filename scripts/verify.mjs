#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const upstreamEntry = path.join(
  root,
  "node_modules",
  "@piotr-agier",
  "google-drive-mcp",
  "dist",
  "index.js",
);
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [upstreamEntry],
  env: { ...process.env },
  stderr: "inherit",
});
const client = new Client(
  { name: "grande-google-drive-verifier", version: "1.0.0" },
  { capabilities: {} },
);

const timeout = setTimeout(() => {
  console.error("MCP verification timed out.");
  process.exit(1);
}, 15000);

try {
  await client.connect(transport);
  const result = await client.listTools();
  if (!result.tools.some((tool) => tool.name === "search")) {
    throw new Error("Google Drive search tool is missing");
  }
  console.log("Verified " + result.tools.length + " Google tools.");
} finally {
  clearTimeout(timeout);
  await Promise.race([
    client.close(),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
  await Promise.race([
    transport.close(),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
}

process.exit(0);
