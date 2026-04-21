#!/usr/bin/env python3
"""
Run this script any time you add/remove files from images/gallery/
  python3 generate-gallery.py
It will rebuild data/gallery.js automatically.
"""

import os, json

GALLERY_DIR = os.path.join(os.path.dirname(__file__), "images", "gallery")
OUTPUT_JS   = os.path.join(os.path.dirname(__file__), "data", "gallery.js")

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
VIDEO_EXTS = {".mp4", ".mov", ".webm", ".ogg"}

items = []
for fname in sorted(os.listdir(GALLERY_DIR)):
    ext = os.path.splitext(fname)[1].lower()
    if ext in IMAGE_EXTS:
        media_type = "image"
    elif ext in VIDEO_EXTS:
        media_type = "video"
    else:
        continue

    # Caption = filename without extension, replacing dashes/underscores with spaces
    caption = os.path.splitext(fname)[0].replace("-", " ").replace("_", " ").title()

    items.append({
        "file":    fname,
        "caption": caption,
        "type":    media_type
    })

js_content = "/* AUTO-GENERATED — run generate-gallery.py to rebuild */\n"
js_content += "window.GALLERY_DATA = " + json.dumps(items, indent=2) + ";\n"

with open(OUTPUT_JS, "w") as f:
    f.write(js_content)

print(f"✓ gallery.js updated — {len(items)} item(s) found:")
for it in items:
    print(f"  [{it['type']:5}] {it['file']}")
