export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getPortraitCellOpacity(alpha, tone = 1) {
  const normalizedAlpha = clamp(alpha, 0, 1);
  if (normalizedAlpha <= 0.01) return 0;
  return clamp(Math.pow(normalizedAlpha, 0.72) * (0.42 + clamp(tone, 0, 1) * 0.58), 0, 1);
}

export const RENDER_MODES = [
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

const POST_EFFECT_DEFAULTS = {
  vignette: { enabled: true, intensity: 38 },
  scanLines: { enabled: false, intensity: 40 },
  chromatic: { enabled: false, intensity: 15 },
  bloom: { enabled: false, intensity: 25 },
  filmGrain: { enabled: true, intensity: 30 },
  glitch: { enabled: true, intensity: 20 },
  pixelate: { enabled: false, intensity: 15 },
  halftone: { enabled: false, intensity: 20 },
  filmDust: { enabled: false, intensity: 20 },
};

export const CUSTOM_ASCII_DEFAULTS = {
  renderMode: "braille",
  bgMode: "original",
  bgBlur: 6,
  bgOpacity: 74,
  bgColor: "#101010",
  cellSize: 29,
  coverage: 37,
  invert: true,
  styleBlend: "overlay",
  charSet: "standard",
  customChars: "",
  brightness: 64,
  contrast: 115,
  edgeEmphasis: 72,
  density: 16,
  toneCurve: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 0.48970251752203003, y: 0.4111568727630821 },
  ],
  tint: "#8b5a2b",
  tintOpacity: 0,
  overlayBlend: "hard-light",
  saturation: 0,
  grayscale: 100,
  blurType: "off",
  blurAmount: 7,
  blurAngle: 0,
  directionalBothSides: false,
  tiltFocus: 35,
  tiltPosition: 50,
  tiltFeather: 15,
  lensFocus: 40,
  blurCenterX: 50,
  blurCenterY: 50,
  progressivePosition: 55,
  progressiveReverse: false,
  pfx: POST_EFFECT_DEFAULTS,
  animated: true,
  animStyle: "flicker",
  animSpeed: { enabled: true, intensity: 163 },
  animIntensity: { enabled: true, intensity: 77 },
  lights: {
    enabled: false,
    points: [
      {
        x: 0.3686196724679594,
        y: 0.13176574977817213,
        radius: 44,
        intensity: 80,
      },
    ],
  },
  mask: {
    enabled: false,
    tool: "freehand",
    brushSize: 30,
    showOverlay: false,
    invert: false,
    dataUrl: null,
    shapes: [],
  },
};

const ANIMATION_STYLES = new Set(["wave", "pulse", "shimmer", "ripple", "flicker"]);

function normalizeEffect(effect, fallback) {
  return {
    enabled: Boolean(effect?.enabled ?? fallback.enabled),
    intensity: clamp(Number(effect?.intensity ?? fallback.intensity), 0, 100),
  };
}

function normalizeToggleValue(value, fallback, max = 200) {
  return {
    enabled: Boolean(value?.enabled ?? fallback.enabled),
    intensity: clamp(Number(value?.intensity ?? fallback.intensity), 0, max),
  };
}

export function normalizeAsciiConfig(input = {}) {
  const defaults = CUSTOM_ASCII_DEFAULTS;
  const pfx = Object.fromEntries(
    Object.entries(POST_EFFECT_DEFAULTS).map(([key, fallback]) => [
      key,
      normalizeEffect(input.pfx?.[key], fallback),
    ]),
  );
  const points = Array.isArray(input.lights?.points)
    ? input.lights.points.map((point) => ({
        x: clamp(Number(point.x ?? 0.5), 0, 1),
        y: clamp(Number(point.y ?? 0.5), 0, 1),
        radius: clamp(Number(point.radius ?? 30), 1, 100),
        intensity: clamp(Number(point.intensity ?? 50), 0, 100),
      }))
    : defaults.lights.points.map((point) => ({ ...point }));

  return {
    ...defaults,
    ...input,
    renderMode: RENDER_MODES.includes(input.renderMode)
      ? input.renderMode
      : defaults.renderMode,
    cellSize: clamp(Number(input.cellSize ?? defaults.cellSize), 4, 96),
    coverage: clamp(Number(input.coverage ?? defaults.coverage), 0, 100),
    bgBlur: clamp(Number(input.bgBlur ?? defaults.bgBlur), 0, 40),
    bgOpacity: clamp(Number(input.bgOpacity ?? defaults.bgOpacity), 0, 100),
    brightness: clamp(Number(input.brightness ?? defaults.brightness), 0, 200),
    contrast: clamp(Number(input.contrast ?? defaults.contrast), 0, 200),
    edgeEmphasis: clamp(Number(input.edgeEmphasis ?? defaults.edgeEmphasis), 0, 100),
    density: clamp(Number(input.density ?? defaults.density), 0, 100),
    tintOpacity: clamp(Number(input.tintOpacity ?? defaults.tintOpacity), 0, 100),
    saturation: clamp(Number(input.saturation ?? defaults.saturation), 0, 200),
    grayscale: clamp(Number(input.grayscale ?? defaults.grayscale), 0, 100),
    blurAmount: clamp(Number(input.blurAmount ?? defaults.blurAmount), 0, 40),
    animStyle: ANIMATION_STYLES.has(input.animStyle)
      ? input.animStyle
      : defaults.animStyle,
    toneCurve: Array.isArray(input.toneCurve)
      ? input.toneCurve.map((point) => ({
          x: clamp(Number(point.x), 0, 1),
          y: clamp(Number(point.y), 0, 1),
        }))
      : defaults.toneCurve.map((point) => ({ ...point })),
    pfx,
    animSpeed: normalizeToggleValue(input.animSpeed, defaults.animSpeed, 200),
    animIntensity: normalizeToggleValue(input.animIntensity, defaults.animIntensity, 100),
    lights: {
      ...defaults.lights,
      ...input.lights,
      enabled: Boolean(input.lights?.enabled ?? defaults.lights.enabled),
      points,
    },
    mask: {
      ...defaults.mask,
      ...input.mask,
      enabled: Boolean(input.mask?.enabled ?? defaults.mask.enabled),
      invert: Boolean(input.mask?.invert ?? defaults.mask.invert),
      shapes: Array.isArray(input.mask?.shapes) ? input.mask.shapes : [],
    },
  };
}

export function applyToneCurve(value, toneCurve = CUSTOM_ASCII_DEFAULTS.toneCurve) {
  const points = toneCurve
    .map((point) => ({ x: clamp(Number(point.x), 0, 1), y: clamp(Number(point.y), 0, 1) }))
    .sort((a, b) => a.x - b.x);
  const input = clamp(value, 0, 1);
  if (!points.length) return input;
  if (input <= points[0].x) return points[0].y;
  if (input >= points.at(-1).x) return points.at(-1).y;

  for (let index = 1; index < points.length; index += 1) {
    const right = points[index];
    const left = points[index - 1];
    if (input <= right.x) {
      const range = right.x - left.x;
      const progress = range === 0 ? 0 : (input - left.x) / range;
      return left.y + (right.y - left.y) * progress;
    }
  }
  return input;
}

export function encodeBraille(dots) {
  const bitValues = [1, 8, 2, 16, 4, 32, 64, 128];
  const mask = bitValues.reduce(
    (value, bit, index) => value | (dots[index] ? bit : 0),
    0,
  );
  return mask ? String.fromCodePoint(0x2800 + mask) : " ";
}

function stableNoise(column, row, seed) {
  const value = Math.sin(column * 12.9898 + row * 78.233 + seed * 0.013) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

export function getAnimationModulation(
  style,
  time,
  column,
  row,
  cellSize,
  intensity = 1,
) {
  const phase = time * 0.003;
  let value = 0;
  if (style === "wave") value = Math.sin(phase + column * 0.42 + row * 0.12);
  else if (style === "pulse") value = Math.sin(phase * 1.35);
  else if (style === "shimmer") value = Math.sin(phase * 1.8 + (column + row) * 0.65);
  else if (style === "ripple") {
    const distance = Math.hypot(column * cellSize, row * cellSize) / Math.max(cellSize, 1);
    value = Math.sin(phase * 1.2 - distance * 0.42);
  } else value = stableNoise(column, row, Math.floor(time / 90));
  return clamp(value * clamp(intensity, 0, 1), -Math.abs(intensity), Math.abs(intensity));
}

export function shapeAsciiCellTone(
  tone,
  invert,
  edgeStrength,
  edgeEmphasis,
  modulation = 0,
) {
  const base = invert ? 1 - tone : tone;
  return clamp(
    base + modulation + clamp(edgeStrength, 0, 1) * clamp(edgeEmphasis, 0, 1) * 0.2,
    0,
    1,
  );
}

export function getContainRect(
  sourceWidth,
  sourceHeight,
  targetWidth,
  targetHeight,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
) {
  if (
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    targetWidth <= 0 ||
    targetHeight <= 0
  ) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const containScale = Math.min(
    targetWidth / sourceWidth,
    targetHeight / sourceHeight,
  );
  const width = sourceWidth * containScale * scale;
  const height = sourceHeight * containScale * scale;

  return {
    x: (targetWidth - width) / 2 + offsetX,
    y: (targetHeight - height) / 2 + offsetY,
    width,
    height,
  };
}

export function getPortraitCellSize(width) {
  return width <= 640 ? 12 : 10;
}

export function getPortraitFrameInterval(width) {
  return 1000 / (width <= 640 ? 11 : 18);
}

export function shapePortraitLuminance(
  luminance,
  brightness = 0.64,
  contrast = 1.15,
  invert = true,
) {
  const brightened = clamp(luminance * brightness, 0, 1);
  const contrasted = clamp((brightened - 0.5) * contrast + 0.5, 0, 1);
  return invert ? 1 - contrasted : contrasted;
}

export function getLineMetrics(
  luminance,
  edgeStrength,
  cellSize,
  density = 0.16,
) {
  const light = clamp(luminance, 0, 1);
  const edge = clamp(edgeStrength, 0, 1);
  const normalizedDensity = clamp(density, 0, 1);
  const darkness = 1 - light;
  const detail = clamp(darkness * 0.68 + edge * 0.72, 0, 1);

  return {
    length: clamp(
      cellSize * (0.12 + detail * 0.94 + normalizedDensity * 0.18),
      1,
      cellSize * 1.4,
    ),
    alpha: clamp(0.14 + detail * 0.68, 0, 1),
    lineWidth: clamp(0.5 + edge * 1.45 + darkness * 0.55, 0.5, 3),
  };
}

export function shouldDrawPortraitCell(index, coverage = 50) {
  const normalizedCoverage = clamp(coverage, 0, 100);
  const stableBucket = ((index * 37) % 100 + 100) % 100;
  return stableBucket < normalizedCoverage;
}

export function shouldRunPortraitAnimation({
  isInViewport,
  isDocumentVisible,
  prefersReducedMotion,
  ready,
}) {
  return ready && isInViewport && isDocumentVisible && !prefersReducedMotion;
}
