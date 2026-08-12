# Portfolio Projects Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the portfolio role copy, preserve the requested project categorization, verify every video poster, and present media-free projects as a fixed text-only group in the All Projects view.

**Architecture:** Keep project metadata in `src/data/projects.js`, keep the existing orbit carousel for visual projects, and render a separate fixed text-only list only when All Projects is selected. Add data-level assertions for categories, ordering, text-only constraints, and poster assets.

**Tech Stack:** React 19, Vite 6, CSS, Node test runner, PowerShell.

## Global Constraints

- Do not create hidden video elements to generate thumbnails.
- Every playable project must keep a real, existing static `poster`.
- Text-only projects must not receive fabricated image or video assets.
- Existing project media proportions and orbit card layout must not be squeezed or cropped.
- The fixed text-only group is shown only in All Projects and must not participate in the orbit carousel.

---

### Task 1: Update role copy and project data assertions

**Files:**
- Modify: `src/sections/Hero.jsx`
- Modify: `src/data/projects.js`
- Modify: `scripts/test-project-data.mjs`

**Interfaces:**
- `Hero` continues to render the role summary through the existing `TextReveal` component.
- `projects` continues to expose `layer`, `video`, `poster`, and media-free project metadata.

- [ ] **Step 1: Add failing assertions for requested categories and text-only order**

Add tests that assert:

```js
assert.equal(projectByTitle("一则死亡").layer, "core");
assert.equal(projectByTitle("远山不扰").layer, "core");
assert.equal(projectByTitle("比划").layer, "extended");

const allTextOnlyIds = projects
  .filter((project) => project.textOnly)
  .map((project) => project.id);
assert.deepEqual(allTextOnlyIds, [23, 24, 25, 26, 27]);
```

- [ ] **Step 2: Run the data test and confirm the new `textOnly` assertions fail**

Run:

```powershell
npm.cmd run test:data
```

Expected: FAIL because the existing five media-free projects do not yet expose an explicit `textOnly: true` marker.

- [ ] **Step 3: Add the explicit text-only marker and role copy**

Set `textOnly: true` on the five requested media-free projects and update the Hero role strings to:

```jsx
text={"\u6444\u5f71\u3001\u706f\u5149\u3001\u638c\u673a\u3001\u7b2c\u4e00\u6444\u5f71\u52a9\u7406\u3001\u6570\u5b57\u5f71\u50cf\u5de5\u7a0b\u5e08"}
```

```jsx
text="Cinematography, Gaffer, Camera Operator, 1st Assistant Camera, Digital Imaging Technician"
```

- [ ] **Step 4: Strengthen media-free validation**

Assert that every `textOnly` project has no `image`, `poster`, `video`, or `galleryImages`, and that the five requested projects are placed in the fixed order `[23, 24, 25, 26, 27]`.

- [ ] **Step 5: Run the data test and confirm it passes**

Run:

```powershell
npm.cmd run test:data
```

Expected: PASS.

### Task 2: Separate fixed text-only projects from the orbit carousel

**Files:**
- Modify: `src/sections/Projects.jsx`
- Modify: `src/sections/Projects.css`

**Interfaces:**
- `visibleProjects` remains the source for the existing orbit carousel and active detail panel.
- `textOnlyProjects` is derived from `projects` and is rendered only when `viewMode === "all"`.

- [ ] **Step 1: Add a structural test for the fixed group**

Extend `scripts/check-project-assets.mjs` to assert that `Projects.jsx` contains the `textOnlyProjects` derivation and a `projects-text-only` class, while still rejecting hidden video thumbnail creation.

- [ ] **Step 2: Run the asset check and confirm it fails before implementation**

Run:

```powershell
npm.cmd run test:assets
```

Expected: FAIL because the fixed text-only group does not yet exist.

- [ ] **Step 3: Derive the fixed text-only list**

In `Projects.jsx`, add:

```js
const textOnlyProjects = useMemo(
  () => projects.filter((project) => project.textOnly),
  []
);
```

Keep `visibleProjects` unchanged for `core`, `extended`, and `all` so existing counts and detail behavior remain stable.

- [ ] **Step 4: Render the fixed text-only group in All Projects**

After the existing project detail block, render the group only for `viewMode === "all"`:

```jsx
{viewMode === "all" ? (
  <div className="projects-text-only" aria-label="Text-only projects">
    <div className="projects-text-only-heading">
      <span>Text-only records / 文字履历</span>
      <small>Projects without available media</small>
    </div>
    <div className="projects-text-only-list">
      {textOnlyProjects.map((project) => (
        <button
          key={project.id}
          type="button"
          className="projects-text-only-item"
          onClick={() => setOpenedProjectId(project.id)}
        >
          ...
        </button>
      ))}
    </div>
  </div>
) : null}
```

Each fixed item must show the Chinese title, English title, role, and institution. Clicking it may open the existing empty project detail modal, but it must not alter the orbit active index.

- [ ] **Step 5: Add non-destructive layout rules**

Use a separate block with top margin and a four-column desktop grid, a two-column tablet grid, and a single-column mobile grid. Use `min-width: 0`, `overflow-wrap: anywhere`, and no fixed heights for text content. Keep the block in normal document flow so it increases the stage height instead of overlapping existing content.

- [ ] **Step 6: Run the asset check and build**

Run:

```powershell
npm.cmd run test:assets
npm.cmd run build
```

Expected: both commands pass.

### Task 3: Verify all poster files and final layout safeguards

**Files:**
- Modify: `scripts/check-project-assets.mjs`
- Modify: `scripts/test-project-data.mjs`

**Interfaces:**
- Asset checks use `projects.filter((project) => project.video)` and resolve poster paths under `public`.

- [ ] **Step 1: Verify every video has a poster and the file exists**

Keep assertions for:

```js
for (const project of projects.filter((item) => item.video)) {
  assert.ok(project.poster, `Missing poster: ${project.title}`);
  assert.equal(
    existsSync(resolve(process.cwd(), "public", project.poster.slice(1))),
    true,
    `Missing poster asset: ${project.title}`
  );
}
```

- [ ] **Step 2: Verify no component-side auto-frame regression**

Keep the assertion that `Projects.jsx` does not contain `document.createElement("video")`.

- [ ] **Step 3: Run the complete verification suite**

Run:

```powershell
npm.cmd run test:data
npm.cmd run test:assets
npm.cmd run test:interaction
npm.cmd run build
```

Expected: all commands pass, and the build output is generated successfully.

- [ ] **Step 4: Inspect the changed files and report remaining limits**

Confirm that only the role copy, explicit text-only metadata, fixed text-only rendering, styles, and validation scripts changed. Report that poster verification proves configured static poster files exist; it does not claim that a browser has decoded every video stream.
