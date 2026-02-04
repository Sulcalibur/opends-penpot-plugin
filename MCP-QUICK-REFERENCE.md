# 🚀 Penpot MCP - Quick Reference Card

---

## ⚡ 3-Minute Setup

```bash
# Terminal 1: Start MCP Server
cd ~/Dev/penpot-mcp
npm run bootstrap
# Keep running...

# Browser: Load plugin
# https://design.penpot.app
# Plugins → http://localhost:4400/manifest.json
# Connect to MCP server

# Terminal 2: Configure AI
# Claude Desktop:
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
# Add config from docs
```

---

## 🔌 Ports

- **4400** → Plugin server
- **4401** → MCP server

---

## 🎯 Example Queries

```
"List all color tokens in the design file"
"Export the navigation component as SVG"
"What fonts are used in the header?"
"Show me all components on the homepage"
"Analyze button variant consistency"
```

---

## 🛠️ Commands

```bash
# Start everything
npm run bootstrap

# Stop
Ctrl+C

# Restart
npm run start:all
```

---

## ❌ Troubleshooting

| Issue | Fix |
|-------|-----|
| Plugin won't load | Check browser allows localhost |
| Can't connect | Approve network access popup |
| Ports busy | `lsof -i :4400` `lsof -i :4401` |
| Claude doesn't see it | Fully quit + restart Claude |

---

## 📚 Docs

1. **Quick Setup:** `QUICK-MCP-SETUP.md`
2. **Full Guide:** `PENPOT-MCP-SETUP.md`
3. **Comparison:** `MCP-VS-PLUGIN-COMPARISON.md`
4. **Summary:** `EXECUTIVE-SUMMARY.md`

---

## ⚠️ Current Status

- ✅ **Claude Desktop** - Works
- ✅ **Cursor IDE** - Works
- ⚠️ **Antigravity** - Not yet

---

## 🔗 Links

- **GitHub:** github.com/penpot/penpot-mcp
- **Penpot:** design.penpot.app
- **Claude:** claude.ai/download

---

## 💡 Remember

- Keep plugin UI open (connection active)
- Server must be running
- Approve browser popups
- Use Claude for now
- Wait for Antigravity support

---

**Save this file!** Pin it for quick reference.
