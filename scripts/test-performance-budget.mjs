import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { projects } from "../src/data/projects.js";

const root = path.resolve(import.meta.dirname, "..");
const publicRoot = path.join(root, "public");

const resolvePublicAsset = (assetPath) =>
  path.join(publicRoot, decodeURIComponent(assetPath.replace(/^\//, "")));

const assertAssetBudget = (assetPath, maxBytes) => {
  const absolutePath = resolvePublicAsset(assetPath);
  assert.equal(existsSync(absolutePath), true, `${assetPath} should exist`);
  assert.ok(
    statSync(absolutePath).size <= maxBytes,
    `${assetPath} exceeds ${(maxBytes / 1024 / 1024).toFixed(1)} MB`,
  );
};

test("首屏使用为网页交付压缩的 showreel", () => {
  const appSource = readFileSync(path.join(root, "src/App.jsx"), "utf8");
  const heroSource = readFileSync(path.join(root, "src/sections/Hero.jsx"), "utf8");
  const introSource = readFileSync(
    path.join(root, "src/components/IntroOverlay.jsx"),
    "utf8",
  );

  assertAssetBudget("/projects/showreel-intro.mp4", 5 * 1024 * 1024);
  assertAssetBudget("/projects/showreel-web.mp4", 48 * 1024 * 1024);
  assert.match(heroSource, /\/projects\/showreel-web\.mp4/);
  assert.match(introSource, /\/projects\/showreel-intro\.mp4/);
  assert.doesNotMatch(heroSource, /\/projects\/showreel\.mp4/);
  assert.doesNotMatch(introSource, /\/projects\/showreel\.mp4/);
  assert.doesNotMatch(
    appSource,
    /\{introComplete\s*&&\s*\(\s*<>\s*<Nav/,
  );
  assert.match(
    appSource,
    /lazy\(\(\) => import\(['"]\.\/sections\/Projects['"]\)\)/,
  );
});

test("人物图与所有作品卡片使用轻量网页资源", () => {
  const aboutSource = readFileSync(path.join(root, "src/sections/About.jsx"), "utf8");
  assert.match(aboutSource, /\/about-profile\.webp/);
  assertAssetBudget("/about-profile.webp", 1.5 * 1024 * 1024);

  const visualProjects = projects.filter((project) => !project.textOnly);
  assert.ok(visualProjects.length > 0);
  visualProjects.forEach((project) => {
    assert.ok(project.thumbnail, `${project.title} should declare a thumbnail`);
    assertAssetBudget(project.thumbnail, 400 * 1024);
  });
});

test("About portrait uses cached Canvas2D rendering with a safe image fallback", () => {
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
  assert.match(componentSource, /shouldRunPortraitAnimation/);
  assert.doesNotMatch(componentSource, /WebGL|three|pixi/i);
});

test("About integrates the ASCII portrait without replacing its accessible fallback", () => {
  const aboutSource = readFileSync(path.join(root, "src/sections/About.jsx"), "utf8");

  assert.match(
    aboutSource,
    /import AsciiPortrait from "\.\.\/components\/AsciiPortrait"/,
  );
  assert.match(aboutSource, /<AsciiPortrait/);
  assert.doesNotMatch(aboutSource, /<img[\s\S]*className="about-image"/);
});

test("诗项目画廊不再直接加载 25 MB 原始 PNG", () => {
  const poem = projects.find((project) => project.id === 15);
  assert.ok(poem?.galleryImages?.length > 0);
  poem.galleryImages.forEach((assetPath) => {
    assert.match(assetPath, /\/projects\/poem\/web\//);
    assertAssetBudget(assetPath, 650 * 1024);
  });
});

test("字体样式从文档头预连接加载而不是 CSS 阻塞导入", () => {
  const html = readFileSync(path.join(root, "index.html"), "utf8");
  const globalCss = readFileSync(path.join(root, "src/styles/global.css"), "utf8");

  assert.doesNotMatch(globalCss, /@import\s+url\([^)]*fonts\.googleapis\.com/);
  assert.match(html, /rel="preconnect" href="https:\/\/fonts\.googleapis\.com"/);
  assert.match(html, /fonts\.googleapis\.com\/css2\?/);
});
