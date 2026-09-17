# 连成片子：放进 orca-transition-skill 的演示稿

一个场景一页。片子本身就是一份 orca-transition-skill 的演示稿，照它的规范写转场计划和转场。

## 文件结构

```html
<head>
  <link rel="stylesheet" href="{{T}}/node_modules/reveal.js/dist/reset.css">
  <link rel="stylesheet" href="{{T}}/node_modules/reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="{{T}}/runtime/tokens.css">
  <link rel="stylesheet" href="{{T}}/runtime/themes/clearing.css">   <!-- 主题 -->
  <link rel="stylesheet" href="{{M}}/runtime/motion.css">
</head>
<body>
<div class="reveal">
<!-- 场景计划 + 转场计划 -->
<div class="slides">
  <section data-hold="1">
    <div class="mo-scene" data-scene="year"><script type="application/json">{…}</script></div>
  </section>
  <section data-st="zoom-into" data-st-direction="in" data-st-from="day" data-hold="1">
    <div class="mo-scene" data-scene="day"><script type="application/json">{…}</script></div>
  </section>
</div>
</div>
<script src="{{T}}/node_modules/reveal.js/dist/reveal.js"></script>
<script src="{{T}}/node_modules/gsap/dist/gsap.min.js"></script>
<script src="{{M}}/runtime/motion.js"></script>
<script> OrcaMotion.scene("year", …); OrcaMotion.scene("day", …); </script>
<script src="{{T}}/runtime/engine.js"></script>
</body>
```

- `{{T}}` = 到 orca-transition-skill 根目录的相对路径，`{{M}}` = 到本 skill 根目录的相对路径。
- **脚本顺序不能变**：reveal → gsap → motion.js → 场景注册 → engine.js。
  engine.js 一加载就会开始第一页，场景要在它之前注册好。
- gsap 只加载一份（用 orca-transition-skill 的）。

## 场景什么时候播

- 翻到这一页：**先把场景图形建好停在第 0 秒**，再跑转场，转场结束后场景从头播。
  所以转场看到的新页，是场景第 0 秒的样子。用 `zoom-into` / 匹配放大推进来的场景，第 0 秒就要有完整内容，
  不要让图形在场景里才出现（见 `principles.md` 第 4 节）。
- 往回翻、跳页：没有转场，场景直接从头播。
- 离开这一页：场景直接跳到结尾，下一次转场拍到的是场景的最终画面。
- 录制时：停留时长 = max(`data-hold`, 场景时长 + 0.8 秒)，停留期间逐帧录场景。

## 场景之间用什么转场

| 两个场景的关系 | 转场 |
| --- | --- |
| 下一个场景是上一个场景里某个元素的细节（格子 → 那一天） | `zoom-into` in，`data-st-from` 指上一个场景里写了 `data-zoom` 的元素 |
| 下一个场景是上一个场景的全局（那一天 → 全年） | `zoom-into` out，`data-st-to` 指这个场景里写了 `data-zoom` 的元素 |
| 同一批图形换个排法 | 形态变换 / 多合一 / 一变多（写法见 orca-transition-skill 的 `transitions.md`） |
| 换话题 | 遮挡剪辑 |

`zoom-into` 的锚点是场景生成出来的元素，所以一定要在场景脚本里写 `dataset.zoom`。
out 方向的锚点最好**已经是主角颜色**（`.mo-hot`）：观众看到「那一天缩回来变成了一个黄格子」。
