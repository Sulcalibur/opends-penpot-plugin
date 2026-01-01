// OpenDS Penpot Plugin - Simple Version
// Exports design tokens as JSON for Vue SPA import

import type { Penpot } from '@penpot/plugin-types'

const PLUGIN_ID = 'opends-simple-export'

class OpenDSSimplePlugin {
  private penpot: Penpot

  constructor(penpot: Penpot) {
    this.penpot = penpot
  }

  private extractComponentSpecs(components: any[]): any[] {
    return components.map(component => {
      const spec = {
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

  async initialize() {
    console.log('OpenDS Simple Export plugin initializing...')
    this.showExportUI()
  }

  private showExportUI() {
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
            margin-bottom: 24px;
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
            margin-bottom: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
          }
          .stat-box {
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
          }
          .primary-button:hover {
            background: #1e3a8a;
          }
          .primary-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
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
            <h1>OpenDS Export</h1>
            <p class="subtitle">Export design tokens to OpenDS Vue SPA</p>
          </div>
          
          <div class="card">
            <div class="stats">
              <div class="stat-box">
                <div class="stat-label">Colors</div>
                <div id="color-count" class="stat-value">0</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Components</div>
                <div id="component-count" class="stat-value">0</div>
              </div>
            </div>
            
            <button class="primary-button" onclick="exportToOpenDS()" id="export-button">
              Export to OpenDS
            </button>
            <div id="export-status" class="status"></div>
          </div>
          
          <div class="card">
            <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 16px;">How to use:</h3>
            <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #4b5563;">
              <li style="margin-bottom: 8px;">Click "Export to OpenDS"</li>
              <li style="margin-bottom: 8px;">JSON file will download</li>
              <li style="margin-bottom: 8px;">Go to OpenDS Vue SPA</li>
              <li style="margin-bottom: 8px;">Click "Import from Penpot"</li>
              <li>Select the downloaded file</li>
            </ol>
          </div>
        </div>
        
        <script>
          async function loadStats() {
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
          
          async function exportToOpenDS() {
            const button = document.getElementById('export-button')
            const originalText = button.textContent
            button.textContent = 'Extracting...'
            button.disabled = true
            
            showStatus('Extracting design system data...', 'info')
            
            try {
              // Extract data from Penpot
              const library = penpot.library.local
              const colors = library.colors || []
              const components = library.components || []
              
              const data = {
                version: '1.0',
                source: 'penpot',
                exportedAt: new Date().toISOString(),
                colors: colors.map(color => ({
                  name: color.name || 'color-' + color.id,
                  value: color.value || '#000000',
                  type: 'color',
                  description: color.description || ''
                })),
                components: this.extractComponentSpecs(components).map(comp => ({
                  name: comp.name,
                  description: comp.description || '',
                  category: 'penpot',
                  properties: comp.properties
                }))
              }
              
              showStatus('Extracted ' + data.components.length + ' components, ' + data.colors.length + ' colors', 'info')
              
              // Create download link
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'opends-export-' + new Date().toISOString().slice(0, 10) + '.json'
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
              
              showStatus('✅ Exported ' + data.components.length + ' components and ' + data.colors.length + ' colors! Download started.', 'success')
              
            } catch (error) {
              showStatus('Export error: ' + error.message, 'error')
            }
            
            button.textContent = originalText
            button.disabled = false
          }
          
          function showStatus(message, type) {
            const element = document.getElementById('export-status')
            element.textContent = message
            element.className = 'status ' + type
          }
          
          // Load initial stats
          window.addEventListener('load', loadStats)
        </script>
      </body>
      </html>
    `
    
    // Create blob URL
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    // Open UI
    this.penpot.ui.open('OpenDS Export', url, { width: 440, height: 500 })
  }
}

// Plugin entry point
const plugin = {
  id: PLUGIN_ID,
  name: 'OpenDS Export',
  description: 'Export design tokens to OpenDS Vue SPA',
  icon: '📤',
  
  async run(penpot: Penpot) {
    console.log('OpenDS Simple Export plugin starting...')
    const exportPlugin = new OpenDSSimplePlugin(penpot)
    await exportPlugin.initialize()
  }
}

export default plugin