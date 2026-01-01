#!/usr/bin/env node

// Simple HTTP server for testing Penpot plugin
// Based on official Penpot documentation: https://help.penpot.app/plugins/create-a-plugin/

import { createServer } from 'http'
import { readFile, stat } from 'fs/promises'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

const PORT = 3002
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PUBLIC_DIR = join(__dirname, 'public')

const server = createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
  
  // Set CORS headers for Penpot compatibility
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  let filePath = join(PUBLIC_DIR, req.url === '/' ? 'manifest.json' : req.url)
  
  // Default to manifest.json
  if (req.url === '/') {
    filePath = join(PUBLIC_DIR, 'manifest.json')
  }
  
  try {
    // Check if file exists
    const stats = await stat(filePath)
    if (!stats.isFile()) {
      throw new Error('Not a file')
    }
    
    // Determine content type
    const ext = extname(filePath).toLowerCase()
    const contentTypes = {
      '.json': 'application/json',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.html': 'text/html',
      '.css': 'text/css'
    }
    
    const contentType = contentTypes[ext] || 'text/plain'
    
    // Read and serve file
    const data = await readFile(filePath)
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Content-Length': data.length
    })
    res.end(data)
  } catch (err) {
    console.error(`Error serving ${req.url}:`, err.message)
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('404 Not Found')
  }
})

server.listen(PORT, () => {
  console.log(`🚀 Plugin server running at http://localhost:${PORT}`)
  console.log(`📄 Manifest: http://localhost:${PORT}/manifest.json`)
  console.log(`⚡ Plugin: http://localhost:${PORT}/plugin.js`)
  console.log('\nTo install in Penpot:')
  console.log('1. Open Penpot (https://penpot.app)')
  console.log('2. Press Ctrl+Alt+P (or Cmd+Alt+P on Mac)')
  console.log('3. Enter URL: http://localhost:3002/manifest.json')
  console.log('4. Click "Install"')
  console.log('\nOr use the Plugin Manager:')
  console.log('- Menu → Plugins → Plugin Manager')
  console.log('- Toolbar → Plugins icon → Plugin Manager')
  console.log('\nRequirements:')
  console.log('- Penpot account (free)')
  console.log('- OpenDS backend running (http://localhost:3001)')
  console.log('- Local network access (for CORS)')
})

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down plugin server...')
  server.close()
  process.exit(0)
})