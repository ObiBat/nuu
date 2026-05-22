#!/usr/bin/env python3
"""Extract world objects (trees, rocks, bushes, buildings, signs) from the LPC
outdoor/building tilesets.

Source: OpenGameArt/LiberatedPixelCup, Sharm (Lanea Zimmerman), CC-BY-SA 3.0 /
GPL 3.0. Some objects (trees) are composited from canopy + trunk tiles.

Usage: python3 scripts/build_objects.py
"""
import io
import os
import urllib.request
import numpy as np
from PIL import Image

RB = (
    "https://raw.githubusercontent.com/OpenGameArt/LiberatedPixelCup/master/"
    "tileset/original/Sharm"
)
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "art", "objects")


def fetch(rel: str) -> Image.Image:
    with urllib.request.urlopen(f"{RB}/{rel}") as r:
        return Image.open(io.BytesIO(r.read())).convert("RGBA")


def trim(im: Image.Image) -> Image.Image:
    a = np.array(im)[:, :, 3]
    ys, xs = np.where(a > 40)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def main() -> int:
    os.makedirs(OUT, exist_ok=True)

    # Tree = canopy (treetop cols0-2 rows0-3) over trunk (cols0-2).
    tt = fetch("outdoor/PNG/treetop.png")
    tr = fetch("outdoor/PNG/trunk.png")
    tree = Image.new("RGBA", (96, 190), (0, 0, 0, 0))
    tree.alpha_composite(tr.crop((0, 0, 96, 96)), (0, 92))
    tree.alpha_composite(tt.crop((0, 0, 96, 128)), (0, 0))
    trim(tree).save(os.path.join(OUT, "tree.png"))

    # Bush = a small dense canopy clump.
    trim(tt.crop((0, 32, 64, 96))).save(os.path.join(OUT, "bush.png"))

    # Rock = one rock from the 2-rock strip.
    rock = fetch("outdoor/PNG/rock.png")
    trim(rock.crop((0, 0, 32, 32))).save(os.path.join(OUT, "rock.png"))

    # House = the main building (cols0-6).
    house = fetch("building-exterior/house.png")
    trim(house.crop((0, 0, 224, 224))).save(os.path.join(OUT, "house.png"))

    # Sign = one signpost.
    signs = fetch("object/signs.png")
    trim(signs.crop((0, 0, 32, 64))).save(os.path.join(OUT, "sign.png"))

    for n in ["tree", "bush", "rock", "house", "sign"]:
        print(n, Image.open(os.path.join(OUT, f"{n}.png")).size)

    note = (
        "\n## World objects\n\n"
        "Trees, bushes, rocks, the house, and signs are from the **LPC base "
        "assets** (Sharm / Lanea Zimmerman), **CC-BY-SA 3.0 / GPL 3.0**, "
        "extracted/composited by `scripts/build_objects.py`.\n"
    )
    with open(os.path.join(OUT, "..", "CREDITS.md"), "a") as f:
        f.write(note)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
