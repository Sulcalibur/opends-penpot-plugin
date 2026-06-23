# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A plugin that runs inside [Penpot](https://penpot.app) and syncs design tokens (colors, typography, spacing) from a Penpot file to a self-hosted OpenDS instance. It is a plain TypeScript project compiled with `tsc` — no framework.

This project is part of the OpenDS monorepo. See the root `CLAUDE.md` for the overall picture.

## Commands

```bash
# Install
npm install

# Build (outputs to dist/)
npm run build

# Watch mode during development
npm run dev

# Type-check without emitting
npm run lint

# Serve the plugin UI locally (for testing in Penpot)
npm run serve
```

## Architecture

Penpot plugins have two sandboxed execution contexts that cannot share code at runtime:

| Context | Entry point | What it can do |
|---------|------------|----------------|
| **Plugin** (headless worker) | `public/plugin.js` | Access Penpot API (`penpot.*`), call `fetch`, communicate with UI via `penpot.ui.sendMessage` / `penpot.ui.onMessage` |
| **UI** (iframe) | `public/index.html` | Render user interface, send messages to plugin via `parent.postMessage()`, receive responses via `window.addEventListener('message', ...)` |

### Communication pattern

The UI never calls Penpot APIs directly. It sends typed messages to the plugin context, which executes the API calls and returns results:

```
index.html (iframe)                plugin.js (plugin context)
      │                                    │
      ├── { type: 'extract-tokens' } ─────→│
      │                                    ├── penpot.library.local.colors
      │                                    ├── penpot.library.local.typographies
      │                                    ├── penpot.library.local.spacings
      │←── { type: 'tokens-extracted',  ───┤
      │     tokens: {...} }                │
      │                                    │
      ├── { type: 'sync-tokens',      ─────→│
      │     url, apiKey, tokens }          ├── fetch(url + '/api/penpot/tokens', ...)
      │←── { type: 'sync-success',    ─────┤
      │     result: {...} }                │
```

Supported message types: `test-connection`, `load-config`, `extract-tokens`, `sync-tokens`, `disconnect`.

### Source structure

```
public/
├── plugin.js               # Plugin entry point — message router, Penpot API calls, fetch
├── index.html              # Plugin UI — connection form, token preview, sync button, tabs
├── manifest.json           # Plugin manifest (permissions, icons, entry point)
├── icon.svg                # Plugin icon
└── icon.html               # Icon fallback

src/
├── main-plugin.ts          # Standalone plugin variant (self-contained UI, not the active entry point)
├── plugin/
│   ├── api/
│   │   └── hub-api.ts      # HTTP client class library (HubAPI) — reusable but not loaded at runtime
│   ├── tokens/
│   │   ├── extractor.ts    # TokenExtractor class — mirror of the extraction logic in plugin.js
│   │   └── transformer.ts  # TokenTransformer class — normalization and YAML generation
│   └── index.ts            # Re-exports public API
└── types.ts                # Shared TypeScript types

dist/
├── main-plugin.js          # Compiled standalone plugin
├── plugin-bundled.js       # Bundled variant (esbuild)
└── plugin/                 # Compiled class library
```

### Key classes (src/ — compiled to dist/, not loaded at runtime)

- **`HubAPI`** (`src/plugin/api/hub-api.ts`) — manages OpenDS connection config (stored in `penpot.localStorage`), tests connectivity via `GET /api/plugin/health`, and syncs tokens via `POST /api/penpot/tokens`
- **`TokenExtractor`** (`src/plugin/tokens/extractor.ts`) — reads `penpot.library.local.colors` and `.typographies` and normalizes them into typed token objects
- **`TokenTransformer`** (`src/plugin/tokens/transformer.ts`) — converts extracted tokens to the OpenDS wire format

### API contract with OpenDS

The plugin talks to three endpoints on the OpenDS app:

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `GET  /api/plugin/health` | Connection test | `Bearer <apiKey>` |
| `POST /api/penpot/tokens` | Push token payload (colors, typography, spacing) → persists to `design_tokens` table | `Bearer <apiKey>` |
| `GET  /api/penpot/sync-status` | Fetch sync stats | `Bearer <apiKey>` |

Token payload shape (POST body):

```json
{
  "version": "1.0",
  "source": "penpot",
  "exportedAt": "2026-06-23T12:00:00Z",
  "colors": [{ "id": "...", "name": "primary.500", "value": "#FF6B4A", "type": "color" }],
  "typography": [{ "id": "...", "name": "heading", "fontFamily": "Inter", "fontSize": "32px", "fontWeight": 700, "lineHeight": "1.2", "type": "typography" }],
  "spacing": [{ "id": "...", "name": "space-4", "value": "16px", "type": "spacing" }]
}
```

If the token payload shape changes here, update `opends/server/api/penpot/tokens.post.ts` in the main app too.

### Plugin configuration

User-entered settings (OpenDS URL + API key) are persisted in `penpot.localStorage` under the key `opends_config` as JSON:

```json
{ "url": "http://localhost:3000", "apiKey": "...", "connected": true, "lastSyncAt": "..." }
```

## Building and testing in Penpot

1. `npm run build` — compiles `src/` to `dist/` (optional — runtime files are in `public/`)
2. `npm run serve` — serves `public/` locally on port 3002
3. In Penpot → Plugins → Plugin Manager → enter `http://localhost:3002/manifest.json`

## Sync flow (end-to-end)

1. Designer opens plugin in Penpot → plugin.js opens index.html as iframe
2. UI sends `load-config` → plugin reads localStorage → UI shows connection form or main view
3. User enters OpenDS URL + API Key → UI sends `test-connection` → plugin calls `/api/plugin/health`
4. Connection confirmed → config saved, UI switches to main view with Token/Components/Status/Settings tabs
5. User clicks "Sync Tokens" → UI sends `extract-tokens` → plugin reads `penpot.library.local`
6. Plugin returns extracted tokens → UI shows preview with color swatches and counts
7. UI sends `sync-tokens` → plugin POSTs to `/api/penpot/tokens` → OpenDS persists to database
8. Result shown: `synced`, `skipped`, `failed` counts

## OpenDS persistence (in opends/ repo)

The `POST /api/penpot/tokens` handler in `opends/server/api/penpot/tokens.post.ts`:
- Validates the API key
- Reshapes the plugin array payload into `TokenRepository.importTokens()` format
- Calls `importTokens(tokensData, 'penpot-plugin')` → tokens persist to the `design_tokens` table
- Skips duplicates (checks `findByName` before inserting)
- Returns `{ synced, skipped, failed, errors }`
