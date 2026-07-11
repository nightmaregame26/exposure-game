from __future__ import annotations

import base64
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets" / "exact" / "home"
OUTPUT_DIR = ROOT / "assets" / "ui" / "components"
MASTER_REFERENCE = (864, 1536)
CROPS = {
    "header": (0, 0, 864, 174),
    "hero": (26, 174, 812, 390),
    "news": (27, 568, 431, 202),
    "clock": (466, 568, 372, 202),
    "stamina": (28, 777, 363, 171),
    "exposure": (398, 777, 440, 171),
    "chapter": (28, 953, 386, 239),
    "tasks": (421, 953, 417, 239),
    "events": (28, 1198, 810, 208),
    "nav": (14, 1425, 837, 105),
}


def load_master() -> Image.Image:
    chunks = sorted(SOURCE_DIR.glob("*.txt"))
    if not chunks:
        raise FileNotFoundError(f"No source chunks found in {SOURCE_DIR}")

    encoded = "".join(path.read_text(encoding="utf-8").strip() for path in chunks)
    raw = base64.b64decode(encoded, validate=True)
    temporary = OUTPUT_DIR / "_master.webp"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    temporary.write_bytes(raw)

    image = Image.open(temporary).convert("RGB")
    image.load()
    temporary.unlink(missing_ok=True)
    return image


def scaled_box(box: tuple[int, int, int, int], size: tuple[int, int]) -> tuple[int, int, int, int]:
    ref_w, ref_h = MASTER_REFERENCE
    actual_w, actual_h = size
    x, y, width, height = box
    left = round(x * actual_w / ref_w)
    top = round(y * actual_h / ref_h)
    right = round((x + width) * actual_w / ref_w)
    bottom = round((y + height) * actual_h / ref_h)
    return left, top, right, bottom


def main() -> None:
    master = load_master()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for name, box in CROPS.items():
        crop = master.crop(scaled_box(box, master.size))
        crop.save(
            OUTPUT_DIR / f"{name}.webp",
            format="WEBP",
            quality=92,
            method=6,
            lossless=False,
        )

    print(f"Generated {len(CROPS)} component assets from {master.size[0]}x{master.size[1]} master artwork.")


if __name__ == "__main__":
    main()
