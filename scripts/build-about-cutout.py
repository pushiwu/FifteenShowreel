from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "about-profile.webp"
TARGET = ROOT / "public" / "about-profile-cutout.webp"
MASK_WIDTH = 350


def largest_center_component(candidate: np.ndarray) -> np.ndarray:
    height, width = candidate.shape
    visited = np.zeros_like(candidate, dtype=bool)
    best_pixels: list[tuple[int, int]] = []
    best_score = 0.0

    for start_y in range(height):
        for start_x in range(width):
            if not candidate[start_y, start_x] or visited[start_y, start_x]:
                continue

            queue = deque([(start_x, start_y)])
            visited[start_y, start_x] = True
            pixels: list[tuple[int, int]] = []
            center_hits = 0

            while queue:
                x, y = queue.popleft()
                pixels.append((x, y))
                if width * 0.38 <= x <= width * 0.62:
                    center_hits += 1

                for next_y in range(max(0, y - 1), min(height, y + 2)):
                    for next_x in range(max(0, x - 1), min(width, x + 2)):
                        if candidate[next_y, next_x] and not visited[next_y, next_x]:
                            visited[next_y, next_x] = True
                            queue.append((next_x, next_y))

            score = len(pixels) + center_hits * 2.5
            if score > best_score:
                best_score = score
                best_pixels = pixels

    result = np.zeros_like(candidate, dtype=np.uint8)
    for x, y in best_pixels:
        result[y, x] = 255
    return result


def main() -> None:
    image = Image.open(SOURCE).convert("RGB")
    mask_height = round(image.height * MASK_WIDTH / image.width)
    small = image.resize((MASK_WIDTH, mask_height), Image.Resampling.LANCZOS)
    pixels = np.asarray(small, dtype=np.float32) / 255.0

    maximum = pixels.max(axis=2)
    minimum = pixels.min(axis=2)
    saturation = (maximum - minimum) / np.maximum(maximum, 0.001)
    luminance = pixels[..., 0] * 0.2126 + pixels[..., 1] * 0.7152 + pixels[..., 2] * 0.0722
    blue_bias = pixels[..., 2] - (pixels[..., 0] + pixels[..., 1]) * 0.5

    yy, xx = np.mgrid[0:mask_height, 0:MASK_WIDTH]
    central_prior = (
        (xx > MASK_WIDTH * 0.23)
        & (xx < MASK_WIDTH * 0.77)
        & (yy > mask_height * 0.03)
        & (yy < mask_height * 0.97)
    )
    candidate = (
        central_prior
        & (saturation < 0.3)
        & (luminance > 0.025)
        & (luminance < 0.9)
        & (blue_bias < 0.12)
    )

    component = largest_center_component(candidate)
    core = Image.fromarray(component, mode="L")
    core = core.filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.MinFilter(7))
    core = core.filter(ImageFilter.GaussianBlur(3.5))
    outer = core.filter(ImageFilter.GaussianBlur(18))

    alpha = np.maximum(
        np.asarray(core, dtype=np.float32),
        np.asarray(outer, dtype=np.float32) * 0.48,
    )
    normalized_y = np.linspace(0.0, 1.0, mask_height)
    normalized_x = np.linspace(0.0, 1.0, MASK_WIDTH)
    half_width = np.interp(
        normalized_y,
        [0.0, 0.06, 0.18, 0.42, 0.62, 0.84, 0.97, 1.0],
        [0.04, 0.12, 0.16, 0.21, 0.2, 0.15, 0.12, 0.04],
    )
    distance = np.abs(normalized_x[None, :] - 0.5)
    feather = 0.055
    body_envelope = np.clip((half_width[:, None] + feather - distance) / feather, 0.0, 1.0)
    body_envelope = body_envelope * body_envelope * (3.0 - 2.0 * body_envelope)
    alpha *= body_envelope

    # The source contains a broad low-saturation shape behind the head. Keep the
    # hair silhouette, but reject that connected background before the envelope
    # opens out toward the shoulders.
    head_half_width = np.interp(
        normalized_y,
        [0.0, 0.06, 0.075, 0.09, 0.12, 0.16, 0.22, 1.0],
        [0.015, 0.035, 0.06, 0.078, 0.105, 0.13, 0.18, 0.18],
    )
    head_feather = np.interp(
        normalized_y,
        [0.0, 0.06, 0.09, 0.12, 0.16, 0.22, 1.0],
        [0.006, 0.008, 0.016, 0.022, 0.03, 0.045, 0.045],
    )
    head_envelope = np.clip(
        (head_half_width[:, None] + head_feather[:, None] - distance)
        / head_feather[:, None],
        0.0,
        1.0,
    )
    head_envelope = head_envelope * head_envelope * (3.0 - 2.0 * head_envelope)
    head_guard = np.ones_like(alpha, dtype=np.float32)
    head_rows = normalized_y <= 0.22
    head_guard[head_rows] = head_envelope[head_rows]

    hair_start = 0.06
    hair_full = 0.073
    top_reveal = np.clip(
        (normalized_y - hair_start) / (hair_full - hair_start),
        0.0,
        1.0,
    )
    top_reveal = top_reveal * top_reveal * (3.0 - 2.0 * top_reveal)
    head_guard[head_rows] *= top_reveal[head_rows, None]
    alpha *= head_guard

    vertical_fade = np.ones(mask_height, dtype=np.float32)
    fade_start = int(mask_height * 0.82)
    fade_end = int(mask_height * 0.985)
    vertical_fade[fade_start:fade_end] = np.linspace(1.0, 0.16, fade_end - fade_start)
    vertical_fade[fade_end:] = 0.0
    alpha *= vertical_fade[:, None]

    alpha_image = Image.fromarray(np.uint8(np.clip(alpha, 0, 255)), mode="L")
    alpha_image = alpha_image.resize(image.size, Image.Resampling.LANCZOS)
    grayscale = ImageOps.autocontrast(ImageOps.grayscale(image), cutoff=1)
    rgba = Image.merge("RGBA", (grayscale, grayscale, grayscale, alpha_image))
    rgba.save(TARGET, "WEBP", quality=84, method=6)
    print(f"Created {TARGET} ({TARGET.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
