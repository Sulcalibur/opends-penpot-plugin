// Minimal working Penpot plugin for OpenDS
// This is the simplest possible plugin that should work

import type { Penpot } from '@penpot/plugin-types'

const plugin = {
  id: 'opends-sync-minimal',
  name: 'OpenDS Sync',
  description: 'Sync design systems to OpenDS',
  icon: '🔄',
  
  async run(penpot: Penpot) {
    console.log('OpenDS minimal plugin loaded')
    
    // Create simple HTML UI
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
            max-width: 360px;
            margin: 0 auto;
            text-align: center;
          }
          h1 {
            color: #1e40af;
            margin-bottom: 8px;
          }
          p {
            color: #6b7280;
            margin-bottom: 24px;
          }
          button {
            padding: 12px 24px;
            background: #1e40af;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          }
          button:hover {
            background: #1e3a8a;
          }
          .status {
            margin-top: 16px;
            padding: 12px;
            border-radius: 6px;
            background: #dbeafe;
            color: #1e40af;
            display: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>OpenDS Sync</h1>
          <p>Sync your Penpot design system to OpenDS platform</p>
          
          <button onclick="testPlugin()">Test Plugin</button>
          
          <div id="status" class="status"></div>
        </div>
        
        <script>
          function testPlugin() {
            const button = document.querySelector('button')
            const status = document.getElementById('status')
            
            button.textContent = 'Testing...'
            button.disabled = true
            status.textContent = 'Accessing Penpot library...'
            status.style.display = 'block'
            
            try {
              // Try to access Penpot API
              if (typeof penpot !== 'undefined') {
                status.textContent = '✓ Penpot API available'
                
                // Try to access library
                if (penpot.library && penpot.library.local) {
                  status.textContent = '✓ Library access available'
                  
                  // Count colors and components
                  const colors = penpot.library.local.colors || []
                  const components = penpot.library.local.components || []
                  
                  status.textContent = \`✓ Found \${colors.length} colors and \${components.length} components\`
                  
                } else {
                  status.textContent = '⚠ Library access not available'
                }
              } else {
                status.textContent = '✗ Penpot API not available'
              }
            } catch (error) {
              status.textContent = 'Error: ' + error.message
            }
            
            setTimeout(() => {
              button.textContent = 'Test Plugin'
              button.disabled = false
            }, 2000)
          }
        </script>
      </body>
      </html>
    `
    
    // Create blob URL
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    // Open UI
    penpot.ui.open('OpenDS Sync', url, { width: 400, height: 300 })
  }
}

export default plugin