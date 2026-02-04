# Quick Setup: Penpot MCP Server

⏱️ **Time:** 15 minutes  
🎯 **Goal:** Get Penpot MCP running and connected

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install & Run MCP Server (5 min)

```bash
# Clone repository
cd ~/Dev
git clone https://github.com/penpot/penpot-mcp.git
cd penpot-mcp

# Install and start everything
npm install
npm run bootstrap
```

✅ **Servers running:**
- Plugin server: http://localhost:4400
- MCP server: http://localhost:4401

⚠️ **Keep this terminal open!**

---

### Step 2: Connect Penpot Plugin (5 min)

1. **Open:** https://design.penpot.app
2. **Go to:** Any design file
3. **Click:** Plugins menu
4. **Enter URL:** `http://localhost:4400/manifest.json`
5. **Click:** "Connect to MCP server"
6. **Verify:** Status shows "Connected"

⚠️ **If Chrome/Brave shows popup:** Approve local network access

---

### Step 3: Configure AI Client (5 min)

#### Option A: Claude Desktop (Recommended)

```bash
# Edit config file (macOS)
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Add this:**
```json
{
  "mcpServers": {
    "penpot": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:4401/sse", "--allow-http"]
    }
  }
}
```

**Then:**
- Quit Claude Desktop completely (Menu → Quit)
- Restart Claude
- Click "Search and tools" icon to verify

#### Option B: Cursor IDE

```bash
cursor mcp add penpot -t http http://localhost:4401/mcp
```

#### Option C: Antigravity (待定)

⚠️ **Status:** Not confirmed working yet

**Try:**
```bash
# Check if config file exists
ls -la ~/.gemini/settings.json

# If it exists, try adding:
code ~/.gemini/settings.json
```

**Add same config as Claude Desktop above**

---

## ✅ Verify It's Working

### Test in Claude Desktop:
1. Type: "Can you see the Penpot MCP tools?"
2. Click "Search and tools" icon
3. Should see Penpot-related tools listed

### Test in Browser:
1. Check Penpot plugin UI shows "Connected"
2. Check terminal shows WebSocket connection
3. No errors in browser console

---

## 🔧 Quick Troubleshooting

### Plugin won't load?
```bash
# Check if servers are running
lsof -i :4400
lsof -i :4401

# If not, restart bootstrap
cd ~/Dev/penpot-mcp
npm run bootstrap
```

### Browser blocks connection?
- **Chrome:** Approve the popup
- **Brave:** Disable Shield for Penpot
- **Try:** Firefox (no restrictions)

### Claude doesn't see tools?
- Quit Claude completely (not just close)
- Check config file syntax (valid JSON)
- Restart Claude Desktop

---

## 🎯 Daily Usage

### Starting Your Session:

```bash
# Terminal 1: Start servers
cd ~/Dev/penpot-mcp
npm run bootstrap
# Leave running...

# Terminal 2: Open your AI client
# Claude Desktop, Cursor, etc.

# Browser: Open Penpot and connect plugin
open https://design.penpot.app
```

### Stopping Your Session:

```bash
# Stop servers
Ctrl+C in terminal

# That's it!
```

---

## 💡 Example Queries

Once connected, try these in your AI client:

```
"List all projects in my Penpot account"
"Show me the colors used in the design system file"
"Export the header component as SVG"
"What fonts are used in the navigation bar?"
"Create a new button variant with primary colors"
```

---

## 📊 What's Running?

```
Port 4400  →  Plugin Server (serves plugin to Penpot)
Port 4401  →  MCP Server (AI client connects here)
WebSocket  →  Plugin ↔ MCP Server communication
```

---

## 🔗 Useful Links

- **GitHub:** https://github.com/penpot/penpot-mcp
- **Penpot:** https://design.penpot.app
- **Claude:** https://claude.ai/download
- **Full Guide:** See `PENPOT-MCP-SETUP.md`

---

## ❓ Quick FAQ

**Q: Do I need to run this every time?**  
A: Yes, run `npm run bootstrap` whenever you want to use it.

**Q: Can I keep it running in the background?**  
A: Yes, or use a process manager like PM2.

**Q: Does it work with Antigravity?**  
A: Not confirmed yet. Use Claude Desktop for now.

**Q: Is my data safe?**  
A: Yes, everything runs locally on your machine.

**Q: Can I use with self-hosted Penpot?**  
A: Yes, configure the plugin to point to your server.

---

## 🎓 Next Steps

1. ✅ Get it running (this guide)
2. ✅ Test with example queries
3. ✅ Read full guide (`PENPOT-MCP-SETUP.md`)
4. ✅ Explore advanced workflows
5. ⏳ Wait for Antigravity support

---

**That's it! You're ready to go. 🚀**
