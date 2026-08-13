import test from "node:test";
import assert from "node:assert/strict";
import {
  getOrbitDatasetKey,
  getOrbitPresentation,
  getOrbitItemVisualState,
  getSafeActiveIndex,
  getSafeOrbitRadiusY,
} from "../src/utils/orbitLayout.js";

test("分类数据集变化时轨道实例必须重置", () => {
  const core = [29, 8, 13, 7].map((id) => ({ id }));
  const all = [29, 8, 13, 9, 2, 3, 4, 21, 22, 5, 6, 7].map((id) => ({ id }));

  assert.notEqual(
    getOrbitDatasetKey("core", core),
    getOrbitDatasetKey("all", all),
  );
  assert.equal(
    getOrbitDatasetKey("core", core),
    getOrbitDatasetKey("core", core),
  );
});

test("所有轨道卡片都保持可见和可交互", () => {
  for (const totalItems of [4, 6, 23]) {
    const states = Array.from({ length: totalItems }, (_, index) =>
      getOrbitItemVisualState(index, 0, totalItems),
    );

    assert.equal(states.every((state) => state.isVisible), true);
    assert.equal(states.every((state) => state.opacity >= 0.4), true);
  }
});

test("当前卡片拥有明确且唯一的尺寸层级", () => {
  const states = Array.from({ length: 6 }, (_, index) =>
    getOrbitItemVisualState(index, 2, 6),
  );
  const active = states[2];
  const largestInactiveScale = Math.max(
    ...states.filter((state) => !state.isActive).map((state) => state.scale),
  );

  assert.equal(active.isActive, true);
  assert.equal(active.scale >= largestInactiveScale + 0.22, true);
  assert.equal(active.opacity, 1);
  assert.equal(states.filter((state) => state.isActive).length, 1);
});

test("高密度轨道在当前卡片两侧预留完整可见空间", () => {
  const previous = getOrbitItemVisualState(22, 0, 23);
  const next = getOrbitItemVisualState(1, 0, 23);
  const sparse = getOrbitItemVisualState(1, 0, 4);

  assert.equal(previous.spreadX <= -48, true);
  assert.equal(next.spreadX >= 48, true);
  assert.equal(sparse.spreadX, 0);
});

test("轨道纵向半径收敛到卡片不会越界的安全范围", () => {
  assert.equal(
    getSafeOrbitRadiusY({
      requestedRadiusY: 215,
      containerHeight: 800,
      itemHeight: 400,
      activeScale: 1.18,
      padding: 36,
    }),
    128,
  );

  assert.equal(
    getSafeOrbitRadiusY({
      requestedRadiusY: 110,
      containerHeight: 680,
      itemHeight: 360,
      activeScale: 1.18,
      padding: 34,
    }),
    93.6,
  );
});

test("高密度卡片在紧凑视口切换为无重叠网格", () => {
  assert.equal(
    getOrbitPresentation({
      compact: true,
      compactLayout: "grid",
      totalItems: 23,
    }),
    "grid",
  );
  assert.equal(
    getOrbitPresentation({
      compact: false,
      compactLayout: "grid",
      totalItems: 23,
    }),
    "orbit",
  );
  assert.equal(
    getOrbitPresentation({
      compact: true,
      compactLayout: "orbit",
      totalItems: 23,
    }),
    "orbit",
  );
});

test("分类数量变化时当前索引始终落在有效范围", () => {
  assert.equal(getSafeActiveIndex(12, 4), 0);
  assert.equal(getSafeActiveIndex(22, 6), 4);
  assert.equal(getSafeActiveIndex(-1, 6), 5);
  assert.equal(getSafeActiveIndex(3, 0), 0);
});
