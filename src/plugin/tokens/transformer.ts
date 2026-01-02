import type { ColorToken, TypographyToken, SpacingToken } from '../api/hub-api'

export interface OpenSpecColorToken {
  name: string
  value: string
  type: string
  description?: string
}

export interface OpenSpecTypographyToken {
  name: string
  fontFamily: string
  fontSize: string
  fontWeight: number
  lineHeight: string
  description?: string
}

export interface OpenSpecSpacingToken {
  name: string
  value: string
  description?: string
}

export interface OpenSpecTokens {
  colors: Record<string, OpenSpecColorToken>
  typography: Record<string, OpenSpecTypographyToken>
  spacing: Record<string, OpenSpecSpacingToken>
}

export class TokenTransformer {
  private colorTokenMap = new Map<string, string>()
  private typographyTokenMap = new Map<string, string>()
  private spacingTokenMap = new Map<string, string>()

  transformColors(colors: ColorToken[]): Record<string, OpenSpecColorToken> {
    const result: Record<string, OpenSpecColorToken> = {}

    colors.forEach(token => {
      const normalizedName = this.normalizeTokenName(token.name)
      this.colorTokenMap.set(token.id, normalizedName)

      result[normalizedName] = {
        name: normalizedName,
        value: this.transformColorValue(token.value),
        type: 'color',
        description: token.description
      }
    })

    return result
  }

  transformTypography(typography: TypographyToken[]): Record<string, OpenSpecTypographyToken> {
    const result: Record<string, OpenSpecTypographyToken> = {}

    typography.forEach(token => {
      const normalizedName = this.normalizeTokenName(token.name)
      this.typographyTokenMap.set(token.id, normalizedName)

      result[normalizedName] = {
        name: normalizedName,
        fontFamily: token.fontFamily,
        fontSize: token.fontSize,
        fontWeight: token.fontWeight,
        lineHeight: token.lineHeight,
        description: token.description
      }
    })

    return result
  }

  transformSpacing(spacing: SpacingToken[]): Record<string, OpenSpecSpacingToken> {
    const result: Record<string, OpenSpecSpacingToken> = {}

    spacing.forEach(token => {
      const normalizedName = this.normalizeTokenName(token.name)
      this.spacingTokenMap.set(token.id, normalizedName)

      result[normalizedName] = {
        name: normalizedName,
        value: token.value,
        description: token.description
      }
    })

    return result
  }

  toYAML(tokens: OpenSpecTokens): string {
    let yaml = '# OpenSpec Design Tokens\n'
    yaml += `# Generated from Penpot on ${new Date().toISOString()}\n\n`

    yaml += '## Colors\n'
    yaml += 'colors:\n'
    Object.entries(tokens.colors).forEach(([key, token]) => {
      yaml += `  ${key}:\n`
      yaml += `    value: "${token.value}"\n`
      yaml += `    type: "${token.type}"\n`
      if (token.description) {
        yaml += `    description: "${token.description}"\n`
      }
    })

    yaml += '\n## Typography\n'
    yaml += 'typography:\n'
    Object.entries(tokens.typography).forEach(([key, token]) => {
      yaml += `  ${key}:\n`
      yaml += `    fontFamily: "${token.fontFamily}"\n`
      yaml += `    fontSize: "${token.fontSize}"\n`
      yaml += `    fontWeight: ${token.fontWeight}\n`
      yaml += `    lineHeight: "${token.lineHeight}"\n`
      if (token.description) {
        yaml += `    description: "${token.description}"\n`
      }
    })

    yaml += '\n## Spacing\n'
    yaml += 'spacing:\n'
    Object.entries(tokens.spacing).forEach(([key, token]) => {
      yaml += `  ${key}:\n`
      yaml += `    value: "${token.value}"\n`
      if (token.description) {
        yaml += `    description: "${token.description}"\n`
      }
    })

    return yaml
  }

  private normalizeTokenName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  private transformColorValue(value: string): string {
    if (value.startsWith('#') && value.length === 9) {
      return value.slice(0, 7)
    }
    
    if (value.startsWith('rgba')) {
      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/)
      if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0')
        const g = parseInt(match[2]).toString(16).padStart(2, '0')
        const b = parseInt(match[3]).toString(16).padStart(2, '0')
        return `#${r}${g}${b}`
      }
    }
    
    if (value.startsWith('rgb')) {
      const match = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0')
        const g = parseInt(match[2]).toString(16).padStart(2, '0')
        const b = parseInt(match[3]).toString(16).padStart(2, '0')
        return `#${r}${g}${b}`
      }
    }
    
    return value
  }
}

export function detectConflicts(
  existing: OpenSpecTokens,
  incoming: OpenSpecTokens
): Array<{ name: string; existingValue: string; incomingValue: string }> {
  const conflicts: Array<{ name: string; existingValue: string; incomingValue: string }> = []

  Object.entries(incoming.colors).forEach(([key, incomingToken]) => {
    const existingToken = existing.colors[key]
    if (existingToken && existingToken.value !== incomingToken.value) {
      conflicts.push({
        name: `colors.${key}`,
        existingValue: existingToken.value,
        incomingValue: incomingToken.value
      })
    }
  })

  Object.entries(incoming.typography).forEach(([key, incomingToken]) => {
    const existingToken = existing.typography[key]
    if (existingToken && JSON.stringify(existingToken) !== JSON.stringify(incomingToken)) {
      conflicts.push({
        name: `typography.${key}`,
        existingValue: JSON.stringify(existingToken),
        incomingValue: JSON.stringify(incomingToken)
      })
    }
  })

  Object.entries(incoming.spacing).forEach(([key, incomingToken]) => {
    const existingToken = existing.spacing[key]
    if (existingToken && existingToken.value !== incomingToken.value) {
      conflicts.push({
        name: `spacing.${key}`,
        existingValue: existingToken.value,
        incomingValue: incomingToken.value
      })
    }
  })

  return conflicts
}
