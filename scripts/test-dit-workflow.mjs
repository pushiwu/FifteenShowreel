import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const expertiseSource = readFileSync(path.join(root, "src/sections/Expertise.jsx"), "utf8");
const workflowSource = readFileSync(path.join(root, "src/components/DitWorkflow.jsx"), "utf8");
const workflowCss = readFileSync(path.join(root, "src/components/DitWorkflow.css"), "utf8");

test("数字影像工程师卡片提供可访问的工作流入口", () => {
  assert.match(expertiseSource, /DitWorkflow/);
  assert.match(expertiseSource, /Digital Imaging Technician/);
  assert.match(workflowSource, /查看工作流/);
});

test("DIT工作流覆盖现场、后期交接和完成交付三段", () => {
  for (const label of ["ON SET", "EDITORIAL HANDOFF", "FINISHING"]) {
    assert.match(workflowSource, new RegExp(label));
  }
  for (const label of ["素材安全", "后期交接", "色彩管理", "最终质检", "恢复测试"]) {
    assert.match(workflowSource, new RegExp(label));
  }
});

test("DIT工作流面板支持键盘关闭、PDF下载和移动端纵向布局", () => {
  assert.match(workflowSource, /role="dialog"/);
  assert.match(workflowSource, /Escape/);
  assert.match(workflowSource, /DIT工作流一览\.pdf/);
  assert.match(workflowCss, /@media \(max-width: 760px\)/);
  assert.match(workflowCss, /workflow-timeline/);
});
