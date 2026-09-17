# orca-motion-skill

一个给 AI Agent（Claude Code 等）用的 skill：把产品、数据抽象成几种简单图形，做**场景内部**的 MG 动画——
成片元素依次亮起、列表行标色收拢、折线画出、扫描线、镜头推近、卡片弹出、点阵拼字、数字滚动。所有动作都在一条可 seek 的时间线上，逐帧录成视频。

它和 [orca-transition-skill](https://github.com/zhenwusw/orca-transition-skill) 分工：
本 skill 管**一个场景里面怎么动**，orca-transition-skill 管**场景和场景之间怎么接**（放大进元素内部、整页推近、形态变换……）。
片子本身是一份 orca-transition-skill 的演示稿，一个场景一页。

Agent 的使用说明见 [`SKILL.md`](SKILL.md)。

## 安装

两个 skill 放在同一层目录下：

```bash
cd ~/ghq/github.com/zhenwusw   # 或 ~/.claude/skills
git clone https://github.com/zhenwusw/orca-transition-skill.git
git clone https://github.com/zhenwusw/orca-motion-skill.git
(cd orca-transition-skill && npm install)
(cd orca-motion-skill && npm install)
```

录视频需要系统里装好的 Google Chrome 和 `ffmpeg`。

## 示例

`examples/clearing/`：一个日历产品的概念动效——全年热力图亮起 → 推进其中一天 → 扫描线找到 30 分钟空档，黄色卡片弹出 →
缩回全年，那一天变成黄格子 → 更多黄格子拼出 CLEARING，统计翻成 63.5 小时被保留。

```bash
node scripts/capture.mjs examples/clearing/index.html -o clearing.mp4
```

`examples/sieve/`：一个订阅管理产品的概念动效（默认深色主题）——九月账单一行行落下 → 6 笔订阅标成橙色、收拢成一根柱子 →
推进柱子，没在用的留下，$59.97 / 月 → 缩回一年，折线画出 $719.64。

`examples/kinetic-title/`：文字做主角的标题开场（拆解自 WWDC 开场）——标志定版后剪到左上角，两行标题逐字走可变字体的字重字宽波浪，署名打字机。拆解和原则见 `references/kinetic-type.md`。字体（Roboto Flex、JetBrains Mono）从 Google Fonts 加载，打开和录制时需要联网。

`examples/scene-preview/`：单独预览一个场景（折线画出、数字跟着滚）。不需要 orca-transition-skill，浏览器直接打开就播，同一个 `capture.mjs` 能录。

## 目录

| 路径 | 内容 |
| --- | --- |
| `SKILL.md` | skill 入口 |
| `references/principles.md` | 抽象、主角颜色、尺度、节奏 |
| `references/api.md` | 场景 API（`OrcaMotion.scene` 和 `m.*`） |
| `references/kinetic-type.md` | 文字做主角：可变字体标题动效的拆解和原则 |
| `references/integration.md` | 把场景放进 orca-transition-skill 的演示稿 |
| `runtime/motion.js` `runtime/motion.css` | 场景运行时和图形类 |
| `runtime/tokens.css` `runtime/themes/` `scripts/capture.mjs` | 从 orca-transition-skill 同步（`scripts/sync-shared.sh`） |
| `templates/scene-starter.html` | 单独预览一个场景 |

## License

[MIT](LICENSE)
