# 场景 API

## 写一个场景

```html
<div class="mo-scene" data-scene="year">
  <script type="application/json">{ "year": 2027, "events": 2184 }</script>
</div>

<script>
  OrcaMotion.scene("year", ({ el, tl, m, data }) => {
    const g = m.grid({ x: 142, y: 470, rows: 7, cols: 53, cell: 24, gap: 7, levels });
    const t = m.appear(g.cells, { at: 0.2, origin: "left", span: 1.3 });
    m.count(stats, { at: 0.3, to: data.events, format: (s) => `${s} events` });
  });
</script>
```

- `el`：场景元素，默认铺满 1920×1080 画布。所有坐标都是画布像素。
- `tl`：这个场景的时间线。`m.*` 都往它上面排，`at` 是秒。
- `m`：下面这些动作。大多数返回「这个动作结束的时刻」，方便接着排：`let t = m.appear(...); m.pop(card, t + 0.2)`。
- `data`：场景里 JSON 的内容。数据写在 JSON 里，脚本里不写死数字。
- 需要随机数（热力图深浅）用固定种子的伪随机数，保证每次生成一样。

## 生成图形

| 方法 | 作用 |
| --- | --- |
| `m.add(cls, {x, y, w, h}, text?, parent?)` | 建一个绝对定位的元素 |
| `m.backdrop({at?})` | 背景渐变：底色上一团柔光（跟着主题色变），压在场景最底下。`at: [x%, y%]` 光的位置，默认 `[50, 25]` |
| `m.world()` | 世界层：要被 `m.camera` 推拉的图形放进去（`parent: world`），标题、统计放在外面 |
| `m.grid({x, y, rows, cols, cell, gap, levels, parent?})` | 格子。`levels[r][c]` 取 0–4 决定深浅。返回 `{cells, at(r, c), box(r, c), width, height}` |
| `m.agenda({x, y, w, hourH, hours: [开始, 结束], events, parent?})` | 日程时间轴。`events: [{title, start: "13:30", end: "15:00"}]`。返回 `{yOf(时间), blocks, labels}`。放不下两行的短日程自动排成一行 |
| `m.rows({x, y, w, rowH, gap, columns, items, cls?, parent?})` | 列表，一行一条记录。`columns: [{key, w?, align?, cls?}]`，不写 `w` 的列占剩下的宽度。返回 `{rows, cell(i, key), box(i)}` |
| `m.line({x, y, w, h, values, min?, max?, parent?})` | 折线，`values` 从左到右均匀分布。返回 `{el, at(i), length}`，用 `m.draw` 画出来 |

## 排动作

| 方法 | 作用 |
| --- | --- |
| `m.appear(els, {at, origin, span, kind, duration})` | 成片依次出现。`origin`：`left` `right` `top` `center` 或 `[x, y]`；`kind`：`pop` `rise` `fade` |
| `m.pop(el, at)` `m.rise(el, at)` `m.fade(el, at)` `m.hide(el, at)` | 单个元素弹出 / 上浮 / 淡入 / 淡出 |
| `m.reveal(el, at, duration)` | 文字从左到右揭开 |
| `m.count(el, {at, from, to, duration, decimals, ease, format})` | 数字滚动，`format(已格式化的数字)` 返回要显示的整句 |
| `m.swapText(el, text, at)` | 换一句文字（出去再进来） |
| `m.heat(cell, at)` | 一个格子变成强调色并弹一下 |
| `m.mark(el 或 [el], at, {cls, on, pulse})` | 任意元素加上 / 去掉一个类（默认 `mo-hot`），轻轻弹一下。`on: false` 去掉（不再是主角） |
| `m.dim(el, at, {to})` | 调暗成背景信息（默认 0.3），不是隐藏 |
| `m.move(el, {x, y, w, h}, {at, duration})` | 移动 / 变形到新位置和尺寸，缺的项不变。同一个元素可以连续 move（列表行收拢成柱子） |
| `m.draw(line, {at, duration, follow})` | 折线从起点画到终点。`follow`：跟着笔尖走的元素（圆点），初始位置放在起点 |
| `m.spell(grid, "TEXT", {at, row, col, each})` | 在网格里点亮格子拼出 5×7 点阵字（A–Z、0–9），每个字占 5 列，字间空 1 列 |
| `m.scan(el, {at, from, to, duration})` | 扫描线从 y=from 走到 y=to |
| `m.camera(world, target, {at, duration, fill})` | 场景内镜头：把 `target`（元素或 `{x, y, w, h}`）推到画面中间，宽度占画面 `fill` |
| `m.blur(el 或 [el], px, {at?, duration?})` | 景深：退到焦外。不写 `at` 是静态的（第 0 秒已经虚了）；写 `at` 在时间线上过渡，`px = 0` 回到清晰 |
| `m.cut(el 或 [el], at, {on})` | 剪切：`at` 瞬间出现（`on: false` 瞬间消失），不是淡入淡出 |
| `m.settle(el, at, {from, to, duration, ease})` | 定版：从 `from` 倍缩到 `to` 倍，减速停住（标志、大标题入场） |
| `m.hold(t)` | 让时间线至少持续到 `t` 秒（结尾停住），代替 `tl.to({}, …)` |
| `m.flip(at, (on) => …)` | 其他瞬间切换。`on` 为 false / true 分别是 at 之前 / 之后的状态，两种状态都要写 |

## 文字

文字做主角时（可变字体标题、打字机），原则和案例见 `kinetic-type.md`。

| 方法 | 作用 |
| --- | --- |
| `m.glyphs(el)` | 把元素里的文字拆成一个字一个 `<span>`，返回这些 span |
| `m.vary(glyphs, {at, span, keys, ease})` | 可变字体轴波浪：每个字按 `keys`（`[{t, wght, wdth, …}]`，`t` 相对这个字的时刻）走一遍字体轴，第 i 个字晚 `i/(n−1) × span` 秒 |
| `m.type(el, text, {at, duration})` | 打字机 |

## 图形类（`motion.css`）

| 类 | 样子 |
| --- | --- |
| `.mo-t-xl` 120 / `.mo-t-l` 64 / `.mo-t-m` 40 / `.mo-t-s` 24 / `.mo-t-xs` 16 等宽 | 文字只用这五档 |
| `.mo-dim` `.mo-strong` `.mo-on-accent` | 文字颜色：暗 / 亮 / 强调色底上的字 |
| `.mo-mono` `.mo-regular` | 换成等宽字 / 常规字重（和 `.mo-t-*` 一起用） |
| `.mo-cell` `.mo-l0`–`.mo-l4` | 格子，深浅五级 |
| `.mo-hot` | 主角（强调色）：格子、列表行都能加 |
| `.mo-row` `.mo-row-cell` | 列表行和单元格（`m.rows` 生成） |
| `.mo-line` `.mo-axis` | 折线（强调色）、坐标轴 |
| `.mo-panel` | 大面板 |
| `.mo-event` | 日程块（`m.agenda` 生成） |
| `.mo-rule` `.mo-dot` | 主角的线和点（强调色） |
| `.mo-dash` | 虚线框：标出一块区域 |
| `.mo-card` | 主角卡片（强调色） |

## 给转场留锚点

场景里生成的元素写 `el.dataset.zoom = "键"`，orca-transition-skill 的 `zoom-into` 就能用它：

```js
grid.at(3, 51).dataset.zoom = "day";
```

## 确定性

- 所有动作都在 `tl` 上。不许用 `setTimeout`、`requestAnimationFrame`、CSS 动画、`Date.now()`。
- 瞬间切换（换文字、加类名）用 `m.flip` / `m.swapText` / `m.heat`，不要用 `tl.call`：
  `call` 只在往前播时触发，录制和预览时往回拖，状态不会复原。
