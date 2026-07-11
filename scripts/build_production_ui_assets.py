from __future__ import annotations

import base64
import io
import re
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "ui" / "production"
OUTPUT.mkdir(parents=True, exist_ok=True)

HOME_REFERENCE = (864, 1536)
HOME_CROPS = {
    "home-header": (0, 0, 864, 174),
    "home-hero": (26, 174, 812, 390),
    "home-news": (27, 568, 431, 202),
    "home-clock": (466, 568, 372, 202),
    "home-stamina": (28, 777, 363, 171),
    "home-exposure": (398, 777, 440, 171),
    "home-chapter": (28, 953, 386, 239),
    "home-tasks": (421, 953, 417, 239),
    "home-events": (28, 1198, 810, 208),
    "home-nav": (14, 1425, 837, 105),
}

DATA_URI = re.compile(
    r"data:image/(?:jpeg|jpg|png|webp);base64,([^\"']+)",
    re.IGNORECASE,
)


def decode_chunk_directory(name: str) -> Image.Image | None:
    directory = ROOT / "assets" / "exact" / name
    chunks = sorted(directory.glob("*.txt"))
    if not chunks:
        return None

    encoded = "".join(path.read_text(encoding="utf-8").strip() for path in chunks)
    try:
        raw = base64.b64decode(encoded, validate=True)
        image = Image.open(io.BytesIO(raw)).convert("RGB")
        image.load()
        return image
    except Exception as exc:  # noqa: BLE001
        print(f"Could not decode assets/exact/{name}: {exc}")
        return None


def decode_svg_slices(name: str) -> Image.Image:
    images: list[Image.Image] = []
    for index in range(4):
        path = ROOT / "assets" / "mockups" / f"{name}-{index}.svg"
        text = path.read_text(encoding="utf-8")
        match = DATA_URI.search(text)
        if not match:
            raise RuntimeError(f"No embedded image found in {path}")
        raw = base64.b64decode(re.sub(r"\s+", "", match.group(1)))
        image = Image.open(io.BytesIO(raw)).convert("RGB")
        image.load()
        images.append(image)

    width = max(image.width for image in images)
    normalized = [
        ImageOps.fit(image, (width, image.height), method=Image.Resampling.LANCZOS)
        for image in images
    ]
    total_height = sum(image.height for image in normalized)
    master = Image.new("RGB", (width, total_height), "#020405")
    y = 0
    for image in normalized:
        master.paste(image, (0, y))
        y += image.height
    return master


def load_master(name: str, alternatives: tuple[str, ...] = ()) -> Image.Image:
    for candidate in (name, *alternatives):
        image = decode_chunk_directory(candidate)
        if image is not None:
            print(f"Loaded high-resolution {name} master from assets/exact/{candidate}")
            return image

    print(f"Falling back to embedded mockup slices for {name}")
    return decode_svg_slices(name)


def scaled_box(
    box: tuple[int, int, int, int],
    reference: tuple[int, int],
    actual: tuple[int, int],
) -> tuple[int, int, int, int]:
    x, y, width, height = box
    ref_width, ref_height = reference
    actual_width, actual_height = actual
    left = round(x * actual_width / ref_width)
    top = round(y * actual_height / ref_height)
    right = round((x + width) * actual_width / ref_width)
    bottom = round((y + height) * actual_height / ref_height)
    return left, top, right, bottom


def save_webp(image: Image.Image, name: str, quality: int = 94) -> None:
    path = OUTPUT / f"{name}.webp"
    image.save(path, "WEBP", quality=quality, method=6)
    print(f"Wrote {path.relative_to(ROOT)} ({image.width}x{image.height})")


def build_home_assets() -> None:
    master = load_master("home")
    save_webp(master, "home-full")
    for name, crop in HOME_CROPS.items():
        panel = master.crop(scaled_box(crop, HOME_REFERENCE, master.size))
        save_webp(panel, name)


def build_full_screen_asset(name: str, alternatives: tuple[str, ...] = ()) -> None:
    master = load_master(name, alternatives)
    save_webp(master, f"{name}-full")


def main() -> None:
    build_home_assets()
    build_full_screen_asset("map")
    build_full_screen_asset("scene", ("emily", "cafe"))


if __name__ == "__main__":
    main()
