export const WHEEL_SWITCH_THRESHOLD = 64;
export const WHEEL_SWITCH_COOLDOWN = 360;

export function shouldCaptureProjectWheel({
  itemCount,
  isModalOpen,
  isGridLayout,
  deltaX = 0,
  deltaY = 0,
}) {
  const dominantDelta =
    Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX;

  return (
    itemCount > 1 &&
    !isModalOpen &&
    !isGridLayout &&
    Number.isFinite(dominantDelta) &&
    dominantDelta !== 0
  );
}

export function normalizeWheelDelta(delta, deltaMode = 0, pageSize = 800) {
  if (deltaMode === 1) return delta * 16;
  if (deltaMode === 2) return delta * pageSize;
  return delta;
}

export function getWheelDirectionStep(
  delta,
  threshold = WHEEL_SWITCH_THRESHOLD,
) {
  if (Math.abs(delta) < threshold) return 0;
  return Math.sign(delta);
}

export function canSwitchWheelDirection(
  delta,
  elapsedMs,
  threshold = WHEEL_SWITCH_THRESHOLD,
  cooldown = WHEEL_SWITCH_COOLDOWN,
) {
  return getWheelDirectionStep(delta, threshold) !== 0 && elapsedMs >= cooldown;
}
