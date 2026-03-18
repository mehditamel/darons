#!/bin/bash
# Placeholder SVG icon for PWA (replace with actual logo)
SVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="80" fill="#1B2838"/><text x="256" y="300" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="200" fill="#E8734A">MP</text></svg>'

for size in 72 96 128 144 152 192 384 512; do
  echo "$SVG" > "icon-${size}x${size}.svg"
done
echo "SVG icons generated. Convert to PNG with ImageMagick or an online tool."
