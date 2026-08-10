#!/usr/bin/env node

import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const codexHome = process.env.HOME || os.homedir();
const userHome = os.userInfo().homedir;
const authHome =
  process.env.GRANDE_GOOGLE_DRIVE_AUTH_HOME ??
  path.join(userHome, ".mcp-auth");
const targetRoot = path.join(codexHome, "plugins", "grande-google-drive");
const marketplacePath = path.join(codexHome, ".agents", "plugins", "marketplace.json");

function cachebuster() {
  return new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
}

async function updateInstalledVersion() {
  const manifestPath = path.join(targetRoot, ".codex-plugin", "plugin.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const baseVersion = String(manifest.version).split("+", 1)[0];
  manifest.version = baseVersion + "+codex." + cachebuster();
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  return manifest.version;
}

async function hasTokenStore() {
  try {
    const raw = await readFile(
      process.env.GOOGLE_DRIVE_MCP_TOKEN_PATH ||
        path.join(authHome, "google-drive-mcp-tokens.json"),
      "utf8",
    );
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.accounts && Object.keys(parsed.accounts).length);
  } catch {
    return false;
  }
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(command + " failed with exit code " + code));
    });
  });
}

if (sourceRoot !== targetRoot) {
  await rm(targetRoot, { recursive: true, force: true });
  await mkdir(path.dirname(targetRoot), { recursive: true });
  await cp(sourceRoot, targetRoot, {
    recursive: true,
    force: true,
    filter(source) {
      return !source.includes(path.sep + ".git") &&
        !source.includes(path.sep + "node_modules");
    },
  });
}

await run("npm", ["install", "--omit=dev"], { cwd: targetRoot });
const installedVersion = await updateInstalledVersion();
await mkdir(path.dirname(marketplacePath), { recursive: true });

let marketplace = {
  name: "personal",
  interface: { displayName: "Personal" },
  plugins: [],
};

try {
  marketplace = JSON.parse(await readFile(marketplacePath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

marketplace.plugins ??= [];
const entry = {
  name: "grande-google-drive",
  source: {
    source: "local",
    path: "./plugins/grande-google-drive",
  },
  policy: {
    installation: "AVAILABLE",
    authentication: "ON_INSTALL",
  },
  category: "Productivity",
};
const index = marketplace.plugins.findIndex((plugin) => plugin.name === entry.name);
if (index === -1) marketplace.plugins.push(entry);
else marketplace.plugins[index] = entry;

await writeFile(marketplacePath, JSON.stringify(marketplace, null, 2) + "\n", { mode: 0o600 });
await run("codex", ["plugin", "add", "grande-google-drive@" + marketplace.name]);

if (!(await hasTokenStore())) {
  console.log("Grande Google Drive installed. Starting Google OAuth...");
  await run(process.execPath, [path.join(targetRoot, "scripts", "auth.mjs")], {
    cwd: targetRoot,
    env: {
      ...process.env,
      GRANDE_GOOGLE_DRIVE_AUTH_HOME: authHome,
    },
  });
}
console.log("Installed Grande Google Drive " + installedVersion + ". Start a new Codex task to load it.");
