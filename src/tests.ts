// Test suite for OpenDS Penpot Plugin
// Contains mock data and test utilities

export const mockPenpotData = {
  library: {
    local: {
      colors: [
        {
          id: 'color-1',
          name: 'Primary Blue',
          value: '#1e40af',
          description: 'Main brand color'
        },
        {
          id: 'color-2',
          name: 'Secondary Green',
          value: '#059669',
          description: 'Secondary accent color'
        },
        {
          id: 'color-3',
          name: 'Neutral Gray',
          value: '#6b7280',
          description: 'Text color'
        }
      ],
      components: [
        {
          id: 'button-primary',
          name: 'Primary Button',
          description: 'Main call-to-action button',
          shapes: [
            {
              id: 'rect-bg',
              type: 'rect',
              width: 120,
              height: 40,
              fill: { color: '#1e40af' },
              stroke: { color: '#1e40af' }
            },
            {
              id: 'text-label',
              type: 'text',
              content: 'Click me',
              fill: { color: '#ffffff' }
            }
          ]
        },
        {
          id: 'input-field',
          name: 'Text Input',
          description: 'Standard text input field',
          shapes: [
            {
              id: 'rect-border',
              type: 'rect',
              width: 200,
              height: 32,
              fill: { color: '#ffffff' },
              stroke: { color: '#d1d5db' }
            },
            {
              id: 'text-placeholder',
              type: 'text',
              content: 'Enter text...',
              fill: { color: '#6b7280' }
            }
          ]
        },
        {
          id: 'card-basic',
          name: 'Basic Card',
          description: 'Content container card',
          shapes: [
            {
              id: 'rect-card',
              type: 'rect',
              width: 300,
              height: 200,
              fill: { color: '#ffffff' },
              stroke: { color: '#e5e7eb' }
            },
            {
              id: 'text-title',
              type: 'text',
              content: 'Card Title',
              fill: { color: '#1e40af' }
            },
            {
              id: 'text-content',
              type: 'text',
              content: 'Card content goes here...',
              fill: { color: '#374151' }
            }
          ]
        }
      ]
    }
  }
}

export function createMockPenpotAPI(mockData = mockPenpotData) {
  return {
    library: mockData.library,
    ui: {
      open: (title: string, url: string, options?: any) => {
        console.log(`Mock UI opened: ${title} at ${url}`)
      }
    },
    localStorage: {
      getItem: (key: string) => {
        console.log(`Mock localStorage get: ${key}`)
        return null
      },
      setItem: (key: string, value: string) => {
        console.log(`Mock localStorage set: ${key} = ${value}`)
      }
    }
  }
}

export function testComponentExtraction() {
  console.log('Testing component extraction...')

  // This would be used in a test environment
  // For now, just log that we're testing
  console.log('✓ Component extraction test placeholder')
}

export function testDataExport() {
  console.log('Testing data export...')

  const testData = {
    colors: mockPenpotData.library.local.colors,
    components: mockPenpotData.library.local.components
  }

  console.log('Test data:', JSON.stringify(testData, null, 2))
  console.log('✓ Data export test completed')
}