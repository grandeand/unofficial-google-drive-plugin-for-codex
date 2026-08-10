---
name: grande-google-drive
description: Use the Grande Google Drive plugin for Google Drive and Google Sheets tasks in Codex.
---

# Grande Google Drive

Use the `google-drive` MCP server for live Google Drive and Google Sheets operations.

The plugin wraps `@piotr-agier/google-drive-mcp` and adds human-readable MCP tool titles for Codex.

## Rules

- Use the authenticated local account configured on the machine.
- For writes, identify the exact file, sheet/tab, and range before changing anything.
- Read the current content before editing an existing Sheet.
- Keep write operations narrow and verify the result after the MCP call.
- Do not reveal OAuth tokens, client secrets, or token-file contents.
- If the target file or range is ambiguous, ask the user to clarify.

## Common workflows

- Search Drive before asking the user for a file ID when the file name is sufficient.
- Use the Google Sheets listing and read tools to inspect spreadsheets.
- Use the Google Sheets update tools for cell-value changes.
- After an update, read the affected range again and report the verified result.
