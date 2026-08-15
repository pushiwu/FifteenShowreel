# R2 HLS 视频分发实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为作品集增加 R2 + HLS 自适应视频分发能力，降低长 MP4 在手机端的首段等待，同时保留现有 MP4 回退。

**Architecture:** 页面继续部署在 Cloudflare Pages；视频由脚本转为 HLS 播放清单和短分片并上传到 Cloudflare R2。浏览器端优先使用 R2 的 `.m3u8`，Safari 走原生 HLS，其他浏览器按需加载 `hls.js`，未配置 R2 地址时继续使用现有 MP4。

**Tech Stack:** React 19, Vite, hls.js, FFmpeg, Wrangler R2。

## Global Constraints

- 不把 R2 凭据写入仓库或前端代码。
- 未配置 `VITE_VIDEO_CDN_BASE_URL` 时，现有 MP4 播放行为必须保持不变。
- HLS 分片使用 6 秒左右的短片段，播放清单和分片设置长期缓存。
- 首次改动必须有失败测试，再写实现。

---

### Task 1: 播放器配置契约

**Files:**
- Create: `src/utils/videoDelivery.js`
- Test: `scripts/test-video-delivery.mjs`

- [ ] 写测试：验证 HLS URL 拼接、空配置回退 MP4、Safari 原生能力判断。
- [ ] 运行 `node --test scripts/test-video-delivery.mjs`，确认测试失败。
- [ ] 实现 `getVideoDeliveryConfig()`、`getHlsUrl()` 和 `supportsNativeHls()`。
- [ ] 运行测试并确认通过。

### Task 2: 项目播放器接入 HLS

**Files:**
- Modify: `src/sections/Projects.jsx`
- Modify: `package.json`
- Modify: `package-lock.json`
- Test: `scripts/test-performance-budget.mjs`

- [ ] 写测试：播放器源码包含 HLS 分支、`hls.js` 动态加载、MP4 回退和销毁释放逻辑。
- [ ] 安装 `hls.js`。
- [ ] 在视频弹窗中优先读取项目 slug 对应的 HLS 播放清单；Safari 原生加载，其他浏览器动态加载 `hls.js`。
- [ ] 保留现有 MP4 `src` 回退和 Safari 媒体释放逻辑。
- [ ] 运行性能测试和构建。

### Task 3: HLS 生成与 R2 上传工具

**Files:**
- Create: `scripts/generate-hls.ps1`
- Create: `scripts/upload-hls-to-r2.ps1`
- Modify: `README.md`
- Modify: `public/_headers`

- [ ] 生成脚本把指定项目 MP4 转成 6 秒 HLS 分片、独立播放清单和 `master.m3u8`。
- [ ] 上传脚本只接受本地目录、R2 桶名和公开 CDN 前缀参数，不读取或打印密钥。
- [ ] 为 HLS 播放清单、分片和跨域访问补充缓存/CORS 说明。
- [ ] 用一个项目执行本地生成校验，确认 `.m3u8` 与 `.ts` 文件存在。

### Task 4: 验证与发布

**Files:**
- Modify: `RELEASE_NOTES.md`

- [ ] 运行 `test:data`、`test:assets`、`test:performance`、`build`。
- [ ] 在未配置 R2 地址的环境确认 MP4 回退不变。
- [ ] 配置 R2 后上传一条样片并用线上页面验证 HLS 播放。
- [ ] 提交代码并部署 Pages；记录 R2 桶名、公开 CDN 前缀和回退策略，但不记录凭据。
