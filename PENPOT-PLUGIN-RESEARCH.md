# Penpot Plugin Development Research for OpenDS

## Executive Summary

This document outlines best practices for creating a Penpot plugin focused on design system synchronization, with specific recommendations for the OpenDS plugin. It covers plugin architecture, UI patterns, API features, and integration best practices based on official Penpot documentation and community standards.

---

## Table of Contents

1. [Plugin Architecture Best Practices](#plugin-architecture-best-practices)
2. [UI Design Guidelines](#ui-design-guidelines)
3. [Penpot API Features for Design Systems](#penpot-api-features-for-design-systems)
4. [OpenDS Plugin Recommendations](#opends-plugin-recommendations)
5. [Implementation Checklist](#implementation-checklist)
6. [Resources](#resources)

---

## Plugin Architecture Best Practices

### 1. Project Structure

**Recommended Structure:**
```
opends-penpot-plugin/
├── src/
│   ├── plugin.ts              # Main plugin entry point
│   ├── index.html             # Plugin UI (iframe)
│   ├── api/
│   │   └── hub-api.ts         # API client for OpenDS backend
│   ├── tokens/
│   │   ├── extractor.ts       # Token extraction logic
│   │   └── transformer.ts     # Data transformation
│   ├── components/
│   │   └── extractor.ts       # Component extraction
│   └── utils/
│       └── storage.ts         # Local storage management
├── dist/                       # Build output
├── manifest.json              # Plugin manifest
├── tsconfig.json
└── package.json
```

### 2. Build Configuration

**Use TypeScript + Vite:**
- TypeScript provides type safety and IDE support
- Vite offers fast HMR (Hot Module Replacement) for development
- The `@penpot/plugin-types` package provides complete type definitions

**Example `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@penpot/plugin-types": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

### 3. Manifest Configuration

**Essential Fields:**
```json
{
  "id": "opends-sync",
  "name": "OpenDS Sync",
  "description": "Sync your Penpot design system to OpenDS platform",
  "version": "0.1.0",
  "icon": "🔄",
  "main": "dist/plugin.js",
  "permissions": [
    "content:read",      // Read design elements
    "library:read",      // Access design tokens & components
    "library:write"      // Create/update library elements (future)
  ]
}
```

**Permission Types Explained:**
- `content:read` - View shapes, pages, design elements
- `content:write` - Modify design elements (use sparingly)
- `library:read` - Access shared components and design tokens
- `library:write` - Create/update library components
- `user:read` - Access user information
- `comment:read/write` - Read/write comments
- `allow:downloads` - Download project files

**Security Best Practice:** Only request permissions you actually need.

---

## UI Design Guidelines

### 1. Design Principles for Penpot Plugins

**Follow Penpot's Design System:**
- Use the `@penpot/plugin-styles` package for consistent styling
- Maintain visual consistency with Penpot's interface
- Use semantic HTML for accessibility

### 2. Recommended UI Patterns

**Default Plugin Dimensions:**
- Default: 285px × 540px
- Customizable via `penpot.ui.open()` options
- Recommended for OpenDS: 440px × 600px (comfortable for forms)

**UI Structure:**
```html
<!-- Header with branding -->
<header>
  <h1>🔄 OpenDS Sync</h1>
  <span class="status-badge">Connected</span>
</header>

<!-- Navigation Tabs -->
<nav>
  <button data-view="tokens">Tokens</button>
  <button data-view="components">Components</button>
  <button data-view="status">Status</button>
  <button data-view="settings">Settings</button>
</nav>

<!-- Dynamic Content Area -->
<main id="content">
  <!-- View content changes here -->
</main>
```

### 3. Color Palette & Typography

**Recommended Color Scheme (consistent with Penpot):**
```css
:root {
  /* Primary */
  --color-primary: #1e40af;
  --color-primary-dark: #1e3a8a;
  
  /* Status Colors */
  --color-success: #065f46;
  --color-success-bg: #d1fae5;
  --color-error: #991b1b;
  --color-error-bg: #fee2e2;
  --color-info: #1e40af;
  --color-info-bg: #dbeafe;
  
  /* Neutral */
  --color-gray-50: #f8f9fa;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-600: #6b7280;
  --color-gray-800: #374151;
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
}
```

### 4. Component Patterns

**Button Styles:**
```css
.primary-button {
  width: 100%;
  padding: 12px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-button:hover {
  background: var(--color-primary-dark);
}

.primary-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
```

**Card/Section Containers:**
```css
.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### 5. Accessibility Requirements

- **Semantic HTML:** Use proper heading hierarchy (`h1`, `h2`, `h3`)
- **ARIA Labels:** Add `aria-label` to interactive elements
- **Keyboard Navigation:** Ensure all actions are keyboard-accessible
- **Focus States:** Visible focus indicators on all interactive elements
- **Color Contrast:** Minimum 4.5:1 for text, 3:1 for UI components

---

## Penpot API Features for Design Systems

### 1. Design Token Access

**Available via `penpot.library.local`:**

```typescript
// Color Tokens
const colors = penpot.library.local.colors
colors.forEach(color => {
  console.log({
    id: color.id,
    name: color.name,
    value: color.value,  // hex color
    opacity: color.opacity
  })
})

// Typography Tokens
const typographies = penpot.library.local.typographies
typographies.forEach(typo => {
  console.log({
    id: typo.id,
    name: typo.name,
    fontFamily: typo.fontFamily,
    fontSize: typo.fontSize,
    fontWeight: typo.fontWeight,
    lineHeight: typo.lineHeight,
    letterSpacing: typo.letterSpacing
  })
})

// Spacing/Dimension Tokens
const spacings = penpot.library.local.spacings
```

**Important Notes:**
- ✅ Native design tokens are W3C DTCG compliant
- ⚠️ Plugin API for token manipulation is limited (read-only for now)
- 🔜 Full programmatic token management API coming soon

### 2. Component Access

**Library Components:**
```typescript
const components = penpot.library.local.components

components.forEach(component => {
  console.log({
    id: component.id,
    name: component.name,
    // Access component shapes/structure
  })
})
```

**Current Page Elements:**
```typescript
const currentPage = penpot.currentPage
const shapes = currentPage.getShapes()

shapes.forEach(shape => {
  console.log({
    type: shape.type,  // 'rectangle', 'text', 'path', 'group', etc.
    name: shape.name,
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
    fills: shape.fills,
    strokes: shape.strokes
  })
})
```

### 3. File & Project Context

```typescript
// Get current file info
const file = penpot.currentFile
console.log({
  id: file.id,
  name: file.name
})

// Get all pages
const pages = file.pages
pages.forEach(page => {
  console.log({
    id: page.id,
    name: page.name
  })
})
```

### 4. Storage API

**Plugin-specific local storage:**
```typescript
// Save configuration
await penpot.storage.set('opends_config', JSON.stringify({
  url: 'https://opends.example.com',
  apiKey: 'opends_...',
  autoSync: true,
  connected: true
}))

// Retrieve configuration
const configStr = await penpot.storage.get('opends_config')
const config = JSON.parse(configStr)
```

### 5. Communication Between Plugin & UI

**From Plugin to UI (iframe):**
```typescript
// In plugin.ts
penpot.ui.sendMessage({
  type: 'token-data',
  payload: { colors, typography }
})
```

**From UI to Plugin:**
```typescript
// In index.html <script>
window.addEventListener('message', (event) => {
  if (event.data.type === 'extract-tokens') {
    // Handle message
  }
})

// Send message to plugin
parent.postMessage({
  type: 'sync-request',
  payload: { ... }
}, '*')
```

---

## OpenDS Plugin Recommendations

### 1. Core Features to Implement

**Phase 1: Design Token Sync (✅ Current)**
- [x] Extract colors from `penpot.library.local.colors`
- [x] Extract typography from `penpot.library.local.typographies`
- [x] Extract spacing tokens
- [x] Transform to OpenDS format
- [x] Sync to OpenDS API endpoint

**Phase 2: Component Metadata**
- [ ] Extract component names & descriptions
- [ ] Capture component variants
- [ ] Extract component dimensions
- [ ] Sync component metadata to OpenDS

**Phase 3: Component Code Export**
- [ ] Generate CSS from component styles
- [ ] Export SVG for vector components
- [ ] Generate HTML structure
- [ ] Create component documentation

**Phase 4: Asset Management**
- [ ] Extract image assets
- [ ] Export SVG icons
- [ ] Sync to OpenDS asset library

**Phase 5: Real-time Sync**
- [ ] Webhook integration
- [ ] Auto-sync on file changes
- [ ] Conflict resolution

### 2. Data Transformation Strategy

**Transform Penpot tokens to OpenDS format:**

```typescript
// Input: Penpot color token
{
  id: "color-1",
  name: "Primary Blue",
  value: "#1e40af",
  opacity: 1
}

// Output: OpenDS format
{
  type: "color",
  name: "primary-blue",
  value: "#1e40af",
  category: "brand",
  usage: "Primary brand color",
  metadata: {
    source: "penpot",
    lastSync: "2026-01-03T12:00:00Z"
  }
}
```

### 3. API Integration Best Practices

**Endpoint Structure (already implemented):**
```
GET  /api/plugin/health         # Health check
POST /api/penpot/tokens         # Token sync
POST /api/penpot/components     # Component sync (future)
GET  /api/penpot/status         # Sync status (future)
```

**Authentication:**
- Use Bearer token: `Authorization: Bearer opends_...`
- Store API key securely in `penpot.storage`
- Validate on every request

**Error Handling:**
```typescript
async function syncTokens(tokens: Token[]) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch(config.url + '/api/penpot/tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tokens),
      signal: controller.signal
    })
    
    clearTimeout(timeout)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection')
    }
    throw error
  }
}
```

### 4. UI/UX Recommendations

**Connection Flow:**
1. **Welcome Screen** (not connected)
   - Logo & branding
   - URL input (with validation)
   - API key input (password field)
   - "Test Connection" button
   - Clear error messages

2. **Main Dashboard** (connected)
   - Connection status badge
   - Tab navigation (Tokens, Components, Status, Settings)
   - Stats overview (token counts)
   - Primary action buttons

3. **Token Sync View**
   - Preview extracted tokens
   - Color swatches with names
   - Typography preview
   - "Sync to OpenDS" button
   - Sync status messages

4. **Settings View**
   - Edit connection settings
   - Enable/disable auto-sync
   - Disconnect option
   - API key visibility toggle

**Status Messages:**
```typescript
interface StatusMessage {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number  // Auto-hide after X ms
}

function showStatus(msg: StatusMessage) {
  const el = document.getElementById('status')
  el.textContent = msg.message
  el.className = `status ${msg.type}`
  
  if (msg.duration) {
    setTimeout(() => el.classList.remove(msg.type), msg.duration)
  }
}
```

### 5. Performance Optimization

**Token Extraction:**
- Extract tokens on-demand (not on plugin load)
- Show progress for large libraries
- Paginate component lists (>100 items)

**Network Optimization:**
- Batch API requests
- Implement request debouncing
- Use compression for large payloads

**Caching:**
```typescript
let cachedTokens: TokenData | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60000 // 1 minute

async function getTokens(forceRefresh = false) {
  const now = Date.now()
  
  if (!forceRefresh && cachedTokens && (now - cacheTimestamp < CACHE_DURATION)) {
    return cachedTokens
  }
  
  // Extract fresh tokens
  const tokens = extractTokensFromPenpot()
  cachedTokens = tokens
  cacheTimestamp = now
  
  return tokens
}
```

---

## Implementation Checklist

### Development Setup
- [x] ✅ Initialize TypeScript project
- [x] ✅ Install `@penpot/plugin-types`
- [x] ✅ Configure build with Vite/esbuild
- [x] ✅ Set up manifest.json
- [x] ✅ Configure local development server

### Core Plugin Features
- [x] ✅ Plugin initialization
- [x] ✅ UI rendering in iframe
- [x] ✅ Connection configuration
- [x] ✅ Health check endpoint
- [x] ✅ Token extraction (colors, typography, spacing)
- [x] ✅ Token sync to OpenDS
- [ ] ⏳ Component extraction
- [ ] ⏳ Component code generation
- [ ] ⏳ Asset management

### UI/UX
- [x] ✅ Welcome/connection screen
- [x] ✅ Main dashboard with tabs
- [x] ✅ Token preview
- [x] ✅ Status messages
- [x] ✅ Settings page
- [ ] ⏳ Loading states
- [ ] ⏳ Empty states
- [ ] ⏳ Error states with retry

### API Integration
- [x] ✅ Health check endpoint
- [x] ✅ Token sync endpoint
- [x] ✅ Authentication with Bearer token
- [x] ✅ Error handling
- [ ] ⏳ Component sync endpoint
- [ ] ⏳ Status tracking endpoint
- [ ] ⏳ Webhook support

### Testing & Quality
- [ ] ⏳ Unit tests for extractors
- [ ] ⏳ Integration tests for API
- [ ] ⏳ Manual testing checklist
- [ ] ⏳ Browser compatibility testing
- [ ] ⏳ Accessibility audit

### Documentation
- [x] ✅ README with installation instructions
- [x] ✅ API documentation
- [ ] ⏳ User guide with screenshots
- [ ] ⏳ Developer contribution guide
- [ ] ⏳ Troubleshooting guide

### Deployment
- [ ] ⏳ Build optimization
- [ ] ⏳ Version management
- [ ] ⏳ Submit to Penpot Hub
- [ ] ⏳ Set up GitHub releases
- [ ] ⏳ Create plugin landing page

---

## Resources

### Official Documentation
- **Penpot Plugin Guide:** https://help.penpot.app/plugins/create-a-plugin/
- **API Documentation:** https://penpot-plugins-api-doc.pages.dev/
- **Plugin Styles:** https://penpot-plugins-styles.pages.dev/
- **Penpot Help Center:** https://help.penpot.app/user-guide/plugins/

### Code Examples
- **Starter Template:** https://github.com/penpot/penpot-plugin-starter-template
- **Plugin Samples:** https://github.com/penpot/penpot-plugins-samples
- **Framework Examples:** https://github.com/penpot/plugin-examples

### Community
- **Penpot Community:** https://community.penpot.app/
- **GitHub Issues:** https://github.com/penpot/penpot/issues
- **Discord:** https://discord.gg/penpot

### Design Token Standards
- **W3C DTCG Spec:** https://design-tokens.github.io/community-group/format/
- **Tokens Studio:** https://tokens.studio/
- **Design Tokens in Penpot:** https://penpot.app/design-tokens

### Design System Resources
- **Material Design:** https://material.io/design
- **Carbon Design System:** https://carbondesignsystem.com/
- **Fluent UI:** https://fluent2.microsoft.design/

---

## Recommended Next Steps for OpenDS Plugin

### Immediate (Week 1-2)
1. ✅ Complete token sync implementation
2. 🔄 Add comprehensive error handling
3. 🔄 Implement loading/progress states
4. 🔄 Add token preview enhancements
5. 🔄 Write user documentation

### Short-term (Month 1)
1. Implement component metadata extraction
2. Add component variant detection
3. Create component preview UI
4. Implement sync status tracking
5. Add auto-sync functionality

### Medium-term (Month 2-3)
1. Component code generation (CSS, HTML, SVG)
2. Asset extraction and management
3. Proposal/documentation trigger system
4. Advanced filtering and search
5. Export to multiple formats (CSS, SCSS, JSON)

### Long-term (Month 4+)
1. Real-time sync with webhooks
2. Conflict resolution UI
3. Version history tracking
4. Team collaboration features
5. Advanced analytics dashboard

---

## Conclusion

The OpenDS plugin is well-positioned to become a powerful design system synchronization tool for Penpot. By following these best practices and leveraging Penpot's robust API, you can create a seamless workflow between design and development.

**Key Success Factors:**
1. ✅ **Clean Architecture** - Modular, maintainable code
2. ✅ **Intuitive UI** - Follows Penpot design patterns
3. ✅ **Robust API Integration** - Reliable sync with error handling
4. 🔄 **Comprehensive Documentation** - Clear for both users and contributors
5. 🔄 **Active Maintenance** - Regular updates and community engagement

---

*Last Updated: January 3, 2026*
*Researched by: Antigravity AI Assistant*
