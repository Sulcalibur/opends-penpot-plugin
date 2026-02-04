# Penpot to HTML Showcase - Research & Best Practices

**Date:** 2026-01-03  
**Objective:** Research the best way to sync or input components, tokens, etc from Penpot out to an HTML page for showcasing the work

---

## Executive Summary

Based on research into Penpot's API, plugin capabilities, and design system showcase best practices, there are **four primary approaches** to syncing Penpot content to HTML pages:

1. **Plugin API Extract → JSON → Static Site Generator** (Recommended for your use case)
2. **Penpot Export Tool → CSS/SCSS → Documentation Site**
3. **Real-time API Integration → Dynamic Web App**
4. **Hybrid: Plugin + Storybook Integration**

---

## Current State Analysis

### What You Have
- ✅ **Penpot Plugin** that extracts design tokens (colors, typography, spacing)
- ✅ **OpenDS Hub API** that receives and stores tokens
- ✅ **Token sync workflow** via `/api/penpot/tokens` endpoint
- ❌ **No HTML showcase/documentation** yet

### What You Can Extract from Penpot
According to the Penpot Plugin API:

| Asset Type | Availability | Current Status | Export Format |
|------------|--------------|----------------|---------------|
| Design Tokens (Colors) | ✅ Available | ✅ Implemented | JSON |
| Design Tokens (Typography) | ✅ Available | ✅ Implemented | JSON |
| Design Tokens (Spacing) | ✅ Available | ✅ Implemented | JSON |
| Components (SVG) | ✅ Available | ⏳ Phase 3 | SVG export API |
| Components (HTML) | ⚠️ Via plugins | ❌ Not yet | Locofy/Custom |
| Components (CSS) | ⚠️ Via tools | ❌ Not yet | penpot-export |
| Component Metadata | ⚠️ Limited | ❌ Not yet | API lacks full info |

---

## Approach 1: Plugin API Extract → JSON → Static Site (RECOMMENDED)

### Why This Approach?
- ✅ You already have the plugin infrastructure
- ✅ Fits your existing OpenDS architecture
- ✅ Full control over presentation
- ✅ Works with your current API endpoints

### Architecture

```
┌─────────────┐
│   Penpot    │  1. Extract tokens/components
│   Plugin    │     via penpot.library.local
└──────┬──────┘
       │
       │ 2. POST to API
       ▼
┌─────────────────────┐
│   OpenDS Server     │  3. Store in database
│  /api/penpot/*      │     or static JSON
└──────┬──────────────┘
       │
       │ 4. Generate HTML
       ▼
┌─────────────────────┐
│  Showcase Site      │  5. Display tokens
│  (Nuxt/Static)      │     & components
└─────────────────────┘
```

### Implementation Steps

#### Step 1: Enhance Plugin to Extract Components

```typescript
// Add to your plugin's extractor
async function extractComponents() {
  const page = penpot.currentPage
  const components = []
  
  // Get all components from the page
  for (const shape of page.shapes) {
    if (shape.type === 'frame' || shape.componentId) {
      const exported = await penpot.export([shape.id], {
        type: 'svg',
        scale: 2
      })
      
      components.push({
        id: shape.id,
        name: shape.name,
        svg: exported,
        // Extract styles from inspect panel
        styles: {
          width: shape.width,
          height: shape.height,
          fills: shape.fills,
          strokes: shape.strokes,
          effects: shape.effects
        }
      })
    }
  }
  
  return components
}
```

#### Step 2: Create Showcase API Endpoint

```typescript
// server/api/showcase/tokens.get.ts
export default defineEventHandler(async (event) => {
  // Fetch from database or read from static JSON
  const tokens = await db.query(`
    SELECT category, name, value, type 
    FROM design_tokens 
    ORDER BY category, name
  `)
  
  // Group by category
  const grouped = {
    colors: tokens.filter(t => t.type === 'color'),
    typography: tokens.filter(t => t.type === 'typography'),
    spacing: tokens.filter(t => t.type === 'spacing')
  }
  
  return grouped
})
```

#### Step 3: Create HTML Showcase Page

```vue
<!-- app/pages/showcase/index.vue -->
<template>
  <div class="showcase">
    <header class="showcase-header">
      <h1>Design System Showcase</h1>
      <p>Live preview of design tokens from Penpot</p>
    </header>
    
    <!-- Color Tokens -->
    <section class="showcase-section">
      <h2>Color Palette</h2>
      <div class="color-grid">
        <div 
          v-for="color in tokens.colors" 
          :key="color.id"
          class="color-swatch"
        >
          <div 
            class="color-preview" 
            :style="{ background: color.value }"
          />
          <div class="color-info">
            <h3>{{ color.name }}</h3>
            <code>{{ color.value }}</code>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Typography Tokens -->
    <section class="showcase-section">
      <h2>Typography</h2>
      <div class="typography-grid">
        <div 
          v-for="typo in tokens.typography" 
          :key="typo.id"
          class="typography-sample"
          :style="{
            fontFamily: typo.fontFamily,
            fontSize: typo.fontSize + 'px',
            fontWeight: typo.fontWeight,
            lineHeight: typo.lineHeight
          }"
        >
          <h3>{{ typo.name }}</h3>
          <p class="sample-text">The quick brown fox jumps over the lazy dog</p>
          <code>{{ typo.fontFamily }} / {{ typo.fontSize }}px / {{ typo.fontWeight }}</code>
        </div>
      </div>
    </section>
    
    <!-- Spacing Tokens -->
    <section class="showcase-section">
      <h2>Spacing Scale</h2>
      <div class="spacing-grid">
        <div 
          v-for="space in tokens.spacing" 
          :key="space.id"
          class="spacing-sample"
        >
          <div 
            class="spacing-visual"
            :style="{ width: space.value + 'px', height: '32px' }"
          />
          <div class="spacing-info">
            <h3>{{ space.name }}</h3>
            <code>{{ space.value }}px</code>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Components (Future) -->
    <section class="showcase-section">
      <h2>Components</h2>
      <div class="component-grid">
        <div 
          v-for="component in components" 
          :key="component.id"
          class="component-card"
        >
          <div class="component-preview" v-html="component.svg" />
          <h3>{{ component.name }}</h3>
          <details>
            <summary>View Code</summary>
            <pre><code>{{ component.svg }}</code></pre>
          </details>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { data: tokens } = await useFetch('/api/showcase/tokens')
const { data: components } = await useFetch('/api/showcase/components')
</script>

<style scoped>
.showcase {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

.showcase-header {
  text-align: center;
  margin-bottom: 64px;
}

.showcase-section {
  margin-bottom: 64px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.color-swatch {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.color-preview {
  height: 120px;
  border-bottom: 1px solid #e5e7eb;
}

.color-info {
  padding: 16px;
  background: white;
}

.typography-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.typography-sample {
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.spacing-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.spacing-sample {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.spacing-visual {
  background: #1e40af;
  border-radius: 4px;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.component-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.component-preview {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

---

## Approach 2: Penpot Export Tool → CSS/SCSS

### Using `penpot-export` CLI Tool

```bash
# Install penpot-export
npm install -g penpot-export

# Export design tokens
penpot-export --url https://design.penpot.app \
  --access-token YOUR_TOKEN \
  --file-id YOUR_FILE_ID \
  --output ./tokens \
  --format css
```

### Generated Output
```css
/* tokens/colors.css */
:root {
  --color-primary-500: #1e40af;
  --color-primary-600: #1e3a8a;
  --color-gray-50: #f8f9fa;
  /* ... */
}

/* tokens/typography.css */
:root {
  --font-family-heading: 'Inter', sans-serif;
  --font-size-h1: 48px;
  --font-weight-bold: 700;
  /* ... */
}
```

### Use in HTML Showcase
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="tokens/colors.css">
  <link rel="stylesheet" href="tokens/typography.css">
  <style>
    .demo-heading {
      font-family: var(--font-family-heading);
      font-size: var(--font-size-h1);
      color: var(--color-primary-500);
    }
  </style>
</head>
<body>
  <h1 class="demo-heading">Design System Showcase</h1>
</body>
</html>
```

---

## Approach 3: Storybook Integration (Industry Standard)

### Why Storybook?
Storybook is the **industry standard** for design system documentation:
- ✅ Living component documentation
- ✅ Interactive controls for props
- ✅ Visual regression testing
- ✅ Accessibility testing built-in
- ✅ Used by IBM Carbon, Material Design, Airbnb, etc.

### Setup Storybook with Penpot Tokens

1. **Install Storybook**
```bash
npx storybook@latest init
npm install storybook-design-token --save-dev
```

2. **Create Token Stories**
```typescript
// stories/design-tokens.stories.ts
import type { Meta } from '@storybook/vue3'

export default {
  title: 'Design System/Tokens',
} as Meta

// Load tokens from your API or JSON file
const tokens = await fetch('https://opends.sulei.dev/api/showcase/tokens')
  .then(r => r.json())

export const Colors = () => ({
  template: `
    <div>
      <h1>Color Palette</h1>
      <div v-for="color in colors" :key="color.id" class="color-swatch">
        <div :style="{ background: color.value }" class="preview"></div>
        <div class="info">
          <strong>{{ color.name }}</strong>
          <code>{{ color.value }}</code>
        </div>
      </div>
    </div>
  `,
  data() {
    return { colors: tokens.colors }
  }
})
```

3. **Create Component Stories**
```typescript
// stories/Button.stories.ts
import Button from '../components/Button.vue'

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost']
    }
  }
}

export const Primary = {
  args: {
    variant: 'primary',
    label: 'Click me'
  }
}
```

### Automated Token Sync Workflow
```yaml
# .github/workflows/sync-tokens.yml
name: Sync Penpot Tokens to Storybook

on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Fetch tokens from OpenDS API
      - name: Fetch Design Tokens
        run: |
          curl https://opends.sulei.dev/api/showcase/tokens \
            -o stories/tokens.json
      
      # Commit if changed
      - name: Commit Changes
        run: |
          git config user.name "Token Sync Bot"
          git add stories/tokens.json
          git commit -m "Sync design tokens from Penpot" || exit 0
          git push
      
      # Deploy Storybook
      - name: Build Storybook
        run: npm run build-storybook
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./storybook-static
```

---

## Approach 4: Real-time Component Embedding

### SVG Component Export

```typescript
// Add to plugin
async function exportComponentToSVG(shapeId: string) {
  const svg = await penpot.export([shapeId], {
    type: 'svg',
    scale: 2
  })
  
  return {
    id: shapeId,
    svg: svg,
    metadata: extractMetadata(shapeId)
  }
}

// Sync to API
async function syncComponents() {
  const components = await getAllComponents()
  
  await fetch(config.url + '/api/penpot/components', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + config.apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ components })
  })
}
```

### Display in HTML

```vue
<template>
  <div class="component-showcase">
    <div v-for="component in components" :key="component.id">
      <h3>{{ component.name }}</h3>
      
      <!-- Direct SVG embedding -->
      <div v-html="sanitize(component.svg)" />
      
      <!-- Or as image -->
      <img :src="'data:image/svg+xml;base64,' + btoa(component.svg)" />
      
      <!-- Download option -->
      <a :href="downloadUrl(component)" download>
        Download SVG
      </a>
    </div>
  </div>
</template>

<script setup>
import DOMPurify from 'dompurify'

const sanitize = (html) => DOMPurify.sanitize(html)

const downloadUrl = (component) => {
  const blob = new Blob([component.svg], { type: 'image/svg+xml' })
  return URL.createObjectURL(blob)
}
</script>
```

---

## Best Practices for Design System Showcases

### 1. **Organization**
```
showcase/
├── tokens/
│   ├── colors.html
│   ├── typography.html
│   └── spacing.html
├── components/
│   ├── buttons.html
│   ├── forms.html
│   └── cards.html
├── patterns/
│   ├── navigation.html
│   └── layouts.html
└── index.html
```

### 2. **Interactive Examples**
```html
<!-- Allow users to copy tokens -->
<div class="token-card">
  <div class="preview" style="background: var(--color-primary)"></div>
  <div class="info">
    <h4>Primary Color</h4>
    <code id="color-value">#1e40af</code>
    <button onclick="copyToClipboard('#color-value')">
      📋 Copy
    </button>
  </div>
</div>
```

### 3. **Accessibility Information**
```html
<div class="color-info">
  <h3>Primary Blue</h3>
  <code>#1e40af</code>
  
  <!-- WCAG Contrast Checker -->
  <div class="a11y-info">
    <span class="badge">WCAG AA ✓</span>
    <p>Contrast ratio on white: 7.32:1</p>
  </div>
</div>
```

### 4. **Search & Filter**
```vue
<template>
  <div>
    <input 
      v-model="search" 
      placeholder="Search tokens..."
      class="search-input"
    />
    
    <div v-for="token in filteredTokens">
      <!-- Token display -->
    </div>
  </div>
</template>

<script setup>
const search = ref('')

const filteredTokens = computed(() => {
  return tokens.filter(t => 
    t.name.toLowerCase().includes(search.value.toLowerCase()) ||
    t.value.toLowerCase().includes(search.value.toLowerCase())
  )
})
</script>
```

### 5. **Responsive Previews**
```html
<!-- Show components at different viewports -->
<div class="responsive-preview">
  <button onclick="setViewport('mobile')">📱 Mobile</button>
  <button onclick="setViewport('tablet')">📱 Tablet</button>
  <button onclick="setViewport('desktop')">🖥️ Desktop</button>
  
  <iframe 
    id="preview-frame"
    class="preview-viewport"
    srcdoc="<your-component-html>"
  ></iframe>
</div>
```

---

## Recommended Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Create `/api/showcase/tokens` endpoint
- [ ] Create `/api/showcase/components` endpoint
- [ ] Build basic showcase page at `/showcase`
- [ ] Display colors, typography, spacing

### Phase 2: Components (Week 2)
- [ ] Enhance plugin to extract component SVGs
- [ ] Store components in database or filesystem
- [ ] Create component showcase grid
- [ ] Add download functionality

### Phase 3: Interactivity (Week 3)
- [ ] Add search and filter
- [ ] Copy-to-clipboard for tokens
- [ ] Responsive preview frames
- [ ] Dark mode toggle

### Phase 4: Automation (Week 4)
- [ ] Auto-sync via GitHub Actions
- [ ] Generate CSS variables file
- [ ] Create Figma/Sketch import option
- [ ] Add changelog tracking

### Phase 5: Storybook (Optional)
- [ ] Set up Storybook
- [ ] Create token stories
- [ ] Create component stories
- [ ] Deploy to GitHub Pages

---

## Tools & Resources

### Penpot Tools
- **penpot-export**: CLI for exporting tokens/components
- **Penpot Plugin API**: https://penpot-plugins-api-doc.pages.dev/
- **Locofy Lightning**: Penpot to code converter plugin

### Design System Showcases (Examples)
- **Carbon Design System**: https://carbondesignsystem.com/
- **Material Design**: https://material.io/
- **Atlassian Design System**: https://atlassian.design/
- **Shopify Polaris**: https://polaris.shopify.com/

### Libraries
- **Storybook**: Component documentation
- **Style Dictionary**: Token transformation
- **DOMPurify**: Sanitize SVG/HTML
- **Prism.js**: Code syntax highlighting

---

## Conclusion

**Best Approach for OpenDS:**

1. **Short term (Now)**: Use **Approach 1** - enhance your existing plugin to extract SVGs and create a simple `/showcase` page on your OpenDS site
2. **Medium term (Next month)**: Add interactivity, search, filters
3. **Long term (Later)**: Consider **Storybook** for professional documentation if you build actual coded components

This approach leverages your existing infrastructure while providing a clear path to scale as your design system grows.
