import type { Penpot } from '@penpot/plugin-types'
import type { ColorToken, TypographyToken, SpacingToken } from '../api/hub-api'

export interface ExtractedTokens {
  colors: ColorToken[]
  typography: TypographyToken[]
  spacing: SpacingToken[]
}

interface PenpotLibraryColor {
  id: string
  name: string
  color?: string
  description?: string
}

interface PenpotLibraryTypography {
  id: string
  name: string
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight?: string
  letterSpacing?: string
  description?: string
}

interface PenpotLibrarySpacing {
  id: string
  name: string
  value: string
  description?: string
}

export class TokenExtractor {
  private penpot: Penpot

  constructor(penpot: Penpot) {
    this.penpot = penpot
  }

  async extractAll(): Promise<ExtractedTokens> {
    const library = this.penpot.library.local

    return {
      colors: this.extractColors(library.colors as unknown as PenpotLibraryColor[]),
      typography: this.extractTypography(library.typographies as unknown as PenpotLibraryTypography[]),
      spacing: this.extractSpacing([] as PenpotLibrarySpacing[])
    }
  }

  private extractColors(colors: PenpotLibraryColor[]): ColorToken[] {
    return colors.map(color => ({
      id: color.id,
      name: color.name || `color-${color.id}`,
      value: this.normalizeColorValue(color.color || '#000000'),
      type: 'color' as const,
      description: color.description
    }))
  }

  private extractTypography(typographies: PenpotLibraryTypography[]): TypographyToken[] {
    return typographies.map(type => ({
      id: type.id,
      name: type.name || `typography-${type.id}`,
      fontFamily: type.fontFamily || 'inherit',
      fontSize: this.normalizeDimensionValue(type.fontSize || '16px'),
      fontWeight: parseInt(type.fontWeight) || 400,
      lineHeight: this.normalizeLineHeight(type.lineHeight || 'normal'),
      type: 'typography' as const,
      description: type.description
    }))
  }

  private extractSpacing(spacings: PenpotLibrarySpacing[]): SpacingToken[] {
    return spacings.map(space => ({
      id: space.id,
      name: space.name || `spacing-${space.id}`,
      value: this.normalizeDimensionValue(space.value || '0px'),
      type: 'spacing' as const,
      description: space.description
    }))
  }

  private normalizeColorValue(value: string): string {
    if (!value) return '#000000'
    
    if (value.startsWith('#')) {
      if (value.length === 4) {
        const hex = value.slice(1)
        return `#${hex}${hex}${hex}`
      }
      if (value.length === 7) {
        return value
      }
      if (value.length === 9) {
        return value.slice(0, 7)
      }
    }
    
    if (value.startsWith('rgb')) {
      return value
    }
    
    if (value.startsWith('hsl')) {
      return value
    }
    
    return value
  }

  private normalizeDimensionValue(value: string): string {
    if (!value) return '0px'
    
    const num = parseFloat(value)
    if (isNaN(num)) return value
    
    if (value.includes('px')) return value
    if (value.includes('rem')) return value
    if (value.includes('em')) return value
    
    return `${num}px`
  }

  private normalizeFontWeight(value: number): number {
    if (value >= 100 && value <= 900) return value
    return 400
  }

  private normalizeLineHeight(value: string): string {
    if (!value) return 'normal'
    
    const num = parseFloat(value)
    if (isNaN(num)) return value
    
    if (value.includes('px')) return value
    if (value.includes('em')) return value
    if (value.includes('%')) return value
    
    if (num > 0 && num < 10) {
      return `${num}`
    }
    
    return `${num}px`
  }
}

export function extractColorsFromShapes(shapes: any[]): ColorToken[] {
  const colorSet = new Map<string, ColorToken>()

  shapes.forEach((shape, index) => {
    if (shape.fill && shape.fill.color) {
      const colorValue = shape.fill.color
      const name = `shape-color-${index}`
      
      if (!colorSet.has(colorValue)) {
        colorSet.set(colorValue, {
          id: `color-${shape.id}-${index}`,
          name,
          value: colorValue,
          type: 'color'
        })
      }
    }
    
    if (shape.stroke && shape.stroke.color) {
      const colorValue = shape.stroke.color
      const name = `stroke-color-${index}`
      
      if (!colorSet.has(colorValue)) {
        colorSet.set(colorValue, {
          id: `color-${shape.id}-stroke-${index}`,
          name,
          value: colorValue,
          type: 'color'
        })
      }
    }
  })

  return Array.from(colorSet.values())
}
