# About ASCII Portrait Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the About portrait's direct image presentation with a recognizable, performance-bounded Canvas2D line-sampling treatment while preserving the source image as the accessible fallback.

**Architecture:** A pure utility module owns contain-layout math, sample-cell derivation, tone shaping, deterministic coverage, and frame-scheduling policy. A focused React component owns image decoding, cached sampling, Canvas2D drawing, viewport/document/reduced-motion lifecycle, and first-frame fallback. The About section only supplies the source and presentation classes.

**Tech Stack:** React 19, Canvas2D, ResizeObserver, IntersectionObserver, requestAnimationFrame, Node test runner, CSS.

## Global Constraints

- Apply the effect only to the existing About portrait.
- Continue using `/about-profile.webp`; do not add or duplicate source media.
- Do not add WebGL or third-party rendering dependencies.
- Preserve the existing About layout, crop, glow, caption, bilingual statement, links, and section motion.
- Keep the source image in the DOM with `alt="蒲师武"`; the canvas must use `aria-hidden="true"`.
- Use a 50% blurred/desaturated source background, warm gray-brown sampled lines, vignette, grain, flicker, and low-frequency glitch bands.
- Cap animation at 24 FPS on desktop and 15 FPS on compact viewports.
- Do not run animation while offscreen, while the document is hidden, or when `prefers-reduced-motion: reduce` is enabled.
- Sample pixels only after load/resize; animation frames must reuse cached cells and never call full-frame `getImageData`.
- If loading, decoding, Canvas2D, or sampling fails, keep the source image visible without a retry loop.

---

### Task 1: Add Pure Portrait Sampling and Scheduling Policies

**Files:**
- Create: `src/utils/asciiPortrait.js`
- Create: `scripts/test-ascii-portrait.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `clamp(value, min, max)`, `getContainRect(sourceWidth, sourceHeight, targetWidth, targetHeight, scale, offsetX, offsetY)`, `getPortraitCellSize(width)`, `getPortraitFrameInterval(width)`, `shapePortraitLuminance(luminance, brightness, contrast, invert)`, `getLineMetrics(luminance, edgeStrength, cellSize, density)`, `shouldDrawPortraitCell(index, coverage)`, and `shouldRunPortraitAnimation({ isInViewport, isDocumentVisible, prefersReducedMotion, ready })`.
- Consumes: numbers in CSS pixel coordinates and normalized luminance/edge values from `0` to `1`.

- [ ] **Step 1: Write the failing policy tests**

Create `scripts/test-ascii-portrait.mjs`:

```js
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
  assert.equal(shouldRunPortraitAnimation({ ...active, isInViewport: false }), false);
  assert.equal(shouldRunPortraitAnimation({ ...active, isDocumentVisible: false }), false);
  assert.equal(shouldRunPortraitAnimation({ ...active, prefersReducedMotion: true }), false);
  assert.equal(shouldRunPortraitAnimation({ ...active, ready: false }), false);
});
```

Add the new file to the performance script:

```json
"test:performance": "node --test scripts/test-animation-policy.mjs scripts/test-ascii-portrait.mjs scripts/test-performance-budget.mjs"
```

- [ ] **Step 2: Run the policy test and verify RED**

Run:

```powershell
node --test scripts/test-ascii-portrait.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/utils/asciiPortrait.js`.

- [ ] **Step 3: Implement the pure policies**

Create `src/utils/asciiPortrait.js` with exported functions. Use `Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight) * scale` for contain framing. Use `width <= 640 ? 12 : 10` for cell size and `1000 / (width <= 640 ? 15 : 24)` for frame interval. Shape luminance in brightness, contrast, invert order, then derive line length, alpha, and width from darkness plus edge strength. Implement deterministic 50% coverage with an integer hash so frame animation never changes which cells exist.

The animation policy must be exactly:

```js
export function shouldRunPortraitAnimation({
  isInViewport,
  isDocumentVisible,
  prefersReducedMotion,
  ready,
}) {
  return ready && isInViewport && isDocumentVisible && !prefersReducedMotion;
}
```

- [ ] **Step 4: Run the policy tests and verify GREEN**

Run:

```powershell
node --test scripts/test-ascii-portrait.mjs
npm.cmd run test:performance
```

Expected: all ASCII portrait tests and the existing performance suite pass.

- [ ] **Step 5: Commit the policy layer**

```powershell
git add package.json scripts/test-ascii-portrait.mjs src/utils/asciiPortrait.js
git commit -m "Add ASCII portrait rendering policies"
```

---

### Task 2: Build the Cached Canvas2D Portrait Component

**Files:**
- Create: `src/components/AsciiPortrait.jsx`
- Create: `src/components/AsciiPortrait.css`
- Modify: `scripts/test-performance-budget.mjs`

**Interfaces:**
- Consumes: `src`, `alt`, `className`, and `imageClassName` props; pure helpers from `src/utils/asciiPortrait.js`.
- Produces: a `.ascii-portrait` wrapper containing an accessible fallback `<img>` and a decorative `.ascii-portrait__canvas` that becomes visible only after the first successful processed frame.

- [ ] **Step 1: Add a failing source-contract test**

Extend `scripts/test-performance-budget.mjs` with:

```js
test("About portrait uses a cached Canvas2D effect with a safe image fallback", () => {
  const componentSource = readFileSync(
    path.join(root, "src/components/AsciiPortrait.jsx"),
    "utf8",
  );

  assert.match(componentSource, /getContext\("2d"/);
  assert.match(componentSource, /ResizeObserver/);
  assert.match(componentSource, /IntersectionObserver/);
  assert.match(componentSource, /visibilitychange/);
  assert.match(componentSource, /prefers-reduced-motion: reduce/);
  assert.match(componentSource, /getImageData/);
  assert.match(componentSource, /requestAnimationFrame/);
  assert.doesNotMatch(componentSource, /WebGL|three|pixi/i);
});
```

- [ ] **Step 2: Run the contract test and verify RED**

Run:

```powershell
npm.cmd run test:performance
```

Expected: FAIL because `src/components/AsciiPortrait.jsx` does not exist.

- [ ] **Step 3: Implement image loading, layout, and cached sampling**

Create `AsciiPortrait.jsx` using `useEffect`, `useRef`, and `useState`. Keep the fallback image visible until `setReady(true)` after the first canvas draw. Use `new Image()`, set `image.decoding = "async"`, assign `image.src = src`, and await `image.decode()` when available.

Use a capped render ratio of `Math.min(window.devicePixelRatio || 1, 1.5)`. On load and ResizeObserver callbacks:

1. Size the visible canvas to the wrapper's CSS dimensions.
2. Draw the contain-framed source into an offscreen sampling canvas whose dimensions equal the visible CSS dimensions divided by `cellSize`.
3. Call `getImageData` once on that low-resolution sampling canvas.
4. Cache cells as `{ x, y, r, g, b, luminance, edge }`, calculating edge from the right and lower neighboring samples.
5. Draw the first processed frame and mark the component ready.

Do not call `getImageData` inside the animation function.

- [ ] **Step 4: Implement the restrained animated frame**

For each frame:

1. Clear the canvas.
2. Draw the source with `filter = "blur(6px) saturate(0.82) contrast(1.15) brightness(0.64)"` and `globalAlpha = 0.5`.
3. Set `globalCompositeOperation = "color-dodge"` and draw cached line cells using warm gray-brown RGB mixed with sampled color. Rotate each line by a luminance-driven angle plus a flicker term under `0.08` radians.
4. Apply deterministic cell coverage at 50% and density `0.16`.
5. Draw grain from a reusable 96 x 96 noise canvas, updated at most every third rendered frame.
6. Draw a radial vignette with strength `0.38`.
7. At low frequency, copy one or two narrow horizontal strips by at most 8 CSS pixels to create a restrained glitch.

Use IntersectionObserver, document visibility, and the reduced-motion media query to control scheduling through `shouldRunPortraitAnimation`. Under reduced motion, render a stable frame with time `0`, no grain refresh, and no glitch. Clean up observers, media listeners, image handlers, ResizeObserver, and pending animation frames.

- [ ] **Step 5: Add component CSS and failure-safe visibility**

Create `AsciiPortrait.css`:

```css
.ascii-portrait {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.ascii-portrait__image,
.ascii-portrait__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.ascii-portrait__image {
  object-fit: contain;
  object-position: center;
  transition: opacity 500ms ease;
}

.ascii-portrait__canvas {
  opacity: 0;
  pointer-events: none;
  transition: opacity 650ms ease;
}

.ascii-portrait.is-ready .ascii-portrait__image {
  opacity: 0;
}

.ascii-portrait.is-ready .ascii-portrait__canvas {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .ascii-portrait__image,
  .ascii-portrait__canvas {
    transition: none;
  }
}
```

- [ ] **Step 6: Run focused tests and build**

Run:

```powershell
npm.cmd run test:performance
npm.cmd run build
```

Expected: all performance checks pass and Vite builds without a new dependency.

- [ ] **Step 7: Commit the component**

```powershell
git add scripts/test-performance-budget.mjs src/components/AsciiPortrait.jsx src/components/AsciiPortrait.css
git commit -m "Add Canvas2D ASCII portrait component"
```

---

### Task 3: Integrate the Portrait and Verify the Whole Site

**Files:**
- Modify: `src/sections/About.jsx`
- Modify: `src/sections/About.css`
- Modify: `scripts/test-performance-budget.mjs`

**Interfaces:**
- Consumes: `<AsciiPortrait src="/about-profile.webp" alt="蒲师武" className="about-image" />`.
- Produces: the same About media footprint and accessible image semantics with Canvas2D presentation layered inside it.

- [ ] **Step 1: Add a failing About integration assertion**

Extend the existing portrait budget test in `scripts/test-performance-budget.mjs`:

```js
assert.match(aboutSource, /import AsciiPortrait from "\.\.\/components\/AsciiPortrait"/);
assert.match(aboutSource, /<AsciiPortrait/);
assert.doesNotMatch(aboutSource, /<img[\s\S]*className="about-image"/);
```

- [ ] **Step 2: Run the integration test and verify RED**

Run:

```powershell
npm.cmd run test:performance
```

Expected: FAIL because About still renders the portrait with a direct `<img>`.

- [ ] **Step 3: Replace only the portrait node**

Import `AsciiPortrait` in `About.jsx` and replace the existing portrait `<img>` with:

```jsx
<AsciiPortrait
  className="about-image"
  imageClassName="about-image-fallback"
  src="/about-profile.webp"
  alt="蒲师武"
/>
```

Do not change the glow, caption, content, links, or statement structure.

- [ ] **Step 4: Adapt About sizing without changing its footprint**

Keep `.about-image` at `width: 100%`, `height: 100%`, and the current translate/scale transform. Move the previous image-only `object-fit`, `object-position`, and filter rules to `.about-image-fallback`. Add `isolation: isolate` if needed so canvas blend modes remain inside the portrait wrapper. Preserve the existing mobile transforms exactly.

- [ ] **Step 5: Run the complete automated verification matrix**

Run serially:

```powershell
npm.cmd run test:assets
npm.cmd run test:interaction
npm.cmd run test:data
npm.cmd run test:orbit
npm.cmd run test:performance
npm.cmd run build
git diff --check
```

Expected: all tests and the production build pass; the entry bundle does not regress by more than 20 kB uncompressed.

- [ ] **Step 6: Verify local delivery and lifecycle behavior**

Confirm the Vite listener belongs to `U:\个人站制作\portfolio`, then request:

```text
http://127.0.0.1:5173/
http://127.0.0.1:5173/about-profile.webp
```

Both must return HTTP 200. In browser QA, verify the source portrait is visible before the first processed frame, the processed portrait remains recognizable, the canvas does not overflow on desktop or mobile, reduced motion is static, and leaving About stops animation. If browser automation is blocked for localhost, report visual QA as unverified instead of substituting HTTP checks.

- [ ] **Step 7: Commit, push, and confirm repository state**

```powershell
git add src/sections/About.jsx src/sections/About.css scripts/test-performance-budget.mjs
git commit -m "Integrate ASCII portrait into About"
git push origin main
git status --short
git rev-parse HEAD
git rev-parse refs/remotes/origin/main
```

Expected: the worktree is clean and local `HEAD` equals `origin/main`.
