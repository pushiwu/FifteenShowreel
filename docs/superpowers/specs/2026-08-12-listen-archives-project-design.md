# 《请听档案说》项目接入设计

## 目标

在个人站点的“全部项目 / All”列表中新增《请听档案说》项目卡片。用户点击卡片后，沿用现有项目详情弹窗打开视频播放页面，并在卡片和播放页面中展示来自视频本身的真实静帧。

## 已确认信息

- 中文片名：请听档案说
- 英文片名：Listen to the Archives
- 分类：档案 / Archive
- 岗位：灯光师 / Gaffer
- 项目来源：商业项目 / Commercial Project
- 类型：公益微电影 / Public Service Short Film
- 不展示额外的机构字段
- 原始压缩视频：`03_项目素材/压缩/请听档案说.mp4`

## 方案

新增一条与现有 `projects` 数据结构一致的项目记录：

- 使用唯一项目 ID，`layer` 设置为 `archive`
- 使用双语字段 `title/titleEn`、`role/roleEn`、`institution/institutionEn`、`format/formatEn`
- 将视频复制到 `public/projects/listen-to-the-archives.mp4`
- 从该视频导出一张静帧到 `public/projects/posters/listen-to-the-archives.jpg`
- 同时将静帧作为项目的 `image` 和 `poster`，使卡片封面、弹窗封面和视频加载前画面保持一致

现有 `Projects.jsx` 已支持：

- `archive` 项目随 `All` 筛选出现
- 带 `video` 字段的项目显示播放提示
- 点击项目后通过 portal 打开全屏视频弹窗
- `Esc` 和返回按钮关闭弹窗
- 弹窗显示片名、岗位、项目来源和类型的中英文信息

因此不新增组件、不改变分类筛选、不改动其他项目数据，也不改变现有移动端布局。

## 数据流

1. 项目数据从 `src/data/projects.js` 导出。
2. `Projects.jsx` 根据 `viewMode` 过滤项目。
3. `All` 模式包含新增的 `archive` 项目。
4. 卡片使用 `poster` 作为缩略图。
5. 点击卡片设置 `openedProjectId`。
6. 弹窗使用同一条项目记录的 `video`、`poster` 和双语元数据。

## 静帧处理

静帧在开发环境中预先从压缩视频导出，而不是让浏览器在运行时等待视频加载后再截取。这样可以：

- 使用真实画面作为封面
- 避免不同浏览器对视频首帧加载时机的差异
- 保持卡片首屏渲染稳定
- 不增加运行时 canvas 或视频事件处理逻辑

导出完成后需要检查图片文件存在、可被浏览器读取，并在站点构建中通过静态资源检查。

## 验收标准

- 在“全部项目 / All”中可以看到《请听档案说》卡片。
- 卡片显示真实视频静帧，而不是 SVG 或纯色占位。
- 卡片显示中英文片名。
- 点击卡片后打开全屏播放页面。
- 播放页面显示视频控件并可播放 `请听档案说.mp4`。
- 播放页面显示以下双语信息：
  - 请听档案说 / Listen to the Archives
  - 灯光师 / Gaffer
  - 商业项目 / Commercial Project
  - 公益微电影 / Public Service Short Film
- 点击返回、点击遮罩或按 `Esc` 可以关闭播放页面。
- `npm.cmd run test:assets` 通过。
- `npm.cmd run build` 通过。

## 范围边界

本次不新增作品描述、不补充机构信息、不调整其他项目分类、不重做播放弹窗视觉、不修改视频内容，也不处理原始素材目录中的其他视频。

