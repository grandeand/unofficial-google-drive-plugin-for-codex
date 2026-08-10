#!/usr/bin/env node

import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targetRoot = path.join(os.homedir(), ".codex", "plugins", "grande-google-drive");
const marketplacePath = path.join(os.homedir(), ".agents", "plugins", "marketplace.json");

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
    path: "./.codex/plugins/grande-google-drive",
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

console.log("Grande Google Drive installed. Starting Google OAuth...");
await run(process.execPath, [path.join(targetRoot, "scripts", "auth.mjs")], { cwd: targetRoot });
console.log("Installation and Google login completed. Restart Codex to load the plugin.");
