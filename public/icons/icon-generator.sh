#!/bin/bash
# Simple icon generator using ImageMagick (if available)
# Otherwise, provides instructions
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Creating placeholder files..."
    # Create empty files as placeholders
    touch public/icons/icon16.png
    touch public/icons/icon48.png
    touch public/icons/icon128.png
    echo "Placeholder icon files created. Please replace with actual icons."
    echo "You can design icons at: https://www.canva.com/ or https://www.figma.com/"
else
    # Generate simple colored squares as icons
    convert -size 16x16 xc:#4F46E5 -gravity center -pointsize 10 -fill white -annotate +0+0 "GH" public/icons/icon16.png
    convert -size 48x48 xc:#4F46E5 -gravity center -pointsize 30 -fill white -annotate +0+0 "GH" public/icons/icon48.png
    convert -size 128x128 xc:#4F46E5 -gravity center -pointsize 80 -fill white -annotate +0+0 "GH" public/icons/icon128.png
    echo "Icon files generated successfully!"
fi
