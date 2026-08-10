# Unofficial Google Drive Plugin for Codex

An unofficial Codex plugin that connects Google Drive and Google Sheets through a local MCP server.

It wraps the excellent [`@piotr-agier/google-drive-mcp`](https://github.com/piotr-agier/google-drive-mcp) project by Piotr Agier and adds human-readable MCP tool titles so Codex can display names such as **List Google Sheets** instead of collapsing camelCase names into `Listgooglesheets`.

This project is not affiliated with OpenAI, Google, or Piotr Agier.

## Features

- Google Drive search and file management
- Google Docs and Google Sheets access
- Google Sheets reading and editing
- Local OAuth credentials and tokens
- Write actions remain approval-gated in Codex
- Display titles added through standard MCP tool annotations

## OAuth files

The wrapper uses these local paths by default:

```text
~/.mcp-auth/google-drive-client.json
~/.mcp-auth/google-drive-mcp-tokens.json
```

Override them with:

```text
GOOGLE_DRIVE_OAUTH_CREDENTIALS
GOOGLE_DRIVE_MCP_TOKEN_PATH
GOOGLE_DRIVE_MCP_SCOPES
```

The plugin never includes credentials or tokens in the repository.

## Development

```bash
npm install
node server/index.mjs
```

The wrapper starts `@piotr-agier/google-drive-mcp@2.5.0` through `npx`, forwards MCP requests, and adds `annotations.title` to the tools returned by `tools/list`.

## Attribution

The Drive, Docs, Sheets, Slides, Calendar, OAuth, and Google API functionality comes from [`piotr-agier/google-drive-mcp`](https://github.com/piotr-agier/google-drive-mcp), authored by Piotr Agier. Please support and credit the upstream project.

## License

The wrapper and plugin configuration are released under the MIT License. The upstream MCP server and its dependencies retain their own licenses.
