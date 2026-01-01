// OpenDS Penpot Plugin - JavaScript version
// This is a working plugin that can be installed in Penpot

const plugin = {
  id: 'opends-sync',
  name: 'OpenDS Sync',
  description: 'Sync your Penpot design system to OpenDS platform',
  version: '0.1.0',
  author: 'OpenDS Team',
  icon: '🔄',
  
  async run(penpot) {
    console.log('OpenDS plugin starting...')
    
    // Create HTML UI
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 24px;
            margin: 0;
            background: #f8f9fa;
          }
          .container {
            max-width: 400px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            font-size: 64px;
            margin-bottom: 16px;
          }
          h1 {
            margin: 0 0 8px 0;
            color: #1e40af;
            font-size: 24px;
          }
          .subtitle {
            color: #6b7280;
            margin: 0 0 24px 0;
            font-size: 14px;
          }
          .card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 6px;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
          }
          .form-input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
          }
          .form-input:focus {
            outline: none;
            border-color: #1e40af;
            box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
          }
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
            margin-bottom: 12px;
          }
          .primary-button:hover {
            background: #1e3a8a;
          }
          .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
          }
          .stat {
            text-align: center;
            padding: 16px;
            background: #f1f5f9;
            border-radius: 8px;
          }
          .stat-label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 4px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #1e40af;
          }
          .status {
            margin-top: 16px;
            padding: 12px;
            border-radius: 6px;
            font-size: 14px;
            display: none;
          }
          .status.success {
            background: #d1fae5;
            color: #065f46;
            display: block;
          }
          .status.error {
            background: #fee2e2;
            color: #991b1b;
            display: block;
          }
          .status.info {
            background: #dbeafe;
            color: #1e40af;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔄</div>
            <h1>OpenDS Sync</h1>
            <p class="subtitle">Sync your Penpot design system to OpenDS platform</p>
          </div>
          
          <div class="card">
            <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 18px;">Connect to OpenDS</h2>
            
            <div class="form-group">
              <label for="opends-url">OpenDS URL</label>
              <input type="text" id="opends-url" placeholder="http://localhost:3001" class="form-input" value="http://localhost:3001">
              <small style="display: block; margin-top: 4px; font-size: 12px; color: #6b7280;">URL of your OpenDS instance</small>
            </div>
            
            <div class="form-group">
              <label for="api-key">API Key</label>
              <input type="password" id="api-key" placeholder="Your API key" class="form-input">
              <small style="display: block; margin-top: 4px; font-size: 12px; color: #6b7280;">
                Get your API key from OpenDS Settings → API Keys
              </small>
            </div>
            
            <button class="primary-button" onclick="connectToOpenDS()">Connect to OpenDS</button>
            <div id="connect-status" class="status"></div>
          </div>
          
          <div class="card" id="sync-ui" style="display: none;">
            <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 18px;">Sync Design System</h2>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-label">Colors</div>
                <div id="color-count" class="stat-value">0</div>
              </div>
              <div class="stat">
                <div class="stat-label">Components</div>
                <div id="component-count" class="stat-value">0</div>
              </div>
            </div>
            
            <button class="primary-button" onclick="syncToOpenDS()">Sync to OpenDS</button>
            <div id="sync-status" class="status"></div>
          </div>
        </div>
        
        <script>
          // Load saved configuration
          let config = null
          try {
            const configJson = penpot.localStorage.getItem('opends_config')
            if (configJson) {
              config = JSON.parse(configJson)
              document.getElementById('opends-url').value = config.url || 'http://localhost:3001'
              document.getElementById('api-key').value = config.apiKey || ''
              
              // Show sync UI if configured
              if (config.url && config.apiKey) {
                document.getElementById('sync-ui').style.display = 'block'
                loadDesignSystemStats()
              }
            }
          } catch (error) {
            console.error('Failed to load config:', error)
          }
          
          async function connectToOpenDS() {
            const url = document.getElementById('opends-url').value
            const apiKey = document.getElementById('api-key').value
            
            if (!url || !apiKey) {
              showStatus('Please enter both URL and API key', 'error', 'connect-status')
              return
            }
            
            const button = document.querySelector('.primary-button')
            const originalText = button.textContent
            button.textContent = 'Connecting...'
            button.disabled = true
            
            showStatus('Testing connection...', 'info', 'connect-status')
            
            try {
              // Test connection to OpenDS
              const response = await fetch(url + '/api/plugin/health', {
                headers: {
                  'Authorization': 'Bearer ' + apiKey
                }
              })
              
              if (response.ok) {
                // Save configuration
                config = { url, apiKey }
                penpot.localStorage.setItem('opends_config', JSON.stringify(config))
                
                showStatus('Connected successfully!', 'success', 'connect-status')
                document.getElementById('sync-ui').style.display = 'block'
                
                // Load design system stats
                loadDesignSystemStats()
                
              } else {
                showStatus('Connection failed: ' + response.status, 'error', 'connect-status')
              }
            } catch (error) {
              showStatus('Connection error: ' + error.message, 'error', 'connect-status')
            }
            
            button.textContent = originalText
            button.disabled = false
          }
          
          async function syncToOpenDS() {
            if (!config) {
              showStatus('Not connected to OpenDS', 'error', 'sync-status')
              return
            }
            
            const button = document.querySelector('#sync-ui .primary-button')
            const originalText = button.textContent
            button.textContent = 'Syncing...'
            button.disabled = true
            
            showStatus('Extracting design system data...', 'info', 'sync-status')
            
            try {
              // Extract data from Penpot
              const library = penpot.library.local
              const colors = library.colors || []
              const components = library.components || []
              
              const data = {
                fileId: 'penpot-file-' + Date.now(),
                fileName: 'Penpot Design System',
                colors: colors.map(color => ({
                  id: color.id,
                  name: color.name,
                  type: 'color',
                  value: color.value,
                  description: color.description
                })),
                typographies: [],
                components: components.map(component => ({
                  id: component.id,
                  name: component.name,
                  properties: {
                    type: 'component',
                    shapes: component.shapes?.length || 0
                  },
                  description: component.description
                })),
                syncedAt: new Date().toISOString()
              }
              
              showStatus(\`Sending \${data.components.length} components, \${data.colors.length} colors...\`, 'info', 'sync-status')
              
              // Send to OpenDS
              const response = await fetch(config.url + '/api/plugin/sync', {
                method: 'POST',
                headers: {
                  'Authorization': 'Bearer ' + config.apiKey,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
              })
              
              if (response.ok) {
                const result = await response.json()
                penpot.localStorage.setItem('opends_last_sync', new Date().toISOString())
                showStatus(\`✅ Synced \${result.components} components and \${result.tokens} tokens!\`, 'success', 'sync-status')
              } else {
                const error = await response.text()
                showStatus('Sync failed: ' + error, 'error', 'sync-status')
              }
              
            } catch (error) {
              showStatus('Sync error: ' + error.message, 'error', 'sync-status')
            }
            
            button.textContent = originalText
            button.disabled = false
          }
          
          function showStatus(message, type, elementId) {
            const element = document.getElementById(elementId)
            element.textContent = message
            element.className = 'status ' + type
          }
          
          function loadDesignSystemStats() {
            try {
              const library = penpot.library.local
              const colors = library.colors || []
              const components = library.components || []
              
              document.getElementById('color-count').textContent = colors.length
              document.getElementById('component-count').textContent = components.length
            } catch (error) {
              console.error('Failed to load stats:', error)
            }
          }
        </script>
      </body>
      </html>
    `
    
    // Create blob URL
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    // Open UI
    penpot.ui.open('OpenDS Sync', url, { width: 440, height: 600 })
  }
}

// Export the plugin
if (typeof module !== 'undefined' && module.exports) {
  module.exports = plugin
} else {
  // For browser/ES module
  window.opendsPlugin = plugin
}