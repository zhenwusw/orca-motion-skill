// 把首页和示例打包成自包含的静态站。
//   node scripts/build-site.mjs [输出目录]     默认 site/
//
// 麻烦在于示例引的是跨仓库相对路径 ../../../orca-transition-skill/…
// （两个 skill 装在同一层目录才成立）。这里把那些文件收进 vendor/ 和 runtime/ 并改写路径。
// index.mp4 不上传 —— 卡片用的是压过的 preview.mp4。
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, process.argv[2] || "site");
const T = join(ROOT, "..", "orca-transition-skill");   // 同一层目录

const VENDOR = [
  [join(T, "node_modules/reveal.js/dist/reset.css"), "reset.css"],
  [join(T, "node_modules/reveal.js/dist/reveal.css"), "reveal.css"],
  [join(T, "node_modules/reveal.js/dist/reveal.js"), "reveal.js"],
  [join(T, "node_modules/gsap/dist/gsap.min.js"), "gsap.min.js"],
  [join(T, "runtime/engine.js"), "engine.js"],
];

// GA4 的 measurement ID 不是密钥 —— 它本来就明文出现在每个用 GA 的页面源码里。
// 构建（给线上用）默认带上，本地预览 npm run gallery 不设就不带。
const GA_ID = process.env.GA_ID ?? "G-HY0E7GFPHH";
execFileSync("node", [join(ROOT, "scripts/gallery.mjs")], { stdio: "inherit", env: { ...process.env, GA_ID } });

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "vendor"), { recursive: true });

for (const [src, to] of VENDOR) {
  if (!existsSync(src)) {
    console.error(`缺少 ${src}\n两个 skill 要放在同一层目录，且 orca-transition-skill 里跑过 npm install`);
    process.exit(1);
  }
  cpSync(src, join(OUT, "vendor", to));
}

cpSync(join(ROOT, "runtime"), join(OUT, "runtime"), { recursive: true });
cpSync(join(ROOT, "index.html"), join(OUT, "index.html"));

const listed = new Set([...readFileSync(join(ROOT, "index.html"), "utf8")
  .matchAll(/href="examples\/([^/"]+)\//g)].map((m) => m[1]));

for (const name of listed) {
  const to = join(OUT, "examples", name);
  cpSync(join(ROOT, "examples", name), to, {
    recursive: true,
    filter: (p) => !p.endsWith("index.mp4"),
  });
  const html = join(to, "index.html");
  writeFileSync(html, readFileSync(html, "utf8")
    // engine.js 要先换，否则会被下面那条通用的 runtime/ 规则吃掉
    .replace(/\.\.\/\.\.\/\.\.\/orca-transition-skill\/runtime\/engine\.js/g, "../../vendor/engine.js")
    .replace(/\.\.\/\.\.\/\.\.\/orca-transition-skill\/node_modules\/(reveal\.js|gsap)\/dist\//g, "../../vendor/")
    .replace(/\.\.\/\.\.\/node_modules\/gsap\/dist\//g, "../../vendor/")
    // tokens.css 和 themes/ 在两个仓库里是同步的同一份，指回本地这份
    .replace(/\.\.\/\.\.\/\.\.\/orca-transition-skill\/runtime\//g, "../../runtime/"));
}

// README 里 <img> 放不了 mp4，而 motion 的重点就是动，静态图等于白搭。
// 顺带产一份 GIF：前 6 秒、480 宽、12fps、64 色，README 引线上地址。
for (const name of listed) {
  const mp4 = join(ROOT, "examples", name, "index.mp4");
  if (!existsSync(mp4)) continue;
  execFileSync("ffmpeg", ["-v", "error", "-t", "6", "-i", mp4, "-vf",
    "fps=12,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer:bayer_scale=3",
    "-loop", "0", "-y", join(OUT, "examples", name, "preview.gif")]);
}

const size = (d) => readdirSync(d, { withFileTypes: true })
  .reduce((n, e) => n + (e.isDirectory() ? size(join(d, e.name)) : statSync(join(d, e.name)).size), 0);
console.log(`\n${OUT}  ${listed.size} 个场景，${(size(OUT) / 1048576).toFixed(1)} MB`);
// 只看真正的引用（href / src），注释里提到仓库名不算
const leftover = [...listed].filter((n) =>
  /(?:href|src)="[^"]*(?:orca-transition-skill|node_modules)/.test(
    readFileSync(join(OUT, "examples", n, "index.html"), "utf8")));
console.log("剩下的跨仓库引用（应为 0）：", leftover.join(" ") || "0");
