import assert from "node:assert/strict";
import test from "node:test";

import {
  getContainRect,
  getLineMetrics,
  getPortraitCellSize,
  getPortraitFrameInterval,
  shapePortraitLuminance,
  shouldDrawPortraitCell,
  shouldRunPortraitAnimation,
} from "../src/utils/asciiPortrait.js";

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
  assert.equal(getPortraitFrameInterval(900), 1000 / 24);
  assert.equal(getPortraitFrameInterval(580), 1000 / 15);
});

test("luminance shaping and edge emphasis produce bounded line metrics", () => {
  const tone = shapePortraitLuminance(0.62, 0.64, 1.15, true);
  const metrics = getLineMetrics(tone, 0.72, 10, 0.16);

  assert.ok(tone >= 0 && tone <= 1);
  assert.ok(metrics.length >= 1 && metrics.length <= 14);
  assert.ok(metrics.alpha >= 0 && metrics.alpha <= 1);
  assert.ok(metrics.lineWidth >= 0.5 && metrics.lineWidth <= 3);
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
