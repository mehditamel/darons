#!/bin/bash
# Generate PWA icons for Darons app
# Requires ImageMagick (convert) or librsvg (rsvg-convert) for PNG generation

SVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="80" fill="#1B2838"/><text x="256" y="340" text-anchor="middle" font-family="DM Serif Display,Georgia,serif" font-weight="bold" font-size="280" fill="#E8734A">D</text></svg>'

SIZES=(72 96 128 144 152 192 384 512)

# Generate SVG source
echo "$SVG" > icon.svg

# Try to generate PNGs
if command -v rsvg-convert &> /dev/null; then
  for size in "${SIZES[@]}"; do
    rsvg-convert -w "$size" -h "$size" icon.svg -o "icon-${size}x${size}.png"
    echo "Generated icon-${size}x${size}.png"
  done
elif command -v convert &> /dev/null; then
  for size in "${SIZES[@]}"; do
    convert -background none -resize "${size}x${size}" icon.svg "icon-${size}x${size}.png"
    echo "Generated icon-${size}x${size}.png"
  done
else
  echo "No SVG-to-PNG converter found (install librsvg2-bin or imagemagick)."
  echo "SVG icons generated as fallback. Convert to PNG manually or use https://realfavicongenerator.net"
  for size in "${SIZES[@]}"; do
    echo "$SVG" > "icon-${size}x${size}.svg"
  done
fi

echo "Done! Icons generated in $(pwd)"
