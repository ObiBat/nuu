#!/usr/bin/env python3
"""Fetch Ninja Adventure (CC0) assets for the Nuu world.

Pack by pixel-boy & AAA (https://pixel-boy.itch.io/ninja-adventure-asset-pack),
released CC0. Pulled from a complete mirror. Downloads the tilesets + chosen
character sheets (Walk/Idle/Faceset) into public/art/ninja/.

Usage: python3 scripts/build_ninja.py
"""
import io
import os
import urllib.request
from PIL import Image

RB = (
    "https://raw.githubusercontent.com/MarioLDD/Kuroshiro-adventure/main/"
    "Assets/NinjaAdventure"
)
ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "art", "ninja")

TILESETS = [
    "TilesetField",
    "TilesetWater",
    "TilesetNature",
    "TilesetHouse",
    "TilesetVillageAbandoned",
    "TilesetElement",
    "TilesetFloor",
    "TilesetFloorDetail",
]

# Human characters used as player/NPC presets.
CHARACTERS = [
    "Boy",
    "Woman",
    "Villager",
    "Villager2",
    "Noble",
    "OldMan",
    "Monk",
    "Hunter",
]


def fetch(rel: str) -> bytes:
    with urllib.request.urlopen(f"{RB}/{rel}") as r:
        return r.read()


def save(data: bytes, *parts: str) -> tuple[int, int]:
    path = os.path.join(ROOT, *parts)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)
    return Image.open(io.BytesIO(data)).size


# Seamless fill tiles: (tileset, col, row) of a 16px fill tile.
FILLS = {
    "grass": ("TilesetField", 1, 7),
    "water": ("TilesetWater", 1, 1),
    "sand": ("TilesetWater", 0, 5),
}


def main() -> int:
    raw: dict[str, Image.Image] = {}
    for name in TILESETS:
        data = fetch(f"Backgrounds/Tilesets/{name}.png")
        size = save(data, "tiles", f"{name}.png")
        raw[name] = Image.open(io.BytesIO(data)).convert("RGBA")
        print(f"tile {name} {size}")

    os.makedirs(os.path.join(ROOT, "fill"), exist_ok=True)
    for out, (src, col, row) in FILLS.items():
        tile = raw[src].crop((col * 16, row * 16, (col + 1) * 16, (row + 1) * 16))
        tile.save(os.path.join(ROOT, "fill", f"{out}.png"))
        print(f"fill {out} from {src} ({col},{row})")

    for ch in CHARACTERS:
        for anim in ["Walk", "Idle"]:
            save(fetch(f"Actor/Characters/{ch}/SeparateAnim/{anim}.png"),
                 "char", ch, f"{anim}.png")
        save(fetch(f"Actor/Characters/{ch}/Faceset.png"), "char", ch, "Faceset.png")
        print(f"char {ch} (walk/idle/face)")

    note = (
        "\n## Ninja Adventure (world redesign)\n\n"
        "Tiles, characters, and facesets from the **Ninja Adventure Asset "
        "Pack** by **pixel-boy & AAA** "
        "(<https://pixel-boy.itch.io/ninja-adventure-asset-pack>), released "
        "**CC0 / public domain**. Fetched by `scripts/build_ninja.py`.\n"
    )
    with open(os.path.join(ROOT, "..", "CREDITS.md"), "a") as f:
        f.write(note)
    print("done")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
