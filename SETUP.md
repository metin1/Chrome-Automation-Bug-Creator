# 🚀 GitHub Issue Creator - Installation & Setup Guide

## ✅ Build Complete!

Your Chrome extension has been successfully built and is ready to install.

## 📦 Installation Steps

### 1. Open Chrome Extensions Page

- Open Google Chrome
- Navigate to: `chrome://extensions/`
- Or click: Menu (⋮) → Extensions → Manage Extensions

### 2. Enable Developer Mode

- Toggle "Developer mode" switch in the top-right corner

### 3. Load the Extension

- Click "Load unpacked" button
- Navigate to: `/Users/metin/Documents/github/Chrome-Automation-Bug-Creator/dist`
- Click "Select" to load the extension

### 4. Verify Installation

You should see:
- ✅ GitHub Issue Creator extension card
- ✅ Version 1.0.0
- ✅ Extension icon in your Chrome toolbar

## ⚙️ Initial Configuration

### Step 1: Create GitHub Personal Access Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens/new)
2. Click "Generate new token (classic)"
3. Give it a name: "GitHub Issue Creator Extension"
4. Select scopes: **`repo`** (Full control of private repositories)
5. Click "Generate token"
6. **⚠️ Copy the token immediately** (you won't see it again!)

### Step 2: Configure the Extension

1. Click the extension icon in Chrome toolbar
2. Go to **Settings** tab
3. Paste your GitHub token
4. Click "Validate Token"
5. Click "Save Settings"

### Step 3: (Optional) Add OpenAI API Key

For AI-powered title generation:

1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. In Settings tab, paste the key in "OpenAI API Key" field
3. Click "Save Settings"

## 🎯 Quick Start Usage

### Testing the Extension

1. **Open any webpage** (try: https://github.com)
2. **Press** `Cmd+Shift+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)
   - Or click the extension icon
3. The popup should open showing 4 tabs:
   - **Create Issue** - Main form
   - **Network** - Captured network requests
   - **Console** - Captured console logs
   - **Settings** - Configuration

### Create Your First Issue

1. Go to a GitHub repository page
2. Open browser console (F12) and type: `console.error("Test error")`
3. Open the extension (`Cmd+Shift+I`)
4. Go to **Console** tab → click "Select All Errors"
5. Go to **Main** tab
6. Select your repository
7. Enter a title or click "Generate with AI"
8. Click "Generate from Captured Data"
9. Review the generated description
10. Click "Create GitHub Issue"

## 🔧 Development Mode

### Watch Mode (Auto-rebuild on changes)

```bash
cd /Users/metin/Documents/github/Chrome-Automation-Bug-Creator
npm run dev
```

After making changes:
1. Save your files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### Manual Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

## 🐛 Troubleshooting

### Extension doesn't appear after loading

- **Solution**: Make sure you selected the `/dist` folder, not the project root
- Verify `manifest.json` exists in the loaded folder

### "Content script not loaded" error

- **Solution**: Refresh the webpage after installing the extension
- Some websites may block content scripts (security policy)

### Network requests not showing

- **Solution**: 
  - Refresh the page to start capturing
  - Make sure the page has made network requests
  - Check browser console for errors

### Console logs are empty

- **Solution**:
  - The extension only captures logs after it's installed
  - Refresh the page and trigger some errors
  - Check if the content script is loaded (look for the log in console)

### GitHub API errors

- **Common issues**:
  - Invalid token: Regenerate and update in Settings
  - Insufficient permissions: Token needs `repo` scope
  - Rate limit: Wait an hour or use a different token

### AI title generation fails

- **Check**:
  - OpenAI API key is configured
  - You have credits on your OpenAI account
  - Check browser console for detailed errors

## 📁 Project Structure

```
dist/                           ← Load this folder in Chrome
├── manifest.json              ← Extension configuration
├── popup.html                 ← Main popup UI
├── options.html               ← Settings page
├── background.js              ← Network monitoring
├── content.js                 ← Console capture
├── assets/                    ← React app bundles
│   ├── popup-[hash].js
│   ├── options-[hash].js
│   ├── styles-[hash].js
│   └── styles-[hash].css
└── icons/                     ← Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🎨 Customizing Icons

Replace placeholder icons:

1. Create or download PNG icons:
   - 16x16 pixels (toolbar)
   - 48x48 pixels (extension management)
   - 128x128 pixels (Chrome Web Store)

2. Replace files in `public/icons/`:
   - icon16.png
   - icon48.png
   - icon128.png

3. Rebuild:
   ```bash
   npm run build
   ```

4. Reload extension in Chrome

## 🚀 Next Steps

### Phase 2 Features (Coming Soon)
- [ ] Screenshot capture
- [ ] Duplicate issue detection
- [ ] Issue templates
- [ ] Export as HAR/JSON

### Contribute
- Report bugs via GitHub Issues
- Suggest features
- Submit pull requests

## 📝 Useful Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development mode (watch)
npm run dev

# Type checking
npm run type-check

# Check TypeScript errors
npx tsc --noEmit
```

## 🔗 Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [React Documentation](https://react.dev/)

## ✨ Success Checklist

- [ ] Extension loads without errors
- [ ] GitHub token validates successfully
- [ ] Can see captured console logs
- [ ] Can see captured network requests
- [ ] Can select repository from dropdown
- [ ] Can create GitHub issue successfully
- [ ] Issue appears in GitHub repository

## 🎉 You're All Set!

Your GitHub Issue Creator extension is ready to use. Start capturing bugs and creating issues with ease!

For questions or issues, check the main README.md or create a GitHub issue.

---

**Version**: 1.0.0  
**Last Updated**: October 27, 2025

