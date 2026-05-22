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

    # Objects sliced from packed tilesets (verified regions) + a rock particle.
    os.makedirs(os.path.join(ROOT, "obj"), exist_ok=True)

    def trim(im: Image.Image) -> Image.Image:
        import numpy as np
        arr = np.array(im)[:, :, 3]
        ys, xs = np.where(arr > 40)
        return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

    nature = raw["TilesetNature"]
    trim(nature.crop((16, 32, 48, 80))).save(os.path.join(ROOT, "obj", "tree.png"))
    trim(nature.crop((16, 160, 48, 192))).save(os.path.join(ROOT, "obj", "bush.png"))
    import numpy as np

    house = raw["TilesetHouse"]
    # A complete small house (peaked roof + windowed walls + door).
    house_img = trim(house.crop((0, 174, 47, 221)))
    house_img.save(os.path.join(ROOT, "obj", "house.png"))

    # Roof palette-swap → distinct buildings (blue + green roofs) so each POI
    # gets its own look. Recolour the red roof pixels, preserving shading.
    def recolour_roof(im: Image.Image, rgb_mul: tuple[float, float, float]) -> Image.Image:
        arr = np.array(im).astype(int)
        r, g, b, al = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
        roof = (al > 60) & (r > g + 25) & (r > b + 25) & (r > 110)
        lum = (0.3 * r + 0.5 * g + 0.2 * b)
        out = arr.copy()
        out[..., 0] = np.where(roof, np.clip(lum * rgb_mul[0], 0, 255), r)
        out[..., 1] = np.where(roof, np.clip(lum * rgb_mul[1], 0, 255), g)
        out[..., 2] = np.where(roof, np.clip(lum * rgb_mul[2], 0, 255), b)
        return Image.fromarray(out.astype("uint8"), "RGBA")

    recolour_roof(house_img, (0.45, 0.65, 1.15)).save(
        os.path.join(ROOT, "obj", "house_blue.png")
    )
    recolour_roof(house_img, (0.45, 0.95, 0.6)).save(
        os.path.join(ROOT, "obj", "house_green.png")
    )

    # WaterMill — a distinct harbour-side building.
    mill = Image.open(
        io.BytesIO(fetch("Backgrounds/Animated/WaterMill/Watermill_A_34x36.png"))
    ).convert("RGBA")
    trim(mill.crop((0, 0, 34, 36))).save(os.path.join(ROOT, "obj", "mill.png"))
    rock = Image.open(io.BytesIO(fetch("FX/Particle/RockGray.png"))).convert("RGBA")
    trim(rock.crop((0, 0, 16, 16))).save(os.path.join(ROOT, "obj", "rock.png"))
    # A harbour boat (first frame).
    boat = Image.open(io.BytesIO(fetch("Backgrounds/Vehicles/Boat.png"))).convert("RGBA")
    trim(boat.crop((0, 0, 40, 32))).save(os.path.join(ROOT, "obj", "boat.png"))
    # A flag on a pole (first frame) — marks the About POI ("The Rocks").
    flag = Image.open(
        io.BytesIO(fetch("Backgrounds/Animated/Flag/FlagRed16x16.png"))
    ).convert("RGBA")
    trim(flag.crop((0, 0, 16, 16))).save(os.path.join(ROOT, "obj", "flag.png"))
    for n in ["tree", "bush", "house", "house_blue", "house_green", "mill", "rock", "boat", "flag"]:
        print(f"obj {n} {Image.open(os.path.join(ROOT, 'obj', n + '.png')).size}")

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
