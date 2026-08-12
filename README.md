# Fifteen Pu Portfolio

当前维护入口是本目录。原始视频和历史预览图不放在 `public/`，以免 Vite 在构建时复制不需要的资源。

## Commands

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run test:assets
npm.cmd run build
npm.cmd run preview
```

## Asset Rules

- `public/` 只保留页面实际引用的静态资源和压缩视频。
- 项目卡片使用静态 `poster`，不会为缩略图创建隐藏 `<video>`。
- 原始视频位于上级 `03_项目素材/`，历史发布资源位于上级 `04_简历与备份/网站发布历史/`。

## Template Notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
