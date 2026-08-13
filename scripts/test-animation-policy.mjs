import assert from "node:assert/strict";
import test from "node:test";

import {
  shouldAnimateTextReveal,
  shouldRunProjectAutoplay,
} from "../src/utils/animationPolicy.js";

const activeState = {
  isPaused: false,
  isDocumentVisible: true,
  isSectionInView: true,
  isCompactAllView: false,
  itemCount: 4,
  isModalOpen: false,
  prefersReducedMotion: false,
};

test("作品轮播只在板块可见且页面可交互时自动切换", () => {
  assert.equal(shouldRunProjectAutoplay(activeState), true);
  assert.equal(
    shouldRunProjectAutoplay({ ...activeState, isSectionInView: false }),
    false,
  );
  assert.equal(
    shouldRunProjectAutoplay({ ...activeState, isDocumentVisible: false }),
    false,
  );
  assert.equal(
    shouldRunProjectAutoplay({ ...activeState, isPaused: true }),
    false,
  );
  assert.equal(
    shouldRunProjectAutoplay({ ...activeState, isModalOpen: true }),
    false,
  );
  assert.equal(
    shouldRunProjectAutoplay({ ...activeState, isCompactAllView: true }),
    false,
  );
  assert.equal(
    shouldRunProjectAutoplay({ ...activeState, itemCount: 1 }),
    false,
  );
  assert.equal(
    shouldRunProjectAutoplay({ ...activeState, prefersReducedMotion: true }),
    false,
  );
});

test("长段正文不逐字解密，避免大量定时器与状态更新", () => {
  assert.equal(shouldAnimateTextReveal("Short title", "view"), true);
  assert.equal(shouldAnimateTextReveal("A".repeat(81), "view"), false);
  assert.equal(shouldAnimateTextReveal("Short title", "none"), false);
});
