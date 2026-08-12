# 问迹静帧画廊 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the bilingual “问迹 / Tracing Questions” still-image project with a random cover and a responsive full-screen gallery.

**Architecture:** Keep the existing React/Vite project data flow. Copy the 12 source stills into `public/projects/wenji/`, extend the existing project record with `galleryImages`, choose one gallery image once per module load for the card image, and reuse the existing full-screen modal branch with focused CSS layout rules.

**Tech Stack:** React 19, Vite 6, plain CSS, existing asset validation script.

## Global Constraints

- Project information must read `问迹 / Tracing Questions`, `导演 / Director`, and `剧情短片 / Narrative Short Film`.
- The card cover must be selected randomly from the 12 supplied stills and remain stable until the page is reloaded.
- The full-screen layer must show all 12 stills without changing the behavior of video projects.
- Asset filenames under `public/projects/wenji/` must use ASCII names `wenji-01.jpg` through `wenji-12.jpg`.
- No new runtime dependency or route is required.
- Validation commands are `npm.cmd run test:assets` and `npm.cmd run build`.

---

### Task 1: Copy And Verify Wenji Assets

**Files:**
- Create: `public/projects/wenji/wenji-01.jpg` through `public/projects/wenji/wenji-12.jpg`
- Read: `U:\个人站制作\03_项目素材\C_履历池\问迹\静帧 2025-11-30 182513_1.5.1.jpg`
- Read: `U:\个人站制作\03_项目素材\C_履历池\问迹\静帧 2025-11-30 182513_1.6.1.jpg`
- Read: `U:\个人站制作\03_项目素材\C_履历池\问迹\静帧 2025-11-30 182513_1.7.1.jpg`
- Read: `U:\个人站制作\03_项目素材\C_履历池\问迹\静帧 2025-11-30 182513_1.10.1.jpg`
- Read: `U:\个人站制作\03_项目素材\C_履历池\问迹\静帧 2025-11-30 182513_1.19.1.jpg`
- Read: `U:\个人站制作\03_项目素材\C_履历池\问迹\静帧 2025-11-30 182513_1.30.1.jpg`
- Read: `U:\个人站制作\03_项目素材\C_履历池\问迹\静帧 2025-11-30 182513_1.31.1.jpg`
- Read: `U:\个人站制作\03_项目素材\C_履历池\问迹\静帧 2025-11-30 182513_1.33.1.jpg`
- Read: `U:\个人站制作\03_项目素材\C_履历池\问迹\静帧 2025-11-30 182513_1.36.1.jpg`
- Read: `U:\个人站制作\03_项目素材\C_履历池\问迹\静帧 2025-11-30 182513_1.39.1.jpg`
- Read: `U:\个人站制作\03_项目素材\C_履历池\问迹\静帧 2025-11-30 182513_2.1.1.jpg`
- Read: `U:\个人站制作\03_项目素材\C_履历池\问迹\静帧 2025-11-30 182513_1.40.1.jpg`

- [ ] Copy the 12 supplied images in the order listed above to `public/projects/wenji/wenji-01.jpg` through `wenji-12.jpg`.
- [ ] Verify that exactly 12 files exist and each file is a readable JPEG.
- [ ] Run `npm.cmd run test:assets` after the project data is updated in Task 2.

### Task 2: Update Project Data

**Files:**
- Modify: `src/data/projects.js` in the existing project record with `id: 4`

**Interfaces:**
- Produces a project object with `galleryImages: string[]`, `image: string`, bilingual `title`, `role`, `format`, and existing `layer: "archive"`.

- [ ] Replace the current “问迹” role and format values with `导演`, `Director`, `剧情短片`, and `Narrative Short Film`.
- [ ] Define `galleryImages` with the exact ordered paths `/projects/wenji/wenji-01.jpg` through `/projects/wenji/wenji-12.jpg`.
- [ ] Set `image` to a random element of `galleryImages` once when the module initializes, using `Math.floor(Math.random() * galleryImages.length)`.
- [ ] Keep the project in the archive category and preserve the existing project id.
- [ ] Run `npm.cmd run test:assets` and confirm the asset checker accepts all referenced files.

### Task 3: Refine The Wenji Gallery Layout

**Files:**
- Modify: `src/sections/Projects.css` in the `.projects-modal-gallery-item` layout rules
- Read: `src/sections/Projects.jsx` existing `galleryImages` rendering branch

**Interfaces:**
- Consumes the existing `galleryImages` array and the `item-N` class names emitted by `Projects.jsx`.
- Produces a desktop editorial grid and a narrow-screen layout without changing modal open/close behavior.

- [ ] Make the first image the dominant visual with a wide two-row span.
- [ ] Use varied spans for images 2 through 5 so the first viewport reads as a composed sequence rather than a uniform tile grid.
- [ ] Keep images 6 through 12 in smaller supporting tiles while preserving a minimum readable height.
- [ ] Add a narrow-screen override that removes the desktop spans and uses one or two columns with no horizontal overflow.
- [ ] Verify the existing video and single-image modal selectors remain unchanged.

### Task 4: Verify Behavior And Build

**Files:**
- Read: `src/sections/Projects.jsx`
- Read: `src/data/projects.js`
- Read: `src/sections/Projects.css`

- [ ] Run `npm.cmd run test:assets`.
- [ ] Run `npm.cmd run build`.
- [ ] Start the site with `npm.cmd run dev -- --host 127.0.0.1` and inspect the Projects section.
- [ ] Confirm “问迹” appears in the All/Archive-visible project set, its cover is one of the 12 stills, and clicking it opens all 12 images.
- [ ] Confirm the bilingual metadata is visible in the modal and `Escape` closes it.
- [ ] Check a narrow viewport for overflow and readable image stacking.
