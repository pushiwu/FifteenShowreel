export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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
  return 1000 / (width <= 640 ? 15 : 24);
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
