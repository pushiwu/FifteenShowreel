# Project Wheel Restore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 恢复项目环形轨道内普通鼠标纵向滚轮与触控板横向滚动的作品切换。

**Architecture:** 继续复用 `Projects.jsx` 的非被动 `wheel` 监听、滚动累积、阈值和冷却机制。唯一行为变化位于纯函数 `shouldCaptureProjectWheel()`，它重新接受纵向或横向的主导滚动输入。

**Tech Stack:** React 19、DOM WheelEvent、Node.js `node:test`、Vite 6。

## Global Constraints

- 监听范围保持为 `.projects-curve`，不得扩展到整个项目 section。
- 手机端全部项目网格和弹窗状态必须继续放行页面滚动。
- 不修改滚动阈值、冷却时间或轨道索引算法。

---

### Task 1: 恢复主导方向滚轮捕获

**Files:**
- Modify: `scripts/test-wheel-direction.mjs`
- Modify: `src/utils/wheelDirection.js`

**Interfaces:**
- Consumes: `shouldCaptureProjectWheel({ itemCount, isModalOpen, isGridLayout, deltaX, deltaY })`。
- Produces: 纵向或横向非零主导滚动均返回 `true`，受保护状态仍返回 `false`。

- [ ] **Step 1: 写入纵向滚轮失败测试**

```js
assert.equal(shouldCaptureProjectWheel({
  itemCount: 4,
  isModalOpen: false,
  isGridLayout: false,
  deltaX: 12,
  deltaY: 80,
}), true);
```

- [ ] **Step 2: 运行并确认失败**

Run: `npm.cmd run test:interaction`

Expected: FAIL，当前实现只接受横向主导输入。

- [ ] **Step 3: 恢复主导滚动算法**

```js
const dominantDelta =
  Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX;

return (
  itemCount > 1 &&
  !isModalOpen &&
  !isGridLayout &&
  Number.isFinite(dominantDelta) &&
  dominantDelta !== 0
);
```

- [ ] **Step 4: 运行交互测试并确认通过**

Run: `npm.cmd run test:interaction`

Expected: 全部 PASS。

- [ ] **Step 5: 运行完整测试与生产构建**

```powershell
npm.cmd run test:data
npm.cmd run test:assets
npm.cmd run test:performance
npm.cmd run test:interaction
npm.cmd run test:orbit
npm.cmd run build
```

- [ ] **Step 6: 浏览器验证**

在桌面视口进入核心作品环形轨道，发送纵向滚轮输入，确认当前卡片索引变化；离开轨道后确认页面仍可滚动。
