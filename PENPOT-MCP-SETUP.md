# How to Setup and Add Penpot MCP to Antigravity

**Date:** 2026-01-03  
**Status:** ✅ Research Complete  
**Purpose:** Enable AI-powered design workflows with Penpot integration

---

## 📋 Executive Summary

The **Penpot Model Context Protocol (MCP) server** bridges AI language models (like Antigravity) with Penpot, allowing you to:
- ✅ Analyze UI/UX designs with AI
- ✅ Get AI feedback on designs
- ✅ Automate design workflows
- ✅ Query design files using natural language
- ✅ Export and transform design components programmatically

**Current Status:** ⚠️ Penpot MCP is **NOT currently available** in Antigravity's MCP server list, but it can be configured manually.

---

## 🎯 What is Penpot MCP?

### Architecture Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Antigravity   │ ←──→ │  Penpot MCP      │ ←──→ │   Penpot    │
│   (AI Client)   │ MCP  │  Server          │  WS  │   Plugin    │
│                 │      │  (Port 4401)     │      │ (Port 4400) │
└─────────────────┘      └──────────────────┘      └─────────────┘
                              ↓ HTTP/SSE                    ↓
                         Tools exposed to AI      Executes in Penpot
```

### Components

1. **Penpot MCP Server** (`mcp-server/`)
   - Runs on port 4401
   - Exposes tools to AI clients via HTTP/SSE
   - Manages WebSocket connections to plugin

2. **Penpot Plugin** (`penpot-plugin/`)
   - Runs on port 4400
   - Connects to MCP server via WebSocket
   - Executes operations in Penpot using Plugin API

3. **Common Types** (`common/`)
   - Shared TypeScript definitions
   - Request/response protocol types

---

## 🚀 Setup Instructions for Antigravity

### Prerequisites

- ✅ **Node.js** (v22 recommended)
- ✅ **npm** and **npx** (installed with Node.js)
- ✅ **Penpot account** (design.penpot.app or self-hosted)
- ✅ **Python 3.12+** (for alternative Python implementation)

### Method 1: Official TypeScript Server (Recommended)

#### Step 1: Clone and Build Penpot MCP

```bash
# Clone the official repository
cd ~/Dev
git clone https://github.com/penpot/penpot-mcp.git
cd penpot-mcp

# Install dependencies
npm install

# Build all components and start servers
npm run bootstrap
```

This will:
- Install all dependencies
- Build server and plugin
- Start MCP server on `http://localhost:4401`
- Start plugin server on `http://localhost:4400`

#### Step 2: Load Plugin in Penpot

1. **Open Penpot** in your browser (https://design.penpot.app)
2. **Navigate** to a design file
3. **Open Plugins menu**
4. **Load plugin** using development URL:
   ```
   http://localhost:4400/manifest.json
   ```
5. **Open the plugin UI**
6. **Click "Connect to MCP server"**
7. **Verify** connection status changes to "Connected"

⚠️ **Important Browser Notes:**
- **Chrome/Chromium (v142+)**: You'll see a popup requesting permission for local network access - **approve it**
- **Brave**: Disable "Shield" for Penpot website
- **Firefox**: No restrictions, works by default

#### Step 3: Configure Antigravity (If Supported)

Currently, Antigravity (Google Gemini AI Assistant) has **specific MCP configuration requirements**:

**Configuration File Location:**
```bash
~/.gemini/settings.json
```

**Expected Configuration Format:**
```json
{
  "mcpServers": {
    "penpot": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:4401/sse",
        "--allow-http"
      ]
    }
  }
}
```

However, **Antigravity may not currently support custom MCP servers** through this configuration file. You would need to:

1. **Contact Google/Deepmind** to request Penpot MCP integration
2. **Wait for official support** in future Antigravity updates
3. **Use alternative AI clients** in the meantime (see Method 2)

---

### Method 2: Python Implementation (Alternative)

If you prefer Python or need a different approach:

```bash
# Install via pip
pip install penpot-mcp

# Or use uv (faster)
uv pip install penpot-mcp
```

Then configure environment variables:

```bash
export PENPOT_API_URL="https://design.penpot.app"
export PENPOT_USERNAME="your-email@example.com"
export PENPOT_PASSWORD="your-password"
# OR use access token instead
export PENPOT_ACCESS_TOKEN="your-token"
```

---

## 🔌 Alternative AI Clients (Working Now)

Since Penpot MCP may not be immediately available in Antigravity, you can use it with these AI clients:

### Option A: Claude Desktop

**Installation:**
- Windows/macOS: https://claude.ai/download
- Linux: https://github.com/aaddrick/claude-desktop-debian (unofficial)

**Configuration:**

1. **Find config file:**
   - Windows: `%APPDATA%/Claude/claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. **Add Penpot MCP:**
   ```json
   {
     "mcpServers": {
       "penpot": {
         "command": "npx",
         "args": [
           "-y",
           "mcp-remote",
           "http://localhost:4401/sse",
           "--allow-http"
         ]
       }
     }
   }
   ```

3. **Restart Claude Desktop** (fully quit, don't just close window)
4. **Verify** by clicking "Search and tools" icon

### Option B: Cursor IDE

```bash
# Direct HTTP connection
cursor mcp add penpot -t http http://localhost:4401/mcp
```

Or edit `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "penpot": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:4401/sse",
        "--allow-http"
      ]
    }
  }
}
```

### Option C: JetBrains IDEs (IntelliJ, WebStorm, etc.)

1. **Go to:** `Settings | Tools | AI Assistant | Model Context Protocol (MCP)`
2. **Click:** Add
3. **Configure:**
   - Name: `Penpot`
   - Command: `npx`
   - Args: `-y mcp-remote http://localhost:4401/sse --allow-http`
4. **Save** and verify connection status

---

## 🛠️ MCP Server Endpoints

Once running, the Penpot MCP server provides:

### HTTP Endpoints
- **Modern Streamable HTTP:** `http://localhost:4401/mcp`
- **Legacy SSE:** `http://localhost:4401/sse`

### Transport Methods
1. **Direct HTTP** (for clients supporting it)
2. **SSE (Server-Sent Events)** (for legacy clients)
3. **stdio proxy** (via `mcp-remote` for clients like Claude Desktop)

---

## 📝 Available MCP Tools

Once connected, you'll have access to these capabilities:

### Design Data Retrieval
- Query project information
- List files in a project
- Get page details
- Retrieve component data
- Export shapes and objects

### Design Modification
- Create new shapes
- Modify existing elements
- Update properties
- Change styles

### Design Creation
- Generate new components
- Create design elements programmatically
- Batch operations

### Example Use Cases

**Natural Language Queries:**
```
"Show me all buttons in the design system"
"What colors are used in the header component?"
"Export the navigation bar as SVG"
"Create a new button variant with primary colors"
```

---

## 🔍 Troubleshooting

### Issue: Browser won't connect to localhost plugin

**Solution:**
- **Chrome/Brave:** Approve local network access popup
- **Brave:** Disable Shield for Penpot site
- **Try Firefox:** No PNA restrictions

### Issue: MCP server won't start

**Check:**
```bash
# Verify Node.js version
node --version  # Should be v22+

# Check if ports are available
lsof -i :4400
lsof -i :4401

# Kill processes if needed
kill -9 <PID>
```

### Issue: Plugin disconnects

**Remember:**
- ⚠️ **Don't close the plugin UI** while using MCP server
- Connection persists only while UI is open

### Issue: Antigravity doesn't recognize MCP server

**Current Status:**
- Antigravity may not support custom MCP servers yet
- Use Claude Desktop or Cursor IDE as alternatives
- Check `~/.gemini/settings.json` for configuration options

---

## 🎯 Using mcp-remote Proxy

For AI clients that only support stdio transport:

**Install globally:**
```bash
npm install -g mcp-remote
```

**Use as proxy:**
```bash
npx -y mcp-remote http://localhost:4401/sse --allow-http
```

This translates stdio commands to HTTP/SSE requests.

---

## 📊 Feature Comparison

| Feature | Official TypeScript | Python Version |
|---------|-------------------|----------------|
| **Language** | TypeScript/Node.js | Python 3.12+ |
| **Installation** | `git clone` + build | `pip install` |
| **Ports** | 4400 (plugin), 4401 (server) | Configurable |
| **Transport** | HTTP, SSE | HTTP, SSE |
| **Auth Method** | Via plugin | API credentials |
| **Best For** | Development, testing | Production, automation |

---

## 🚦 Current Status: Antigravity Integration

### ✅ What's Working
- Penpot MCP server runs successfully
- Plugin connects to Penpot
- Works with Claude Desktop, Cursor, JetBrains

### ⚠️ What's Not Working Yet
- Direct Antigravity integration (configuration may not be supported)
- Auto-discovery in Antigravity's MCP server list

### 🔮 What's Needed
1. **Antigravity MCP Support:** Need Google/Deepmind to enable custom MCP configuration
2. **Official Integration:** Penpot MCP added to Antigravity's approved server list
3. **Documentation:** Official guide for Gemini AI Assistant MCP setup

---

## 💡 Recommended Workflow (For Now)

### Current Best Practice

Since direct Antigravity integration isn't available yet:

**Option 1: Use Claude Desktop for Penpot Work**
```
1. Run Penpot MCP server locally
2. Configure Claude Desktop
3. Use Claude for design queries and operations
4. Use Antigravity for coding tasks
```

**Option 2: Use Cursor IDE**
```
1. Run Penpot MCP server locally
2. Add to Cursor configuration
3. Code and design work in one environment
```

**Option 3: Wait for Official Support**
```
1. Monitor Antigravity updates
2. Request feature from Google/Deepmind
3. Check for ~/.gemini/settings.json support
```

---

## 📦 Quick Start Commands

### Terminal 1: Start Penpot MCP
```bash
cd ~/Dev/penpot-mcp
npm run bootstrap
# Leave running...
```

### Terminal 2: Load Plugin in Browser
```bash
# Open Penpot
open https://design.penpot.app

# Load plugin with:
# http://localhost:4400/manifest.json
```

### Terminal 3: Configure AI Client
```bash
# For Claude Desktop
code ~/Library/Application\ Support/Claude/claude_desktop_config.json

# For Cursor
cursor mcp add penpot -t http http://localhost:4401/mcp

# For Antigravity (if supported)
code ~/.gemini/settings.json
```

---

## 🔗 Resources

### Official Documentation
- **Penpot MCP GitHub:** https://github.com/penpot/penpot-mcp
- **Penpot Plugin API:** https://help.penpot.app/technical-guide/plugins/
- **Model Context Protocol:** https://modelcontextprotocol.io

### Community Projects
- **montevive/penpot-mcp:** https://github.com/montevive/penpot-mcp (Python)
- **zcube/penpot-mcp-server:** https://github.com/zcube/penpot-mcp-server (Full manipulation)
- **cale0b/penpot-mcp:** https://github.com/cale0b/penpot-mcp

### Tools
- **mcp-remote:** Proxy for stdio transport
- **MCP Servers List:** https://mcpservers.org
- **MCP Marketplace:** https://mcpmarket.com

### AI Clients with MCP Support
- Claude Desktop
- Cursor IDE
- JetBrains AI Assistant
- (Antigravity - pending verification)

---

## 🎓 Learning Path

### Phase 1: Setup (Today)
1. ✅ Install Node.js v22
2. ✅ Clone Penpot MCP repository
3. ✅ Run `npm run bootstrap`
4. ✅ Load plugin in Penpot
5. ✅ Verify connection

### Phase 2: Test with Alternative Client (This Week)
1. ✅ Install Claude Desktop
2. ✅ Configure Claude with Penpot MCP
3. ✅ Test natural language queries
4. ✅ Explore available tools

### Phase 3: Integration (When Available)
1. ⏳ Wait for Antigravity MCP support
2. ⏳ Configure `~/.gemini/settings.json`
3. ⏳ Test with Antigravity
4. ⏳ Build custom workflows

---

## ❓ FAQs

### Q: Can I use Penpot MCP with Antigravity right now?
**A:** Not directly confirmed. Antigravity may not support custom MCP servers via `~/.gemini/settings.json` yet. Use Claude Desktop or Cursor IDE as alternatives.

### Q: Do I need a Penpot Pro account?
**A:** No, works with free Penpot accounts.

### Q: Can I use this with self-hosted Penpot?
**A:** Yes, configure `PENPOT_API_URL` environment variable.

### Q: Does this work with design.penpot.app?
**A:** Yes, the plugin loads from localhost but connects to cloud Penpot.

### Q: Is this secure?
**A:** The MCP server runs locally, communicates via WebSocket. Not exposed to internet unless you explicitly deploy it.

### Q: Can I deploy MCP server to cloud?
**A:** Yes, possible via Docker and Google Cloud Run (requires HTTP transport refactoring).

### Q: What's the difference from your Penpot plugin project?
**A:** 
- **Your plugin:** Syncs design tokens to OpenDS database
- **Penpot MCP:** Enables AI to query/modify designs directly
- **Complementary:** Can use both together!

---

## 🎯 Next Steps for Your Project

### Immediate (This Week)
1. **Test Penpot MCP** with Claude Desktop
2. **Explore capabilities** for design automation
3. **Document workflows** that could help OpenDS

### Short-term (This Month)
1. **Monitor Antigravity** for MCP support updates
2. **Build integration** if API becomes available
3. **Combine with your plugin** for powerful workflows

### Long-term (This Quarter)
1. **Automate design export** using AI + MCP
2. **Generate documentation** from designs
3. **Sync design tokens** to OpenDS automatically
4. **AI-powered design reviews**

---

## 🏆 Potential Benefits for OpenDS

If Antigravity supports Penpot MCP in the future:

### Design Workflow Automation
```
You: "Extract all color tokens from the design system file"
AI: *Uses MCP to query Penpot, formats as JSON, syncs to OpenDS*
```

### Component Documentation
```
You: "Document the button component with usage examples"
AI: *Reads component from Penpot, generates docs, creates showcase*
```

### Design System Analysis
```
You: "Are all components using the primary color palette?"
AI: *Analyzes entire design file, reports inconsistencies*
```

### Automated Exports
```
You: "Export all icons as SVG and add to the asset library"
AI: *Batch exports, optimizes, uploads to OpenDS*
```

---

## 📁 Recommended File Structure

```
~/Dev/
├── penpot-mcp/              ← Official MCP server (clone here)
│   ├── mcp-server/          ← Server code (port 4401)
│   ├── penpot-plugin/       ← Plugin code (port 4400)
│   └── common/              ← Shared types
│
├── opends-penpot-plugin/    ← Your existing plugin
│   ├── penpot-plugin.ts     ← Your token sync plugin
│   └── PENPOT-MCP-SETUP.md  ← This document
│
└── .gemini/                 ← Antigravity config (if supported)
    └── settings.json        ← MCP configuration
```

---

## ✨ Summary

### What You Learned
- ✅ Penpot MCP bridges AI and design tools
- ✅ Architecture: MCP Server ↔ Plugin ↔ Penpot
- ✅ Setup process with official TypeScript server
- ✅ Alternative clients (Claude, Cursor) work now
- ✅ Antigravity support is pending/unconfirmed

### What You Can Do Now
- ✅ Install and run Penpot MCP locally
- ✅ Test with Claude Desktop or Cursor
- ✅ Explore AI-powered design workflows
- ⏳ Wait for Antigravity integration

### What's Next
- ⏳ Monitor Antigravity for MCP updates
- ⏳ Request feature from Google/Deepmind
- ⏳ Combine with OpenDS plugin when available
- ⏳ Build automated design-to-code workflows

---

## 📞 Getting Help

### If Setup Fails
1. Check Node.js version (`node --version`)
2. Verify ports are free (4400, 4401)
3. Review browser console for WebSocket errors
4. Check Penpot MCP server terminal output

### If Antigravity Integration Needed
1. Check `~/.gemini/` directory for config files
2. Review Antigravity documentation for MCP support
3. Contact Google/Deepmind support
4. Use alternative clients in the meantime

### Community Support
- **Penpot Discord:** Community discussion
- **GitHub Issues:** Bug reports and feature requests
- **MCP Community:** General protocol questions

---

**Good luck with your Penpot MCP setup! 🚀**

*This document will be updated as Antigravity MCP support evolves.*
