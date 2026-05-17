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
| **Plugin** (headless worker) | `src/main-plugin.ts` | Access Penpot API (`penpot.*`), call `fetch`, communicate with UI via `penpot.ui.sendMessage` |
| **UI** (iframe) | `public/index.html` | Render user interface, receive messages from plugin via `window.addEventListener('message', ...)` |

### Source structure

```
src/
├── main-plugin.ts          # Plugin entry point — orchestrates everything
├── plugin/
│   ├── api/
│   │   └── hub-api.ts      # HTTP client for the OpenDS app (HubAPI class)
│   ├── tokens/
│   │   ├── extractor.ts    # Reads colors/typography from penpot.library.local
│   │   └── transformer.ts  # Converts Penpot token shapes to OpenDS format
│   └── index.ts            # Re-exports public API
└── types.ts                # Shared TypeScript types

public/
├── index.html              # Plugin UI (rendered in Penpot's iframe)
└── plugin.js               # Built plugin code loaded by Penpot
```

### Key classes

- **`HubAPI`** (`src/plugin/api/hub-api.ts`) — manages OpenDS connection config (stored in `penpot.localStorage`), tests connectivity via `GET /api/plugin/health`, and syncs tokens via `POST /api/penpot/tokens`
- **`TokenExtractor`** (`src/plugin/tokens/extractor.ts`) — reads `penpot.library.local.colors` and `.typographies` and normalizes them into typed token objects
- **`TokenTransformer`** (`src/plugin/tokens/transformer.ts`) — converts extracted tokens to the OpenDS wire format

### API contract with OpenDS

The plugin talks to two endpoints on the OpenDS app:

| Endpoint | Purpose |
|----------|---------|
| `GET  /api/plugin/health` | Connection test (auth: `Bearer <apiKey>`) |
| `POST /api/penpot/tokens` | Push token payload |
| `GET  /api/penpot/sync-status` | Fetch sync stats |

If the token payload shape changes here, update `opends/server/api/penpot/tokens.post.ts` in the main app too.

### Plugin configuration

User-entered settings (OpenDS URL + API key) are persisted in `penpot.localStorage` under the key `opends_config` as JSON matching the `OpenDSConfig` interface.

## Building and testing in Penpot

1. `npm run build` — compiles `src/` to `dist/`
2. `npm run serve` — serves `public/` locally (default port 3000)
3. In Penpot → Plugins → Add custom plugin → point to `http://localhost:3000/manifest.json`
