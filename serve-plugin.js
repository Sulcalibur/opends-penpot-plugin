#!/usr/bin/env node

import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

const PORT = 3002
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PUBLIC_DIR = join(__dirname, 'public')

const MIME_TYPES = {
  '.json': 'application/json',
  '.js': 'application/javascript',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.css': 'text/css'
}

const server = createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
  
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  let urlPath = req.url?.split('?')[0] || '/'
  if (urlPath === '/') {
    urlPath = '/manifest.json'
  }
  
  const filePath = join(PUBLIC_DIR, urlPath)
  
  try {
    const data = await readFile(filePath)
    const ext = extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'text/plain'
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Content-Length': data.length
    })
    res.end(data)
  } catch (err) {
    console.error(`  404: ${urlPath}`)
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('404 Not Found')
  }
})

server.listen(PORT, () => {
  console.log(`🚀 Plugin server running at http://localhost:${PORT}`)
  console.log(`📄 Manifest: http://localhost:${PORT}/manifest.json`)
  console.log(`⚡ Plugin: http://localhost:${PORT}/plugin.js`)
  console.log(`🌐 UI: http://localhost:${PORT}/index.html`)
  console.log('\nTo install in Penpot:')
  console.log('1. Open Penpot (https://penpot.app)')
  console.log('2. Menu → Plugins → Plugin Manager')
  console.log(`3. Enter: http://localhost:${PORT}/manifest.json`)
  console.log('4. Click "Install"')
})

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down plugin server...')
  server.close()
  process.exit(0)
})
