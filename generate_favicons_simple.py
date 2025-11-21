#!/usr/bin/env python3
"""Generate favicon PNG files from SVG using cairosvg only"""

import cairosvg

# Paths
svg_path = "public/assets/images/favicon.svg"
png32_path = "public/assets/images/favicon-32.png"
png16_path = "public/assets/images/favicon-16.png"

# Read SVG
with open(svg_path, 'rb') as f:
    svg_data = f.read()

# Generate 32x32 PNG
cairosvg.svg2png(bytestring=svg_data, write_to=png32_path, output_width=32, output_height=32)
print(f"✓ Created {png32_path}")

# Generate 16x16 PNG  
cairosvg.svg2png(bytestring=svg_data, write_to=png16_path, output_width=16, output_height=16)
print(f"✓ Created {png16_path}")

print("\n✅ PNG favicons generated!")
print("Note: For .ico file, you can use an online converter or image editor to combine the two PNGs.")
