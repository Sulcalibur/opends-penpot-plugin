# Quick Start: Build Your Design Showcase Page

> 🎯 **Goal:** Create a beautiful HTML page that displays your Penpot design tokens and components

---

## ⚡ Fast Track (30 minutes)

### Step 1: Add API Endpoint (5 min)

Create `server/api/showcase/tokens.get.ts` in your OpenDS repo:

```typescript
export default defineEventHandler(async (event) => {
  // For now, return from memory/JSON
  // Later: query from database
  
  const tokens = {
    colors: [
      { id: '1', name: 'Primary', value: '#1e40af', type: 'color' },
      { id: '2', name: 'Secondary', value: '#6b7280', type: 'color' },
      // Add more from your Penpot sync
    ],
    typography: [
      { 
        id: '1', 
        name: 'Heading 1', 
        fontFamily: 'Inter',
        fontSize: 48,
        fontWeight: 700,
        lineHeight: 1.2 
      },
      // Add more
    ],
    spacing: [
      { id: '1', name: 'xs', value: 4, type: 'spacing' },
      { id: '2', name: 'sm', value: 8, type: 'spacing' },
      // Add more
    ]
  }
  
  return tokens
})
```

### Step 2: Create Showcase Page (10 min)

Create `app/pages/showcase.vue`:

```vue
<template>
  <div class="showcase">
    <header>
      <h1>🎨 Design System Showcase</h1>
      <p>Live preview from Penpot</p>
    </header>

    <!-- Colors -->
    <section>
      <h2>Colors</h2>
      <div class="color-grid">
        <div v-for="color in tokens?.colors" :key="color.id" class="color-card">
          <div class="preview" :style="{ background: color.value }" />
          <h3>{{ color.name }}</h3>
          <code>{{ color.value }}</code>
        </div>
      </div>
    </section>

    <!-- Typography -->
    <section>
      <h2>Typography</h2>
      <div v-for="typo in tokens?.typography" :key="typo.id" class="typo-sample">
        <div 
          :style="{
            fontFamily: typo.fontFamily,
            fontSize: typo.fontSize + 'px',
            fontWeight: typo.fontWeight
          }"
          class="sample-text"
        >
          {{ typo.name }}
        </div>
        <code>{{ typo.fontFamily }} / {{ typo.fontSize }}px / {{ typo.fontWeight }}</code>
      </div>
    </section>

    <!-- Spacing -->
    <section>
      <h2>Spacing</h2>
      <div v-for="space in tokens?.spacing" :key="space.id" class="spacing-row">
        <div class="spacing-visual" :style="{ width: space.value + 'px' }" />
        <span>{{ space.name }}: {{ space.value }}px</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { data: tokens } = await useFetch('/api/showcase/tokens')
</script>

<style scoped>
.showcase {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

section {
  margin: 48px 0;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 24px;
}

.color-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.color-card .preview {
  height: 100px;
}

.color-card h3,
.color-card code {
  padding: 8px 12px;
  background: white;
  display: block;
}

.typo-sample {
  padding: 24px;
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
}

.sample-text {
  margin-bottom: 12px;
}

.spacing-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 16px 0;
}

.spacing-visual {
  height: 32px;
  background: #1e40af;
  border-radius: 4px;
}
</style>
```

### Step 3: Update Plugin to Store Tokens (10 min)

Modify your plugin's sync function to ensure data is persisted:

```typescript
// In server/api/penpot/tokens.post.ts
export default defineEventHandler(async (event) => {
  const apiKey = extractApiKey(event)
  if (!apiKey || !(await validateApiKey(apiKey))) {
    throw getAuthError()
  }
  
  const body = await readBody(event)
  const { colors, typography, spacing } = body
  
  // Save to database or JSON file
  // For now, you can save to a JSON file:
  const fs = await import('fs/promises')
  await fs.writeFile(
    './data/design-tokens.json',
    JSON.stringify({ colors, typography, spacing }, null, 2)
  )
  
  return {
    success: true,
    processed: (colors?.length || 0) + (typography?.length || 0) + (spacing?.length || 0)
  }
})
```

Then update the GET endpoint to read from this file:

```typescript
// server/api/showcase/tokens.get.ts
export default defineEventHandler(async (event) => {
  const fs = await import('fs/promises')
  
  try {
    const data = await fs.readFile('./data/design-tokens.json', 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // Return empty if file doesn't exist yet
    return { colors: [], typography: [], spacing: [] }
  }
})
```

### Step 4: Test It! (5 min)

1. Start your dev server: `pnpm dev`
2. Open Penpot plugin and sync tokens
3. Visit: `http://localhost:3001/showcase`
4. See your design tokens beautifully displayed! 🎉

---

## 🚀 Next Steps

### Add Components (Later)

1. **Extract SVG from Penpot**
```typescript
// Add to plugin
const svg = await penpot.export([shapeId], { type: 'svg' })
```

2. **Store Components**
```typescript
// POST /api/penpot/components
await fetch(url + '/api/penpot/components', {
  method: 'POST',
  body: JSON.stringify({ components: [{ id, name, svg }] })
})
```

3. **Display Components**
```vue
<div v-for="comp in components" :key="comp.id">
  <h3>{{ comp.name }}</h3>
  <div v-html="sanitize(comp.svg)" />
</div>
```

### Make It Interactive

- [ ] Add search/filter
- [ ] Copy-to-clipboard buttons
- [ ] Dark mode toggle
- [ ] Export as CSS variables
- [ ] Share links for specific tokens

### Go Pro with Storybook

If you want industry-standard documentation:
```bash
npx storybook@latest init
npm install storybook-design-token
```

---

## 📚 Full Research

See `SHOWCASE-RESEARCH.md` for:
- 4 different approaches compared
- Storybook integration guide
- Best practices from top design systems
- Code examples for every scenario
- Implementation roadmap

---

## ✨ Pro Tips

1. **Start Simple**: Get the basic showcase working first
2. **Use Your Existing API**: You already have `/api/penpot/tokens`
3. **Iterate**: Add features based on what you actually need
4. **Inspiration**: Check out https://carbondesignsystem.com/

Good luck! 🎨
