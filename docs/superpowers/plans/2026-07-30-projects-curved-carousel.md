# Projects Curved Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Projects section as a centered bilingual past-works carousel with a curved side-to-center arrangement and autoplay motion.

**Architecture:** Replace the current rail/detail layout with one self-contained carousel section that computes each project's position, scale, and opacity from its offset to the active index. Keep the project data source intact, but render it through a new curved presentation and a centered title stack.

**Tech Stack:** React, Vite, CSS, existing `TextReveal` / `DecryptedText` wrappers.

## Global Constraints

- Dark, premium, restrained visual language.
- PC-first layout with a max content width near 1700px.
- Bilingual Chinese/English copy for section labeling.
- Use the existing project image dataset from `src/data/projects.js`.
- Preserve the current app structure and keep the section independently testable in the browser.

---

### Task 1: Replace Projects layout logic

**Files:**
- Modify: `src/sections/Projects.jsx`
- Modify: `src/data/projects.js`

**Interfaces:**
- Consumes: `projects` array fields `id`, `title`, `role`, `institution`, `format`, `image`
- Produces: a centered carousel section with autoplay, hover pause, click-to-focus, and curved positioning

- [ ] **Step 1: Remove the rail/detail rendering and define active carousel index state**
- [ ] **Step 2: Render the active project and surrounding items from the active index**
- [ ] **Step 3: Keep click selection and autoplay pause behavior in the same section**
- [ ] **Step 4: Update visible text to bilingual "往期作品 / Past Works" naming**

### Task 2: Restyle the carousel section

**Files:**
- Modify: `src/sections/Projects.css`

**Interfaces:**
- Consumes: structure emitted by `src/sections/Projects.jsx`
- Produces: curved item layout, centered title, transparent editorial surface, and responsive fallback behavior

- [ ] **Step 1: Remove the current horizontal rail and detail card styling**
- [ ] **Step 2: Add transforms for arc placement, depth, and opacity**
- [ ] **Step 3: Add centered typography and motion states for hover and active items**
- [ ] **Step 4: Add responsive rules so the section remains legible on narrower screens**

### Task 3: Verify the section in the running app

**Files:**
- None

**Interfaces:**
- Consumes: the updated app running in the browser at `http://localhost:5173/`
- Produces: confirmed visual behavior and a production build that still passes

- [ ] **Step 1: Load the page in the browser and confirm the new arrangement**
- [ ] **Step 2: Check autoplay, hover pause, and click selection**
- [ ] **Step 3: Run a production build**
- [ ] **Step 4: Fix any layout or runtime issues found during verification**

