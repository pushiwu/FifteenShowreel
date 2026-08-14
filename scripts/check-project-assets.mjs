import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { projects } from "../src/data/projects.js";

const projectSource = readFileSync(
  resolve(process.cwd(), "src/sections/Projects.jsx"),
  "utf8"
);

const videoProjects = projects.filter((project) => project.video || project.videoSegments?.length);
const maxCloudflareAssetBytes = 25 * 1024 * 1024;
const publicRoot = resolve(process.cwd(), "public");

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
}

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
  projectSource.includes("videoSegments") && projectSource.includes("onEnded"),
  true,
  "Project modal must support sequential Cloudflare-safe video segments.",
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

  const videoAssets = project.videoSegments ?? [project.video];
  for (const videoAsset of videoAssets) {
    const videoPath = resolve(process.cwd(), "public", videoAsset.slice(1));
    assert.equal(existsSync(videoPath), true, `Missing video for ${project.title}: ${videoAsset}`);
    assert.equal(
      statSync(videoPath).size <= maxCloudflareAssetBytes,
      true,
      `Cloudflare Pages asset exceeds 25 MiB: ${videoAsset}`,
    );
  }
}

for (const assetPath of listFiles(publicRoot)) {
  assert.equal(
    statSync(assetPath).size <= maxCloudflareAssetBytes,
    true,
    `Cloudflare Pages asset exceeds 25 MiB: ${assetPath.slice(publicRoot.length + 1)}`,
  );
}

console.log(`Checked ${videoProjects.length} playable project assets.`);
