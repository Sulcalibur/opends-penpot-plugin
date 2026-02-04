# Penpot MCP Setup - Step by Step Guide

**Status:** 🔄 In Progress  
**Date:** 2026-01-03

---

## ✅ Step 1: Get Your Penpot Access Token

### Instructions:

1. **Open Penpot:**
   - Go to https://design.penpot.app
   - Sign in to your account

2. **Navigate to Settings:**
   - Click on your profile icon (top right)
   - Select "Settings"

3. **Create Access Token:**
   - Click on "Access Tokens" tab
   - Click "Create New Token" or "Generate Token"
   - Give it a name like "Antigravity MCP"

4. **Copy Your Token:**
   - ⚠️ **IMPORTANT:** Copy it immediately - it won't be shown again!
   - Keep it somewhere safe temporarily

5. **Return Here:**
   - Once you have the token, continue to Step 2

---

## ⬜ Step 2: Install Penpot MCP Server

We'll install the MCP server globally via npm.

### Command to run:

```bash
npm install -g @zcubekr/penpot-mcp-server
```

### What this does:
- Installs the Penpot MCP server globally on your system
- Makes it available as a command: `penpot-mcp-server`
- Takes about 1-2 minutes

---

## ⬜ Step 3: Configure Antigravity (Claude Desktop)

We need to create a configuration file that tells Antigravity about the Penpot MCP server.

### Configuration File Location:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Configuration Content:

```json
{
  "mcpServers": {
    "penpot": {
      "command": "npx",
      "args": ["@zcubekr/penpot-mcp-server"],
      "env": {
        "PENPOT_API_URL": "https://design.penpot.app",
        "PENPOT_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

**🔴 Replace `YOUR_TOKEN_HERE` with your actual token from Step 1**

---

## ⬜ Step 4: Restart Antigravity

After saving the configuration:

1. **Quit Claude Desktop / Antigravity** completely
2. **Reopen it**
3. The MCP server will be loaded automatically

---

## ⬜ Step 5: Test the Integration

Once restarted, try these test commands:

### Test 1: Check Available Tools
Ask Antigravity:
```
"What Penpot tools do you have available?"
```

Expected: You should see a list of 76+ Penpot tools

### Test 2: List Projects
Ask Antigravity:
```
"Can you list my Penpot projects?"
```

Expected: You should see your Penpot projects

### Test 3: Get Design Tokens
Ask Antigravity:
```
"Extract design tokens from my latest Penpot project"
```

Expected: Colors, typography, spacing tokens from your design

---

## 🔧 Troubleshooting

### Issue: "Penpot MCP not found"
**Solution:** Make sure you restarted Claude Desktop after editing the config

### Issue: "Authentication failed"
**Solution:** Check that your access token is correct in the config file

### Issue: "Command not found: penpot-mcp-server"
**Solution:** Make sure you installed via npm: `npm install -g @zcubekr/penpot-mcp-server`

### Issue: "Cannot find config file"
**Solution:** Make sure the directory exists: `mkdir -p ~/Library/Application\ Support/Claude/`

---

## 📋 Checklist

- [ ] Got Penpot access token
- [ ] Installed `@zcubekr/penpot-mcp-server` via npm
- [ ] Created/updated `claude_desktop_config.json`
- [ ] Added token to config file
- [ ] Restarted Claude Desktop
- [ ] Tested Penpot tools are available
- [ ] Successfully listed Penpot projects

---

## 🎯 Next Steps After Setup

Once working, you can:

1. **Extract Design Tokens** - "Get all colors from my design system"
2. **Export Components** - "Export this component as SVG"
3. **Generate Documentation** - "Document this component"
4. **Automate Workflows** - "Sync these tokens to my OpenDS API"

---

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your token is valid
3. Check Claude Desktop logs
4. Refer to PENPOT-MCP-RESEARCH.md for detailed info

---

**Ready to start? Begin with Step 1! 🚀**
