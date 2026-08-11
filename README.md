# Unofficial Google Drive Plugin for Codex

An unofficial Codex plugin package that runs the upstream Google Drive MCP server directly.

It installs and launches [`@piotr-agier/google-drive-mcp`](https://github.com/piotr-agier/google-drive-mcp) directly, without an intermediate MCP proxy or tool-schema transformation.

This project is not affiliated with OpenAI, Google, or Piotr Agier.

## Features

- Google Drive search and file management
- Google Docs and Google Sheets access
- Google Sheets reading and editing
- Local OAuth credentials and tokens
- Write actions remain approval-gated in Codex
- Display titles added through standard MCP tool annotations

## One-command installation

Install the plugin globally for the current user, register it with the personal
Codex marketplace, install all Node.js dependencies, and start Google OAuth:

```bash
npx --yes --package=github:grandeand/unofficial-google-drive-plugin-for-codex grande-google-drive-install
```

The installer copies the plugin into the active Codex profile, installs its
production dependencies, generates a fresh Codex cachebuster, and reinstalls
the marketplace snapshot. Existing Google OAuth tokens are preserved. Start a
new Codex task after each update so the refreshed MCP tools are loaded.

The machine must have Node.js, npm, and the Codex CLI available on `PATH`.

To run Google authentication again later:

```bash
cd ~/.codex/plugins/grande-google-drive
npm run auth
```

## OAuth files

The wrapper uses these local paths by default:

```text
~/.mcp-auth/google-drive-client.json
~/.mcp-auth/google-drive-mcp-tokens.json
```

The default is resolved from the real operating-system user home, even when
Codex runs the plugin with an isolated profile `HOME`. If the token store is
missing, the plugin automatically starts the upstream OAuth flow before the MCP
server becomes ready and opens the browser.

Override them with:

```text
GOOGLE_DRIVE_OAUTH_CREDENTIALS
GOOGLE_DRIVE_MCP_TOKEN_PATH
GOOGLE_DRIVE_MCP_SCOPES
GRANDE_GOOGLE_DRIVE_AUTH_HOME
```

Set `GRANDE_GOOGLE_DRIVE_AUTO_AUTH=0` to disable automatic first-start OAuth.

The plugin never includes credentials or tokens in the repository.

## Development

```bash
npm install
npm run verify
```

The wrapper uses its pinned local `@piotr-agier/google-drive-mcp@2.5.0`
dependency, forwards MCP requests, and adds `annotations.title` to the tools
returned by `tools/list`.

## Attribution

The Drive, Docs, Sheets, Slides, Calendar, OAuth, and Google API functionality comes from [`piotr-agier/google-drive-mcp`](https://github.com/piotr-agier/google-drive-mcp), authored by Piotr Agier. Please support and credit the upstream project.

## License

The wrapper and plugin configuration are released under the MIT License. The upstream MCP server and its dependencies retain their own licenses.
