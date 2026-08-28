# FifteenShowreel

蒲师武个人影像作品集，当前由 `main` 分支持续维护。网站以 React、Vite、GSAP 与 Canvas2D 构建，包含电影化 opening、滚动叙事、动态人物 ASCII 轮廓及项目视频播放页。历史上线基线保留为 `v1.0.0`，当前主线最新维护提交为 `a439094`。

## 本地运行

```powershell
npm.cmd install
npm.cmd run dev
```

默认开发地址由 Vite 输出。当前项目在 Windows 环境中建议使用 `npm.cmd`，避免 PowerShell 执行策略拦截 `npm.ps1`。

## 发布检查

```powershell
npm.cmd run test:data
npm.cmd run test:assets
npm.cmd run test:performance
npm.cmd run test:interaction
npm.cmd run test:orbit
npm.cmd run build
```

`test:assets` 会递归检查 `public/`，并阻止任何超过 Cloudflare Pages `25 MiB` 单文件上限的资源进入发布版本。

## 可选的 R2 + HLS 视频分发

网站默认继续使用现有 MP4；配置 `VITE_VIDEO_CDN_BASE_URL` 后，项目播放页会优先请求 R2 上的 HLS 播放清单，Safari 使用原生 HLS，其他浏览器按需加载 `hls.js`，不可用时自动回退 MP4。

```powershell
.\scripts\generate-hls.ps1 -ProjectSlug nian-nian
.\scripts\upload-hls-to-r2.ps1 -Bucket fifteen-showreel-video -InputRoot .\dist-hls -Prefix hls
```

R2 公开域名应允许网站来源执行 `GET` 和 `HEAD`，并为 `.m3u8` 设置 `application/vnd.apple.mpegurl`、为 `.m4s` 设置 `video/iso.segment`。构建 Pages 时设置：

```powershell
$env:VITE_VIDEO_CDN_BASE_URL = "https://media.example.com"
npm.cmd run build
```

未设置该环境变量时，页面不会请求 R2，也不会改变现有 MP4 播放行为。

## Cloudflare Pages

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`
- Production branch: `main`
- Node.js: `22.16.0`

媒体文件由 Git LFS 管理。Cloudflare 连接 GitHub 私有仓库时，需要确保 GitHub LFS 存储与下载流量仍有可用额度，否则构建阶段无法取回视频资源。

也可以在本地构建后使用 Wrangler 直接部署：

```powershell
npm.cmd run build
npx wrangler pages deploy dist --project-name fifteenshowreel
```

## 媒体规则

- 页面卡片只加载静态海报，不为缩略图创建隐藏视频。
- 长片使用低于 `25 MiB` 的连续 MP4 分段，播放器在片段结束时自动续播。
- 原始高码率素材不放入 `public/`，可逆归档位于项目目录外的 `.release-source-backup-v1`。
- `public/projects/web-video/` 是网站实际交付媒体，不应在发布前删除。

## 版本说明

完整更新内容见 [RELEASE_NOTES.md](./RELEASE_NOTES.md)，其中包含 `v1.0.0` 之后的逐提交维护记录。
