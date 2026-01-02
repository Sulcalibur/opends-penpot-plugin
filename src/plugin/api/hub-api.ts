import type { Penpot } from '@penpot/plugin-types'

export interface OpenDSConfig {
  url: string
  apiKey: string
  autoSync: boolean
  connected: boolean
  lastSyncAt?: string
}

export interface HubResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface TokenPayload {
  colors: ColorToken[]
  typography: TypographyToken[]
  spacing: SpacingToken[]
}

export interface ColorToken {
  id: string
  name: string
  value: string
  type: 'color'
  description?: string
}

export interface TypographyToken {
  id: string
  name: string
  fontFamily: string
  fontSize: string
  fontWeight: number
  lineHeight: string
  type: 'typography'
  description?: string
}

export interface SpacingToken {
  id: string
  name: string
  value: string
  type: 'spacing'
  description?: string
}

export interface SyncResult {
  success: boolean
  itemsProcessed: number
  itemsFailed: number
  syncedAt: string
}

export class HubAPI {
  private config: OpenDSConfig | null = null
  private penpot: Penpot

  constructor(penpot: Penpot) {
    this.penpot = penpot
  }

  async loadConfig(): Promise<OpenDSConfig | null> {
    try {
      const stored = await this.penpot.localStorage.getItem('opends_config')
      if (stored) {
        this.config = JSON.parse(stored)
        return this.config
      }
    } catch (e) {
      console.error('Failed to load config:', e)
    }
    return null
  }

  async saveConfig(config: OpenDSConfig): Promise<void> {
    this.config = config
    await this.penpot.localStorage.setItem('opends_config', JSON.stringify(config))
  }

  async testConnection(): Promise<boolean> {
    if (!this.config?.url || !this.config?.apiKey) {
      return false
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`${this.config.url}/api/plugin/health`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (e) {
      console.error('Connection test failed:', e)
      return false
    }
  }

  async syncTokens(payload: TokenPayload): Promise<SyncResult> {
    if (!this.config?.url || !this.config?.apiKey) {
      throw new Error('Not configured')
    }

    try {
      const response = await fetch(`${this.config.url}/api/penpot/tokens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: '1.0',
          source: 'penpot',
          exportedAt: new Date().toISOString(),
          ...payload
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }

      const result = await response.json()
      
      await this.saveConfig({
        ...this.config,
        lastSyncAt: new Date().toISOString()
      })

      return {
        success: true,
        itemsProcessed: payload.colors.length + payload.typography.length + payload.spacing.length,
        itemsFailed: 0,
        syncedAt: new Date().toISOString()
      }
    } catch (e) {
      console.error('Token sync failed:', e)
      throw e
    }
  }

  async getSyncStatus(): Promise<{ synced: number; pending: number; conflicts: number }> {
    if (!this.config?.url || !this.config?.apiKey) {
      throw new Error('Not configured')
    }

    try {
      const response = await fetch(`${this.config.url}/api/penpot/sync-status`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (e) {
      console.error('Failed to get sync status:', e)
      throw e
    }
  }

  getConfig(): OpenDSConfig | null {
    return this.config
  }

  isConfigured(): boolean {
    return !!(this.config?.url && this.config?.apiKey)
  }
}
