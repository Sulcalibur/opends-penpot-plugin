# OpenDS Penpot Plugin

A Penpot plugin for syncing design systems to the OpenDS platform. This plugin extracts components, design tokens, and assets from Penpot files and sends them to OpenDS for further processing and code generation.

## Features

- **Component Extraction**: Automatically extracts component specifications from Penpot designs including dimensions, shape types, colors, and text content
- **Design Token Sync**: Syncs colors, typography, and other design tokens
- **Asset Management**: Handles images and other assets used in components
- **Real-time Sync**: Optional webhook-based real-time synchronization
- **Error Handling**: Robust error handling with retry logic and connection timeouts
- **Secure Storage**: API keys stored locally in Penpot

## Installation

### From Penpot Plugin Store (Recommended)

1. Open Penpot in your browser
2. Go to **Plugins** → **Browse Plugins**
3. Search for "OpenDS Sync"
4. Click **Install**
5. The plugin will appear in your plugin toolbar

### Manual Installation (Development)

1. Clone this repository:

   ```bash
   git clone https://github.com/opends/opends-penpot-plugin.git
   cd opends-penpot-plugin
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the plugin:

   ```bash
   pnpm run build
   ```

4. Load the plugin in Penpot:
   - Open Penpot
   - Go to **Plugins** → **Develop your plugin**
   - Select the `dist/index.js` file
   - The plugin will be loaded for testing

## Configuration

1. **Start OpenDS backend:**
   - Ensure your OpenDS instance is running (local or remote)
   - Default local URL: `http://localhost:3001`

2. **Generate API key:**

   ```bash
   curl -X POST http://localhost:3001/api/plugin/api-keys
   ```

3. **Configure plugin in Penpot:**
   - Open the OpenDS plugin
   - Enter:
     - **OpenDS URL**: `http://localhost:3001`
     - **API Key**: (from step 2)
   - Click "Connect"

## Usage

### First Time Setup

1. **Launch the Plugin**: Click the 🔄 icon in the Penpot toolbar
2. **Configure Connection**:
   - Enter your OpenDS instance URL (e.g., `https://opends.example.com`)
   - Enter your API key from OpenDS Settings → API Keys
   - Optionally enable auto-sync
3. **Test Connection**: Click "Connect to OpenDS" to verify the connection

### Syncing Design Systems

1. **Open Plugin**: Click the 🔄 icon in the toolbar
2. **View Stats**: Check the current count of colors and components
3. **Sync Data**: Click "Sync to OpenDS" to send your design system data
4. **Monitor Progress**: Watch the status messages for sync progress

### Component Extraction Details

The plugin extracts the following from Penpot components:

- **Basic Properties**: Name, description, dimensions
- **Visual Elements**: Shape types (rectangles, paths, text)
- **Colors**: Fill and stroke colors used
- **Text Content**: Any text elements within the component
- **Structure**: Number and types of shapes

## Development

### Project Structure

```
opends-penpot-plugin/
├── src/
│   ├── index.ts          # Main plugin entry point
│   ├── minimal-plugin.ts # Minimal plugin version
│   ├── simple-plugin.ts  # Simple export version
│   ├── types.ts          # TypeScript interfaces
│   └── tests.ts          # Test utilities and mock data
├── dist/                 # Built plugin files
├── package.json          # Plugin metadata and scripts
└── README.md            # This file
```

### Building

```bash
# Install dependencies
pnpm install

# Build for production
pnpm run build

# Build with watch mode
pnpm run dev
```

### Testing

The plugin includes test utilities in `src/tests.ts`. To run tests:

```bash
# Run tests (requires test runner setup)
pnpm test
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## API Endpoints

The plugin communicates with OpenDS backend:

- `GET /api/plugin/health` - Health check
- `POST /api/plugin/sync` - Sync design system data
- `POST /api/plugin/api-keys` - Generate API keys

## Permissions

The plugin requires:

- `storage` - Save configuration
- `library.local` - Access design tokens
- `file.current` - Access current file

## Troubleshooting

### Connection Issues

**"Connection failed"**

- Verify the OpenDS URL is correct and accessible
- Check that your API key is valid and not expired
- Ensure OpenDS is running and the API endpoint is available

**"Connection timeout"**

- Check your internet connection
- Verify the OpenDS server is responding
- Try again later if the server is under heavy load

### Sync Issues

**"Sync failed after 3 attempts"**

- Check the OpenDS server logs for error details
- Verify the design file is not corrupted
- Try syncing a smaller subset of components

**"No components found"**

- Ensure you have components defined in your Penpot library
- Check that components are properly named and structured
- Try refreshing the Penpot page and reopening the plugin

### Component Extraction Issues

**"Components not extracting properly"**

- Ensure components are created using Penpot's component system
- Check that component names and descriptions are set
- Verify shapes within components have proper properties

### Plugin Issues

**Plugin doesn't appear:**

- Check browser console for errors
- Verify `plugin.json` is valid
- Ensure Penpot version supports plugins

## License

MIT
