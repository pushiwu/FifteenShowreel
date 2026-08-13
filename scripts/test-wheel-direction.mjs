import test from "node:test";
import assert from "node:assert/strict";
import {
  canSwitchWheelDirection,
  getWheelDirectionStep,
  normalizeWheelDelta,
  shouldCaptureProjectWheel,
} from "../src/utils/wheelDirection.js";

test("向下滚动切换到下一张卡片", () => {
  assert.equal(getWheelDirectionStep(80), 1);
});

test("向上滚动切换到上一张卡片", () => {
  assert.equal(getWheelDirectionStep(-80), -1);
});

test("触控板轻微滚动不会立即切换", () => {
  assert.equal(getWheelDirectionStep(28), 0);
  assert.equal(getWheelDirectionStep(-28), 0);
});

test("滚轮切换遵守冷却时间", () => {
  assert.equal(canSwitchWheelDirection(80, 360), true);
  assert.equal(canSwitchWheelDirection(80, 180), false);
});

test("行和页滚动单位会转换为像素量级", () => {
  assert.equal(normalizeWheelDelta(3, 1), 48);
  assert.equal(normalizeWheelDelta(1, 2, 900), 900);
});

test("环形卡片切换会独占有效滚轮输入", () => {
  assert.equal(
    shouldCaptureProjectWheel({
      itemCount: 4,
      isModalOpen: false,
      isGridLayout: false,
      deltaX: 0,
      deltaY: 80,
    }),
    true,
  );
});

test("长网格和不可切换状态保留页面滚动", () => {
  assert.equal(
    shouldCaptureProjectWheel({
      itemCount: 23,
      isModalOpen: false,
      isGridLayout: true,
      deltaX: 0,
      deltaY: 80,
    }),
    false,
  );
  assert.equal(
    shouldCaptureProjectWheel({
      itemCount: 1,
      isModalOpen: false,
      isGridLayout: false,
      deltaX: 0,
      deltaY: 80,
    }),
    false,
  );
  assert.equal(
    shouldCaptureProjectWheel({
      itemCount: 4,
      isModalOpen: true,
      isGridLayout: false,
      deltaX: 0,
      deltaY: 80,
    }),
    false,
  );
});
