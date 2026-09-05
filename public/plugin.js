// OpenDS Sync Plugin — Plugin Context (has access to penpot.*)
// Architecture: this entry point opens index.html as the UI (iframe),
// listens for messages from the UI, and executes Penpot API calls here.
//
// Auto-sync: while the panel is open, the plugin watches penpot.library.local
// and pushes design-token changes to the configured OpenDS hub automatically —
// sync-on-open plus a debounced hash-diff watch loop. (Penpot's plugin API has
// no library-change event, so change detection is polling-based: a fingerprint
// of the normalized token library is compared on a short interval.)

console.log('[OpenDS Plugin] Loading...');

// ══════════════════════════════════════════════════════════════════════
// OPENDSCORE-START — pure logic (no penpot access). Unit-tested by
// tests/logic.test.mjs which extracts this exact block from this file.
// ══════════════════════════════════════════════════════════════════════

// Tiny FNV-1a string hash — deterministic, no crypto dependency needed in
// the Penpot plugin context. Used to fingerprint the token library.
function hashFnv1a(str) {
  var h = 0x811c9dc5;
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0; // 32-bit multiply, keep unsigned
  }
  return 'h' + h.toString(16);
}

// Keep only the fields that change what gets synced (names + values), so
// cosmetic library noise (ordering, internal ids, description edits that do
// not alter the payload) never triggers a sync. Arrays are sorted so a
// reorder does not count as a change.
function canonicalTokenSets(sets) {
  function toRow(kind, t) {
    if (kind === 'color') return { name: t.name, value: t.value };
    if (kind === 'typography') {
      return { name: t.name, fontFamily: t.fontFamily, fontSize: t.fontSize, fontWeight: t.fontWeight, lineHeight: t.lineHeight };
    }
    return { name: t.name, value: t.value }; // spacing
  }
  function sortRows(kind, rows) {
    return (rows || [])
      .map((t) => toRow(kind, t))
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  }

  return {
    colors: sortRows('color', sets.colors),
    typographies: sortRows('typography', sets.typographies),
    spacings: sortRows('spacing', sets.spacings),
  };
}

// Fingerprint of the *extracted* token sets (already normalized by
// extractTokenSets). Two libraries with equal fingerprints produce identical
// payloads, so a fingerprint change is exactly "something worth syncing".
function tokenFingerprint(sets) {
  const canon = canonicalTokenSets(sets);
  return hashFnv1a(JSON.stringify(canon));
}

// Sorted component names — identifies which components exist to sync. Only
// names matter: imports add/update by name, so an edit to a description that
// does not change the payload never triggers a re-push.
function canonicalComponentNames(components) {
  return (components || [])
    .map((c) => c.name)
    .filter(Boolean)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

// Sync scope: 'all' | 'tokens' | 'components' | 'pick'.
//  - all        → tokens + every component
//  - tokens     → colors / typography / spacing only
//  - components → every component only
//  - pick       → only the components whose ids are listed in scope.componentIds
function scopeIncludesTokens(scope) { return !scope || scope.mode === 'all' || scope.mode === 'tokens'; }
function scopeIncludesComponents(scope) { return !scope || scope.mode === 'all' || scope.mode === 'components' || scope.mode === 'pick'; }

function filterComponentsForScope(scope, components) {
  const mode = scope && scope.mode ? scope.mode : 'all';
  if (mode === 'pick') {
    const ids = new Set((scope.componentIds || []).filter(Boolean));
    return (components || []).filter((c) => c.id && ids.has(c.id));
  }
  if (mode === 'components' || mode === 'all') return components || [];
  return []; // tokens-only mode
}

// One fingerprint for the whole selected scope (tokens part + components
// part). Watch keeps a single lastHash across both.
function scopeFingerprint(scope, tokens, components) {
  const parts = {};
  if (scopeIncludesTokens(scope)) {
    parts.tokens = canonicalTokenSets(tokens);
  }
  if (scopeIncludesComponents(scope)) {
    parts.components = canonicalComponentNames(filterComponentsForScope(scope, components));
  }
  return hashFnv1a(JSON.stringify(parts));
}

// Map extracted components to the OpenDS /api/penpot/components wire format.
function buildComponentsPayload(components, exportedAt) {
  return {
    version: '1.0',
    source: 'penpot',
    exportedAt: exportedAt || new Date().toISOString(),
    components: (components || []).map((c) => ({
      id: c.id || null,
      name: c.name,
      displayName: c.displayName || c.name,
      description: c.description || null,
      type: c.type || 'component',
      structure: c.structure || {},
    })),
  };
}

// Map extracted sets to the OpenDS /api/penpot/tokens wire format.
// Note the endpoint keys: colors | typography | spacing.
function buildWirePayload(tokens, exportedAt) {
  return {
    version: '1.0',
    source: 'penpot',
    exportedAt: exportedAt || new Date().toISOString(),
    colors: tokens.colors || [],
    typography: tokens.typographies || [],
    spacing: tokens.spacings || [],
  };
}

// Normalize a color value to a canonical hex/rgb/hsl string.
function normalizeColor(value) {
  if (!value) return '#000000';
  if (value.startsWith('#')) {
    if (value.length === 4) { // #RGB → #RRGGBB
      return '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
    }
    if (value.length === 7) return value;
    if (value.length === 9) return value.slice(0, 7); // drop alpha
  }
  if (value.startsWith('rgb') || value.startsWith('hsl')) return value;
  return value;
}

// Normalize a dimension to a px string when unitless.
function normalizeDimension(value) {
  if (!value) return '0px';
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  if (value.includes('px') || value.includes('rem') || value.includes('em')) return value;
  return num + 'px';
}

// Normalize a line-height: keep ratios (<10) unitless, add px otherwise.
function normalizeLineHeight(value) {
  if (!value) return 'normal';
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  if (value.includes('px') || value.includes('em') || value.includes('%')) return value;
  if (num > 0 && num < 10) return String(num);
  return num + 'px';
}

// ══════════════════════════════════════════════════════════════════════
// OPENDSCORE-END
// ══════════════════════════════════════════════════════════════════════

// ── Extract normalized token sets from the Penpot library ────────────
function extractTokenSets(library) {
  const colors = (library.colors || []).map(c => ({
    id: c.id,
    name: c.name || 'color-' + c.id,
    value: normalizeColor(c.color || '#000000'),
    type: 'color',
    description: c.description || null,
  }));

  const typographies = (library.typographies || []).map(t => ({
    id: t.id,
    name: t.name || 'typography-' + t.id,
    fontFamily: t.fontFamily || 'inherit',
    fontSize: normalizeDimension(t.fontSize || '16px'),
    fontWeight: parseInt(t.fontWeight) || 400,
    lineHeight: normalizeLineHeight(t.lineHeight || 'normal'),
    type: 'typography',
    description: t.description || null,
  }));

  const spacings = (library.spacings || []).map(s => ({
    id: s.id,
    name: s.name || 'spacing-' + s.id,
    value: normalizeDimension(s.value || '0px'),
    type: 'spacing',
    description: s.description || null,
  }));

  return { colors, typographies, spacings };
}

// Extract design-system components (library main components) with the
// metadata/structure OpenDS can store. Field availability varies across
// Penpot versions, so each optional field is read defensively.
function extractComponents(library) {
  const components = library.components || [];

  return components
    .filter((c) => c && c.name)
    .map((c) => {
      const structure = {};

      // How many direct shapes the component contains (if exposed)
      if (Array.isArray(c.shapes)) structure.shapesCount = c.shapes.length;
      else if (typeof c.childrenCount === 'number') structure.shapesCount = c.childrenCount;

      // Bounding dimensions, when available
      const bounds = c.bounds || c.absoluteBounds || null;
      if (bounds) {
        if (typeof bounds.width === 'number') structure.width = Math.round(bounds.width);
        if (typeof bounds.height === 'number') structure.height = Math.round(bounds.height);
      }
      if (typeof c.type === 'string') structure.type = c.type;

      return {
        id: c.id,
        name: c.name,
        description: c.description || null,
        type: c.type || 'component',
        structure,
      };
    });
}

// ══════════════════════════════════════════════════════════════════════
// Auto-sync engine
// ══════════════════════════════════════════════════════════════════════

var AUTO_SYNC_INTERVAL_MS = 4000; // watch poll cadence
var AUTO_SYNC_DEBOUNCE_MS = 1800; // wait for edits to settle before pushing

var state = {
  connected: false,
  autoSync: true,
  url: null,
  apiKey: null,
  scope: { mode: 'all', componentIds: [] }, // all | tokens | components | pick
  pollTimer: null,
  debounceTimer: null,
  lastFingerprint: null, // last seen scope fingerprint (in-memory)
  syncing: false,
};

async function loadConfig() {
  try {
    const stored = await penpot.localStorage.getItem('opends_config');
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.warn('[OpenDS Plugin] Failed to read config:', err);
    return null;
  }
}

async function persistConfig(patch) {
  const current = (await loadConfig()) || {};
  const next = Object.assign({}, current, patch);
  await penpot.localStorage.setItem('opends_config', JSON.stringify(next));
  return next;
}

function applyConfig(config) {
  state.connected = !!(config && config.connected && config.url && config.apiKey);
  state.autoSync = config.autoSync !== false; // default on
  state.url = config ? config.url : null;
  state.apiKey = config ? config.apiKey : null;
  state.scope = (config && config.scope)
    ? Object.assign({ mode: 'all', componentIds: [] }, config.scope)
    : { mode: 'all', componentIds: [] };
}

function send(type, payload) {
  penpot.ui.sendMessage(Object.assign({ source: 'plugin', type: type }, payload || {}));
}

// ── Sync (shared by manual flow, sync-on-open and the watch loop) ────
async function pushSets(tokens, reason) {
  const payload = buildWirePayload(tokens);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(state.url + '/api/penpot/tokens', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + state.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      const data = (result && result.data) || result || {};
      const counts = {
        synced: data.synced || 0,
        skipped: data.skipped || 0,
        failed: data.failed || 0,
      };

      await persistConfig({
        lastSyncAt: new Date().toISOString(),
        lastSynced: counts.synced,
        lastSkipped: counts.skipped,
        lastFailed: counts.failed,
      });

      send('sync-status', {
        state: 'synced',
        reason: reason || 'manual',
        counts: counts,
      });

      return counts;
    }

    const body = await response.text();
    send('sync-status', {
      state: 'error',
      reason: reason || 'manual',
      error: 'HTTP ' + response.status + ': ' + body.slice(0, 300),
    });
    return null;
  } catch (err) {
    clearTimeout(timeoutId);
    const msg = err.name === 'AbortError'
      ? 'Connection timeout — check your URL'
      : 'Connection error: ' + err.message;
    send('sync-status', { state: 'error', reason: reason || 'manual', error: msg });
    return null;
  }
}

// Push extracted components to /api/penpot/components. Returns counts or null.
async function pushComponents(components, reason) {
  const payload = buildComponentsPayload(components);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(state.url + '/api/penpot/components', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + state.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      const data = (result && result.data) || result || {};
      const counts = {
        synced: data.synced || 0,
        skipped: data.skipped || 0,
        failed: data.failed || 0,
      };
      send('component-sync-success', { reason: reason || 'manual', counts });
      return counts;
    }

    const body = await response.text();
    send('sync-status', {
      state: 'error',
      reason: reason || 'manual',
      error: 'Component sync HTTP ' + response.status + ': ' + body.slice(0, 300),
    });
    return null;
  } catch (err) {
    clearTimeout(timeoutId);
    const msg = err.name === 'AbortError'
      ? 'Connection timeout — check your URL'
      : 'Connection error: ' + err.message;
    send('sync-status', { state: 'error', reason: reason || 'manual', error: 'Component sync: ' + msg });
    return null;
  }
}

// Read the library once and compute what the current scope would sync.
function currentScopeSnapshot() {
  const library = penpot.library.local;
  const tokens = extractTokenSets(library);
  const components = extractComponents(library);
  const compsToSync = filterComponentsForScope(state.scope, components);
  const fingerprint = scopeFingerprint(state.scope, tokens, compsToSync);
  return { tokens, compsToSync, fingerprint };
}

// Sync now per the active scope. `force` bypasses the no-change check.
async function syncLibrary(reason, force) {
  if (!state.connected || state.syncing) return;

  const wantTokens = scopeIncludesTokens(state.scope);
  const wantComponents = scopeIncludesComponents(state.scope);

  let snapshot;
  try {
    snapshot = currentScopeSnapshot();
  } catch (err) {
    send('sync-status', { state: 'error', reason: reason || 'watch', error: 'Cannot read library: ' + err.message });
    return;
  }

  const { tokens, compsToSync, fingerprint } = snapshot;

  // Nothing included in this scope → report idle, don't churn
  if (!wantTokens && (!wantComponents || compsToSync.length === 0)) {
    send('sync-status', { state: 'no-change', reason: reason || 'watch' });
    return;
  }

  const config = await loadConfig();
  if (!force && config && config.lastHash === fingerprint) {
    send('sync-status', { state: 'no-change', reason: reason || 'watch' });
    return;
  }

  state.syncing = true;
  send('sync-status', { state: 'syncing', reason: reason || 'watch' });
  try {
    const combined = { tokens: null, components: null };
    let ok = true;

    if (wantTokens) {
      combined.tokens = await pushSets(tokens, reason);
      if (!combined.tokens) ok = false;
    }
    if (wantComponents && compsToSync.length > 0) {
      combined.components = await pushComponents(compsToSync, reason);
      if (!combined.components) ok = false;
    }

    if (ok) {
      await persistConfig({ lastHash: fingerprint, lastSyncAt: new Date().toISOString() });
      state.lastFingerprint = fingerprint;
      send('sync-status', {
        state: 'synced',
        reason: reason || 'manual',
        counts: combined,
      });
    }
  } finally {
    state.syncing = false;
  }
}

// ── Watch loop ───────────────────────────────────────────────────────
function watchTick() {
  if (!state.connected || !state.autoSync || state.syncing) return;

  let fingerprint;
  try {
    fingerprint = currentScopeSnapshot().fingerprint;
  } catch (err) {
    return; // file/library not ready yet — try again next tick
  }

  // Fingerprint changed since last poll → schedule a debounced sync.
  if (fingerprint !== state.lastFingerprint) {
    state.lastFingerprint = fingerprint;

    if (state.debounceTimer) clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(() => {
      state.debounceTimer = null;
      syncLibrary('watch');
    }, AUTO_SYNC_DEBOUNCE_MS);
  }
}

function startWatch() {
  stopWatch();
  if (!state.connected || !state.autoSync) return;
  state.pollTimer = setInterval(watchTick, AUTO_SYNC_INTERVAL_MS);
  send('sync-status', { state: 'watch-on' });
}

function stopWatch() {
  if (state.pollTimer) { clearInterval(state.pollTimer); state.pollTimer = null; }
  if (state.debounceTimer) { clearTimeout(state.debounceTimer); state.debounceTimer = null; }
}

// Initial kick: config may already exist (plugin reopened). Try auto sync
// shortly after the UI has had a chance to attach its message listener.
penpot.ui.open('OpenDS Sync', '/index.html', {
  width: 440,
  height: 560
});

(async function init() {
  const config = await loadConfig();
  applyConfig(config || {});
  if (state.connected) {
    // Seed the fingerprint baseline from the stored hash so a reopen with no
    // changes does not re-push, then start the watcher.
    state.lastFingerprint = config && config.lastHash ? config.lastHash : null;
    startWatch();
    setTimeout(() => syncLibrary('open'), 1800);
  }
})();

// ── Message handler from iframe UI ──────────────────────────────────
penpot.ui.onMessage(async function (message) {
  console.log('[OpenDS Plugin] Received:', message.type);

  switch (message.type) {

    // ── Connection test ──────────────────────────────────
    case 'test-connection': {
      const { url, apiKey } = message;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url + '/api/plugin/health', {
          headers: { Authorization: 'Bearer ' + apiKey },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const config = { url, apiKey, connected: true, autoSync: true, scope: { mode: 'all', componentIds: [] } };
          await penpot.localStorage.setItem('opends_config', JSON.stringify(config));
          applyConfig(config);
          send('connection-success', { config });
          // Connected → sync the current library immediately and watch it.
          startWatch();
          syncLibrary('connect', true);
        } else {
          send('connection-error', { error: 'HTTP ' + response.status });
        }
      } catch (err) {
        const msg = err.name === 'AbortError'
          ? 'Connection timeout — check your URL'
          : 'Connection error: ' + err.message;
        send('connection-error', { error: msg });
      }
      break;
    }

    // ── Load stored config ───────────────────────────────
    case 'load-config': {
      const config = await loadConfig();
      applyConfig(config || {});
      send('config-loaded', { config });
      break;
    }

    // ── Extract tokens from Penpot library (preview) ─────
    case 'extract-tokens': {
      try {
        const library = penpot.library.local;
        const tokens = extractTokenSets(library);
        send('tokens-extracted', { tokens });
      } catch (err) {
        send('extract-error', { error: err.message });
      }
      break;
    }

    // ── Manual sync (UI passes tokens from its preview) ──
    case 'sync-tokens': {
      const { url, apiKey, tokens } = message;
      if (url && apiKey) {
        // Allow the manual path to run even if connection config differs
        state.url = url; state.apiKey = apiKey; state.connected = true;
      }
      if (!state.connected) {
        send('sync-error', { error: 'Not connected' });
        break;
      }
      try {
        const fingerprint = tokenFingerprint(tokens);
        const config = await loadConfig();
        if (config && config.lastHash === fingerprint) {
          send('sync-success', { result: { data: { synced: 0, skipped: (tokens.colors || []).length + (tokens.typographies || []).length + (tokens.spacings || []).length, failed: 0 } } });
          break;
        }
        const counts = await pushSets(tokens, 'manual');
        if (counts) {
          await persistConfig({ lastHash: fingerprint });
          send('sync-success', { result: { data: counts } });
        } else {
          send('sync-error', { error: 'Sync failed' });
        }
      } catch (err) {
        send('sync-error', { error: err.message });
      }
      break;
    }

    // ── List library components (for the picker) ─────────
    case 'list-components': {
      try {
        const components = extractComponents(penpot.library.local);
        send('components-listed', {
          components: components.map((c) => ({ id: c.id, name: c.name, description: c.description })),
        });
      } catch (err) {
        send('list-error', { error: err.message });
      }
      break;
    }

    // ── Sync scope selection from UI ─────────────────────
    case 'set-sync-scope': {
      const mode = ['all', 'tokens', 'components', 'pick'].includes(message.mode) ? message.mode : 'all';
      state.scope = {
        mode,
        componentIds: Array.isArray(message.componentIds) ? message.componentIds.filter(Boolean) : [],
      };
      await persistConfig({ scope: state.scope });
      send('scope-updated', { scope: state.scope });
      // Selection affects what is up-to-date — re-check with a forced sync
      syncLibrary('scope-change', true);
      break;
    }

    // ── Auto-sync toggle from UI ─────────────────────────
    case 'set-auto-sync': {
      state.autoSync = !!message.enabled;
      await persistConfig({ autoSync: state.autoSync });
      if (state.autoSync) {
        startWatch();
        syncLibrary('resume');
      } else {
        stopWatch();
        send('sync-status', { state: 'watch-off' });
      }
      break;
    }

    // ── Sync now button in UI ────────────────────────────
    case 'sync-now': {
      await syncLibrary('manual', true);
      break;
    }

    // ── Disconnect (clear config) ────────────────────────
    case 'disconnect': {
      stopWatch();
      state.connected = false;
      await penpot.localStorage.setItem('opends_config', JSON.stringify({ url: '', apiKey: '', connected: false, autoSync: true }));
      send('disconnected');
      break;
    }
  }
});

// ── Theme change forwarding ─────────────────────────────────
penpot.on('themechange', function (theme) {
  send('themechange', { theme });
});

console.log('[OpenDS Plugin] Ready');
