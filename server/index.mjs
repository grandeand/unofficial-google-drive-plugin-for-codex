#!/usr/bin/env node

import os from "node:os";
import path from "node:path";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const upstreamPackage =
  process.env.GRANDE_GOOGLE_DRIVE_UPSTREAM_PACKAGE ??
  "@piotr-agier/google-drive-mcp@2.5.0";

const authHome =
  process.env.GRANDE_GOOGLE_DRIVE_AUTH_HOME ??
  path.join(os.userInfo().homedir, ".mcp-auth");

const upstreamEnv = {
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

const upstreamTransport = new StdioClientTransport({
  command: "npx",
  args: ["-y", upstreamPackage],
  env: upstreamEnv,
  stderr: "inherit",
});

const upstream = new Client(
  {
    name: "unofficial-google-drive-plugin-for-codex",
    version: "0.1.0",
  },
  { capabilities: {} },
);

const server = new Server(
  {
    name: "grande-google-drive",
    version: "0.2.1",
  },
  { capabilities: { tools: {} } },
);

async function hasAuthenticatedTokenStore() {
  try {
    await access(upstreamEnv.GOOGLE_DRIVE_MCP_TOKEN_PATH, constants.R_OK);
    const raw = await readFile(upstreamEnv.GOOGLE_DRIVE_MCP_TOKEN_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return parsed?.accounts && Object.keys(parsed.accounts).length > 0;
  } catch {
    return false;
  }
}

function isAutoAuthEnabled() {
  return !["0", "false", "no", "off"].includes(
    (process.env.GRANDE_GOOGLE_DRIVE_AUTO_AUTH ?? "1").trim().toLowerCase(),
  );
}

async function ensureGoogleOAuth() {
  if (!isAutoAuthEnabled() || (await hasAuthenticatedTokenStore())) {
    return;
  }

  console.error(
    "[Grande Google Drive] Google OAuth hesabı bulunamadı; tarayıcıda giriş açılıyor.",
  );

  const child = spawn(
    "npx",
    ["-y", upstreamPackage, "auth"],
    {
      env: upstreamEnv,
      stdio: "inherit",
    },
  );

  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });

  if (exitCode !== 0) {
    throw new Error(`Google OAuth başarısız oldu (exit code ${exitCode ?? "unknown"}).`);
  }
}

function humanizeToolName(name) {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const acronyms = new Map([
    ["api", "API"],
    ["codex", "Codex"],
    ["docs", "Docs"],
    ["doc", "Doc"],
    ["drive", "Drive"],
    ["google", "Google"],
    ["id", "ID"],
    ["mcp", "MCP"],
    ["oauth", "OAuth"],
    ["sheets", "Sheets"],
    ["sheet", "Sheet"],
    ["slides", "Slides"],
  ]);

  return words
    .map((word, index) => {
      const normalized = word.toLowerCase();
      if (acronyms.has(normalized)) {
        return acronyms.get(normalized);
      }
      return index === 0
        ? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
        : normalized;
    })
    .join(" ");
}

function addDisplayTitle(tool) {
  return {
    ...tool,
    annotations: {
      ...(tool.annotations ?? {}),
      title: humanizeToolName(tool.name),
    },
  };
}

server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  const result = await upstream.listTools(request.params);
  return {
    ...result,
    tools: result.tools.map(addDisplayTitle),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return upstream.callTool(request.params);
});

async function close() {
  await Promise.allSettled([server.close(), upstream.close()]);
}

process.once("SIGINT", async () => {
  await close();
  process.exit(0);
});

process.once("SIGTERM", async () => {
  await close();
  process.exit(0);
});

await ensureGoogleOAuth();
await upstream.connect(upstreamTransport);
await server.connect(new StdioServerTransport());
