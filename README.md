# Unofficial Google Drive Plugin for Codex

An unofficial Codex plugin package that installs and runs the upstream [`@piotr-agier/google-drive-mcp`](https://github.com/piotr-agier/google-drive-mcp) server directly. There is no intermediate MCP proxy or tool-schema transformation.

This project is not affiliated with OpenAI, Google, or Piotr Agier.

## Features

- Google Drive search and file management
- Google Docs, Sheets, Slides, and Calendar tools from the upstream MCP server
- Local Google OAuth credentials and tokens
- Approval-gated write actions in Codex
- Automatic Codex marketplace registration and cache refresh
- Direct use of the upstream MCP entry point

## Requirements

Before installing, make sure the machine has:

- Node.js 20 or newer
- npm and npx
- The Codex CLI available on `PATH`
- A Google Cloud OAuth desktop client JSON file

In Google Cloud Console:

1. Create or select a Google Cloud project.
2. Enable the Google Drive, Docs, Sheets, Slides, and Calendar APIs.
3. Configure the OAuth consent screen.
4. Create an OAuth 2.0 Client ID with application type **Desktop app**.
5. Download the JSON file.
6. Save it at:

```text
~/.mcp-auth/google-drive-client.json
```

Never commit OAuth credentials or generated token files to Git.

## One-command installation

Run this command in the same user environment and Codex profile that will use the plugin:

```bash
npx --yes --package=github:grandeand/unofficial-google-drive-plugin-for-codex grande-google-drive-install
```

The installer:

1. Copies the plugin into the active Codex profile.
2. Installs production dependencies.
3. Generates a fresh Codex cachebuster.
4. Registers `grande-google-drive@grande-profile-plugins`.
5. Preserves existing Google OAuth tokens.
6. Starts Google OAuth when no authenticated account exists.

If OAuth opens in the browser, complete the Google sign-in and consent flow. Tokens are stored locally at:

```text
~/.mcp-auth/google-drive-mcp-tokens.json
```

After installation, completely restart Codex or create a new task. MCP tools are selected when a task starts, so an already-open task may not receive a newly installed or updated plugin.

## Verify the installation

### 1. Verify the plugin identity

Run:

```bash
codex plugin list
```

The output must include:

```text
grande-google-drive@grande-profile-plugins  installed, enabled
```

Marketplace-qualified identities are distinct. For example, `grande-google-drive@local-user-plugins` is not the same installation.

### 2. Verify the upstream MCP server

Run:

```bash
cd "$HOME/plugins/grande-google-drive"
npm run verify
```

A successful installation prints a result similar to:

```text
Verified 116 Google tools.
```

This check proves the upstream MCP process starts and exposes the `search` tool.

### 3. Verify a real Codex task

Open a fresh Codex task and use a prompt such as:

```text
Use the Google Drive MCP search tool to find a file named "weekly work".
Do not use Chrome, browser automation, list_mcp_resources, or a filesystem fallback.
```

The task should call `google-drive/search`. Local MCP verification alone is not sufficient. A real search in a fresh task proves that Codex loaded the plugin and added its tools to the task catalog.

## Installing with an LLM or coding agent

Give the agent the repository URL and the following instructions. The agent must execute every step and report evidence instead of only describing the process:

```text
Install https://github.com/grandeand/unofficial-google-drive-plugin-for-codex
for the active Codex profile.

1. Confirm Node.js, npm, npx, and the Codex CLI are available.
2. Confirm ~/.mcp-auth/google-drive-client.json exists without printing its contents.
3. Run:
   npx --yes --package=github:grandeand/unofficial-google-drive-plugin-for-codex grande-google-drive-install
4. Complete OAuth if the installer requests it.
5. Run codex plugin list and require
   grande-google-drive@grande-profile-plugins to be installed and enabled.
6. Run npm run verify from the installed plugin directory and require the
   Google Drive search tool to be present.
7. Start a fresh Codex task and execute a real read-only Drive search through
   google-drive/search. Do not use Chrome, browser automation,
   list_mcp_resources, or a filesystem fallback.
8. Report the installed version, exact plugin identity, MCP verification
   result, and real search result.

Do not claim success when only the local MCP process starts. Success requires
the plugin to be installed and enabled in Codex and a real search tool call to
complete in a fresh task.
```

## Updating

Run the same installer command again:

```bash
npx --yes --package=github:grandeand/unofficial-google-drive-plugin-for-codex grande-google-drive-install
```

Each run creates a fresh Codex cachebuster and reinstalls the marketplace snapshot. Existing OAuth tokens are preserved. Restart Codex or create a new task after updating, then repeat both MCP and fresh-task verification.

## OAuth files

The plugin uses these local paths by default:

```text
~/.mcp-auth/google-drive-client.json
~/.mcp-auth/google-drive-mcp-tokens.json
```

The installer resolves these paths from the real operating-system user home, including when Codex runs with an isolated profile `HOME`.

Supported overrides:

```text
GOOGLE_DRIVE_OAUTH_CREDENTIALS
GOOGLE_DRIVE_MCP_TOKEN_PATH
GOOGLE_DRIVE_MCP_SCOPES
GRANDE_GOOGLE_DRIVE_AUTH_HOME
```

## Reauthenticate Google

Run:

```bash
cd "$HOME/plugins/grande-google-drive"
npm run auth
```

## Troubleshooting

### Plugin disappears after restarting Codex

Run `codex plugin list`. The active identity must be `grande-google-drive@grande-profile-plugins`.

If Codex restores an old identity such as `grande-google-drive@local-user-plugins`, run the one-command installer again. The plugin files may still exist even when the active marketplace identity is incorrect.

### Codex opens Chrome instead of using Drive MCP

This normally means the task did not receive the Drive tool catalog. Confirm that the expected plugin identity is installed and enabled, restart Codex, and create a new task. During testing, explicitly require `google-drive/search` and forbid browser fallback.

### MCP startup or initialize failure

Check that the OAuth credential and token files exist without printing their contents, then run:

```bash
cd "$HOME/plugins/grande-google-drive"
npm install --omit=dev
npm run verify
```

If verification succeeds but a fresh Codex task lacks the tools, investigate Codex plugin registration and the marketplace-qualified identity rather than the upstream Google Drive MCP server.

## Development

```bash
npm install
npm run verify
```

The plugin installs the upstream package directly from its GitHub repository and runs its bundled `dist/index.js` MCP entry point without an intermediate proxy or tool-schema transformation.

## Attribution

The Drive, Docs, Sheets, Slides, Calendar, OAuth, and Google API functionality comes from [`piotr-agier/google-drive-mcp`](https://github.com/piotr-agier/google-drive-mcp), authored by Piotr Agier. Please support and credit the upstream project.

## License

The plugin configuration and installer are released under the MIT License. The upstream MCP server and its dependencies retain their own licenses.
