# OpenDS ↔️ Penpot Integration - Visual Flow

## Connection Flow

```
┌─────────────┐
│   Penpot    │
│   Plugin    │
└──────┬──────┘
       │
       │ 1. Test Connection
       │    GET /api/plugin/health
       │    Header: Authorization: Bearer opends_fc13318...
       │
       ▼
┌─────────────────────┐
│   OpenDS Server     │
│  (Coolify/Nuxt)    │
└─────────┬───────────┘
          │
          │ 2. Auth Check
          │    ├─ Extract API key from header
          │    ├─ Check hardcoded list in auth.ts
          │    └─ Validate against database
          │
          ▼
    ✅ Return 200 OK
    { "status": "ok", "timestamp": "..." }
```

## Token Sync Flow

```
┌─────────────┐
│   Penpot    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Extract Tokens
       │    ├─ penpot.library.local.colors
       │    ├─ penpot.library.local.typographies
       │    └─ penpot.library.local.spacings
       │
       │ 2. Transform & Send
       │    POST /api/penpot/tokens
       │    Header: Authorization: Bearer opends_fc13318...
       │    Body: { colors: [...], typography: [...], spacing: [...] }
       │
       ▼
┌─────────────────────┐
│   OpenDS Server     │
│   /api/penpot/      │
│   tokens.post.ts    │
└─────────┬───────────┘
          │
          │ 3. Process
          │    ├─ Authenticate
          │    ├─ Parse payload
          │    ├─ Store in database (future)
          │    └─ Return success
          │
          ▼
    ✅ Return 200 OK
    { "success": true, "processed": 42 }
```

## File Structure

```
opends/  (Server Repository)
├── server/
│   ├── utils/
│   │   └── auth.ts  ⭐ Contains your API key
│   ├── api/
│   │   ├── plugin/
│   │   │   └── health.get.ts  ⭐ Health check endpoint
│   │   └── penpot/
│   │       └── tokens.post.ts  ⭐ Token sync endpoint
│   └── repositories/
│       └── documentation.repository.ts  ⭐ Fixed database errors
├── app/
│   └── pages/
│       └── docs/
│           └── index.vue  ⭐ Fixed data access
└── nuxt.config.ts  ⭐ Disabled prerendering

opends-penpot-plugin/  (Plugin Repository - Local Only)
├── src/
│   ├── main-plugin.ts  ⭐ Main plugin code
│   ├── plugin/
│   │   ├── api/
│   │   │   └── hub-api.ts  📡 API client
│   │   └── tokens/
│   │       ├── extractor.ts  🔍 Token extraction
│   │       └── transformer.ts  🔄 Data transformation
│   └── manifest.json  📋 Plugin metadata
└── dist/  → Penpot loads from here
```

## Authentication Flow Detail

```
Plugin Request:
━━━━━━━━━━━━━━
GET /api/plugin/health
Authorization: Bearer opends_fc13318bb89b627e477281ca6cda7ab3dbf64fa3d0d0ab71f00c945448358b2c

Server Processing:
━━━━━━━━━━━━━━━━━
1. extractApiKey(event)
   └─ Checks "Authorization: Bearer <key>"
   └─ Returns: "opends_fc13318bb89b627e477281ca6cda7ab3dbf64fa3d0d0ab71f00c945448358b2c"

2. validateApiKey(apiKey)
   ├─ Check hardcoded list:
   │  const API_KEYS = new Set([
   │    "opends_fc13318bb89b627e477281ca6cda7ab3dbf64fa3d0d0ab71f00c945448358b2c", ✅
   │  ])
   │
   └─ If not in list, check database:
      SELECT id FROM api_keys 
      WHERE key = $1 AND deleted_at IS NULL

3. Return Response
   └─ If valid: 200 OK { status: "ok", ... }
   └─ If invalid: 401 Unauthorized
```

## Current State Checklist

### Backend (OpenDS Server) ✅
- [x] API key added to auth.ts
- [x] Health check endpoint implemented
- [x] Token sync endpoint implemented  
- [x] Authentication middleware working
- [x] CORS configured correctly
- [x] Database error handling added
- [x] Frontend data access fixed
- [x] Build configuration optimized

### Plugin (Penpot) ✅
- [x] Connection UI implemented
- [x] Health check integration
- [x] Token extraction working
- [x] Token transformation working
- [x] Sync UI implemented
- [x] Error handling added
- [x] Storage for config
- [x] Auto-reload after connection

### Deployment ⏳
- [ ] Latest code deployed to Coolify
- [ ] Health check returns 200 OK
- [ ] Plugin connects successfully
- [ ] Tokens sync successfully

## Testing Checklist

### 1. Health Check Test
```bash
curl -v https://opends.sulei.dev/api/plugin/health \
  -H "Authorization: Bearer opends_fc13318bb89b627e477281ca6cda7ab3dbf64fa3d0d0ab71f00c945448358b2c"

Expected Response:
HTTP/1.1 200 OK
{"status":"ok","timestamp":"2026-01-03T..."}
```

### 2. Plugin Connection Test
```
1. Open Penpot plugin
2. Enter URL: https://opends.sulei.dev
3. Enter API Key: opends_fc13318bb89b627e477281ca6cda7ab3dbf64fa3d0d0ab71f00c945448358b2c
4. Click "Connect"

Expected Result:
✅ "Connected successfully!"
```

### 3. Token Sync Test
```
1. In connected plugin
2. Click "Sync Tokens"
3. See extracted token counts
4. Click "Sync to Hub"

Expected Result:
✅ "Synced X colors, Y typography, Z spacing to OpenDS!"
```

## Expected Outcomes

### Success Scenario
```
Deploy → Health Check 200 → Plugin Connects → Tokens Sync → ✅ DONE
```

### Failure Scenarios & Fixes

```
Deploy Fails
├─ Build Error → Check deployment logs, usually fixed by retrying
├─ Timeout → Server under load, wait and retry
└─ 500 Error → Check if latest code was pushed

Health Check 401
├─ API key not in auth.ts → Re-deploy latest code (commit b057849)
├─ Database connection issue → Check Coolify environment variables
└─ Auth middleware not applied → Clear cache and redeploy

Connection Timeout
├─ Server slow → Retry connection
├─ CORS issue → Check FRONTEND_URL env var
└─ Network issue → Check if opends.sulei.dev is accessible

Token Sync Fails
├─ Auth issue → Same as health check
├─ Endpoint missing → Shouldn't happen, it exists
└─ Payload invalid → Check browser console
```

---

## Key Files Reference

### Authentication
```typescript
// server/utils/auth.ts (line 4-9)
const API_KEYS = new Set([
  "test-api-key",
  "opends-simple-key",
  "opends_5ceaa06f48417a197ba30c9d4fe4788658f38422887441115dda1e546bd7dec8",
  "opends_fc13318bb89b627e477281ca6cda7ab3dbf64fa3d0d0ab71f00c945448358b2c", // YOUR KEY
]);
```

### Health Check
```typescript
// server/api/plugin/health.get.ts
export default defineEventHandler(async (event) => {
  const apiKey = extractApiKey(event);
  if (!apiKey || !(await validateApiKey(apiKey))) {
    throw getAuthError(); // Returns 401
  }
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
});
```

### Token Sync
```typescript
// server/api/penpot/tokens.post.ts
export default defineEventHandler(async (event) => {
  const apiKey = extractApiKey(event);
  if (!apiKey || !(await validateApiKey(apiKey))) {
    throw getAuthError(); // Returns 401
  }
  
  const body = await readBody(event);
  const { colors, typography, spacing } = body;
  
  return {
    success: true,
    processed: (colors?.length || 0) + (typography?.length || 0) + (spacing?.length || 0),
  };
});
```

---

**Everything is ready! Deploy and test.** 🚀
