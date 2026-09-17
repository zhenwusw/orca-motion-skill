// 场景：可变字体标题开场（拆解自 WWDC 2026 session 开场，见 references/kinetic-type.md）
// 时间都按原片 30fps 的帧数换算成秒写在注释里，方便对照。
OrcaMotion.scene("kinetic-title", ({ el, tl, m, data }) => {
  const f = (n) => n / 30; // 原片帧 → 秒
  const LEFT = 96, TOP = 550, LINE = 128;

  // ── 标志：先在画面中央定版，然后剪到左上角 ──
  const big = m.add("mo-t-l mo-regular", { x: 0, y: 480, w: 1920 }, data.brand);
  big.style.textAlign = "center";
  const small = m.add("mo-t-l mo-regular", { x: LEFT, y: 50 }, data.brand);
  small.style.transformOrigin = "0 0";
  m.cut(big, f(1));
  m.settle(big, f(1), { from: data.logo.big * 1.33, to: data.logo.big, duration: f(13), ease: "power2.out" }); // 1–14 帧缩小定版
  m.cut(big, f(25), { on: false });                                                                           // 25 帧剪走
  m.settle(small, 0, { from: data.logo.small, to: data.logo.small, duration: 0.001 });
  m.cut(small, f(25));
  m.move(small, { y: 74 }, { at: f(25), duration: f(11), ease: "power1.out" });                                // 剪到角上后再往下落一点

  // ── 标题：逐字的字重 / 字宽波浪，从左往右扫过去 ──
  // 每个字：又粗又宽 → 又细又窄（波谷）→ 停在阅读用的粗体
  const keys = [
    { t: -f(10), wght: 900, wdth: 150 },
    { t: -f(5), wght: 50, wdth: 30 },
    { t: f(1), wght: 50, wdth: 30 },
    { t: f(9), wght: 700, wdth: 125 },
  ];
  // 第二行的波谷比第一行更早起步（18 帧 vs 29 帧），行一出现时左半边已经在收
  const waves = [{ at: f(29), span: f(14), show: f(29) }, { at: f(18), span: f(17), show: f(31) }];
  const rows = data.lines.map((line, r) => {
    const row = m.add("mo-t-xl", { x: LEFT, y: TOP + r * LINE, h: LINE }, line);
    row.style.lineHeight = `${LINE}px`;
    m.cut(row, waves[r].show);
    m.vary(m.glyphs(row), { at: waves[r].at, span: waves[r].span, keys });
    return row;
  });

  // ── 署名：等宽字打字机 ──
  const byline = m.add("mo-t-m mo-mono", { x: LEFT, y: TOP + data.lines.length * LINE + 14 }, "");
  m.type(byline, data.byline, { at: f(40), duration: f(20) }); // 每帧约 2 个字

  // ── 停住，先收文字再收标志 ──
  m.hide([...rows, byline], f(188), f(10));
  m.hide(small, f(194), f(7));
  m.hold(f(210));
});
