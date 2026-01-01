export interface OpenDSConfig {
  url: string
  apiKey: string
  autoSync: boolean
}

export interface DesignSystemData {
  fileId: string
  fileName: string
  colors: DesignToken[]
  typographies: DesignToken[]
  components: Component[]
  syncedAt: string
}

export interface DesignToken {
  id: string
  name: string
  type: 'color' | 'typography' | 'spacing' | 'radius' | 'shadow'
  value: any
  description?: string
}

export interface Component {
  id: string
  name: string
  variant?: string
  properties: Record<string, any>
  description?: string
}

export interface SyncResult {
  success: boolean
  fileId: string
  components: number
  tokens: number
  message?: string
  error?: string
}

export interface ConnectionStatus {
  connected: boolean
  url?: string
  lastSync?: string
  autoSync: boolean
}