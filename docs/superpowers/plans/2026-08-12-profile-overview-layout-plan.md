# Profile Overview Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将个人概览区域改为右侧人物、左侧创作内容、底部三入口的无边框编辑式布局，并把联系方式留在页面末尾。

**Architecture:** 继续使用现有 React 组件边界，不重做 Projects、Expertise、Resume 的内部功能。重构 `About` 的内容结构与 CSS，新增入口链接和透明人物资源；`Contact` 保持在 App 最后，只移除 About 内重复联系方式。

**Tech Stack:** React 19, Vite 6, CSS Grid, PNG alpha transparency, Node test/build scripts, Playwright browser verification.

## Global Constraints

- 人物图使用 `微信图片_20260807234623_367_174.png`，保留透明背景。
- About 不展示联系方式；电话、邮箱、微信只出现在最后的 Contact 区域。
- 不删除或改写 Projects、Expertise、Resume 的详细内容与现有交互。
- 三个入口必须分别指向 `#projects`、`#expertise`、`#resume`。
- 不使用独立照片卡片、白色边框或内容面板。
- 桌面端人物在右侧，移动端不得出现横向溢出。

---

### Task 1: 接入透明人物素材

**Files:**
- Create: `public/about-profile.png`
- Modify: `src/sections/About.jsx`

**Interfaces:**
- Produces the `/about-profile.png` static asset consumed by the About image element.

- [ ] **Step 1: Copy the supplied PNG into the public asset root**

Copy `U:/个人站制作/02_参考与人物素材/个人照片/微信图片_20260807234623_367_174.png` to `portfolio/public/about-profile.png`, preserving the RGBA alpha channel.

- [ ] **Step 2: Update the About image source**

Change the image source from `/about-profile.jpg` to `/about-profile.png` and keep the existing person alt text.

- [ ] **Step 3: Verify the asset exists**

Run:

```powershell
Get-Item public/about-profile.png
```

Expected: the file exists and reports a non-zero size.

### Task 2: Rebuild About content structure

**Files:**
- Modify: `src/sections/About.jsx`

**Interfaces:**
- Keeps the existing `About` component and `#about` anchor.
- Adds three anchor links with `href="#projects"`, `href="#expertise"`, and `href="#resume"`.

- [ ] **Step 1: Remove duplicated contact data and markup**

Delete the local `contacts` array and the `.about-contact-grid` rendering from `About.jsx`; do not change `Contact.jsx`.

- [ ] **Step 2: Add the overview entry data**

Add an `overviewLinks` array with:

```js
[
  { href: "#projects", number: "03", zh: "核心作品", en: "Selected Works" },
  { href: "#expertise", number: "04", zh: "工作维度", en: "Working Dimensions" },
  { href: "#resume", number: "10", zh: "奖项与入围", en: "Awards & Selections" },
]
```

- [ ] **Step 3: Render the right-side image and bottom links**

Use semantic `nav` markup for the three links. Keep the statement copy on the left and render the image in a dedicated right-side visual wrapper with no card background.

### Task 3: Apply the reference-inspired responsive layout

**Files:**
- Modify: `src/sections/About.css`

**Interfaces:**
- Defines the visual contract for `.about-layout`, `.about-media`, `.about-content`, and `.about-overview-links`.

- [ ] **Step 1: Define the desktop grid**

Use a 12-column layout where the content spans the left five columns and the visual spans the right seven columns. Keep the section background transparent so the global dither remains visible.

- [ ] **Step 2: Blend the image with the background**

Remove the old frame and divider styles. Position the PNG in the visual wrapper with `object-fit: contain`, a transparent background, and a soft blue/cyan glow that does not create a rectangular panel.

- [ ] **Step 3: Style the three vertical entries**

Render the links as a three-column rail with top/bottom rules and vertical separators. Use small numeric indices, large Chinese labels, uppercase English labels, and a hover arrow/color transition.

- [ ] **Step 4: Add responsive breakpoints**

At medium widths, reduce the visual height and keep the two-column structure. At mobile widths, switch to one column, show content before the image, and collapse the link rail to one column without horizontal overflow.

### Task 4: Verify user-visible behavior

**Files:**
- Test: browser flow against `http://127.0.0.1:5173/`

**Interfaces:**
- Confirms the final layout and anchor behavior without changing the existing section IDs.

- [ ] **Step 1: Run the production build**

Run:

```powershell
npm.cmd run build
```

Expected: Vite exits with code 0.

- [ ] **Step 2: Verify the About DOM**

Use a browser check to assert:

```js
document.querySelector('.about-image').getAttribute('src') === '/about-profile.png'
document.querySelectorAll('.about-overview-link').length === 3
document.querySelector('.about-contact-grid') === null
```

- [ ] **Step 3: Verify the three anchors**

Click each `.about-overview-link` and assert the URL hash becomes `#projects`, `#expertise`, and `#resume`.

- [ ] **Step 4: Verify responsive layout**

Check 1440px and 390px viewports for:

```js
document.documentElement.scrollWidth <= window.innerWidth
```

Expected: true at both widths.

- [ ] **Step 5: Check console errors**

Expected: no browser `console.error` or `pageerror` events during the verification flow.

