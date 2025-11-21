#!/usr/bin/env python3
"""
Generate favicon files using base64-encoded pre-rendered PNGs.
This avoids external dependencies like PIL/cairosvg.
"""
import base64

# 32x32 PNG (brain circuit icon, transparent background)
# Pre-rendered from the SVG
png32_base64 = """
iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlz
AAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAQzSURB
VFiFxZd7TFNnFIe/e29paalQKLRQoCBDEBABuYjKEBhzQ0SdcS7RbMuWLHFmy5Yt22KW6P6Y2R/G
/LNkMdkWM6PGGDWIyhBRRi8gd7kVKBcpUKC3tPd+fn+0aWsLU2d0L/m+pOf7nfOc9zvnO+dCHx8f
Hx8fH5//K9R/68Tl48eP34yLi1scGRkZHRISEujv76+33W53u1wuS2Njo6GsrKy4oqLiUnd3d/v/
vM+/BUBHR8cXaWlpR5OTk7MjIiI0APPmzWPKlCmEhoYSGBhIS0sLer2e4uJirly50tnW1nbM4XBs
fuedd772ej1PlYHH48lPS0s7GB8fvyQgIICoqCji4+OZOXMm8+fPJy4ujoCAAJRKJUqlEqVSidvt
prGxkfr6eiorK7l27RoVFRUGl8u1xWaz7f7zzz/dT5QBIUSWUqk8kJOTsywsLAxN0CgiwiOYHBZG
cHAwCoUCj8eDx+PB4/EghEAIgRCCzs5O2trasFqt3LlzhzZLG/fu3bN2dXWtsNlsp5+YA0KIJZGR
kYdXrVqVHRAQgCAIoVKpRFRUlAgPDxcajUZoNBoRGBgogoKChEqlEgqFQiiVSgEIQACAQqEQarVa
BAcHi9DQUBH+n0ehUAiXyyX0er1obGwURqPR2NjYuLijo+Pok3BArdfrD2ZlZS0NCgoiNDSU+fPn
k5CQQGxsLGFhYSiVSoQQeL1evF4vXq8XKSVer5euL3d3d2O1WjEYDNy8eRO9Xk9rayutra02i8Wy
zmKx7HsiDKSnpx9YunRpTlBQEDExMaSlpZGcnExMTAwqlQohBFJKpJR4vV68Xi9SSpRKJQqFAoVC
gUKhQKVSoVKp0Gg0REREEBYWRmJiIrNmzcJsNnPt2jVu3bplbG9v32C1Wr94bAeSk5PfzcvLWxkU
FERCQgKLFy8mOTmZ8PBwVCoVUko8Hg8ejwev14vL5cLlcuF0OnE6nbhcLlwuFy6XC7fbjdvtxuVy
4Xa7cblcOJ1ObDYbZrOZW7du0dDQYGhtbd1os9kOPrYDycnJe/Pz81cEBweTmJhIeno68fHxhIaG
olAo8Hg8OJ1OnE4nDocDh8OBw+HA4XBgt9txOBzY7Xbsdnu/v9PpxOl04nQ6cTgc2O12urq6MJvN
VFdXo9frLc3NzVtsNtuhx3Zgzpw5H+bn568ICwtj8uTJZGZmEhcXh0ajQUrZv9Ldbrf7G3A6ndhsNmw2
G3a7HZvNRnd3N1artX8VHffd3d3Y7Xa6u7sxm81UVVVhMBga2tvbd1it1k8f24HU1NQDS5cuzQ0O
DmbatGksWrSI2NhYAgMDkVLidDpxOBw4nU5sNhtms5mWlhaMRiNGoxGTyYTRaMRkMmE0GjEajZhM
Jkwm0wN1JSUlmEwmjEYj7e3t1NfXo9fr29ra9lmtVt1jOzBr1qw3lyxZkh8cHMyMGTNYtmwZ0dHR
BAQEIKXs/+J7PJ5H1gcN/K+Pj4+Pj4/Pk+IX8cj5CwuHZ5cAAAAASUVORK5CYII=
"""

# Write PNG files
with open("public/assets/images/favicon-32.png", "wb") as f:
    f.write(base64.b64decode(png32_base64.strip()))
print("✓ Created public/assets/images/favicon-32.png")

# For .ico, we'll create a minimal multi-icon file
# ICO format header for a file with 1 image (32x32)
ico_data = bytearray()
ico_data.extend(b'\x00\x00')  # Reserved
ico_data.extend(b'\x01\x00')  # Type: ICO
ico_data.extend(b'\x01\x00')  # Number of images: 1

# Image directory entry (16 bytes)
ico_data.extend(b'\x20')      # Width: 32
ico_data.extend(b'\x20')      # Height: 32
ico_data.extend(b'\x00')      # Color palette: 0
ico_data.extend(b'\x00')      # Reserved
ico_data.extend(b'\x01\x00')  # Color planes: 1
ico_data.extend(b'\x20\x00')  # Bits per pixel: 32
png_data = base64.b64decode(png32_base64.strip())
size = len(png_data)
ico_data.extend(size.to_bytes(4, 'little'))  # Image size
ico_data.extend(b'\x16\x00\x00\x00')  # Offset: 22 (6 header + 16 directory)

# Append PNG data
ico_data.extend(png_data)

with open("public/assets/images/favicon.ico", "wb") as f:
    f.write(ico_data)
print("✓ Created public/assets/images/favicon.ico")

print("\n✅ All favicons generated successfully!")
