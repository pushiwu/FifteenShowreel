import assert from "node:assert/strict";
import test from "node:test";

import {
  shouldAnimateTextReveal,
  shouldRunProjectAutoplay,
} from "../src/utils/animationPolicy.js";
import {
  MOTION_EASES,
  getMotionSettings,
  getSectionMotionSelectors,
} from "../src/utils/motionSystem.js";

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

test("电影化动效在桌面和紧凑视口使用稳定的慢节奏", () => {
  assert.deepEqual(getMotionSettings({ compact: false, reducedMotion: false }), {
    reducedMotion: false,
    compact: false,
    entranceDuration: 1.7,
    travel: 120,
    stagger: 0.15,
    parallax: 5,
  });
  assert.deepEqual(getMotionSettings({ compact: true, reducedMotion: false }), {
    reducedMotion: false,
    compact: true,
    entranceDuration: 1.36,
    travel: 58,
    stagger: 0.11,
    parallax: 2.5,
  });
  assert.equal(MOTION_EASES.entrance, "power4.out");
  assert.equal(MOTION_EASES.settle, "expo.out");
  assert.doesNotMatch(Object.values(MOTION_EASES).join(" "), /bounce|elastic|back/i);
});

test("减少动态时取消位移、错峰和视差", () => {
  assert.deepEqual(getMotionSettings({ compact: false, reducedMotion: true }), {
    reducedMotion: true,
    compact: false,
    entranceDuration: 0,
    travel: 0,
    stagger: 0,
    parallax: 0,
  });
});

test("模块动效只读取约定的语义目标", () => {
  assert.deepEqual(getSectionMotionSelectors(), {
    title: '[data-motion="title"]',
    heading: '[data-motion="heading"]',
    copy: '[data-motion="copy"]',
    cards: '[data-motion="cards"] > *',
    media: '[data-motion="media"]',
    meta: '[data-motion="meta"]',
  });
});
