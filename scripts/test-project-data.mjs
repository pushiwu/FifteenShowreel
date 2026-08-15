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
  assert.equal(projectByTitle("远山不扰")?.role, "制片 / 数字影像工程师");
  assert.equal(projectByTitle("远山不扰")?.roleEn, "Producer / Digital Imaging Technician");
  assert.equal(projectByTitle("远山不扰")?.institution, "湖南城市学院");
  assert.equal(projectByTitle("远山不扰")?.institutionEn, "Hunan City University");
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
    "信",
  ];

  for (const title of textOnlyTitles) {
    const project = projectByTitle(title);
    assert.ok(project, `Missing text-only project: ${title}`);
    assert.equal(project.textOnly, true, `Missing textOnly marker: ${title}`);
    assert.equal(project.image, undefined, `Unexpected image for text-only project: ${title}`);
    assert.equal(project.video, undefined, `Unexpected video for text-only project: ${title}`);
    assert.equal(project.galleryImages, undefined, `Unexpected gallery for text-only project: ${title}`);
  }

  const letter = projectByTitle("信");
  assert.equal(letter.titleEn, "Letter");
  assert.equal(letter.role, "灯光助理");
  assert.equal(letter.roleEn, "Lighting Assistant");
  assert.equal(letter.institution, "伦敦艺术学院");
  assert.equal(letter.institutionEn, "London College of Arts");
  assert.equal(letter.format, undefined);
  assert.equal(letter.formatEn, undefined);

  assert.deepEqual(
    projects.filter((project) => project.textOnly).map((project) => project.id),
    [23, 24, 25, 26, 27, 33]
  );
});

test("新增视频项目拥有完整双语资料并从全部项目进入播放弹窗", () => {
  const expected = [
    {
      title: "悔纪春归",
      titleEn: "Spring Returns, Regrets Remain",
      role: "第二摄影助理",
      roleEn: "2nd Assistant Camera",
      institution: "武汉传媒学院",
      institutionEn: "Wuhan University of Communication",
      format: "短片电影",
      formatEn: "Short Film",
    },
    {
      title: "念念",
      titleEn: "Lingering Thoughts",
      role: "灯光助理",
      roleEn: "Lighting Assistant",
      institution: "上海戏剧学院",
      institutionEn: "Shanghai Theatre Academy",
      format: "短片电影",
      formatEn: "Short Film",
    },
    {
      title: "情绪封装器",
      titleEn: "Emotion Encapsulator",
      role: "导演 / 编剧",
      roleEn: "Director / Screenwriter",
      institution: "湖南应用技术学院",
      institutionEn: "Hunan Applied Technology University",
      format: "微电影广告",
      formatEn: "Microfilm Advertisement",
    },
    {
      title: "逐光",
      titleEn: "Chasing Light",
      role: "摄影",
      roleEn: "Cinematographer",
      institution: "商业项目",
      institutionEn: "Commercial Project",
      format: "微电影公益广告",
      formatEn: "Public Service Microfilm",
    },
  ];

  for (const metadata of expected) {
    const project = projectByTitle(metadata.title);
    assert.ok(project, `Missing project: ${metadata.title}`);
    assert.equal(project.layer, "archive", `New project must appear in All: ${metadata.title}`);
    assert.equal(project.textOnly, undefined, `Playable project cannot be text-only: ${metadata.title}`);
    for (const [key, value] of Object.entries(metadata)) {
      assert.equal(project[key], value, `Unexpected ${key}: ${metadata.title}`);
    }
    assert.ok(project.video || project.videoSegments?.length, `Missing video: ${metadata.title}`);
    assert.ok(project.poster, `Missing poster: ${metadata.title}`);
  }
});

test("麦苗生长使用用户指定海报作为卡片展示图", () => {
  const project = projectByTitle("麦苗生长");
  assert.equal(project.image, "/projects/mai-miao-growth/poster.webp");
  assert.equal(project.poster, "/projects/mai-miao-growth/poster.webp");
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

