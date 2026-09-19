# orca-motion-skill

一个给 AI Agent（Claude Code 等）用的 skill：把产品、数据抽象成几种简单图形（格子、横条、卡片、线），
做**场景内部**的 MG 动画——成片元素依次亮起、列表行标色收拢、折线画出、镜头推近、点阵拼字、数字滚动。
所有动作在一条可 seek 的时间线上，逐帧录成视频。

## 全部场景在这里

### **[motion.orca-studio.ai](https://motion.orca-studio.ai)**

点开就播，不用装任何东西。

## 示例

<table>
<tr>
<td width="50%"><a href="https://motion.orca-studio.ai/examples/sieve/"><img src="https://motion.orca-studio.ai/examples/sieve/preview.gif" alt="Sieve"></a></td>
<td width="50%"><a href="https://motion.orca-studio.ai/examples/clearing/"><img src="https://motion.orca-studio.ai/examples/clearing/preview.gif" alt="Clearing"></a></td>
</tr>
<tr>
<td><b>Sieve</b> · 3 个场景<br>账单行收拢成柱子，钻进去看订阅，再拉成一年的折线</td>
<td><b>Clearing</b> · 3 个场景<br>收件箱清空：行标色、收拢、数字滚动</td>
</tr>
<tr>
<td><a href="https://motion.orca-studio.ai/examples/kinetic-title/"><img src="https://motion.orca-studio.ai/examples/kinetic-title/preview.gif" alt="Kinetic title"></a></td>
<td><a href="https://motion.orca-studio.ai/examples/scene-preview/"><img src="https://motion.orca-studio.ai/examples/scene-preview/preview.gif" alt="kept"></a></td>
</tr>
<tr>
<td><b>Kinetic title</b> · 单场景<br>可变字体标题开场，字重和字宽双轴联动</td>
<td><b>kept</b> · 单场景<br>模板填好的样子：折线画出，数字跟着滚</td>
</tr>
</table>

## 安装

```bash
npx skills add zhenwusw/orca-motion-skill -g -a claude-code
```

其他 agent 把 `-a` 换成对应的名字。装好之后直接说「做个产品动效」「把这个功能做成动画演示」就会用上。

要把多个场景连成一部片子（场景**之间**的转场），
再装 [orca-transition-skill](https://github.com/zhenwusw/orca-transition-skill)，两个放在同一层目录下。

## License

[MIT](LICENSE)
