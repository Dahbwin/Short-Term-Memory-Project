#!/usr/bin/env python3
"""Generate favicon.png and favicon.ico from favicon.svg"""

from PIL import Image
import cairosvg
import io

# Paths
svg_path = "public/assets/images/favicon.svg"
png32_path = "public/assets/images/favicon-32.png"
ico_path = "public/assets/images/favicon.ico"

# Read SVG
with open(svg_path, 'rb') as f:
    svg_data = f.read()

# Generate 32x32 PNG with transparency
png32_data = cairosvg.svg2png(bytestring=svg_data, output_width=32, output_height=32)
img32 = Image.open(io.BytesIO(png32_data))
img32.save(png32_path, 'PNG')
print(f"✓ Created {png32_path}")

# Generate 16x16 for ICO
png16_data = cairosvg.svg2png(bytestring=svg_data, output_width=16, output_height=16)
img16 = Image.open(io.BytesIO(png16_data))

# Create ICO with both sizes
img32.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32)], append_images=[img16])
print(f"✓ Created {ico_path} (16x16 + 32x32)")

print("\n✅ All favicons generated successfully!")
