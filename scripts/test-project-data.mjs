import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { projects } from "../src/data/projects.js";

const projectByTitle = (title) => projects.find((project) => project.title === title);
const projectById = (id) => projects.find((project) => project.id === id);

test("requested projects keep their intended categories", () => {
  assert.equal(projectById(7)?.layer, "core");
  assert.equal(projectById(29)?.layer, "core");
  assert.equal(projectById(9)?.layer, "extended");
});

test("已确认的画廊项目拥有完整双语资料和可访问素材", () => {
  const expected = [
    ["问迹", 12],
    ["我将如何呼唤你", 5],
    ["麦苗生长", 20],
  ];

  for (const [title, galleryCount] of expected) {
    const project = projectByTitle(title);
    assert.ok(project, `Missing project: ${title}`);
    assert.equal(project.titleEn.length > 0, true, `Missing English title: ${title}`);
    assert.equal(project.roleEn.length > 0, true, `Missing English role: ${title}`);
    assert.equal(project.institutionEn.length > 0, true, `Missing English institution: ${title}`);
    assert.equal(project.formatEn.length > 0, true, `Missing English format: ${title}`);
    assert.equal(project.galleryImages.length, galleryCount, `Unexpected gallery count: ${title}`);

    for (const image of project.galleryImages) {
      assert.equal(
        existsSync(resolve(process.cwd(), "public", image.slice(1))),
        true,
        `Missing gallery image for ${title}: ${image}`
      );
    }
  }
});

test("文字资料项目不伪造媒体资源并仍可被全部项目展示", () => {
  const textOnlyTitles = [
    "异日伙伴",
    "silentceall",
    "湖南省益阳市南县检察院MV",
    "湖南省怀化市麻阳县2025文旅宣传片",
    "蜘蛛之丝",
    "悔纪春归",
  ];

  for (const title of textOnlyTitles) {
    const project = projectByTitle(title);
    assert.ok(project, `Missing text-only project: ${title}`);
    assert.equal(project.textOnly, true, `Missing textOnly marker: ${title}`);
    assert.equal(project.image, undefined, `Unexpected image for text-only project: ${title}`);
    assert.equal(project.video, undefined, `Unexpected video for text-only project: ${title}`);
    assert.equal(project.galleryImages, undefined, `Unexpected gallery for text-only project: ${title}`);
  }

  assert.deepEqual(
    projects.filter((project) => project.textOnly).map((project) => project.id),
    [23, 24, 25, 26, 27, 28]
  );
});

test("所有视频项目都声明静态 poster", () => {
  for (const project of projects.filter((item) => item.video)) {
    assert.ok(project.poster, `Missing poster: ${project.title}`);
    assert.equal(
      existsSync(resolve(process.cwd(), "public", project.poster.slice(1))),
      true,
      `Missing poster asset: ${project.title}`
    );
  }
});

test("创作阐述保持中英成对，媒体状态不冒充作品类型", () => {
  for (const project of projects) {
    if (project.note) {
      assert.ok(project.noteEn, `Missing English statement: ${project.title}`);
    }

    if (project.textOnly) {
      assert.notEqual(
        project.formatEn,
        "Text-Only Project",
        `Media availability is not a format: ${project.title}`,
      );
    }
  }
});
