export const MOUSE_SWITCH_THRESHOLD = 72;
export const MOUSE_SWITCH_COOLDOWN = 240;

export function getMouseDirectionStep(
  deltaX,
  threshold = MOUSE_SWITCH_THRESHOLD
) {
  if (Math.abs(deltaX) < threshold) return 0;
  return Math.sign(deltaX);
}

export function canSwitchMouseDirection(
  deltaX,
  elapsedMs,
  threshold = MOUSE_SWITCH_THRESHOLD,
  cooldown = MOUSE_SWITCH_COOLDOWN
) {
  return (
    getMouseDirectionStep(deltaX, threshold) !== 0 &&
    elapsedMs >= cooldown
  );
}
