// OpenDS Penpot Plugin
// Main entry point for syncing design systems to OpenDS

import type { Penpot } from '@penpot/plugin-types'

// Configuration interface
interface OpenDSConfig {
  url: string
  apiKey: string
  autoSync: boolean
}

// Design token interface
interface DesignToken {
  id: string
  name: string
  type: 'color' | 'typography'
  value: any
  description?: string
}

// Component interface
interface Component {
  id: string
  name: string
  variant?: string
  properties: Record<string, any>
  description?: string
}

// Sync result interface
interface SyncResult {
  success: boolean
  components: number
  tokens: number
  message?: string
  error?: string
}

// Plugin constants
const PLUGIN_ID = 'opends-sync'
const STORAGE_KEYS = {
  CONFIG: 'opends_config',
  LAST_SYNC: 'opends_last_sync'
}

// Main plugin class
class OpenDSSyncPlugin {
  private penpot: Penpot
  private config: OpenDSConfig | null = null

  constructor(penpot: Penpot) {
    this.penpot = penpot
  }

  async initialize() {
    console.log('OpenDS plugin initializing...')
    
    try {
      // Load saved configuration
      await this.loadConfig()
      
      // Setup initial UI
      this.showWelcomeUI()
      
    } catch (error) {
      console.error('Failed to initialize plugin:', error)
      this.showErrorUI('Failed to initialize plugin')
    }
  }

  private async loadConfig() {
    try {
      const configJson = this.penpot.localStorage.getItem(STORAGE_KEYS.CONFIG)
      if (configJson) {
        this.config = JSON.parse(configJson)
        console.log('Loaded config:', this.config)
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }

  private async saveConfig(config: OpenDSConfig) {
    this.config = config
    this.penpot.localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
  }

  private extractComponentSpecs(components: any[]): Component[] {
    return components.map(component => {
      const spec: Component = {
        id: component.id,
        name: component.name || `Component ${component.id}`,
        properties: {},
        description: component.description || ''
      }

      // Extract basic properties from component
      if (component.shapes && component.shapes.length > 0) {
        const mainShape = component.shapes[0]

        // Extract size if available
        if (mainShape.width && mainShape.height) {
          spec.properties.width = mainShape.width
          spec.properties.height = mainShape.height
        }

        // Extract component type based on shape types
        const shapeTypes = component.shapes.map((shape: any) => shape.type).filter(Boolean)
        if (shapeTypes.includes('text')) {
          spec.properties.type = 'text-component'
        } else if (shapeTypes.includes('path') || shapeTypes.includes('rect')) {
          spec.properties.type = 'visual-component'
        } else {
          spec.properties.type = 'mixed-component'
        }

        // Extract props from shape data
        spec.properties.shapeCount = component.shapes.length
        spec.properties.shapeTypes = [...new Set(shapeTypes)]

        // Extract text content if present
        const textShapes = component.shapes.filter((shape: any) => shape.type === 'text')
        if (textShapes.length > 0) {
          spec.properties.textContent = textShapes.map((shape: any) =>
            shape.content || shape.text || ''
          ).join(' ')
        }

        // Extract colors used
        const colors = new Set<string>()
        component.shapes.forEach((shape: any) => {
          if (shape.fill && shape.fill.color) {
            colors.add(shape.fill.color)
          }
          if (shape.stroke && shape.stroke.color) {
            colors.add(shape.stroke.color)
          }
        })
        spec.properties.colors = Array.from(colors)
      }

      return spec
    })
  }

  private showWelcomeUI() {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 24px;
            background: #f8f9fa;
            margin: 0;
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
            transition: border-color 0.2s;
          }
          .form-input:focus {
            outline: none;
            border-color: #1e40af;
            box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
          }
          .form-help {
            display: block;
            margin-top: 4px;
            font-size: 12px;
            color: #6b7280;
          }
          .checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 14px;
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
            transition: background 0.2s;
            margin-bottom: 12px;
          }
          .primary-button:hover {
            background: #1e3a8a;
          }
          .secondary-button {
            width: 100%;
            padding: 12px;
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
          }
          .secondary-button:hover {
            background: #e5e7eb;
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
              <input type="text" id="opends-url" placeholder="https://opends.example.com" class="form-input" value="${this.config?.url || 'http://localhost:3001'}">
              <small class="form-help">URL of your OpenDS instance</small>
            </div>
            
            <div class="form-group">
              <label for="api-key">API Key</label>
              <input type="password" id="api-key" placeholder="Your API key" class="form-input" value="${this.config?.apiKey || ''}">
              <small class="form-help">
                Get your API key from OpenDS Settings → API Keys
              </small>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="auto-sync" ${this.config?.autoSync ? 'checked' : ''}>
                Enable auto-sync
              </label>
              <small class="form-help">Automatically sync when design system changes</small>
            </div>
            
            <button class="primary-button" onclick="connectToOpenDS()">Connect to OpenDS</button>
            <div id="connect-status" class="status"></div>
          </div>
          
          <div class="card" id="sync-ui" style="display: ${this.config ? 'block' : 'none'}">
            <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 18px;">Sync Design System</h2>
            
            <div class="stats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
              <div style="text-align: center; padding: 16px; background: #f1f5f9; border-radius: 8px;">
                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Colors</div>
                <div id="color-count" style="font-size: 24px; font-weight: 600; color: #1e40af;">0</div>
              </div>
              <div style="text-align: center; padding: 16px; background: #f1f5f9; border-radius: 8px;">
                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Components</div>
                <div id="component-count" style="font-size: 24px; font-weight: 600; color: #1e40af;">0</div>
              </div>
            </div>
            
            <button class="primary-button" onclick="syncToOpenDS()">Sync to OpenDS</button>
            <button class="secondary-button" onclick="showSettings()">Settings</button>
            <div id="sync-status" class="status"></div>
          </div>
        </div>
        
        <script>
          async function connectToOpenDS() {
            const url = document.getElementById('opends-url').value
            const apiKey = document.getElementById('api-key').value
            const autoSync = document.getElementById('auto-sync').checked
            
            if (!url || !apiKey) {
              showStatus('Please enter both URL and API key', 'error')
              return
            }
            
            const button = document.querySelector('.primary-button')
            const originalText = button.textContent
            button.textContent = 'Connecting...'
            button.disabled = true
            
            showStatus('Testing connection...', 'info')
            
             try {
               // Test connection with timeout
               const controller = new AbortController()
               const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

               const response = await fetch(url + '/api/plugin/health', {
                 headers: {
                   'Authorization': 'Bearer ' + apiKey
                 },
                 signal: controller.signal
               })

               clearTimeout(timeoutId)

               if (response.ok) {
                // Save configuration
                await penpot.storage.set('opends_config', JSON.stringify({
                  url,
                  apiKey,
                  autoSync
                }))
                
                showStatus('Connected successfully!', 'success')
                document.getElementById('sync-ui').style.display = 'block'
                
                // Load initial stats
                loadDesignSystemStats()
                
              } else {
                showStatus('Connection failed: ' + response.status, 'error')
              }
             } catch (error) {
               if (error.name === 'AbortError') {
                 showStatus('Connection timeout: Please check your URL and try again', 'error')
               } else {
                 showStatus('Connection error: ' + error.message, 'error')
               }
             }
            
            button.textContent = originalText
            button.disabled = false
          }
          
           async function syncToOpenDS() {
             const button = document.querySelector('#sync-ui .primary-button')
             const originalText = button.textContent
             button.textContent = 'Extracting...'
             button.disabled = true
             
             showStatus('Extracting design system data...', 'info', 'sync-status')
             
             try {
               // Extract data from Penpot
               const library = penpot.library.local
               const colors = library.colors || []
               const components = library.components || []
               
                const data = {
                  version: '1.0',
                  source: 'penpot',
                  exportedAt: new Date().toISOString(),
                  fileName: 'Current Design File',
                  colors: colors.map(color => ({
                    name: color.name || `color-${color.id}`,
                    value: color.value || '#000000',
                    type: 'color',
                    description: color.description || ''
                  })),
                  components: this.extractComponentSpecs(components).map(comp => ({
                    name: comp.name,
                    description: comp.description,
                    category: 'penpot',
                    properties: comp.properties
                  }))
                }
               
               showStatus(`Extracted ${data.components.length} components, ${data.colors.length} colors`, 'info', 'sync-status')
               
               // Create download link
               const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
               const url = URL.createObjectURL(blob)
               const a = document.createElement('a')
               a.href = url
               a.download = `opends-export-${new Date().toISOString().slice(0, 10)}.json`
               document.body.appendChild(a)
               a.click()
               document.body.removeChild(a)
               URL.revokeObjectURL(url)
               
               await penpot.storage.set('opends_last_export', new Date().toISOString())
               showStatus(`✅ Exported ${data.components.length} components and ${data.colors.length} colors! Download started.`, 'success', 'sync-status')
               
             } catch (error) {
               showStatus('Export error: ' + error.message, 'error', 'sync-status')
             }
             
             button.textContent = originalText
             button.disabled = false
           }
            
            const config = JSON.parse(configJson)
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
                  fileId: 'test-file-id',
                  fileName: 'Current Design File',
                  colors: colors.map(color => ({
                    id: color.id,
                    name: color.name,
                    type: 'color',
                    value: color.value,
                    description: color.description
                  })),
                  typographies: [],
                  components: this.extractComponentSpecs(components),
                  syncedAt: new Date().toISOString()
                }
              
              showStatus(\`Sending \${data.components.length} components, \${data.colors.length} colors...\`, 'info', 'sync-status')
              
               // Send to OpenDS with retry logic
               const maxRetries = 3
               let retryCount = 0
               let success = false
               let lastError = ''

               while (retryCount < maxRetries && !success) {
                 try {
                   showStatus(\`Sending data to OpenDS (attempt \${retryCount + 1}/\${maxRetries})...\`, 'info', 'sync-status')

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
                     await penpot.storage.set('opends_last_sync', new Date().toISOString())
                     showStatus(\`✅ Synced \${result.components || data.components.length} components and \${result.tokens || data.colors.length} tokens!\`, 'success', 'sync-status')
                     success = true
                   } else {
                     const error = await response.text()
                     lastError = \`HTTP \${response.status}: \${error}\`
                     console.error('Sync failed:', lastError)
                     retryCount++
                     if (retryCount < maxRetries) {
                       await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // Exponential backoff
                     }
                   }
                 } catch (error) {
                   lastError = error.message
                   console.error('Sync error:', error)
                   retryCount++
                   if (retryCount < maxRetries) {
                     await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
                   }
                 }
               }

               if (!success) {
                 showStatus(\`Sync failed after \${maxRetries} attempts: \${lastError}\`, 'error', 'sync-status')
               }
              
            } catch (error) {
              showStatus('Sync error: ' + error.message, 'error', 'sync-status')
            }
            
            button.textContent = originalText
            button.disabled = false
          }
          
          function showSettings() {
            document.getElementById('sync-ui').style.display = 'none'
          }
          
          function showStatus(message, type, elementId = 'connect-status') {
            const element = document.getElementById(elementId)
            element.textContent = message
            element.className = 'status ' + type
          }
          
          async function loadDesignSystemStats() {
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
          
          // Load initial stats if connected
          window.addEventListener('load', async () => {
            const configJson = await penpot.storage.get('opends_config')
            if (configJson) {
              loadDesignSystemStats()
            }
          })
        </script>
      </body>
      </html>
    `
    
    // Create blob URL
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    // Open UI
    this.penpot.ui.open('OpenDS Sync', url, { width: 440, height: 600 })
  }

  private showErrorUI(message: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            text-align: center;
            background: #f8f9fa;
          }
          .error {
            color: #dc2626;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <h1>⚠️ Plugin Error</h1>
        <p class="error">${message}</p>
        <p>Please check the console for details.</p>
      </body>
      </html>
    `
    
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    this.penpot.ui.open('OpenDS Error', url, { width: 400, height: 300 })
  }
}

// Plugin entry point
const plugin = {
  id: PLUGIN_ID,
  name: 'OpenDS Sync',
  description: 'Sync your Penpot design system to OpenDS platform',
  icon: '🔄',
  
  async run(penpot: Penpot) {
    console.log('OpenDS plugin starting...')
    const syncPlugin = new OpenDSSyncPlugin(penpot)
    await syncPlugin.initialize()
  }
}

export default plugin