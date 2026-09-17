---
name: orca-motion-skill
description: 把产品、数据抽象成几种简单图形（格子、横条、卡片、线），做场景内部的 MG 动画：成片元素依次亮起、列表行标色收拢、折线画出、扫描线、镜头推近、卡片弹出、点阵拼字、数字滚动、可变字体标题波浪、打字机。逐帧可录成视频。和 orca-transition-skill 分工：本 skill 管一个场景里面怎么动，那个 skill 管场景和场景之间怎么接。用于「做个产品动效 / MG 动画 / 标题开场动画 / 文字动效 / 苹果发布会那样的产品介绍动画 / 数据可视化动效 / 把这个功能做成动画演示」这类请求。
---

# orca-motion-skill

把一个产品讲成一段 MG 动画。**成品是若干个场景**，每个场景是一段能逐帧 seek 的时间线；
场景之间怎么衔接交给 orca-transition-skill。

## 分工

| | orca-motion-skill（本 skill） | orca-transition-skill |
| --- | --- | --- |
| 管什么 | 一个场景**里面**：图形怎么生成、按什么顺序动 | 场景**之间**：上一个场景怎么变成下一个 |
| 写在哪 | `<div class="mo-scene">` + `OrcaMotion.scene(...)` | `<section data-st="…">` |
| 典型动作 | 格子依次亮起、卡片弹出、拼字、数字滚动、场景内镜头推近 | 放大进元素内部、整页推近、形态变换、遮挡剪辑 |

两个 skill 要装在同一层目录下（比如 `~/.claude/skills/orca-motion-skill` 和 `~/.claude/skills/orca-transition-skill`）。

## 流程（按顺序，不许跳）

0. **装依赖**：本 skill 根目录下没有 `node_modules/` 时，先在根目录跑 `npm install`。
1. **读原则**：`references/principles.md`。主角是文字本身（标题开场、金句）时，再读 `references/kinetic-type.md`。
2. **找主角和抽象**：写出这段片子的**一个**主角（一段被空出来的时间、一笔省下的钱），
   它用什么颜色（主题的 `--accent`，整片只给它用），产品里的东西抽象成哪几种图形（最多 4 种）。
3. **写场景计划**：每个场景一行：这个场景里主角发生了什么（一个场景只讲一件事）。
   再写场景之间的转场计划（按 orca-transition-skill 的 `transitions.md` 选手法）。计划写成 HTML 注释放进文件。
4. **写场景**：读 `references/api.md`，每个场景一段 `OrcaMotion.scene(...)`，数据写在场景里的 JSON。
   单个场景先用 `templates/scene-starter.html` 单独预览、录制（填好的样子见 `examples/scene-preview/`），动作对了再往下。
5. **连成片子**：读 `references/integration.md`，把场景放进 orca-transition-skill 的演示稿，一个场景一页。
6. **录制并看视频**：
   ```bash
   node <orca-motion-skill>/scripts/capture.mjs <片子>.html -o <片子>.mp4
   ```
   输出末尾「页面报告的问题」必须为空。先按正常速度看一遍，再抽帧对照 `principles.md` 末尾的自检标准。

## 本 skill 带了什么

| 路径 | 内容 |
| --- | --- |
| `runtime/motion.js` | 场景运行时：`OrcaMotion.scene / build / stage` 和 `m.*` 动作 |
| `runtime/motion.css` | 场景图形类（`.mo-*`），只用设计变量 |
| `runtime/tokens.css` `runtime/themes/` | 设计变量和主题，从 orca-transition-skill 同步过来，不要在这里改 |
| `scripts/capture.mjs` | 逐帧录制，从 orca-transition-skill 同步过来 |
| `scripts/sync-shared.sh` | 同步上面两项 |
| `templates/scene-starter.html` | 单独预览一个场景 |
| `examples/clearing/` | 完整示例：全年热力图 → 推进那一天 → 空档变黄 → 缩回全年拼出 CLEARING |
| `examples/sieve/` | 完整示例：账单列表 → 订阅标橙收拢成柱子 → 推进看哪些没在用 → 缩回一年的折线 |
| `examples/scene-preview/` | 单场景预览：模板填好的样子，不需要 orca-transition-skill，浏览器直接打开就播 |
| `examples/kinetic-title/` | 文字做主角：可变字体标题开场（逐字字重字宽波浪、打字机署名、标志定版后剪到角上），拆解见 `references/kinetic-type.md` |

## 不许做的

- 不许在场景脚本里直接写 `gsap.to` / `gsap.set`、`setTimeout`、CSS 动画。只用 `m.*` 往 `tl` 上排。
  `m.*` 不够用时，报告缺什么，不要自己绕。
- 不许写死颜色、字号：颜色只用 `.mo-*` 类和主题变量，文字只用 `.mo-t-*` 五档。
- 强调色（`--accent`）只给主角用，不许拿来装饰。
- 不许改 `runtime/` 下的文件。同步来的文件去 orca-transition-skill 改。
