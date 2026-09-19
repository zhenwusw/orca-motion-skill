// 扫 examples/ 生成一个首页。
// 数据全部从稿子本身读出来，不另建元数据文件：
//   名字   ← <title> 的第一段
//   场景数 ← .mo-scene 的个数
//   预览   ← ffmpeg 把 index.mp4 压成循环播放的小视频
// motion 的内容是「场景里面怎么动」，静态缩略图看不出东西，所以卡片直接放视频。
// 用法：node scripts/gallery.mjs   （或 npm run dev）
// 环境变量 GA_ID 有值时，生成的页面会带上 Google Analytics 代码（本地预览不设就没有）。
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXAMPLES = join(ROOT, "examples");
const PAGE = join(ROOT, "index.html");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const run = (cmd, args) => {
  try { return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { return null; }
};
const hasFfmpeg = run("ffmpeg", ["-version"]) !== null;

function parseScene(name) {
  const dir = join(EXAMPLES, name);
  const htmlPath = join(dir, "index.html");
  if (!existsSync(htmlPath)) return null;
  const html = readFileSync(htmlPath, "utf8");

  const raw = (html.match(/<title>([\s\S]*?)<\/title>/) || [, name])[1];
  const title = raw.split("·")[0].trim() || name;
  const scenes = (html.match(/class="[^"]*mo-scene/g) || []).length;

  const mp4 = join(dir, "index.mp4");
  let preview = null;
  if (existsSync(mp4) && hasFfmpeg) {
    // 卡片上循环播的小视频：720 宽、无声、faststart，比原片小一个数量级
    const out = join(dir, "preview.mp4");
    const ok = run("ffmpeg", ["-v", "error", "-i", mp4, "-an",
      "-vf", "scale=720:-2", "-c:v", "libx264", "-crf", "30", "-preset", "veryfast",
      "-movflags", "+faststart", "-y", out]);
    if (ok !== null && existsSync(out)) preview = `examples/${name}/preview.mp4`;
  }
  return { name, title, scenes, preview, mtime: statSync(htmlPath).mtimeMs };
}

const scenes = readdirSync(EXAMPLES, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
  .map((d) => parseScene(d.name))
  .filter(Boolean)
  .sort((a, b) => b.mtime - a.mtime);

const card = (d) => `<article class="card">
  <a class="thumb play" data-name="${esc(d.name)}" href="examples/${esc(d.name)}/">
    ${d.preview
      ? `<video class="shot" src="${esc(d.preview)}" autoplay muted loop playsinline></video>`
      : `<div class="shot empty"><span>没有 index.mp4</span></div>`}
    <span class="hover"><span class="btn solid">打开</span></span>
  </a>
  <div class="body">
    <div class="row">
      <a class="name play" data-name="${esc(d.name)}" href="examples/${esc(d.name)}/">${esc(d.title)}</a>
      <span class="meta">${d.scenes > 1 ? `${d.scenes} 个场景` : "单场景"}</span>
    </div>
  </div>
</article>`;

const page = `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8">${process.env.GA_ID ? `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(process.env.GA_ID)}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${esc(process.env.GA_ID)}');
</script>` : ""}
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MG 动效场景 · orca-motion-skill</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=JetBrains+Mono:wght@400;500&family=Work+Sans:wght@400;500;600&display=swap">
<style>
:root{--bg:#0b0b0f;--card:#16161c;--line:#23232c;--text:#f5f5f7;--dim:#8e8e98;--faint:#6e6e78;--accent:#ff7a1a}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:"Work Sans","PingFang SC",sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:1440px;margin:0 auto;padding:60px}
header{display:block}
.eyebrow{margin:0;font-family:"JetBrains Mono",monospace;font-size:12px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
h1{margin:12px 0 0;font-family:"Bricolage Grotesque","PingFang SC",sans-serif;font-size:48px;font-weight:700;letter-spacing:-.02em;line-height:1.1}
hr{border:0;height:1px;background:#1f1f27;margin:28px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:24px}
.card{display:flex;flex-direction:column;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden}
.card:hover{border-color:var(--accent)}
.thumb{position:relative;display:block;aspect-ratio:16/9;background:#141419;text-decoration:none}
.shot{display:block;width:100%;height:100%;object-fit:cover}
.shot.empty{display:flex;align-items:center;justify-content:center;font-family:"JetBrains Mono",monospace;font-size:11px;color:#5e5e68}
.hover{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(11,11,15,.55);opacity:0;transition:opacity .15s}
.card:hover .hover,.thumb:focus-visible .hover{opacity:1}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:11px 18px;font-size:13.5px;font-weight:600;border-radius:7px}
.btn.solid{background:var(--accent);color:#0b0b0f}
.body{padding:16px 20px 18px}
.row{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.name{font-size:16px;font-weight:600;letter-spacing:-.01em;color:var(--text);text-decoration:none}
.name:hover{color:var(--accent)}
.meta{font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--faint);white-space:nowrap}
#viewer{padding:0;border:0;background:transparent;max-width:100vw;max-height:100vh}
#viewer::backdrop{background:rgba(6,6,9,.97);backdrop-filter:blur(6px)}
.vbox{display:flex;flex-direction:column;gap:10px;width:min(92vw,150vh)}
.vbar{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.vtitle{font-size:16px;font-weight:600}
.vhint{flex-grow:1;font-family:"JetBrains Mono",monospace;font-size:11px;color:var(--faint)}
.vopen{font-family:"JetBrains Mono",monospace;font-size:11px;color:var(--accent);text-decoration:none}
.vclose{min-height:36px;padding:8px 16px;background:var(--card);color:var(--text);border:1px solid var(--line);border-radius:7px;font-family:inherit;font-size:13px;cursor:pointer}
.vclose:hover{border-color:var(--accent);color:var(--accent)}
.vframe{width:100%;aspect-ratio:16/9;border:0;border-radius:10px;background:#000;display:block}
@media (max-width:640px){.wrap{padding:28px 20px}h1{font-size:34px}.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="wrap">
<header>
  <p class="eyebrow">orca-motion-skill</p>
  <h1>MG 动效场景</h1>
</header>
<hr>
<div class="grid">
${scenes.map(card).join("\n")}
</div>
</div>

<dialog id="viewer">
  <div class="vbox">
    <div class="vbar">
      <span class="vtitle"></span>
      <span class="vhint">场景自动播放 · Esc 关闭</span>
      <a class="vopen" href="#" target="_blank" rel="noopener">新标签页打开</a>
      <button class="vclose" type="button" aria-label="关闭">关闭</button>
    </div>
    <iframe class="vframe" title="播放" allow="fullscreen"></iframe>
  </div>
</dialog>

<script>
(() => {
  const dlg = document.getElementById("viewer");
  const frame = dlg.querySelector(".vframe");
  dlg.querySelector(".vclose").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", () => { frame.src = "about:blank"; });
  frame.addEventListener("load", () => {
    // 焦点在 iframe 里时父页面收不到按键，Esc 要从里面抢回来
    try {
      frame.contentDocument.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { e.preventDefault(); dlg.close(); }
      }, true);
      frame.contentWindow.focus();
    } catch (err) {}
  });
  document.querySelectorAll("a.play").forEach((a) => a.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const href = a.getAttribute("href");
    dlg.querySelector(".vtitle").textContent = a.dataset.name;
    dlg.querySelector(".vopen").href = href;
    frame.src = href;
    dlg.showModal();
  }));
})();
</script>
</body>
</html>
`;

writeFileSync(PAGE, page);
console.log(`index.html  ${scenes.length} 个场景，${scenes.filter((s) => s.preview).length} 段预览`);
if (!hasFfmpeg) console.log("没找到 ffmpeg：预览视频跳过");
