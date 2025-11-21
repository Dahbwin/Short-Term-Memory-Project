#!/usr/bin/env python3
"""
Simple favicon generator - creates minimal valid PNG and ICO files
representing the brain circuit icon with basic shapes.
"""

import struct
import zlib

def create_png_32():
    """Create a minimal 32x32 PNG with transparency"""
    width, height = 32, 32
    
    # Create RGBA pixel data (all transparent except for colored pixels)
    pixels = bytearray()
    for y in range(height):
        pixels.append(0)  # Filter type: None
        for x in range(width):
            # Create simple geometric representation
            # Purple circle outline and cyan dots
            dx, dy = x - 16, y - 16
            dist = (dx*dx + dy*dy) ** 0.5
            
            # Purple outline at radius ~14
            if 12 < dist < 15:
                pixels.extend([0xA8, 0x55, 0xF7, 0xFF])  # Purple
            # Cyan dots at specific positions (simplified)
            elif (x == 10 and y == 8) or (x == 16 and y == 6) or \
                 (x == 22 and y == 12) or (x == 18 and y == 22):
                pixels.extend([0x22, 0xD3, 0xEE, 0xFF])  # Cyan
            else:
                pixels.extend([0x00, 0x00, 0x00, 0x00])  # Transparent
    
    # PNG signature
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR chunk
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(struct.pack('>I', len(ihdr)))
    png.extend(b'IHDR')
    png.extend(ihdr)
    png.extend(struct.pack('>I', zlib.crc32(b'IHDR' + ihdr)))
    
    # IDAT chunk
    compressed = zlib.compress(bytes(pixels), 9)
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', zlib.crc32(b'IDAT' + compressed)))
    
    # IEND chunk
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', zlib.crc32(b'IEND')))
    
    return bytes(png)

# Generate PNG
png_data = create_png_32()
with open("public/assets/images/favicon-32.png", "wb") as f:
    f.write(png_data)
print("✓ Created public/assets/images/favicon-32.png (32x32)")

# Create ICO file with the PNG embedded
ico = bytearray()
ico.extend(b'\x00\x00\x01\x00\x01\x00')  # ICO header
ico.extend(b'\x20\x20\x00\x00\x01\x00\x20\x00')  # 32x32, 32bpp
ico.extend(struct.pack('<I', len(png_data)))  # PNG size
ico.extend(struct.pack('<I', 22))  # Offset
ico.extend(png_data)

with open("public/assets/images/favicon.ico", "wb") as f:
    f.write(ico)
print("✓ Created public/assets/images/favicon.ico (32x32)")

print("\n✅ Favicons generated successfully!")
