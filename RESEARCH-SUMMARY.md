# Research Summary: Penpot Integration & Showcase

**Date:** 2026-01-03  
**Status:** ✅ Research Complete  
**Topics:** Penpot MCP Setup, HTML Showcase, Design System Sync

---

## 📚 Research Documents

### 1. Penpot MCP Setup (`PENPOT-MCP-SETUP.md`)
- **Purpose:** Setup Penpot MCP server with Antigravity/AI clients
- **Status:** ✅ Complete
- **Key Finding:** Use Claude Desktop or Cursor for now; Antigravity support pending
- **Time to Setup:** 15 minutes

### 2. Quick MCP Setup (`QUICK-MCP-SETUP.md`)
- **Purpose:** Quick reference for daily MCP usage
- **Status:** ✅ Complete
- **Contents:** 3-step setup, troubleshooting, example queries

### 3. Showcase Research (Below)
- **Purpose:** Export Penpot components to HTML showcase
- **Status:** ✅ Complete
- **Recommended Approach:** Plugin → JSON → Website

---

# Part 1: Penpot MCP Integration Research

## 🎯 What is Penpot MCP?

**Model Context Protocol (MCP)** server that enables AI assistants to:
- Query Penpot design files programmatically
- Analyze UI/UX designs with AI
- Automate design workflows
- Export components and tokens
- Natural language design operations

## ✅ Setup Summary

### Architecture
```
AI Client (Claude/Cursor) ←→ MCP Server ←→ Penpot Plugin ←→ Penpot
     (Port varies)          (Port 4401)    (Port 4400)
```

### Quick Setup (15 min)
1. Clone `github.com/penpot/penpot-mcp`
2. Run `npm run bootstrap`
3. Load plugin at `http://localhost:4400/manifest.json`
4. Configure AI client (Claude Desktop recommended)

### Current Status: Antigravity
- ⚠️ **Not confirmed working** with Antigravity yet
- ✅ **Works great** with Claude Desktop and Cursor IDE
- 🔮 **Future:** Waiting for official Antigravity MCP support

### Use Cases
- "Extract all color tokens from design file"
- "Export navigation component as SVG"
- "List all typography styles"
- "Analyze design consistency"

## 📁 New Files Created
- `PENPOT-MCP-SETUP.md` - Full setup guide (comprehensive)
- `QUICK-MCP-SETUP.md` - Quick reference (15 min setup)

---

# Part 2: Penpot → HTML Showcase Research

---

## 📋 What You Asked For

> "Research the best way to sync or input components, tokens, etc from Penpot out to a HTML page for showcasing the work"

---

## ✅ What I Found

### 4 Main Approaches Available:

1. **Plugin → JSON → Website** (Your best option)
   - Uses your existing Penpot plugin
   - Store tokens via your API
   - Display on custom showcase page
   - ⏱️ **30 minutes to implement**

2. **penpot-export CLI Tool**
   - Command-line export to CSS/SCSS
   - Good for CSS variables
   - ⏱️ **10 minutes to setup**

3. **Storybook Integration**
   - Industry standard for design systems
   - Best for coded component libraries
   - ⏱️ **2-3 hours to setup**

4. **Real-time Embedding**
   - Live SVG component previews
   - Auto-sync capabilities
   - ⏱️ **1 hour to implement**

---

## 🎯 My Recommendation

### **Use Approach 1: Plugin → JSON → Website**

**Why?**
- ✅ You already have the plugin code
- ✅ Fits your current architecture perfectly
- ✅ Can be live in 30 minutes
- ✅ Full control over design
- ✅ Easy to maintain

**What You Can Showcase:**
- ✅ Colors (from Penpot library)
- ✅ Typography (from Penpot library)
- ✅ Spacing (from Penpot library)
- ✅ Components (SVG exports) - coming soon
- ✅ Interactive demos - easy to add

---

## 📚 Documents Created

I've created **4 comprehensive documents** for you:

### 1. `SHOWCASE-RESEARCH.md` (Main Research)
**What's inside:**
- Detailed comparison of all 4 approaches
- Architecture diagrams
- Complete code examples for each approach
- Best practices from top design systems (Carbon, Material, Atlassian)
- Tools and resources
- 5-phase implementation roadmap

**Key sections:**
- ✅ Current state analysis
- ✅ Approach 1: Plugin API Extract (RECOMMENDED)
- ✅ Approach 2: penpot-export CLI
- ✅ Approach 3: Storybook Integration
- ✅ Approach 4: Real-time Embedding
- ✅ Best practices (search, a11y, interactivity)
- ✅ Tools & resources

### 2. `QUICK-START-SHOWCASE.md` (Implementation Guide)
**What's inside:**
- Step-by-step tutorial (30 minutes total)
- Copy-paste ready code
- API endpoint examples
- Vue component code
- Testing instructions

**Steps covered:**
1. Add API endpoint (5 min)
2. Create showcase page (10 min)
3. Update plugin storage (10 min)
4. Test it (5 min)

### 3. `APPROACH-COMPARISON.md` (Decision Guide)
**What's inside:**
- Comparison matrix (difficulty, time, features)
- Feature availability table
- Cost comparison
- Visual quality comparison
- Decision tree flowchart
- Final recommendations

**Helps you decide:**
- Which approach fits your needs
- When to switch to Storybook
- What features each approach supports

### 4. Mock-up Image
**What it shows:**
- Visual example of what your showcase could look like
- Clean, modern design
- Color swatches grid
- Typography samples
- Spacing visualizations

---

## 🚀 Next Steps (If You Want to Implement)

### Option A: Quick Implementation (30 min)
1. Read `QUICK-START-SHOWCASE.md`
2. Follow the 4 steps
3. You'll have a working showcase!

### Option B: Full Research First
1. Read `SHOWCASE-RESEARCH.md` 
2. Review code examples
3. Choose your approach
4. Follow implementation plan

### Option C: Compare Approaches
1. Read `APPROACH-COMPARISON.md`
2. Use decision tree
3. Pick the best fit
4. Implement chosen approach

---

## 💡 Key Insights from Research

### What Penpot Can Export:
✅ **Design Tokens** (colors, typography, spacing) - W3C standard format  
✅ **Components** (SVG export via plugin API)  
✅ **Metadata** (names, values, styles)  
⚠️ **Limited component properties** (API doesn't expose all variants)  
❌ **Not HTML directly** (need plugins like Locofy for that)

### What Design Systems Use:
- **Storybook** - Most popular (IBM Carbon, Shopify Polaris, Atlassian)
- **Custom sites** - Full control (Material Design, Apple)
- **Static generators** - Simple but effective
- **Hybrids** - Mix of above

### Best Practices Discovered:
1. **Interactive examples** - let users copy tokens
2. **Search & filter** - essential for large systems
3. **Accessibility info** - WCAG contrast ratios
4. **Responsive previews** - mobile/tablet/desktop
5. **Dark mode** - show tokens in both themes
6. **Version history** - track changes over time

---

## 🛠️ Code Examples Provided

### For API Endpoints:
- ✅ `GET /api/showcase/tokens`
- ✅ `GET /api/showcase/components`
- ✅ `POST /api/penpot/tokens` (enhanced)

### For Frontend:
- ✅ Complete Vue showcase page
- ✅ Color swatch component
- ✅ Typography preview
- ✅ Spacing visualizer
- ✅ Component grid (future)

### For Plugin:
- ✅ SVG component extraction
- ✅ Metadata gathering
- ✅ Batch sync functions

---

## 📊 What Each Approach Gets You

| Feature | Plugin→Site | CLI Export | Storybook | Real-time |
|---------|------------|------------|-----------|-----------|
| Colors | ✅ | ✅ | ✅ | ✅ |
| Typography | ✅ | ✅ | ✅ | ✅ |
| Spacing | ✅ | ✅ | ✅ | ✅ |
| Components | ✅ | ⚠️ | ✅ | ✅ |
| Interactive | ✅ | ❌ | ✅✅ | ⚠️ |
| Time to setup | 30min | 10min | 2-3hr | 1hr |
| Maintenance | Low | Low | Medium | Low |

---

## 🎨 Inspiration Examples Researched

I examined these top design systems:
- **Carbon Design System** (IBM) - Uses Storybook
- **Material Design** (Google) - Custom site
- **Polaris** (Shopify) - Storybook + custom
- **Atlassian Design System** - Storybook
- **Component Gallery** - Aggregator of 100+ systems

---

## 🔧 Tools Mentioned

### For Token Export:
- `penpot-export` - Official CLI tool
- `@penpot/plugin-types` - TypeScript definitions
- Style Dictionary - Token transformation

### For Showcasing:
- Storybook - Component documentation
- DOMPurify - Sanitize SVG/HTML
- Prism.js - Code highlighting

### For Conversion:
- Locofy Lightning - Penpot to code
- Semantic Tagger - HTML tagging plugin

---

## ⚡ Quick Wins You Can Get

### Today (30 min):
- Basic showcase page with colors and typography
- Copy-to-clipboard for hex codes
- Clean, professional design

### This Week:
- Add component SVG previews
- Add search and filter
- Add dark mode toggle

### This Month:
- Full interactive component explorer
- CSS variable export
- Auto-sync via GitHub Actions
- Changelog tracking

---

## 📖 Additional Resources Provided

In the research docs, you'll find:
- Official Penpot plugin API docs
- Links to example design systems
- Tool documentation
- GitHub Actions workflow examples
- Best practices articles

---

## 🎯 Bottom Line

**You have everything you need to build a beautiful design showcase:**

1. ✅ Your plugin already extracts tokens
2. ✅ Your API already receives them
3. ✅ You just need a display page
4. ✅ I've provided all the code
5. ✅ 30 minutes to go live

**The Path Forward:**
```
Your Plugin → Your API → Showcase Page → Beautiful Token Display
            (exists)    (add endpoint)   (30 min to build)
```

---

## 📁 File Structure

```
/Users/sul/Dev/opends-penpot-plugin/
├── SHOWCASE-RESEARCH.md          ← Full research (all approaches)
├── QUICK-START-SHOWCASE.md       ← 30-min implementation
├── APPROACH-COMPARISON.md        ← Decision matrix
└── README.md                     ← Update this with showcase link

Future structure (in OpenDS repo):
~/Dev/opends/
├── server/api/showcase/
│   ├── tokens.get.ts            ← Add this
│   └── components.get.ts        ← Add this later
└── app/pages/
    └── showcase.vue              ← Add this
```

---

## ❓ Questions Answered

**Q: Can Penpot export to HTML directly?**  
A: Not natively, but plugins can export SVG and you can transform to HTML

**Q: What's the industry standard?**  
A: Storybook for coded components, custom sites for design tokens

**Q: How do I keep it in sync?**  
A: Manual sync via plugin or automated via GitHub Actions

**Q: Do I need Storybook?**  
A: Only if you have coded components. For design tokens, a custom page is perfect.

**Q: How long will this take?**  
A: 30 minutes for basic, 1 week for polished, 1 month for full-featured

---

## ✨ Final Thoughts

Your OpenDS project is **perfectly positioned** to add a showcase page:
- You have the plugin ✅
- You have the API ✅
- You have the hosting ✅
- You have the tokens ✅

**All you need is the display layer** - and I've given you the code! 

Start with the Quick Start guide, iterate based on what you need, and you'll have a professional design system showcase in no time.

Good luck! 🚀
