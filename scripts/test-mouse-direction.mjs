import test from "node:test";
import assert from "node:assert/strict";
import {
  getMouseDirectionStep,
  canSwitchMouseDirection,
} from "../src/utils/mouseDirection.js";

test("向右移动时切换到右侧下一张卡片", () => {
  assert.equal(getMouseDirectionStep(84), 1);
});

test("向左移动时切换到左侧上一张卡片", () => {
  assert.equal(getMouseDirectionStep(-84), -1);
});

test("鼠标轻微抖动时不切换卡片", () => {
  assert.equal(getMouseDirectionStep(52), 0);
  assert.equal(getMouseDirectionStep(-52), 0);
});

test("冷却时间内不连续切换卡片", () => {
  assert.equal(canSwitchMouseDirection(84, 240), true);
  assert.equal(canSwitchMouseDirection(84, 120), false);
});
