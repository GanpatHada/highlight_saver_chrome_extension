# Quick Installation Guide

## 🚀 Install the Highlight Saver Chrome Extension

### Step 1: Build the Extension
```bash
npm install
npm run build-extension
```

### Step 2: Load in Chrome
1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right corner)
4. Click "Load unpacked"
5. Select the `dist` folder from this project

### Step 3: Start Using
1. Navigate to any website
2. Select text by clicking and dragging
3. Click the "💾 Save" button that appears
4. Click the extension icon to view your saved highlights

## 🎯 How to Use

1. **Select Text**: Highlight any text on any website
2. **Save**: Click the floating save button that appears
3. **View**: Click the extension icon in your toolbar
4. **Manage**: Delete highlights or visit original pages

## 🔧 Troubleshooting

- **Extension not working?** Make sure Developer mode is enabled
- **Save button not appearing?** Try selecting text on a different part of the page
- **Build errors?** Make sure all dependencies are installed with `npm install`

## 📝 Note About Icons

The current icons are placeholders. For a production extension, replace the icon files in `public/` with actual PNG images:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)
