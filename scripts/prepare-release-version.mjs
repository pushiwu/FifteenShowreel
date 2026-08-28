import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

function bumpPatch(version) {
  const match = String(version).match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error(`Unsupported package version: ${version}`);
  return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
}

const packageJson = await readJson("package.json");
const packageLock = await readJson("package-lock.json");
const version = bumpPatch(packageJson.version);
const commit = process.env.RELEASE_COMMIT?.slice(0, 7) || execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
const date = new Date().toISOString().slice(0, 10);

packageJson.version = version;
packageLock.version = version;
if (packageLock.packages?.[""]) packageLock.packages[""].version = version;

await writeFile("package.json", `${JSON.stringify(packageJson, null, 2)}\n`);
await writeFile("package-lock.json", `${JSON.stringify(packageLock, null, 2)}\n`);

const releaseNotes = await readFile("RELEASE_NOTES.md", "utf8");
const entry = `## 自动发布 v${version}\n\n- 发布触发提交：\`${commit}\`\n- 发布日期：${date}\n- 本版本仅在 Cloudflare Pages 生产部署成功后写回主分支。\n\n`;
await writeFile("RELEASE_NOTES.md", releaseNotes.replace(/^\s*/, "").replace(/^(# [^\n]+\n\n)/, `$1${entry}`));

console.log(`Prepared release v${version} for ${commit}`);
