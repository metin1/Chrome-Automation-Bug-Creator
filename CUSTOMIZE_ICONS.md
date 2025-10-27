# How to Customize Icons

The extension currently uses simple blue square icons with a "G" letter. You can easily customize them!

## Option 1: Auto-Generated Icons (Current)

The icons are automatically generated during build using `scripts/generate-icons.cjs`.

To change the color or text:
1. Edit `scripts/generate-icons.cjs`
2. Change the color (line with `#4F46E5`) to any hex color
3. Run `npm run generate-icons` or `npm run build`

## Option 2: Design Custom Icons

### Using Online Tools:
1. Go to https://www.canva.com or https://www.figma.com
2. Create designs for:
   - 16x16 pixels (toolbar icon)
   - 48x48 pixels (extension management)
   - 128x128 pixels (Chrome Web Store)
3. Export as PNG
4. Save to `public/icons/` as:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`
5. Run `npm run build`

### Using ImageMagick (if installed):
```bash
# Create a simple icon with text
convert -size 16x16 xc:#4F46E5 -gravity center -pointsize 10 -fill white -annotate +0+0 "GH" public/icons/icon16.png
convert -size 48x48 xc:#4F46E5 -gravity center -pointsize 30 -fill white -annotate +0+0 "GH" public/icons/icon48.png
convert -size 128x128 xc:#4F46E5 -gravity center -pointsize 80 -fill white -annotate +0+0 "GH" public/icons/icon128.png
```

## Option 3: Use SVG (Recommended for Quality)

1. Create an SVG icon
2. Use an online converter to convert to PNG at the required sizes:
   - https://cloudconvert.com/svg-to-png
   - Or use Inkscape/GIMP

## Icon Design Tips

- **Keep it simple**: Icons should be recognizable at small sizes
- **High contrast**: Make sure the icon stands out in the toolbar
- **Consistent style**: All three sizes should look similar
- **Brand colors**: Use your preferred color scheme
- **GitHub theme**: Consider using GitHub's octoc at or similar

## Rebuild After Changes

Always rebuild after changing icons:
```bash
npm run build
```

Then reload the extension in Chrome:
1. Go to `chrome://extensions/`
2. Click the refresh icon on your extension card

---

**Current Icons**: Simple blue squares with "G" letter
**Location**: `public/icons/icon{16,48,128}.png`
**Generator**: `scripts/generate-icons.cjs`

