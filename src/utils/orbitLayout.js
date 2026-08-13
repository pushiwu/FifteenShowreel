const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const ORBIT_ACTIVE_SCALE = 1.18;

export function getOrbitDatasetKey(scope, items = []) {
  const itemIds = items.map((item, index) => item?.id ?? item?.key ?? index);
  return `${scope}:${itemIds.join("|")}`;
}

export function getSafeActiveIndex(activeIndex, totalItems) {
  if (totalItems <= 0) return 0;
  const index = Number.isFinite(activeIndex) ? Math.trunc(activeIndex) : 0;
  return ((index % totalItems) + totalItems) % totalItems;
}

export function getOrbitPresentation({
  compact,
  compactLayout = "orbit",
  totalItems,
}) {
  if (compact && compactLayout === "grid" && totalItems > 0) {
    return "grid";
  }

  return "orbit";
}

export function getCircularOffset(index, activeIndex, totalItems) {
  if (totalItems <= 0) return 0;
  const raw = index - activeIndex;
  return (
    ((raw + totalItems + Math.floor(totalItems / 2)) % totalItems) -
    Math.floor(totalItems / 2)
  );
}

export function getOrbitItemVisualState(index, activeIndex, totalItems) {
  const circularOffset = getCircularOffset(index, activeIndex, totalItems);
  const distance = Math.abs(circularOffset);
  const isActive = distance === 0;
  const density = clamp((totalItems - 6) / 17, 0, 1);
  const densityScale = 1 - density * 0.36;
  const inactiveScale = clamp(0.84 - distance * 0.055, 0.48, 0.79);
  const scale = isActive
    ? ORBIT_ACTIVE_SCALE
    : Math.max(0.3, inactiveScale * densityScale);
  const opacity = isActive
    ? 1
    : Math.max(0.42, 0.84 - distance * 0.04 - density * 0.08);
  const tilt = isActive
    ? 0
    : Math.sign(circularOffset) * Math.min(13, 4 + distance * 1.45);
  const spreadX =
    !isActive && totalItems >= 12 ? Math.sign(circularOffset) * 56 : 0;

  return {
    circularOffset,
    distance,
    isActive,
    isVisible: true,
    opacity,
    scale,
    spreadX,
    tilt,
    zIndex: isActive ? totalItems + 10 : Math.max(1, totalItems - distance),
  };
}

export function getSafeOrbitRadiusY({
  requestedRadiusY,
  containerHeight,
  itemHeight,
  activeScale = ORBIT_ACTIVE_SCALE,
  padding = 36,
}) {
  const availableRadius =
    containerHeight / 2 - (itemHeight * activeScale) / 2 - padding;

  return Number(
    clamp(requestedRadiusY, 0, Math.max(0, availableRadius)).toFixed(2),
  );
}
