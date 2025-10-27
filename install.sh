#!/bin/bash

# GitHub Issue Creator - Quick Installation Script
# This script helps verify the build and provides installation instructions

echo "═══════════════════════════════════════════════════════════════"
echo "  🎉 GitHub Issue Creator - Installation Helper"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found!"
    echo "   Run: npm run build"
    exit 1
fi

# Check essential files
echo "✅ Checking build files..."
files_ok=true

if [ ! -f "dist/manifest.json" ]; then
    echo "   ❌ manifest.json missing"
    files_ok=false
else
    echo "   ✅ manifest.json"
fi

if [ ! -f "dist/popup.html" ]; then
    echo "   ❌ popup.html missing"
    files_ok=false
else
    echo "   ✅ popup.html"
fi

if [ ! -f "dist/options.html" ]; then
    echo "   ❌ options.html missing"
    files_ok=false
else
    echo "   ✅ options.html"
fi

if [ ! -f "dist/background.js" ]; then
    echo "   ❌ background.js missing"
    files_ok=false
else
    echo "   ✅ background.js"
fi

if [ ! -f "dist/content.js" ]; then
    echo "   ❌ content.js missing"
    files_ok=false
else
    echo "   ✅ content.js"
fi

if [ ! -d "dist/assets" ]; then
    echo "   ❌ assets folder missing"
    files_ok=false
else
    echo "   ✅ assets/ ($(ls -1 dist/assets | wc -l | xargs) files)"
fi

echo ""

if [ "$files_ok" = false ]; then
    echo "❌ Build incomplete. Run: npm run build"
    exit 1
fi

echo "═══════════════════════════════════════════════════════════════"
echo "  📦 INSTALLATION INSTRUCTIONS"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Open Chrome and navigate to:"
echo "   chrome://extensions/"
echo ""
echo "2. Enable 'Developer mode' (toggle in top-right)"
echo ""
echo "3. Click 'Load unpacked' button"
echo ""
echo "4. Select this folder:"
echo "   $(pwd)/dist"
echo ""
echo "5. Configure GitHub Token:"
echo "   - Click extension icon → Settings tab"
echo "   - Get token: https://github.com/settings/tokens/new"
echo "   - Scope: 'repo'"
echo "   - Paste token → Validate → Save"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🚀 USAGE"
echo "════════════════════════════════════════════════════════════���══"
echo ""
echo "Keyboard Shortcut: Cmd+Shift+I (Mac) or Ctrl+Shift+I (Windows)"
echo ""
echo "Or click the extension icon in Chrome toolbar"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  📚 DOCUMENTATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "• QUICK_START.md     - 5-minute setup guide"
echo "• SETUP.md           - Detailed installation & troubleshooting"
echo "• README.md          - Complete feature documentation"
echo "• BUILD_COMPLETE.md  - Implementation summary"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✨ Ready to install!"
echo "═══════════════════════════════════════════════════════════════"
echo ""

