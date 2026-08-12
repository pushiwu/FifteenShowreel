# Fifteen Pu Portfolio

> Canonical project directory: `U:\个人站制作\portfolio`
>
> This is the only maintained website source. Historical copies must not be used as development entrypoints.

## Start Development

```powershell
cd "U:\个人站制作\portfolio"
npm install
npm run dev
```

Open `http://localhost:5173/`.

## Build Check

```powershell
npm run build
```

## Current Project Notes

- React + Vite portfolio site.
- Main project carousel lives in `src/sections/Projects.jsx`.
- Project content and media paths live in `src/data/projects.js`.
- Project videos and thumbnails are stored in `public/projects/`.
- Video projects use pre-generated static posters stored in `public/projects/posters/`; the browser does not create hidden video elements for thumbnails.
- Clicking a playable project opens the full-screen player layer with a visible mobile-friendly back button.
- The landing page mounts a full-screen `MaskedHeading` showreel intro on every load, then removes it before normal page interaction begins.
- Video assets are stored with Git LFS in the GitHub archive.
