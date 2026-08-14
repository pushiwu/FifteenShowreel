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
  const introCss = readFileSync(
    path.join(root, "src/components/IntroOverlay.css"),
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
  assert.match(appSource, /heroHandoff/);
  assert.match(appSource, /onHandoffStart/);
  assert.match(appSource, /<Hero active=\{heroHandoff\}/);
  assert.match(introSource, /INTRO_DURATION = 4\.5/);
  assert.match(introSource, /intro-overlay__curtain--top/);
  assert.match(introSource, /intro-overlay__curtain--bottom/);
  assert.match(introSource, /scaleX: 0\.58/);
  assert.match(introSource, /setTimeout\(finish/);
  assert.doesNotMatch(introSource, /gsap\.matchMedia/);
  assert.doesNotMatch(introSource, /gsap\.to\(overlay,\s*\{\s*autoAlpha: 0/);
  assert.match(introCss, /intro-overlay__curtain/);
  assert.match(heroSource, /data-motion="hero-title"/);
  assert.match(heroSource, /heroHandoff/);
  assert.doesNotMatch(heroSource, /animateOn="view"/);
  assert.match(
    appSource,
    /lazy\(\(\) => import\(['"]\.\/sections\/Projects['"]\)\)/,
  );
});

test("人物图与所有作品卡片使用轻量网页资源", () => {
  const aboutSource = readFileSync(path.join(root, "src/sections/About.jsx"), "utf8");
  assert.match(aboutSource, /\/about-profile-cutout\.webp/);
  assertAssetBudget("/about-profile-cutout.webp", 1.5 * 1024 * 1024);

  const visualProjects = projects.filter((project) => !project.textOnly);
  assert.ok(visualProjects.length > 0);
  visualProjects.forEach((project) => {
    assert.ok(project.thumbnail, `${project.title} should declare a thumbnail`);
    assertAssetBudget(project.thumbnail, 400 * 1024);
    if (project.poster) assertAssetBudget(project.poster, 4 * 1024 * 1024);
  });
});

test("About portrait uses cached Canvas2D rendering with a safe image fallback", () => {
  const componentSource = readFileSync(
    path.join(root, "src/components/AsciiPortrait.jsx"),
    "utf8",
  );
  const rendererSource = readFileSync(
    path.join(root, "src/components/asciiPortraitRenderer.js"),
    "utf8",
  );

  assert.match(componentSource, /getContext\("2d"/);
  assert.match(componentSource, /ResizeObserver/);
  assert.match(componentSource, /IntersectionObserver/);
  assert.match(componentSource, /visibilitychange/);
  assert.match(componentSource, /prefers-reduced-motion: reduce/);
  assert.match(rendererSource, /getImageData/);
  assert.match(componentSource, /requestAnimationFrame/);
  assert.match(componentSource, /shouldRunPortraitAnimation/);
  assert.match(componentSource, /lastBuiltWidth/);
  assert.match(componentSource, /lastBuiltHeight/);
  assert.match(componentSource, /width === lastBuiltWidth && height === lastBuiltHeight/);
  assert.match(componentSource, /CUSTOM_ASCII_DEFAULTS/);
  assert.match(componentSource, /normalizeAsciiConfig/);
  assert.match(componentSource, /createPortraitRenderer/);
  assert.match(rendererSource, /renderPrimitive/);
  assert.match(rendererSource, /case "braille"/);
  assert.match(rendererSource, /drawBraille/);
  assert.match(rendererSource, /applyColorAdjustments/);
  assert.match(rendererSource, /drawPostEffects/);
  assert.match(rendererSource, /scanLines/);
  assert.match(rendererSource, /vignette/);
  assert.match(rendererSource, /bloom/);
  assert.match(rendererSource, /chromatic/);
  assert.match(rendererSource, /filmGrain/);
  assert.match(rendererSource, /glitch/);
  assert.match(rendererSource, /halftone/);
  assert.match(rendererSource, /pixelate/);
  assert.match(rendererSource, /filmDust/);
  assert.match(rendererSource, /drawLights/);
  assert.match(rendererSource, /revealMask/);
  assert.match(rendererSource, /maskPixels\[index \+ 3\] = Math\.round\(luminance \* alpha\)/);
  assert.match(rendererSource, /matrixState/);
  assert.doesNotMatch(`${componentSource}\n${rendererSource}`, /WebGL|three|pixi/i);
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

test("Contact exposes the supplied Xiaohongshu link and WeChat QR asset", () => {
  const contactSource = readFileSync(path.join(root, "src/sections/Contact.jsx"), "utf8");

  assert.match(contactSource, /https:\/\/xhslink\.cn\/m\/8BjFMwU35im/);
  assert.match(contactSource, /contact-wechat-qr\.jpg/);
  assert.match(contactSource, /noopener noreferrer/);
  assertAssetBudget("/contact-wechat-qr.jpg", 200 * 1024);
});

test("主要内容模块使用标题优先的电影化动效标记", () => {
  const aboutSource = readFileSync(path.join(root, "src/sections/About.jsx"), "utf8");
  const projectsSource = readFileSync(path.join(root, "src/sections/Projects.jsx"), "utf8");
  const expertiseSource = readFileSync(path.join(root, "src/sections/Expertise.jsx"), "utf8");
  const resumeSource = readFileSync(path.join(root, "src/sections/Resume.jsx"), "utf8");
  const contactSource = readFileSync(path.join(root, "src/sections/Contact.jsx"), "utf8");

  for (const source of [aboutSource, projectsSource, expertiseSource, resumeSource]) {
    assert.match(source, /data-motion="title"/);
    assert.match(source, /data-motion="heading"/);
  }
  assert.match(aboutSource, /data-motion="media"/);
  assert.match(projectsSource, /data-motion-scope="projects-orbit"/);
  assert.match(projectsSource, /data-motion-scope="projects-detail"/);
  assert.doesNotMatch(projectsSource, /parallaxSelector=.*projects-orbit-item/);
  assert.match(contactSource, /once: true/);
  assert.match(contactSource, /contact-giant__text/);
  assert.doesNotMatch(contactSource, /content\.children[\s\S]*scrub:/);
});
