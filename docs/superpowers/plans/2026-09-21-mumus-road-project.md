# Mumu's Road Project Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 《木木的路》 as a bilingual, image-gallery project in the site's core portfolio and publish it through the existing production release workflow.

**Architecture:** Reuse the existing `projects.js` record shape and the current gallery modal. Convert the selected source stills into stable, numbered WebP assets; expose them through one gallery array and one `core` project record; protect the metadata and resource contract with the existing Node test suite.

**Tech Stack:** React 19, Vite 6, Node test runner, Pillow 12, Cloudflare Pages, GitHub Actions.

## Global Constraints

- Chinese title: `木木的路`.
- Temporary English title: `Mumu's Road`; replace directly if an official English title becomes available.
- Role: `摄影指导 / Director of Photography`.
- Institution: `武汉传媒学院 / Wuhan University of Communication`.
- Format: `实验短片 / Experimental Short Film`.
- Layer: `core`.
- Use exactly 12 selected images; do not invent a creative statement, year, credits, awards, or video URL.
- Preserve source framing and cap the longest image edge at 1920 pixels.
- Keep unrelated untracked files out of every commit.

---

### Task 1: Lock the project data contract with a failing test

**Files:**
- Modify: `scripts/test-project-data.mjs`
- Test: `scripts/test-project-data.mjs`

**Interfaces:**
- Consumes: exported `projects` array and existing `projectByTitle(title)` helper.
- Produces: a regression contract for the `木木的路` record and its 12 gallery assets.

- [ ] **Step 1: Add the failing test**

```js
test("木木的路作为核心组图项目展示完整双语资料", () => {
  const project = projectByTitle("木木的路");

  assert.ok(project, "Missing project: 木木的路");
  assert.equal(project.layer, "core");
  assert.equal(project.titleEn, "Mumu's Road");
  assert.equal(project.role, "摄影指导");
  assert.equal(project.roleEn, "Director of Photography");
  assert.equal(project.institution, "武汉传媒学院");
  assert.equal(project.institutionEn, "Wuhan University of Communication");
  assert.equal(project.format, "实验短片");
  assert.equal(project.formatEn, "Experimental Short Film");
  assert.equal(project.galleryImages.length, 12);
  assert.equal(project.image, "/projects/mumus-road/05.webp");

  for (const image of project.galleryImages) {
    assert.equal(
      existsSync(resolve(process.cwd(), "public", image.slice(1))),
      true,
      `Missing gallery image for 木木的路: ${image}`,
    );
  }
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm.cmd run test:data`

Expected: FAIL with `Missing project: 木木的路`.

---

### Task 2: Produce the optimized gallery assets

**Files:**
- Create: `public/projects/mumus-road/01.webp`
- Create: `public/projects/mumus-road/02.webp`
- Create: `public/projects/mumus-road/03.webp`
- Create: `public/projects/mumus-road/04.webp`
- Create: `public/projects/mumus-road/05.webp`
- Create: `public/projects/mumus-road/06.webp`
- Create: `public/projects/mumus-road/07.webp`
- Create: `public/projects/mumus-road/08.webp`
- Create: `public/projects/mumus-road/09.webp`
- Create: `public/projects/mumus-road/10.webp`
- Create: `public/projects/mumus-road/11.webp`
- Create: `public/projects/mumus-road/12.webp`

**Interfaces:**
- Consumes: the 12 approved source JPEG files listed below.
- Produces: numbered, orientation-preserving WebP images referenced by `mumusRoadGalleryImages`.

- [ ] **Step 1: Map the approved source images in narrative order**

```text
01 <- e89062f5cf8ea983cafb5f878dd48a45.jpg
02 <- e81ba6396e4f80ba1e3b0c9676cc1c8f.jpg
03 <- 7bfea58985414ffcc12e243ded576649.jpg
04 <- 3ea6f2d7d1604ac70150183cf076f17e.jpg
05 <- 4f7cbef145770428791fd07ba441c6c3.jpg
06 <- 3c3e33236b834cf62b5aac34634530f2.jpg
07 <- acbbec8eb080543f823477a7d6c12235.jpg
08 <- 556912a03338ba56293af9df5c875e77.jpg
09 <- 5a5b3c049b761b5951e5154b11363332.jpg
10 <- 63f4feb51905b460f6776f03400b1e9e.jpg
11 <- 12390989493acdc2a6173ac6f157c4c6.jpg
12 <- 172edcc571d3853438db451150d4c179.jpg
```

- [ ] **Step 2: Convert each JPEG with Pillow**

Use the bundled Python runtime and Pillow. Apply EXIF orientation, resize only when the longest edge exceeds 1920 pixels using Lanczos, convert to RGB, and save WebP with `quality=82`, `method=6`, and `optimize=True`. Do not crop or upscale.

- [ ] **Step 3: Validate the generated assets**

Run a Pillow inspection that asserts all 12 files are WebP, have a longest edge of at most 1920 pixels, and have positive dimensions. Then run `npm.cmd run test:assets`.

Expected: all 12 image assertions pass and the asset check exits with code 0.

---

### Task 3: Add the core project record

**Files:**
- Modify: `src/data/projects.js`
- Test: `scripts/test-project-data.mjs`

**Interfaces:**
- Consumes: `/projects/mumus-road/01.webp` through `/projects/mumus-road/12.webp`.
- Produces: `mumusRoadGalleryImages: string[]` and a `ProjectRecord`-shaped object in the exported `projects` array.

- [ ] **Step 1: Add the gallery list near the other gallery constants**

```js
const mumusRoadGalleryImages = Array.from(
  { length: 12 },
  (_, index) => `/projects/mumus-road/${String(index + 1).padStart(2, "0")}.webp`,
);
```

- [ ] **Step 2: Add the project after the existing leading core record**

```js
{
  id: 34,
  layer: "core",
  title: "木木的路",
  titleEn: "Mumu's Road",
  role: "摄影指导",
  roleEn: "Director of Photography",
  institution: "武汉传媒学院",
  institutionEn: "Wuhan University of Communication",
  format: "实验短片",
  formatEn: "Experimental Short Film",
  image: mumusRoadGalleryImages[4],
  galleryImages: mumusRoadGalleryImages,
},
```

- [ ] **Step 3: Run the focused tests**

Run: `npm.cmd run test:data`

Expected: PASS, including `木木的路作为核心组图项目展示完整双语资料`.

- [ ] **Step 4: Commit the tested project entry**

```powershell
git add -- scripts/test-project-data.mjs src/data/projects.js public/projects/mumus-road
git commit -m "feat: add Mumu's Road to core projects"
```

---

### Task 4: Record and verify the release candidate

**Files:**
- Modify: `RELEASE_NOTES.md`
- Verify: `src/sections/Projects.jsx`

**Interfaces:**
- Consumes: the completed project record and gallery assets.
- Produces: a documented, production-buildable release candidate.

- [ ] **Step 1: Add the maintenance record**

Add a dated section describing the new core project, its 12-image gallery, bilingual metadata, and optimized WebP delivery. Do not claim production success before the deployment finishes.

- [ ] **Step 2: Run automated verification**

Run independently:

```powershell
npm.cmd run test:data
npm.cmd run test:assets
npm.cmd run test:performance
npm.cmd run build
git diff --check
```

Expected: all tests and build pass; `git diff --check` reports no errors.

- [ ] **Step 3: Run browser QA**

Start the Vite development server on an available local port. At desktop and mobile viewport widths, verify:

- `木木的路 / Mumu's Road` appears in the Core tab.
- The card uses `05.webp` and keeps the subject visible.
- Metadata wraps without overlap.
- Opening the card shows all 12 images in order.
- Closing the modal returns focus and scrolling to the project list.

- [ ] **Step 4: Commit release documentation**

```powershell
git add -- RELEASE_NOTES.md
git commit -m "docs: record Mumu's Road portfolio update"
```

---

### Task 5: Publish and verify production

**Files:**
- Verify: `.github/workflows/deploy-cloudflare-pages.yml`
- Verify: `package.json`
- Verify: `RELEASE_NOTES.md`

**Interfaces:**
- Consumes: commits from Tasks 3 and 4.
- Produces: a successful Cloudflare Pages deployment and the automated patch-version writeback.

- [ ] **Step 1: Push `main`**

```powershell
git -c http.proxy=http://127.0.0.1:10808 -c https.proxy=http://127.0.0.1:10808 push origin main
```

- [ ] **Step 2: Wait for the matching GitHub Actions run**

Use the run whose `headSha` matches the content commit. Require every build, test, credential, Cloudflare deploy, and release persistence step to succeed.

- [ ] **Step 3: Synchronize the release commit**

Fetch `origin/main`, verify the generated commit increments `1.0.3` to `1.0.4`, then fast-forward the local branch without touching unrelated untracked files.

- [ ] **Step 4: Verify production content**

Fetch the live site with a cache-busting query, resolve the current Projects bundle, and confirm it contains `木木的路`, `Mumu's Road`, `Experimental Short Film`, and `/projects/mumus-road/05.webp`. Open the live page for visual confirmation.
