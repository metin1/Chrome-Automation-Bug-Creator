# GitHub Issue Creator - Chrome Extension

A powerful Chrome extension that automates GitHub issue creation with network request and console log capture capabilities.

## Features

### Core Functionality
- 🎯 **One-Click Issue Creation**: Create GitHub issues directly from any webpage
- 🌐 **Network Request Capture**: Monitor and include failed/relevant network requests
- 🔍 **Console Log Capture**: Automatically capture errors, warnings, and logs
- ✨ **AI-Powered Titles**: Generate intelligent issue titles using OpenAI GPT-3.5
- 🎨 **Dark/Light Theme**: Beautiful UI with theme support

### Data Capture
- Current page URL and timestamp
- Console errors with stack traces
- Network requests with status codes, timing, and headers
- Browser and environment information
- Viewport size and user agent

### Smart Features
- Filter network requests by status code and type
- Select specific console logs and network requests to include
- Markdown-powered issue descriptions
- Label management with existing repo labels
- Repository selection with recent repos

## Installation

### Development Mode

1. **Clone the repository**
   ```bash
   cd /Users/metin/Documents/github/Chrome-Automation-Bug-Creator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder

5. **Development with auto-reload**
   ```bash
   npm run dev
   ```
   Then reload the extension in Chrome after changes

## Setup

### GitHub Personal Access Token

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens/new)
2. Create a new token with `repo` scope
3. Copy the token
4. Open the extension and go to Settings tab
5. Paste the token and click "Validate Token"
6. Click "Save Settings"

### OpenAI API Key (Optional)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key
4. Open the extension Settings tab
5. Paste the key in the OpenAI field
6. Click "Save Settings"

## Usage

### Basic Workflow

1. **Navigate to a webpage** where you encountered a bug or want to report an issue

2. **Open the extension** using:
   - Click the extension icon
   - Press `Cmd+Shift+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)

3. **Review captured data**:
   - **Console Tab**: Review errors and warnings
   - **Network Tab**: Filter and select relevant network requests

4. **Create issue**:
   - Go to **Main Tab**
   - Select your repository
   - Generate or write a title (AI generation requires OpenAI key)
   - Click "Generate from Captured Data" to auto-populate description
   - Select labels (if available)
   - Click "Create GitHub Issue"

### Keyboard Shortcut

- **Open Extension**: `Cmd+Shift+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)

### Tips

- 🎯 Use "Select All Errors" in Console tab to quickly include all error logs
- 🌐 Filter network requests by status (4xx/5xx) to find failed requests
- 📋 Edit the generated description before creating the issue
- 🏷️ Use labels to categorize issues automatically
- 💡 The extension captures data continuously, so errors that happened before opening the popup are also available

## Project Structure

```
github-issue-creator/
├── public/
│   ├── manifest.json          # Extension manifest
│   └── icons/                 # Extension icons
├── src/
│   ├── background/
│   │   └── background.ts      # Service worker for network monitoring
│   ├── content/
│   │   └── content.ts         # Content script for console capture
│   ├── popup/
│   │   ├── App.tsx            # Main popup component
│   │   ├── index.tsx          # Popup entry point
│   │   ├── styles.css         # Global styles
│   │   └── components/        # React components
│   │       ├── MainTab.tsx
│   │       ├── NetworkTab.tsx
│   │       ├── ConsoleTab.tsx
│   │       └── SettingsTab.tsx
│   ├── options/
│   │   ├── index.html         # Options page HTML
│   │   └── Options.tsx        # Options page component
│   ├── store/
│   │   └── useStore.ts        # Zustand state management
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── utils/
│       ├── github.ts          # GitHub API wrapper
│       ├── openai.ts          # OpenAI API wrapper
│       └── storage.ts         # Chrome storage utilities
├── dist/                      # Built extension (generated)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Technologies

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Build Tool**: Vite
- **APIs**: GitHub REST API v3, OpenAI Chat API

## Security

- ✅ Tokens stored securely using Chrome's storage API
- ✅ No data sent to external servers (except GitHub and OpenAI APIs)
- ✅ Content Security Policy compliant
- ✅ All API calls use HTTPS
- ✅ Token validation before use

## Troubleshooting

### Extension doesn't capture console logs

- **Solution**: Refresh the webpage after installing the extension. The content script needs to be injected.

### Network requests not showing

- **Solution**: Make sure the page has loaded and made network requests. Navigate or refresh the page.

### "Content script not loaded" error

- **Solution**: Refresh the page and try again. Some pages may block content scripts.

### GitHub API rate limit

- **Solution**: Authenticated requests have a limit of 5,000 per hour. Wait or use a different token.

### AI title generation not working

- **Solution**: 
  1. Check that your OpenAI API key is configured
  2. Ensure you have credits on your OpenAI account
  3. Check the browser console for detailed errors

## Future Enhancements (Phase 2 & 3)

- [ ] Screenshot capture
- [ ] Session recording (last 30 seconds)
- [ ] Duplicate issue detection
- [ ] Issue templates
- [ ] Bulk issue creation
- [ ] Team mentions
- [ ] GitHub Projects integration
- [ ] Export data as JSON/HAR
- [ ] LocalStorage/SessionStorage capture
- [ ] WebSocket message capture
- [ ] Redux/Vuex state capture

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

ISC

## Version

1.0.0 - Initial MVP Release

## Support

For issues or questions, create an issue in this repository.

