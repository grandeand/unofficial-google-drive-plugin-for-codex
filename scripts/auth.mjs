#!/usr/bin/env node

import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const authHome =
  process.env.GRANDE_GOOGLE_DRIVE_AUTH_HOME ??
  path.join(os.homedir(), ".mcp-auth");
const upstreamEntry = path.join(
  root,
  "node_modules",
  "@piotr-agier",
  "google-drive-mcp",
  "dist",
  "index.js",
);

await mkdir(authHome, { recursive: true, mode: 0o700 });

const env = {
  ...process.env,
  GOOGLE_DRIVE_OAUTH_CREDENTIALS:
    process.env.GOOGLE_DRIVE_OAUTH_CREDENTIALS ??
    path.join(authHome, "google-drive-client.json"),
  GOOGLE_DRIVE_MCP_TOKEN_PATH:
    process.env.GOOGLE_DRIVE_MCP_TOKEN_PATH ??
    path.join(authHome, "google-drive-mcp-tokens.json"),
  GOOGLE_DRIVE_MCP_SCOPES:
    process.env.GOOGLE_DRIVE_MCP_SCOPES ?? "drive,spreadsheets",
};

const child = spawn(process.execPath, [upstreamEntry, "auth"], {
  env,
  stdio: "inherit",
});
const exitCode = await new Promise((resolve, reject) => {
  child.once("error", reject);
  child.once("close", resolve);
});

process.exitCode = exitCode ?? 1;
