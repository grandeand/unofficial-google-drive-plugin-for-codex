#!/usr/bin/env node

import { access, chmod } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const upstreamEntry = path.join(
  root,
  "node_modules",
  "@piotr-agier",
  "google-drive-mcp",
  "dist",
  "index.js",
);

await access(upstreamEntry);
if (process.platform !== "win32") {
  await chmod(path.join(root, "server", "index.mjs"), 0o755);
}

console.error("[Grande Google Drive] Dependencies are ready.");
