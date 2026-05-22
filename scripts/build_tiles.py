#!/usr/bin/env python3
"""Extract ground tiles for the Nuu world from the LPC outdoor tileset.

Source: OpenGameArt/LiberatedPixelCup, Sharm (Lanea Zimmerman) outdoor tiles
(CC-BY-SA 3.0 / GPL 3.0). 32px tiles in 3x6 autotile blocks; we pull the
seamless fill tiles + one textured grass tile for sparse detail.

Usage: python3 scripts/build_tiles.py
"""
import io
import os
import urllib.request
from PIL import Image

RAW = (
    "https://raw.githubusercontent.com/OpenGameArt/LiberatedPixelCup/master/"
    "tileset/original/Sharm/outdoor/PNG"
)
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "art", "tiles")
T = 32

# (source file, col, row) of the 32px sub-tile to extract.
TILES = {
    "grass": ("grass", 1, 3),        # seamless flat grass fill
    "grass_detail": ("grassalt", 1, 1),  # textured grass (sparse scatter)
    "dirt": ("dirt", 2, 5),          # path fill
    "water": ("water", 1, 3),        # pond fill
}


def fetch(name: str) -> Image.Image:
    url = f"{RAW}/{name}.png"
    with urllib.request.urlopen(url) as r:
        return Image.open(io.BytesIO(r.read())).convert("RGBA")


def main() -> int:
    os.makedirs(OUT, exist_ok=True)
    cache: dict[str, Image.Image] = {}
    for out_name, (src, col, row) in TILES.items():
        if src not in cache:
            cache[src] = fetch(src)
        tile = cache[src].crop((col * T, row * T, (col + 1) * T, (row + 1) * T))
        tile.save(os.path.join(OUT, f"{out_name}.png"))
        print(f"built {out_name}.png from {src} ({col},{row})")

    cred = os.path.join(OUT, "..", "CREDITS.md")
    note = (
        "\n## Ground tiles\n\n"
        "Outdoor terrain tiles from the **Liberated Pixel Cup base assets** "
        "(<https://github.com/OpenGameArt/LiberatedPixelCup>), by **Lanea "
        "Zimmerman (Sharm)**, licensed **CC-BY-SA 3.0 / GPL 3.0**. "
        "Extracted by `scripts/build_tiles.py`.\n"
    )
    with open(cred, "a") as f:
        f.write(note)
    print("appended tile credits")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
