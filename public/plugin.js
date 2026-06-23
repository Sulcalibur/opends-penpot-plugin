// OpenDS Sync Plugin — Plugin Context (has access to penpot.*)
// Architecture: this thin entry point opens index.html as the UI (iframe),
// listens for messages from the UI, and executes Penpot API calls here.

console.log('[OpenDS Plugin] Loading...');

// ── Open the UI ──────────────────────────────────────────────
penpot.ui.open('OpenDS Sync', '/index.html', {
  width: 440,
  height: 560
});

// ── Message handler from iframe UI ──────────────────────────
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
          const config = { url, apiKey, connected: true };
          await penpot.localStorage.setItem('opends_config', JSON.stringify(config));
          penpot.ui.sendMessage({ source: 'plugin', type: 'connection-success', config });
        } else {
          penpot.ui.sendMessage({ source: 'plugin', type: 'connection-error', error: 'HTTP ' + response.status });
        }
      } catch (err) {
        const message = err.name === 'AbortError'
          ? 'Connection timeout — check your URL'
          : 'Connection error: ' + err.message;
        penpot.ui.sendMessage({ source: 'plugin', type: 'connection-error', error: message });
      }
      break;
    }

    // ── Load stored config ───────────────────────────────
    case 'load-config': {
      try {
        const stored = await penpot.localStorage.getItem('opends_config');
        const config = stored ? JSON.parse(stored) : null;
        penpot.ui.sendMessage({ source: 'plugin', type: 'config-loaded', config });
      } catch (err) {
        penpot.ui.sendMessage({ source: 'plugin', type: 'config-loaded', config: null });
      }
      break;
    }

    // ── Extract tokens from Penpot library ───────────────
    case 'extract-tokens': {
      try {
        const library = penpot.library.local;
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

        penpot.ui.sendMessage({
          source: 'plugin',
          type: 'tokens-extracted',
          tokens: { colors, typographies, spacings },
        });
      } catch (err) {
        penpot.ui.sendMessage({ source: 'plugin', type: 'extract-error', error: err.message });
      }
      break;
    }

    // ── Sync tokens to OpenDS ────────────────────────────
    case 'sync-tokens': {
      const { url, apiKey, tokens } = message;
      try {
        const response = await fetch(url + '/api/penpot/tokens', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: '1.0',
            source: 'penpot',
            exportedAt: new Date().toISOString(),
            colors: tokens.colors,
            typography: tokens.typographies,
            spacing: tokens.spacings,
          }),
        });

        if (response.ok) {
          const result = await response.json();

          // Update last sync timestamp
          const stored = await penpot.localStorage.getItem('opends_config');
          if (stored) {
            const config = JSON.parse(stored);
            config.lastSyncAt = new Date().toISOString();
            await penpot.localStorage.setItem('opends_config', JSON.stringify(config));
          }

          penpot.ui.sendMessage({ source: 'plugin', type: 'sync-success', result });
        } else {
          penpot.ui.sendMessage({ source: 'plugin', type: 'sync-error', error: 'HTTP ' + response.status + ': ' + await response.text() });
        }
      } catch (err) {
        penpot.ui.sendMessage({ source: 'plugin', type: 'sync-error', error: err.message });
      }
      break;
    }

    // ── Disconnect (clear config) ────────────────────────
    case 'disconnect': {
      await penpot.localStorage.setItem('opends_config', JSON.stringify({ url: '', apiKey: '', connected: false }));
      penpot.ui.sendMessage({ source: 'plugin', type: 'disconnected' });
      break;
    }
  }
});

// ── Theme change forwarding ─────────────────────────────────
penpot.on('themechange', function (theme) {
  penpot.ui.sendMessage({ source: 'plugin', type: 'themechange', theme });
});

// ── Helpers ──────────────────────────────────────────────────
function normalizeColor(value) {
  if (!value) return '#000000';
  if (value.startsWith('#')) {
    if (value.length === 4) { const h = value.slice(1); return '#' + h + h + h; }
    if (value.length === 7) return value;
    if (value.length === 9) return value.slice(0, 7);
  }
  if (value.startsWith('rgb') || value.startsWith('hsl')) return value;
  return value;
}

function normalizeDimension(value) {
  if (!value) return '0px';
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  if (value.includes('px') || value.includes('rem') || value.includes('em')) return value;
  return num + 'px';
}

function normalizeLineHeight(value) {
  if (!value) return 'normal';
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  if (value.includes('px') || value.includes('em') || value.includes('%')) return value;
  if (num > 0 && num < 10) return String(num);
  return num + 'px';
}

console.log('[OpenDS Plugin] Ready');
