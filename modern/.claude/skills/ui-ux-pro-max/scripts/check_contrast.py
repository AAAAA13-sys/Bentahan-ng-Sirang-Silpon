#!/usr/bin/env python3
"""
WCAG Contrast Ratio Calculator (UI/UX Pro Max)
Calculates WCAG 2.1 relative luminance and contrast ratio between foreground and background colors.
Checks compliance against WCAG AA and AAA standards for normal and large text.
"""

import sys
import re
import argparse

def hex_to_rgb(hex_str):
    hex_clean = hex_str.strip().lstrip("#")
    if len(hex_clean) == 3:
        hex_clean = "".join([c*2 for c in hex_clean])
    if len(hex_clean) != 6:
        raise ValueError(f"Invalid hex color code: {hex_str}")
    return tuple(int(hex_clean[i:i+2], 16) for i in (0, 2, 4))

def srgb_channel_to_linear(c):
    c_norm = c / 255.0
    if c_norm <= 0.03928:
        return c_norm / 12.92
    else:
        return ((c_norm + 0.055) / 1.055) ** 2.4

def relative_luminance(rgb):
    r, g, b = [srgb_channel_to_linear(c) for c in rgb]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast_ratio(hex1, hex2):
    rgb1 = hex_to_rgb(hex1)
    rgb2 = hex_to_rgb(hex2)
    l1 = relative_luminance(rgb1)
    l2 = relative_luminance(rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def main():
    parser = argparse.ArgumentParser(description="Calculate WCAG Contrast Ratio between two hex colors")
    parser.add_argument("color1", help="First color hex (e.g. '#09090b' or '09090b')")
    parser.add_argument("color2", help="Second color hex (e.g. '#fafafa' or 'fafafa')")
    args = parser.parse_args()

    try:
        ratio = contrast_ratio(args.color1, args.color2)
    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)

    print("=" * 65)
    print("           WCAG 2.1 COLOR CONTRAST RATIO AUDITOR")
    print("=" * 65)
    print(f"Color 1:        {args.color1}")
    print(f"Color 2:        {args.color2}")
    print(f"Contrast Ratio: {ratio:.2f}:1")
    print("-" * 65)

    aa_normal = ratio >= 4.5
    aa_large = ratio >= 3.0
    aaa_normal = ratio >= 7.0
    aaa_large = ratio >= 4.5

    def badge(passed):
        return "[PASS]" if passed else "[FAIL]"

    print(f"{badge(aa_normal):<8} WCAG AA Normal Text (Requires 4.5:1)")
    print(f"{badge(aa_large):<8} WCAG AA Large Text / UI Components (Requires 3.0:1)")
    print(f"{badge(aaa_normal):<8} WCAG AAA Normal Text (Requires 7.0:1)")
    print(f"{badge(aaa_large):<8} WCAG AAA Large Text (Requires 4.5:1)")
    print("=" * 65)

    sys.exit(0 if aa_normal else 1)

if __name__ == "__main__":
    main()
