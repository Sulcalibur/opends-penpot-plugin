import type { Penpot } from '@penpot/plugin-types'
import { HubAPI } from './plugin/api/hub-api'
import { TokenExtractor } from './plugin/tokens/extractor'
import { TokenTransformer } from './plugin/tokens/transformer'

console.log('[OpenDS Plugin] Loading...')

const PLUGIN_ID = 'opends-sync'

interface PluginState {
  currentView: 'welcome' | 'tokens' | 'components' | 'status' | 'settings'
  isLoading: boolean
  error?: string
}

class OpenDSPlugin {
  private penpot: Penpot
  private api: HubAPI
  private extractor: TokenExtractor
  private transformer: TokenTransformer
  private state: PluginState

  constructor(penpot: Penpot) {
    this.penpot = penpot
    this.api = new HubAPI(penpot)
    this.extractor = new TokenExtractor(penpot)
    this.transformer = new TokenTransformer()
    this.state = {
      currentView: 'welcome',
      isLoading: false
    }
  }

  async initialize(): Promise<void> {
    await this.api.loadConfig()
    this.render()
  }

  private render(): void {
    const config = this.api.getConfig()

    if (!config?.connected) {
      this.showWelcomeUI()
    } else {
      this.showMainUI()
    }
  }

  private showWelcomeUI(): void {
    const config = this.api.getConfig()
    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 24px;
      background: #f8f9fa;
      margin: 0;
    }
    .container { max-width: 400px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 64px; margin-bottom: 16px; }
    h1 { margin: 0 0 8px 0; color: #1e40af; font-size: 24px; }
    .subtitle { color: #6b7280; margin: 0 0 24px 0; font-size: 14px; }
    .card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #374151; }
    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
    }
    .form-input:focus { outline: none; border-color: #1e40af; box-shadow: 0 0 0 3px rgba(30,64,175,0.1); }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }
    .primary-button {
      width: 100%;
      padding: 12px;
      background: #1e40af;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    .primary-button:hover { background: #1e3a8a; }
    .primary-button:disabled { background: #9ca3af; cursor: not-allowed; }
    .status {
      margin-top: 16px;
      padding: 12px;
      border-radius: 6px;
      font-size: 14px;
      display: none;
    }
    .status.success { background: #d1fae5; color: #065f46; display: block; }
    .status.error { background: #fee2e2; color: #991b1b; display: block; }
    .status.info { background: #dbeafe; color: #1e40af; display: block; }
    .help-text { font-size: 12px; color: #6b7280; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🔄</div>
      <h1>OpenDS Sync</h1>
      <p class="subtitle">Connect to sync your Penpot design system</p>
    </div>
    
    <div class="card">
      <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 18px;">Connection Settings</h2>
      
      <div class="form-group">
        <label for="opends-url">OpenDS URL</label>
        <input type="text" id="opends-url" class="form-input" value="${config?.url || 'http://localhost:3001'}" placeholder="https://opends.example.com">
        <p class="help-text">Your OpenDS hub URL</p>
      </div>
      
      <div class="form-group">
        <label for="api-key">API Key</label>
        <input type="password" id="api-key" class="form-input" value="${config?.apiKey || ''}" placeholder="Your API key">
        <p class="help-text">Generate from OpenDS Settings → API Keys</p>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" id="auto-sync" ${config?.autoSync ? 'checked' : ''}>
          Enable auto-sync
        </label>
      </div>
      
      <button class="primary-button" id="connect-btn">Connect to OpenDS</button>
      <div id="connect-status" class="status"></div>
    </div>
  </div>

  <script>
    document.getElementById('connect-btn').addEventListener('click', async () => {
      const btn = document.getElementById('connect-btn')
      const url = document.getElementById('opends-url').value
      const apiKey = document.getElementById('api-key').value
      const autoSync = document.getElementById('auto-sync').checked
      
      if (!url || !apiKey) {
        showStatus('Please enter both URL and API key', 'error')
        return
      }
      
      btn.disabled = true
      btn.textContent = 'Connecting...'
      showStatus('Testing connection...', 'info')
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        const response = await fetch(url + '/api/plugin/health', {
          headers: { 'Authorization': 'Bearer ' + apiKey },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          await penpot.storage.set('opends_config', JSON.stringify({ url, apiKey, autoSync, connected: true }))
          showStatus('Connected successfully!', 'success')
          setTimeout(() => window.location.reload(), 1000)
        } else {
          showStatus('Connection failed: ' + response.status, 'error')
          btn.disabled = false
          btn.textContent = 'Connect to OpenDS'
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          showStatus('Connection timeout: Please check your URL', 'error')
        } else {
          showStatus('Connection error: ' + error.message, 'error')
        }
        btn.disabled = false
        btn.textContent = 'Connect to OpenDS'
      }
    })
    
    function showStatus(message, type) {
      const el = document.getElementById('connect-status')
      el.textContent = message
      el.className = 'status ' + type
    }
  </script>
</body>
</html>`
    
    this.openUI('OpenDS Sync', html, { width: 440, height: 520 })
  }

  private showMainUI(): string {
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 0;
      background: #f8f9fa;
      margin: 0;
    }
    .header {
      background: white;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header h1 { margin: 0; font-size: 18px; color: #1e40af; }
    .connection-status {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      background: #d1fae5;
      color: #065f46;
    }
    .nav {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      padding: 0 12px;
    }
    .nav-item {
      padding: 12px 16px;
      font-size: 13px;
      color: #6b7280;
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }
    .nav-item:hover { color: #374151; }
    .nav-item.active {
      color: #1e40af;
      border-bottom-color: #1e40af;
    }
    .content { padding: 20px; }
    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat {
      text-align: center;
      padding: 16px;
      background: #f1f5f9;
      border-radius: 8px;
    }
    .stat-value { font-size: 24px; font-weight: 600; color: #1e40af; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
    .primary-button {
      width: 100%;
      padding: 12px;
      background: #1e40af;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: 8px;
    }
    .primary-button:hover { background: #1e3a8a; }
    .primary-button:disabled { background: #9ca3af; cursor: not-allowed; }
    .secondary-button {
      width: 100%;
      padding: 12px;
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    }
    .secondary-button:hover { background: #e5e7eb; }
    .status {
      margin-top: 16px;
      padding: 12px;
      border-radius: 6px;
      font-size: 14px;
      display: none;
    }
    .status.success { background: #d1fae5; color: #065f46; display: block; }
    .status.error { background: #fee2e2; color: #991b1b; display: block; }
    .status.info { background: #dbeafe; color: #1e40af; display: block; }
    .section-title { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; }
    .token-preview { max-height: 200px; overflow-y: auto; }
    .token-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border-bottom: 1px solid #f3f4f6;
    }
    .token-color { width: 24px; height: 24px; border-radius: 4px; margin-right: 12px; border: 1px solid #e5e7eb; }
    .token-name { flex: 1; font-size: 13px; }
    .token-value { font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔄 OpenDS Sync</h1>
    <span class="connection-status">Connected</span>
  </div>
  
  <div class="nav">
    <div class="nav-item active" data-view="tokens">Tokens</div>
    <div class="nav-item" data-view="components">Components</div>
    <div class="nav-item" data-view="status">Status</div>
    <div class="nav-item" data-view="settings">Settings</div>
  </div>
  
  <div class="content" id="content">
    <div class="stats">
      <div class="stat">
        <div class="stat-value" id="color-count">-</div>
        <div class="stat-label">Colors</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="typography-count">-</div>
        <div class="stat-label">Typography</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="spacing-count">-</div>
        <div class="stat-label">Spacing</div>
      </div>
    </div>
    
    <div class="card">
      <div class="section-title">Design Tokens</div>
      <p style="font-size: 13px; color: #6b7280; margin-bottom: 16px;">
        Sync colors, typography, and spacing tokens to your OpenDS hub
      </p>
      <button class="primary-button" id="sync-tokens">Sync Tokens</button>
      <div id="sync-status" class="status"></div>
    </div>
    
    <div class="card">
      <div class="section-title">Token Preview</div>
      <div class="token-preview" id="token-preview">
        <p style="font-size: 13px; color: #6b7280;">Click sync to preview and extract tokens</p>
      </div>
    </div>
  </div>

  <script>
    let currentView = 'tokens'
    
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'))
        item.classList.add('active')
        currentView = item.dataset.view
        loadView()
      })
    })
    
    async function loadView() {
      const content = document.getElementById('content')
      if (currentView === 'tokens') {
        content.innerHTML = \`
          <div class="stats">
            <div class="stat">
              <div class="stat-value" id="color-count">-</div>
              <div class="stat-label">Colors</div>
            </div>
            <div class="stat">
              <div class="stat-value" id="typography-count">-</div>
              <div class="stat-label">Typography</div>
            </div>
            <div class="stat">
              <div class="stat-value" id="spacing-count">-</div>
              <div class="stat-label">Spacing</div>
            </div>
          </div>
          
          <div class="card">
            <div class="section-title">Design Tokens</div>
            <p style="font-size: 13px; color: #6b7280; margin-bottom: 16px;">
              Sync colors, typography, and spacing tokens to your OpenDS hub
            </p>
            <button class="primary-button" id="sync-tokens">Sync Tokens</button>
            <div id="sync-status" class="status"></div>
          </div>
          
          <div class="card">
            <div class="section-title">Token Preview</div>
            <div class="token-preview" id="token-preview">
              <p style="font-size: 13px; color: #6b7280;">Click sync to preview and extract tokens</p>
            </div>
          </div>
        \`
        attachTokenHandlers()
      } else if (currentView === 'components') {
        content.innerHTML = \`
          <div class="card">
            <div class="section-title">Components</div>
            <p style="font-size: 13px; color: #6b7280; margin-bottom: 16px;">
              Extract component code (CSS, SVG, HTML) from your Penpot designs
            </p>
            <button class="primary-button">Select Components</button>
            <p style="font-size: 12px; color: #9ca3af;">Coming in Phase 3</p>
          </div>
        \`
      } else if (currentView === 'status') {
        content.innerHTML = \`
          <div class="card">
            <div class="section-title">Sync Status</div>
            <p style="font-size: 13px; color: #6b7280; margin-bottom: 16px;">
              Monitor sync status between Penpot and your OpenDS hub
            </p>
            <p style="font-size: 12px; color: #9ca3af;">Coming in Phase 5</p>
          </div>
        \`
      } else if (currentView === 'settings') {
        content.innerHTML = \`
          <div class="card">
            <div class="section-title">Connection</div>
            <p style="font-size: 13px; color: #6b7280; margin-bottom: 16px;">
              Configure your OpenDS connection
            </p>
            <button class="secondary-button" id="disconnect-btn">Disconnect</button>
          </div>
        \`
        document.getElementById('disconnect-btn').addEventListener('click', async () => {
          await penpot.storage.set('opends_config', JSON.stringify({ url: '', apiKey: '', autoSync: false, connected: false }))
          window.location.reload()
        })
      }
    }
    
    function attachTokenHandlers() {
      document.getElementById('sync-tokens').addEventListener('click', async () => {
        const btn = document.getElementById('sync-tokens')
        const config = JSON.parse(await penpot.storage.get('opends_config'))
        
        btn.disabled = true
        btn.textContent = 'Extracting...'
        showStatus('Extracting tokens from Penpot...', 'info')
        
        try {
          const library = penpot.library.local
          const colors = library.colors || []
          const typography = library.typographies || []
          const spacing = library.spacings || []
          
          document.getElementById('color-count').textContent = colors.length
          document.getElementById('typography-count').textContent = typography.length
          document.getElementById('spacing-count').textContent = spacing.length
          
          const preview = document.getElementById('token-preview')
          let previewHTML = ''
          
          colors.slice(0, 10).forEach(c => {
            previewHTML += \`<div class="token-item">
              <div class="token-color" style="background: \${c.value}"></div>
              <div class="token-name">\${c.name || 'Unnamed'}</div>
              <div class="token-value">\${c.value}</div>
            </div>\`
          })
          
          if (colors.length > 10) {
            previewHTML += \`<p style="font-size: 12px; color: #6b7280; padding: 8px;">...and \${colors.length - 10} more colors</p>\`
          }
          
          preview.innerHTML = previewHTML
          
          showStatus(\`Extracted \${colors.length} colors, \${typography.length} typography, \${spacing.length} spacing\`, 'success')
          
          btn.textContent = 'Sync to Hub'
          btn.disabled = false
          
          btn.onclick = async () => {
            btn.disabled = true
            btn.textContent = 'Syncing...'
            showStatus('Syncing to OpenDS hub...', 'info')
            
            const payload = {
              colors: colors.map(c => ({ id: c.id, name: c.name, value: c.value, type: 'color' })),
              typography: typography.map(t => ({ id: t.id, name: t.name, fontFamily: t.fontFamily, fontSize: t.fontSize, fontWeight: t.fontWeight || 400, lineHeight: t.lineHeight, type: 'typography' })),
              spacing: spacing.map(s => ({ id: s.id, name: s.name, value: s.value, type: 'spacing' }))
            }
            
            const response = await fetch(config.url + '/api/penpot/tokens', {
              method: 'POST',
              headers: { 'Authorization': 'Bearer ' + config.apiKey, 'Content-Type': 'application/json' },
              body: JSON.stringify({ version: '1.0', source: 'penpot', exportedAt: new Date().toISOString(), ...payload })
            })
            
            if (response.ok) {
              showStatus(\`Synced \${colors.length} colors, \${typography.length} typography, \${spacing.length} spacing to OpenDS!\`, 'success')
            } else {
              showStatus('Sync failed: ' + response.status, 'error')
            }
            
            btn.disabled = false
            btn.textContent = 'Sync to Hub'
          }
        } catch (error) {
          showStatus('Error: ' + error.message, 'error')
          btn.disabled = false
          btn.textContent = 'Sync Tokens'
        }
      })
    }
    
    function showStatus(message, type) {
      const el = document.getElementById('sync-status')
      el.textContent = message
      el.className = 'status ' + type
    }
    
    loadView()
  </script>
</body>
</html>`
  }

  private openUI(title: string, html: string, size: { width: number; height: number }): void {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    this.penpot.ui.open(title, url, size)
  }
}

async function run(penpot: Penpot): Promise<void> {
  console.log('[OpenDS Plugin] Starting...')
  try {
    const plugin = new OpenDSPlugin(penpot)
    await plugin.initialize()
    console.log('[OpenDS Plugin] Initialized successfully')
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('[OpenDS Plugin] Error:', error.message)
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, sans-serif; padding: 20px; color: #dc2626; }
    h1 { color: #1e40af; }
  </style>
</head>
<body>
  <h1>🔄 OpenDS Sync</h1>
  <p>Error: ${error.message}</p>
  <p>Check browser console for details</p>
</body>
</html>`
    const blob = new Blob([errorHtml], { type: 'text/html' })
    penpot.ui.open('OpenDS Error', URL.createObjectURL(blob), { width: 400, height: 300 })
  }
}

const pluginExport = {
  id: PLUGIN_ID,
  name: 'OpenDS Sync',
  description: 'Sync your Penpot design system to OpenDS platform',
  icon: '🔄',
  run
}

if (typeof window !== 'undefined') {
  console.log('[OpenDS Plugin] Exposing as window.penpotPlugin')
  ;(window as any).penpotPlugin = pluginExport
  console.log('[OpenDS Plugin] Exported successfully')
}

export default pluginExport
