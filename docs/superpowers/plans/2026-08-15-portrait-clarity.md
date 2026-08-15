# Portrait Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 About 人物接近完整显示原照片，同时仅叠加少量 Braille 点阵纹理并保留透明轮廓渐隐。

**Architecture:** 继续复用现有单张透明 WebP、一个回退 `<img>` 和一个 Canvas。`AsciiPortrait` 通过 CSS 自定义属性暴露 ready 状态下两层透明度；About 使用局部 ASCII 配方和混合比例，全局默认配方保持不变。

**Tech Stack:** React 19、Canvas2D、CSS 自定义属性、Node.js `node:test`、Vite 6。

## Global Constraints

- 原始人物图视觉占比约 75% 至 85%，点阵纹理占比约 15% 至 25%。
- 人物外侧必须继续使用素材 alpha 通道自然消失，不得出现矩形背景。
- 不增加 Canvas、逐帧循环或设备像素比，不改变 About 布局和其他页面动效。
- 全局 `CUSTOM_ASCII_DEFAULTS` 必须保持原 21st.dev 配方，不被 About 局部调整污染。

---

### Task 1: 锁定人物双层混合与局部配方

**Files:**
- Modify: `scripts/test-performance-budget.mjs`
- Modify: `scripts/test-ascii-portrait.mjs`
- Test: `scripts/test-performance-budget.mjs`
- Test: `scripts/test-ascii-portrait.mjs`

**Interfaces:**
- Consumes: `AsciiPortrait` 当前的 `src`、`alt`、`className`、`imageClassName`、`config` props。
- Produces: `imageOpacity` 与 `canvasOpacity` props；`ABOUT_PORTRAIT_CONFIG` 常量。

- [ ] **Step 1: 写入失败测试**

在 `scripts/test-performance-budget.mjs` 中断言：

```js
assert.match(componentSource, /imageOpacity = 0/);
assert.match(componentSource, /canvasOpacity = 1/);
assert.match(componentSource, /--ascii-image-ready-opacity/);
assert.match(componentSource, /--ascii-canvas-ready-opacity/);
assert.match(aboutSource, /imageOpacity=\{0\.82\}/);
assert.match(aboutSource, /canvasOpacity=\{0\.22\}/);
assert.match(aboutSource, /ABOUT_PORTRAIT_CONFIG/);
```

在 `scripts/test-ascii-portrait.mjs` 中断言局部配方保持轻量：

```js
assert.equal(ABOUT_PORTRAIT_CONFIG.bgMode, "none");
assert.ok(ABOUT_PORTRAIT_CONFIG.coverage <= 24);
assert.ok(ABOUT_PORTRAIT_CONFIG.pfx.filmGrain.intensity <= 12);
assert.ok(ABOUT_PORTRAIT_CONFIG.pfx.glitch.intensity <= 6);
assert.ok(ABOUT_PORTRAIT_CONFIG.animIntensity.intensity <= 24);
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm.cmd run test:performance`

Expected: FAIL，因为双层透明度 props 与 `ABOUT_PORTRAIT_CONFIG` 尚不存在。

- [ ] **Step 3: 提交测试**

```powershell
git add scripts/test-performance-budget.mjs scripts/test-ascii-portrait.mjs
git commit -m "test: define clear portrait blend policy"
```

---

### Task 2: 实现清晰人物与轻量点阵混合

**Files:**
- Modify: `src/components/AsciiPortrait.jsx`
- Modify: `src/components/AsciiPortrait.css`
- Modify: `src/utils/asciiPortrait.js`
- Modify: `src/sections/About.jsx`
- Modify: `src/sections/About.css`

**Interfaces:**
- Consumes: Task 1 定义的 `imageOpacity`、`canvasOpacity` 与 `ABOUT_PORTRAIT_CONFIG`。
- Produces: 默认行为不变、About 人物使用 `0.82` 原图透明度与 `0.22` Canvas 透明度。

- [ ] **Step 1: 扩展 `AsciiPortrait` props**

```jsx
export default function AsciiPortrait({
  src,
  alt = "",
  className = "",
  imageClassName = "",
  config = CUSTOM_ASCII_DEFAULTS,
  imageOpacity = 0,
  canvasOpacity = 1,
}) {
```

在 wrapper 上传入：

```jsx
style={{
  "--ascii-image-ready-opacity": imageOpacity,
  "--ascii-canvas-ready-opacity": canvasOpacity,
}}
```

- [ ] **Step 2: 更新 ready 状态混合规则**

```css
.ascii-portrait.is-ready .ascii-portrait__image {
  opacity: var(--ascii-image-ready-opacity, 0);
}

.ascii-portrait.is-ready .ascii-portrait__canvas {
  opacity: var(--ascii-canvas-ready-opacity, 1);
}
```

- [ ] **Step 3: 增加 About 专属轻量配方**

在 `src/utils/asciiPortrait.js` 中以 `CUSTOM_ASCII_DEFAULTS` 为基础导出 `ABOUT_PORTRAIT_CONFIG`，关键参数为：

```js
export const ABOUT_PORTRAIT_CONFIG = {
  ...CUSTOM_ASCII_DEFAULTS,
  bgMode: "none",
  bgBlur: 0,
  bgOpacity: 0,
  coverage: 22,
  brightness: 96,
  contrast: 108,
  edgeEmphasis: 64,
  density: 12,
  pfx: {
    ...CUSTOM_ASCII_DEFAULTS.pfx,
    vignette: { enabled: true, intensity: 12 },
    filmGrain: { enabled: true, intensity: 10 },
    glitch: { enabled: true, intensity: 4 },
  },
  animIntensity: { enabled: true, intensity: 20 },
};
```

- [ ] **Step 4: 在 About 中启用局部混合**

```jsx
<AsciiPortrait
  className="about-image"
  imageClassName="about-image-fallback"
  src="/about-profile-cutout.webp"
  alt="蒲师武"
  config={ABOUT_PORTRAIT_CONFIG}
  imageOpacity={0.82}
  canvasOpacity={0.22}
/>
```

将 `.about-image .ascii-portrait__canvas` 的额外亮度滤镜改为轻量中性调整，避免两次增亮：

```css
filter: brightness(1.08) contrast(1.04);
```

- [ ] **Step 5: 运行目标测试并确认通过**

Run: `npm.cmd run test:performance`

Expected: 相关 ASCII、性能和动画策略测试全部 PASS。

- [ ] **Step 6: 提交实现**

```powershell
git add src/components/AsciiPortrait.jsx src/components/AsciiPortrait.css src/utils/asciiPortrait.js src/sections/About.jsx src/sections/About.css
git commit -m "fix: clarify About portrait treatment"
```

---

### Task 3: 构建与视觉回归验收

**Files:**
- Verify: `src/sections/About.jsx`
- Verify: `src/sections/About.css`
- Verify: `dist/`

**Interfaces:**
- Consumes: Task 2 完成的局部人物混合。
- Produces: 可发布的修正版构建和桌面/手机视觉验证结果。

- [ ] **Step 1: 运行完整测试矩阵**

```powershell
npm.cmd run test:data
npm.cmd run test:assets
npm.cmd run test:performance
npm.cmd run test:interaction
npm.cmd run test:orbit
```

Expected: 所有测试通过，无新增 warning 或 failure。

- [ ] **Step 2: 生成生产构建**

Run: `npm.cmd run build`

Expected: Vite build 成功，媒体预算与输出结构不变。

- [ ] **Step 3: 浏览器视觉验收**

在 `1440×900` 与 `390×844` 检查：脸部、手臂和裤腿清晰可辨；点阵只作为少量纹理；人物外缘仍透明融入背景；页面无横向溢出；控制台无项目错误。

- [ ] **Step 4: 提交最终必要修正**

```powershell
git add src scripts docs
git commit -m "fix: finalize portrait clarity tuning"
```

仅在视觉验收产生必要调参时创建此提交；没有额外修改则跳过。
