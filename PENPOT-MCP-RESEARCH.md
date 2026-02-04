# Penpot MCP Server Research & Setup Guide

**Date:** 2026-01-03  
**Status:** ✅ Research Complete - Ready for Implementation

---

## 📋 Overview

The Penpot MCP (Model Context Protocol) Server enables AI assistants like Antigravity to interact with Penpot designs programmatically. This provides full manipulation capabilities similar to Figma plugins.

### What is MCP?

The Model Context Protocol is a standardized framework that allows AI assistants to:
- Access external tools and data sources
- Interact with design files programmatically
- Perform automated design workflows
- Extract and analyze design data

---

## 🎯 What the Penpot MCP Server Provides

### Core Capabilities
✅ **Complete Design Manipulation** - Create, modify, and manage Penpot designs  
✅ **76+ Tools Available** - Comprehensive API coverage  
✅ **Real-time Operations** - Live design file interactions  
✅ **Multi-architecture Support** - Works on Intel and ARM (Apple Silicon)

### Available Features
- 🎨 Design token extraction (colors, typography, spacing)
- 📦 Component management and manipulation
- 🔤 Font management
- 🖼️ Media upload and handling
- 🔔 Webhooks integration
- 🔍 Advanced search capabilities
- 💬 Comments and collaboration
- 👤 Profile & statistics access

---

## 🚀 Installation Options

### Option 1: NPM (Recommended for Antigravity)

```bash
# Install globally
npm install -g @zcubekr/penpot-mcp-server

# Run the server
penpot-mcp-server

# Or run in HTTP mode
TRANSPORT=http penpot-mcp-server
```

### Option 2: Docker (For Production/Server Deployments)

```bash
# Pull latest version
docker pull ghcr.io/zcube/penpot-mcp-server:latest

# Run with environment variables
docker run -d \
  --name penpot-mcp-server \
  -p 3000:3000 \
  -e TRANSPORT=http \
  -e PENPOT_API_URL=https://design.penpot.app \
  -e PENPOT_ACCESS_TOKEN=your-access-token \
  ghcr.io/zcube/penpot-mcp-server:latest
```

### Option 3: Build from Source

```bash
git clone https://github.com/zcube/penpot-mcp-server.git
cd penpot-mcp-server
npm install
npm run build
```

---

## ⚙️ Configuration

### Required Environment Variables

```bash
export PENPOT_API_URL="https://design.penpot.app"
export PENPOT_ACCESS_TOKEN="your-access-token-here"
```

### Getting a Penpot Access Token

1. **Log in to Penpot**
   - Go to https://design.penpot.app
   - Sign in to your account

2. **Navigate to Settings**
   - Click on your profile icon
   - Select "Settings"

3. **Access Tokens Section**
   - Go to "Access Tokens" tab
   - Click "Create New Token"

4. **Save Your Token**
   - Copy the token immediately (it won't be shown again)
   - Store it securely

### Self-Hosted Penpot (If Applicable)

If using a self-hosted Penpot instance:

```yaml
# docker-compose.yml or penpot-config.env
environment:
  - PENPOT_FLAGS=enable-registration enable-login enable-access-tokens
```

---

## 🔌 Integration with Antigravity

### Configuration File Location

For Antigravity (Claude Desktop), the MCP server configuration goes in:

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### Configuration Format

```json
{
  "mcpServers": {
    "penpot": {
      "command": "npx",
      "args": [
        "@zcubekr/penpot-mcp-server"
      ],
      "env": {
        "PENPOT_API_URL": "https://design.penpot.app",
        "PENPOT_ACCESS_TOKEN": "your-access-token-here"
      }
    }
  }
}
```

### Alternative: Using Installed Global Package

```json
{
  "mcpServers": {
    "penpot": {
      "command": "penpot-mcp-server",
      "args": [],
      "env": {
        "PENPOT_API_URL": "https://design.penpot.app",
        "PENPOT_ACCESS_TOKEN": "your-access-token-here"
      }
    }
  }
}
```

---

## 📚 Transport Modes

### 1. Stdio Mode (Default - For Antigravity)

This is the recommended mode for local AI assistants like Antigravity/Claude Desktop.

**Characteristics:**
- Direct communication via standard input/output
- No network ports required
- Secure local-only access
- Default mode when running `penpot-mcp-server`

**Usage:**
```bash
node dist/index.js
# or
penpot-mcp-server
```

### 2. HTTP/SSE Mode (For External Access)

For server deployments or remote access.

**Characteristics:**
- HTTP endpoints with Server-Sent Events
- Can be accessed remotely
- Requires port configuration
- Supports CORS and security options

**Usage:**
```bash
TRANSPORT=http penpot-mcp-server
# or
TRANSPORT=http HTTP_PORT=8080 penpot-mcp-server
```

**Endpoints:**
- `http://localhost:3000/mcp` - Main MCP endpoint
- `http://localhost:3000/health` - Health check

---

## 🎨 Use Cases for OpenDS Project

### 1. Design Token Extraction
Extract colors, typography, and spacing from Penpot designs and sync to your OpenDS API.

```javascript
// Example: Get all design tokens
const tokens = await penpot.getTokens();
// Returns: { colors: [...], typography: [...], spacing: [...] }
```

### 2. Component Documentation
Generate documentation for design components automatically.

```javascript
// Example: Export component with metadata
const component = await penpot.getComponent(componentId);
const documentation = await penpot.generateDocs(component);
```

### 3. Design System Sync
Keep your design system in sync between Penpot and your codebase.

```javascript
// Example: Sync workflow
1. Extract tokens from Penpot
2. Push to OpenDS API
3. Generate showcase page
4. Update documentation
```

### 4. Automated Asset Export
Export assets in various formats (SVG, PNG, etc.).

```javascript
// Example: Export component as SVG
const svg = await penpot.exportSVG(componentId);
```

---

## 🔒 Security Considerations

### Token Security
- ✅ **Never commit** access tokens to version control
- ✅ **Use environment variables** for configuration
- ✅ **Rotate tokens regularly** (monthly recommended)
- ✅ **Limit token scope** if possible

### HTTP Mode Security (If Used)
1. **Use HTTPS** - Run behind reverse proxy (nginx, Caddy)
2. **Enable CORS** - Restrict origins with `ALLOWED_ORIGINS`
3. **DNS Protection** - Set `ENABLE_DNS_REBINDING_PROTECTION=true`
4. **Firewall Rules** - Restrict to trusted networks
5. **Token Rotation** - Change tokens periodically

---

## 🧪 Testing the Integration

### Quick Test Commands

Once configured, restart Antigravity and try:

1. **List available tools:**
   ```
   "What Penpot tools do you have available?"
   ```

2. **Check connection:**
   ```
   "Can you connect to my Penpot account?"
   ```

3. **List projects:**
   ```
   "Show me my Penpot projects"
   ```

4. **Extract tokens:**
   ```
   "Extract design tokens from [project-name]"
   ```

---

## 📦 Package Information

- **NPM Package:** `@zcubekr/penpot-mcp-server`
- **GitHub:** https://github.com/zcube/penpot-mcp-server
- **Docker:** `ghcr.io/zcube/penpot-mcp-server:latest`
- **License:** MIT (with third-party attributions)

### Supported Platforms
- ✅ macOS (Intel & Apple Silicon)
- ✅ Linux (x86_64 & ARM64)
- ✅ Windows
- ✅ Docker (multi-architecture)

---

## 🛣️ Implementation Roadmap

### Phase 1: Setup (Today - 10 minutes)
1. ✅ Research Penpot MCP (Complete)
2. ⬜ Get Penpot access token
3. ⬜ Install MCP server via npm
4. ⬜ Configure Antigravity
5. ⬜ Test connection

### Phase 2: Basic Integration (This Week)
1. ⬜ Test token extraction
2. ⬜ Test component export
3. ⬜ Document available tools
4. ⬜ Create usage examples

### Phase 3: OpenDS Integration (Next Week)
1. ⬜ Automate token sync to OpenDS API
2. ⬜ Generate component documentation
3. ⬜ Create automated workflows
4. ⬜ Build showcase page

### Phase 4: Advanced Features (Future)
1. ⬜ Bi-directional sync
2. ⬜ Automated version tracking
3. ⬜ Component variation management
4. ⬜ Design-to-code automation

---

## 💡 Key Insights

### What Makes This Powerful
1. **76+ Tools** - Comprehensive API coverage for design manipulation
2. **Real-time** - Live interaction with design files
3. **AI-Native** - Built specifically for AI assistant integration
4. **Open Source** - Fully transparent and customizable
5. **Active Development** - v1.0.0 just released with full API coverage

### Comparison to Alternatives
- **vs Manual Export** - Automated and programmable
- **vs Penpot Export CLI** - More comprehensive, AI-friendly
- **vs Direct API** - Abstracted, easier to use with AI
- **vs Browser Automation** - More reliable, faster

### Integration Benefits for OpenDS
1. **Speed** - Automated token extraction vs manual copy/paste
2. **Accuracy** - Direct API access reduces errors
3. **Scalability** - Handle multiple projects easily
4. **Workflow** - Seamless design-to-code pipeline
5. **Documentation** - Auto-generated component docs

---

## 🔗 Useful Links

- 📖 [Official GitHub Repository](https://github.com/zcube/penpot-mcp-server)
- 📦 [NPM Package](https://www.npmjs.com/package/@zcubekr/penpot-mcp-server)
- 🐳 [Docker Images](https://github.com/zcube/penpot-mcp-server/pkgs/container/penpot-mcp-server)
- 🎨 [Penpot Official Site](https://penpot.app/)
- 📚 [Model Context Protocol Docs](https://modelcontextprotocol.io/)

---

## ❓ FAQ

### Q: Do I need a self-hosted Penpot server?
**A:** No, you can use the public Penpot instance (design.penpot.app). However, self-hosted gives you more control.

### Q: Is this secure?
**A:** Yes, when using stdio mode (default), communication is local-only. HTTP mode requires additional security measures.

### Q: Can I use multiple Penpot accounts?
**A:** You can configure multiple MCP servers in Antigravity, each with different tokens.

### Q: What if my token expires?
**A:** Generate a new token in Penpot settings and update your configuration file.

### Q: Does this work with Penpot free tier?
**A:** Yes! Works with any Penpot account that has access token generation enabled.

---

## ✅ Next Steps

### To Get Started:
1. **Read this document** ✅
2. **Get your Penpot token** - Follow instructions in Configuration section
3. **Install the MCP server** - Run `npm install -g @zcubekr/penpot-mcp-server`
4. **Configure Antigravity** - Edit `claude_desktop_config.json`
5. **Restart Antigravity** - Restart Claude Desktop
6. **Test** - Ask Antigravity to list Penpot tools

### Configuration Template (Copy-Ready):

```json
{
  "mcpServers": {
    "penpot": {
      "command": "npx",
      "args": ["@zcubekr/penpot-mcp-server"],
      "env": {
        "PENPOT_API_URL": "https://design.penpot.app",
        "PENPOT_ACCESS_TOKEN": "REPLACE_WITH_YOUR_TOKEN"
      }
    }
  }
}
```

---

**Status:** Ready to implement! 🚀
