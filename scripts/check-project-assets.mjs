import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { projects } from "../src/data/projects.js";

const projectSource = readFileSync(
  resolve(process.cwd(), "src/sections/Projects.jsx"),
  "utf8"
);

const videoProjects = projects.filter((project) => project.video);

assert.equal(
  projectSource.includes("document.createElement(\"video\")"),
  false,
  "Project cards must not create hidden video elements for thumbnails."
);

assert.equal(
  projectSource.includes("textOnlyProjects"),
  true,
  "All Projects must render a fixed text-only project group."
);

assert.equal(
  projectSource.includes("projects-text-only"),
  true,
  "Fixed text-only projects must use the dedicated layout."
);

assert.equal(
  videoProjects.some((project) => !project.poster),
  false,
  "Every playable project must define a static poster."
);

for (const project of videoProjects) {
  const posterPath = resolve(process.cwd(), "public", project.poster.slice(1));
  assert.equal(
    existsSync(posterPath),
    true,
    `Missing poster for ${project.title}: ${project.poster}`
  );
}

console.log(`Checked ${videoProjects.length} playable project assets.`);
