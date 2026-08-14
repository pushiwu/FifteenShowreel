import assert from "node:assert/strict";
import test from "node:test";

import {
  CUSTOM_ASCII_DEFAULTS,
  RENDER_MODES,
  applyToneCurve,
  encodeBraille,
  getAnimationModulation,
  getContainRect,
  getPortraitCellSize,
  getPortraitFrameInterval,
  getPortraitCellOpacity,
  normalizeAsciiConfig,
  shapeAsciiCellTone,
  shapePortraitLuminance,
  shouldDrawPortraitCell,
  shouldRunPortraitAnimation,
} from "../src/utils/asciiPortrait.js";

const expectedModes = [
  "characters",
  "dither",
  "mosaic",
  "pixel",
  "dots",
  "cross",
  "diamond",
  "voxel",
  "lego",
  "mixed",
  "lines",
  "diagonal",
  "braille",
  "disco",
  "hexdump",
  "matrix",
  "rings",
  "hearts",
  "stars",
  "hexagons",
  "triangles",
  "bubbles",
  "hatch",
  "contour",
  "halfblocks",
];

test("custom ASCII defaults preserve the supplied braille recipe", () => {
  assert.equal(CUSTOM_ASCII_DEFAULTS.renderMode, "braille");
  assert.equal(CUSTOM_ASCII_DEFAULTS.bgMode, "original");
  assert.equal(CUSTOM_ASCII_DEFAULTS.bgBlur, 6);
  assert.equal(CUSTOM_ASCII_DEFAULTS.bgOpacity, 74);
  assert.equal(CUSTOM_ASCII_DEFAULTS.cellSize, 29);
  assert.equal(CUSTOM_ASCII_DEFAULTS.coverage, 37);
  assert.equal(CUSTOM_ASCII_DEFAULTS.invert, true);
  assert.equal(CUSTOM_ASCII_DEFAULTS.styleBlend, "overlay");
  assert.equal(CUSTOM_ASCII_DEFAULTS.edgeEmphasis, 72);
  assert.equal(CUSTOM_ASCII_DEFAULTS.density, 16);
  assert.equal(CUSTOM_ASCII_DEFAULTS.grayscale, 100);
  assert.equal(CUSTOM_ASCII_DEFAULTS.pfx.vignette.enabled, true);
  assert.equal(CUSTOM_ASCII_DEFAULTS.pfx.filmGrain.intensity, 30);
  assert.equal(CUSTOM_ASCII_DEFAULTS.pfx.glitch.intensity, 20);
  assert.equal(CUSTOM_ASCII_DEFAULTS.animated, true);
  assert.equal(CUSTOM_ASCII_DEFAULTS.animStyle, "flicker");
  assert.equal(CUSTOM_ASCII_DEFAULTS.animSpeed.intensity, 163);
  assert.equal(CUSTOM_ASCII_DEFAULTS.animIntensity.intensity, 77);
  assert.deepEqual(RENDER_MODES, expectedModes);
});

test("config normalization clamps unsafe values and rejects unknown modes", () => {
  const config = normalizeAsciiConfig({
    renderMode: "unknown",
    cellSize: 1,
    coverage: 140,
    brightness: -5,
    contrast: 999,
    density: -20,
    bgOpacity: 101,
    tintOpacity: -1,
    animStyle: "unknown",
    pfx: { vignette: { enabled: true, intensity: 170 } },
  });

  assert.equal(config.renderMode, "braille");
  assert.equal(config.cellSize, 4);
  assert.equal(config.coverage, 100);
  assert.equal(config.brightness, 0);
  assert.equal(config.contrast, 200);
  assert.equal(config.density, 0);
  assert.equal(config.bgOpacity, 100);
  assert.equal(config.tintOpacity, 0);
  assert.equal(config.animStyle, "flicker");
  assert.equal(config.pfx.vignette.intensity, 100);
  assert.equal(config.pfx.filmGrain.intensity, 30);
});

test("tone curve sorts control points and interpolates between neighbors", () => {
  const curve = [
    { x: 1, y: 1 },
    { x: 0.5, y: 0.25 },
    { x: 0, y: 0 },
  ];

  assert.equal(applyToneCurve(0, curve), 0);
  assert.equal(applyToneCurve(0.25, curve), 0.125);
  assert.equal(applyToneCurve(0.5, curve), 0.25);
  assert.equal(applyToneCurve(0.75, curve), 0.625);
  assert.equal(applyToneCurve(1, curve), 1);
});

test("braille encoding follows the Unicode 2 by 4 dot layout", () => {
  assert.equal(encodeBraille([false, false, false, false, false, false, false, false]), " ");
  assert.equal(encodeBraille([true, false, false, false, false, false, false, false]), "\u2801");
  assert.equal(encodeBraille([false, true, false, false, false, false, false, false]), "\u2808");
  assert.equal(encodeBraille([true, true, true, true, true, true, true, true]), "\u28ff");
});

test("animation styles are deterministic and remain intensity bounded", () => {
  for (const style of ["wave", "pulse", "shimmer", "ripple", "flicker"]) {
    const first = getAnimationModulation(style, 1234, 3, 5, 10, 0.77);
    const second = getAnimationModulation(style, 1234, 3, 5, 10, 0.77);
    assert.equal(first, second);
    assert.ok(first >= -0.77 && first <= 0.77, `${style} should be bounded`);
  }
});

test("primitive tone applies curve output, inversion, edge, and animation once", () => {
  assert.equal(shapeAsciiCellTone(0.25, false, 0, 0, 0), 0.25);
  assert.equal(shapeAsciiCellTone(0.25, true, 0, 0, 0), 0.75);
  assert.equal(shapeAsciiCellTone(0.25, false, 0.5, 0.8, 0.1), 0.43);
  assert.equal(shapeAsciiCellTone(0.95, false, 1, 1, 0.2), 1);
});

test("contain framing preserves the portrait aspect ratio", () => {
  const rect = getContainRect(1400, 2100, 700, 700, 1, 0, 0);

  assert.ok(Math.abs(rect.x - 116.6667) < 0.001);
  assert.equal(rect.y, 0);
  assert.ok(Math.abs(rect.width - 466.6667) < 0.001);
  assert.equal(rect.height, 700);
});

test("portrait policies use coarser mobile sampling and lower frame rate", () => {
  assert.equal(getPortraitCellSize(900), 10);
  assert.equal(getPortraitCellSize(580), 12);
  assert.equal(getPortraitFrameInterval(900), 1000 / 18);
  assert.equal(getPortraitFrameInterval(580), 1000 / 11);
});

test("transparent portrait cells fade before primitives reach the outer contour", () => {
  assert.equal(getPortraitCellOpacity(0, 1), 0);
  assert.ok(getPortraitCellOpacity(0.25, 0.8) < getPortraitCellOpacity(0.8, 0.8));
  assert.equal(getPortraitCellOpacity(1, 1), 1);
});

test("luminance shaping stays bounded", () => {
  const tone = shapePortraitLuminance(0.62, 0.64, 1.15, true);
  assert.ok(tone >= 0 && tone <= 1);
});

test("coverage is deterministic and animation respects lifecycle state", () => {
  const firstPass = Array.from({ length: 100 }, (_, index) =>
    shouldDrawPortraitCell(index, 50),
  );
  const secondPass = Array.from({ length: 100 }, (_, index) =>
    shouldDrawPortraitCell(index, 50),
  );

  assert.deepEqual(firstPass, secondPass);
  assert.ok(firstPass.filter(Boolean).length >= 45);
  assert.ok(firstPass.filter(Boolean).length <= 55);

  const active = {
    isInViewport: true,
    isDocumentVisible: true,
    prefersReducedMotion: false,
    ready: true,
  };

  assert.equal(shouldRunPortraitAnimation(active), true);
  assert.equal(
    shouldRunPortraitAnimation({ ...active, isInViewport: false }),
    false,
  );
  assert.equal(
    shouldRunPortraitAnimation({ ...active, isDocumentVisible: false }),
    false,
  );
  assert.equal(
    shouldRunPortraitAnimation({ ...active, prefersReducedMotion: true }),
    false,
  );
  assert.equal(
    shouldRunPortraitAnimation({ ...active, ready: false }),
    false,
  );
});
