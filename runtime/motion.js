// orca-motion-skill 运行时：场景内部的 MG 动画。
//
// 一个场景 = 页面上的一个 <div class="mo-scene" data-scene="名字"> + 一段注册脚本：
//   OrcaMotion.scene("名字", ({ el, tl, m, data }) => { … });
// 脚本用 m.* 生成图形、往 tl（一条暂停的 GSAP 时间线）上排动作。不直接写 gsap.to。
//
// 谁来播：
//   - 放在 orca-transition-skill 的演示稿里：engine.js 在转场结束后播，录制时逐帧 seek。
//   - 单独预览（页面里没有 Reveal）：OrcaMotion.stage() 自己播，并提供同样的 window.__capture 接口，
//     可以直接用 orca-transition-skill 的 scripts/capture.mjs 录。
//
// 所有动作都排在时间线上，时间线任意 seek 都得到同一帧：不用 setTimeout、不用 CSS 动画、不读真实时间。
(() => {
  const W = 1920;
  const H = 1080;
  const registry = new Map();
  const built = new WeakMap(); // section → 主时间线

  const err = (msg) => console.error(`[orca-motion-skill] ${msg}`);
  const warn = (msg) => console.warn(`[orca-motion-skill] ${msg}`);

  function scene(name, fn) {
    registry.set(name, fn);
  }

  // 场景里 <script type="application/json"> 的内容就是 data
  function dataOf(el) {
    const node = el.querySelector(':scope > script[type="application/json"]');
    if (!node) return {};
    try {
      return JSON.parse(node.textContent);
    } catch (e) {
      err(`场景 "${el.dataset.scene}" 的 JSON 解析失败：${e.message}`);
      return {};
    }
  }

  // 一个根节点（演示稿的一页，或整个 body）里所有场景合成一条主时间线。只建一次，之后复用
  function build(root = document.body) {
    if (built.has(root)) return built.get(root);
    const master = gsap.timeline({ paused: true });
    for (const el of root.querySelectorAll(".mo-scene")) {
      const name = el.dataset.scene;
      const fn = registry.get(name);
      if (!fn) {
        err(`没有注册场景 "${name}"。OrcaMotion.scene("${name}", …) 要写在 engine.js 之前`);
        continue;
      }
      const tl = gsap.timeline();
      fn({ el, tl, m: helpers(el, tl), data: dataOf(el) });
      master.add(tl, +(el.dataset.sceneDelay || 0));
    }
    master.progress(1).progress(0); // 先跑一遍到终点再回到开头，保证所有 fromTo 的初始状态都已写上
    built.set(root, master);
    return master;
  }

  // ───────── 5×7 点阵字（拼字用）─────────
  const FONT = {
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    G: ["01111", "10000", "10000", "10011", "10001", "10001", "01111"],
    H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
    K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
    X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    5: ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
    6: ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
    7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    9: ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  };

  // 元素的场景坐标。优先读 m.add 写上的 style（页面被 Reveal 隐藏时 offsetLeft 读出来是 0）
  const px = (v) => (v && v.endsWith("px") ? parseFloat(v) : null);
  const boxOf = (n) => ({
    x: px(n.style.left) ?? n.offsetLeft,
    y: px(n.style.top) ?? n.offsetTop,
    w: px(n.style.width) ?? n.offsetWidth,
    h: px(n.style.height) ?? n.offsetHeight,
  });

  // ───────── m.*：生成图形 + 排动作 ─────────
  function helpers(root, tl) {
    const m = {};

    // 瞬间切换（文字、类名）：在 at 之前是 off 状态，之后是 on 状态。
    // 用一个极短的补间驱动，不用 tl.call：call 只在往前播时触发，往回 seek 状态不会复原
    const flip = (at, apply) => {
      const p = { v: 0 };
      // 补间在 at 之前 1ms 结束，seek 到正好 at 时已经是 on 状态
      tl.fromTo(p, { v: 0 }, { v: 1, duration: 0.001, ease: "none", onUpdate: () => apply(p.v >= 1) }, Math.max(0, at - 0.001));
      apply(false);
    };
    m.flip = flip;

    // 建一个绝对定位的元素。box = { x, y, w, h }，都是场景坐标（像素）
    m.add = (cls, box = {}, text, parent = root) => {
      const node = document.createElement("div");
      node.className = cls;
      const { x, y, w, h } = box;
      if (x != null) node.style.left = `${x}px`;
      if (y != null) node.style.top = `${y}px`;
      if (w != null) node.style.width = `${w}px`;
      if (h != null) node.style.height = `${h}px`;
      if (text != null) node.textContent = text;
      parent.append(node);
      return node;
    };

    // 背景渐变：底色上一团柔光，压在场景最底下。at 默认画面上方偏中（[x%, y%]）
    m.backdrop = ({ at = [50, 25] } = {}) => {
      const node = m.add("mo-backdrop", { x: 0, y: 0, w: W, h: H });
      node.style.setProperty("--mo-glow-at", `${at[0]}% ${at[1]}%`);
      root.prepend(node);
      return node;
    };

    // 景深：让元素虚掉（背景信息退到焦外）。px = 0 回到清晰。
    // 不写 at 就是静态的（第 0 秒已经虚了），写 at 就在时间线上过渡
    m.blur = (el, px, { at, duration = 0.6, ease = "power2.inOut" } = {}) => {
      const els = [].concat(el);
      if (at == null) { els.forEach((n) => { n.style.filter = px ? `blur(${px}px)` : ""; }); return 0; }
      // 起点写明：GSAP 从 "none" 补间到 blur() 会直接跳
      for (const n of els) {
        const from = n._moBlur ?? (parseFloat((n.style.filter.match(/blur\(([\d.]+)px\)/) || [])[1]) || 0);
        tl.fromTo(n, { filter: `blur(${from}px)` }, { filter: `blur(${px}px)`, duration, ease, immediateRender: false }, at);
        n._moBlur = px;
      }
      return at + duration;
    };

    // 让时间线至少持续到 t 秒（结尾停住的时间）
    m.hold = (t) => (tl.to({}, { duration: 0.001 }, Math.max(0, t - 0.001)), t);

    // 瞬间出现 / 消失（剪切，不是淡入淡出）：at 之前是隐藏的，之后显示。on: false 反过来
    m.cut = (el, at, { on = true } = {}) => {
      for (const n of [].concat(el)) flip(at, (s) => { n.style.visibility = (on ? s : !s) ? "" : "hidden"; });
      return at;
    };

    // ───── 文字 ─────
    // 把元素里的文字拆成一个字一个 <span>（空格也占一个），返回这些 span。拆完才能逐字动
    m.glyphs = (el) => {
      const chars = Array.from(el.textContent);
      el.textContent = "";
      return chars.map((ch) => {
        const sp = document.createElement("span");
        sp.className = "mo-glyph";
        sp.textContent = ch;
        el.append(sp);
        return sp;
      });
    };

    // 可变字体轴的波浪：每个字按 keys 走一遍字体轴，第 i 个字比第一个晚 i/(n-1) × span 秒。
    // keys = [{ t: 相对这个字的时刻（秒，可以为负）, wght: 900, wdth: 150, … }, …]，t 从小到大。
    // 第一个 key 之前停在第一个 key 的状态，最后一个之后停在最后一个。字体要有这些轴（见 references/kinetic-type.md）
    m.vary = (glyphs, { at, span = 0.5, keys, ease = "none" }) => {
      const axes = Object.keys(keys[0]).filter((k) => k !== "t");
      const css = (p) => axes.map((k) => `"${k}" ${Math.round(p[k] * 10) / 10}`).join(", ");
      glyphs = [...glyphs];
      let end = at;
      glyphs.forEach((g, i) => {
        const t0 = at + (glyphs.length > 1 ? i / (glyphs.length - 1) : 0) * span;
        const p = Object.fromEntries(axes.map((k) => [k, keys[0][k]]));
        const apply = () => { g.style.fontVariationSettings = css(p); };
        for (let j = 1; j < keys.length; j++) {
          const from = Object.fromEntries(axes.map((k) => [k, keys[j - 1][k]]));
          const to = Object.fromEntries(axes.map((k) => [k, keys[j][k]]));
          const start = t0 + keys[j - 1].t;
          const duration = Math.max(0.001, keys[j].t - keys[j - 1].t);
          tl.fromTo(p, from, { ...to, duration, ease, onUpdate: apply, immediateRender: false }, Math.max(0, start));
          end = Math.max(end, start + duration);
        }
        apply();
      });
      return end;
    };

    // 打字机：at 开始，duration 内一个字一个字打出 text
    m.type = (el, text, { at, duration = 1.0 }) => {
      const chars = Array.from(text);
      const p = { n: 0 };
      const show = () => { el.textContent = chars.slice(0, Math.floor(p.n)).join(""); };
      tl.fromTo(p, { n: 0 }, { n: chars.length, duration, ease: "none", onUpdate: show }, at);
      show();
      return at + duration;
    };

    // 定版：从 from 倍缩到 to 倍，减速停住（标志、大标题的入场）
    m.settle = (el, at, { from = 1.3, to = 1, duration = 0.5, ease = "power3.out" } = {}) => (
      tl.fromTo(el, { scale: from }, { scale: to, duration, ease }, at), at + duration);

    // 世界层：镜头推拉作用在它上面，界面元素（标题、统计）放在世界层外面就不会跟着缩放
    m.world = () => m.add("mo-world", { x: 0, y: 0, w: W, h: H });

    // 网格：rows × cols 个格子，levels[r][c] 取 0–4 决定深浅。返回 { cells, at(r, c), box(r, c) }
    m.grid = ({ x, y, rows, cols, cell, gap, levels, parent = root }) => {
      const cells = [];
      const grid = [];
      for (let r = 0; r < rows; r++) {
        grid.push([]);
        for (let c = 0; c < cols; c++) {
          const lv = levels ? levels[r]?.[c] ?? 0 : 0;
          const node = m.add(`mo-cell mo-l${lv}`, { x: x + c * (cell + gap), y: y + r * (cell + gap), w: cell, h: cell }, null, parent);
          node.dataset.r = r;
          node.dataset.c = c;
          grid[r].push(node);
          cells.push(node);
        }
      }
      return {
        cells,
        at: (r, c) => grid[r]?.[c],
        box: (r, c) => ({ x: x + c * (cell + gap), y: y + r * (cell + gap), w: cell, h: cell }),
        width: cols * (cell + gap) - gap,
        height: rows * (cell + gap) - gap,
      };
    };

    // 一批元素依次出现，顺序按离 origin 的距离（像水波）。
    // origin："left" / "right" / "top" / "center" / [x, y]；kind："pop" / "rise" / "fade"
    m.appear = (els, { at = 0, origin = "left", span = 1.0, kind = "pop", duration = 0.45 } = {}) => {
      els = [...els];
      if (!els.length) return at;
      const centerOf = (n) => { const b = boxOf(n); return [b.x + b.w / 2, b.y + b.h / 2]; };
      const pts = els.map(centerOf);
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      const o = Array.isArray(origin) ? origin
        : origin === "left" ? [Math.min(...xs), 0]
        : origin === "right" ? [Math.max(...xs), 0]
        : origin === "top" ? [0, Math.min(...ys)]
        : [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
      const dist = pts.map(([px, py]) =>
        origin === "left" || origin === "right" ? Math.abs(px - o[0]) : origin === "top" ? Math.abs(py - o[1]) : Math.hypot(px - o[0], py - o[1]));
      const max = Math.max(...dist) || 1;
      const from = kind === "pop" ? { autoAlpha: 0, scale: 0.3 } : kind === "rise" ? { autoAlpha: 0, y: 24 } : { autoAlpha: 0 };
      const to = kind === "pop" ? { autoAlpha: 1, scale: 1, ease: "back.out(2)" } : kind === "rise" ? { autoAlpha: 1, y: 0, ease: "power2.out" } : { autoAlpha: 1, ease: "power1.out" };
      els.forEach((n, i) => tl.fromTo(n, from, { ...to, duration }, at + (dist[i] / max) * span));
      return at + span + duration;
    };

    // 单个元素入场
    m.pop = (el, at, duration = 0.5) => (tl.fromTo(el, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration, ease: "back.out(1.8)" }, at), at + duration);
    m.rise = (el, at, duration = 0.5) => (tl.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration, ease: "power2.out" }, at), at + duration);
    m.fade = (el, at, duration = 0.4, to = 1) => (tl.fromTo(el, { autoAlpha: to ? 0 : 1 }, { autoAlpha: to, duration, ease: "power1.inOut" }, at), at + duration);
    m.hide = (el, at, duration = 0.3) => (tl.to(el, { autoAlpha: 0, duration, ease: "power1.in" }, at), at + duration);

    // 文字从左到右揭开
    m.reveal = (el, at, duration = 0.6) => (
      tl.fromTo(el, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration, ease: "power2.inOut" }, at), at + duration);

    // 数字滚动。format(n) 返回要显示的文字
    m.count = (el, { at, from = 0, to, duration = 1.2, decimals = 0, ease = "power2.out", format = (s) => s }) => {
      const p = { v: from };
      const show = () => { el.textContent = format(p.v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })); };
      tl.fromTo(p, { v: from }, { v: to, duration, ease, onUpdate: show, onStart: show }, at);
      show();
      return at + duration;
    };

    // 换一段文字（先淡出再淡入同一个元素）
    m.swapText = (el, text, at, duration = 0.5) => {
      const old = el.textContent;
      tl.to(el, { autoAlpha: 0, y: -10, duration: duration / 2, ease: "power1.in" }, at);
      flip(at + duration / 2, (on) => { el.textContent = on ? text : old; });
      tl.fromTo(el, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: duration / 2, ease: "power1.out", immediateRender: false }, at + duration / 2);
      return at + duration;
    };

    // 把网格里的一些格子点亮成强调色，拼出点阵字（5×7，字间空一列）。
    // 从 (row, col) 开始写；按列从左到右依次点亮。返回点亮的格子
    m.spell = (grid, text, { at, row = 0, col = 0, each = 0.03, cls = "mo-hot" }) => {
      const lit = [];
      let cx = col;
      for (const ch of text.toUpperCase()) {
        const glyph = FONT[ch];
        if (!glyph) { warn(`点阵字里没有「${ch}」`); cx += 6; continue; }
        for (let gc = 0; gc < 5; gc++) {
          for (let gr = 0; gr < 7; gr++) {
            if (glyph[gr][gc] !== "1") continue;
            const cellEl = grid.at(row + gr, cx + gc);
            if (!cellEl) { warn(`拼字「${text}」超出网格`); continue; }
            lit.push([cellEl, (cx + gc - col) * each]);
          }
        }
        cx += 6;
      }
      for (const [cellEl, dt] of lit) m.heat(cellEl, at + dt, cls);
      return lit.map(([n]) => n);
    };

    // 单个格子变成强调色（带一下弹）
    m.heat = (el, at, cls = "mo-hot") => m.mark(el, at, { cls, pulse: 1.35 });

    // 任意元素加上 / 去掉一个类（默认 mo-hot，变成主角颜色），同时轻轻弹一下。
    // on: false 表示去掉这个类（比如不再是主角）。pulse: 1 不弹
    m.mark = (el, at, { cls = "mo-hot", on = true, pulse = 1.04 } = {}) => {
      for (const n of [].concat(el)) {
        flip(at, (s) => n.classList.toggle(cls, on ? s : !s));
        if (pulse !== 1) tl.fromTo(n, { scale: 1 }, { keyframes: [{ scale: pulse, duration: 0.12, ease: "power2.out" }, { scale: 1, duration: 0.25, ease: "power2.inOut" }], immediateRender: false }, at);
      }
      return at + 0.37;
    };

    // 调暗（退成背景信息），不是隐藏
    m.dim = (el, at, { to = 0.3, duration = 0.4 } = {}) => (tl.to(el, { opacity: to, duration, ease: "power1.inOut" }, at), at + duration);

    // 把元素移动 / 变形到 box（{x, y, w, h}，缺的项不变）。同一个元素可以连续 move
    m.move = (el, box, { at, duration = 0.8, ease = "power3.inOut" }) => {
      const from = el._moBox ?? boxOf(el);
      const to = { ...from, ...Object.fromEntries(Object.entries(box).filter(([, v]) => v != null)) };
      tl.fromTo(el, { left: from.x, top: from.y, width: from.w, height: from.h },
        { left: to.x, top: to.y, width: to.w, height: to.h, duration, ease, immediateRender: false }, at);
      el._moBox = to;
      return at + duration;
    };

    // 旋转到 deg 度（顺时针为正），同一个元素可以连续 turn。origin 是旋转中心（CSS transform-origin），
    // 比如扇形展开绕底边中点转："50% 100%"
    m.turn = (el, deg, { at, duration = 0.5, ease = "power3.inOut", origin = "50% 50%" }) => {
      const from = el._moTurn ?? 0;
      tl.fromTo(el, { rotation: from, transformOrigin: origin }, { rotation: deg, transformOrigin: origin, duration, ease, immediateRender: false }, at);
      el._moTurn = deg;
      return at + duration;
    };

    // 日程时间轴：hours = [开始, 结束]，events = [{ title, start: "13:30", end: "15:00" }]
    // 返回 { yOf(time), blocks, labels }
    m.agenda = ({ x, y, w, hourH, hours: [h0, h1], events, parent = root }) => {
      const toH = (t) => { const [hh, mm] = String(t).split(":").map(Number); return hh + (mm || 0) / 60; };
      const yOf = (t) => y + (toH(t) - h0) * hourH;
      const labels = [];
      for (let h = h0; h <= h1; h++) {
        labels.push(m.add("mo-hour", { x, y: yOf(h) - 10, w: 48 }, String(h).padStart(2, "0"), parent));
      }
      const blocks = events.map((ev) => {
        const top = yOf(ev.start);
        const h = Math.max(20, yOf(ev.end) - top - 4);
        // 放不下两行（标题 + 时间）就排成一行，不让时间被切掉
        const b = m.add(h < 52 ? "mo-event mo-event-short" : "mo-event", { x: x + 64, y: top + 2, w: w - 64, h }, null, parent);
        m.add("mo-event-title", {}, ev.title, b);
        m.add("mo-event-time", {}, `${ev.start}–${ev.end}`, b);
        return b;
      });
      return { yOf, blocks, labels };
    };

    // 列表：一行一条记录。columns = [{ key, w?, align?, cls? }]，不写 w 的列占剩下的宽度；
    // items = [{ key: 文字, … }]。返回 { rows, cell(i, key), box(i) }
    m.rows = ({ x, y, w, rowH, gap = 8, columns, items, cls = "", parent = root }) => {
      const box = (i) => ({ x, y: y + i * (rowH + gap), w, h: rowH });
      const rows = items.map((item, i) => {
        const row = m.add(`mo-row ${cls}`.trim(), box(i), null, parent);
        for (const col of columns) {
          const c = m.add(`mo-row-cell ${col.cls ?? ""}`.trim(), {}, item[col.key] ?? "", row);
          c.dataset.key = col.key;
          if (col.w != null) { c.style.width = `${col.w}px`; c.style.flex = "none"; }
          if (col.align) c.style.textAlign = col.align;
        }
        return row;
      });
      return { rows, box, cell: (i, key) => rows[i]?.querySelector(`[data-key="${key}"]`) };
    };

    // 折线：values 从左到右均匀分布在 {x, y, w, h} 里，min / max 对应底边 / 顶边。
    // 返回 { el, at(i) → 场景坐标 {x, y}, length }。用 m.draw 画出来
    m.line = ({ x, y, w, h, values, min = 0, max = Math.max(...values), cls = "mo-line", parent = root }) => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", cls);
      Object.assign(svg.style, { position: "absolute", left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, overflow: "visible" });
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const pts = values.map((v, i) => [values.length > 1 ? (i * w) / (values.length - 1) : 0, h - ((v - min) / (max - min || 1)) * h]);
      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      poly.setAttribute("points", pts.map((p) => p.join(",")).join(" "));
      svg.append(poly);
      parent.append(svg);
      // 长度自己算：页面被 Reveal 隐藏时不能靠 getTotalLength
      const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
      const length = segs.reduce((a, b) => a + b, 0);
      const pointAt = (d) => {
        for (let i = 0; i < segs.length; i++) {
          if (d <= segs[i] || i === segs.length - 1) {
            const k = segs[i] ? Math.min(1, d / segs[i]) : 0;
            return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
          }
          d -= segs[i];
        }
        return pts[0];
      };
      return { el: svg, poly, length, pointAt, at: (i) => ({ x: x + pts[i][0], y: y + pts[i][1] }), origin: { x, y } };
    };

    // 把折线从起点画到终点。follow：一个元素（圆点）跟着笔尖走，它的初始位置要放在起点上
    m.draw = (line, { at, duration = 1.2, ease = "power1.inOut", follow }) => {
      const p = { v: 0 };
      const fb = follow && boxOf(follow);
      const show = () => {
        const d = line.length * p.v;
        line.poly.style.strokeDasharray = `${line.length}`;
        line.poly.style.strokeDashoffset = `${line.length - d}`;
        line.poly.style.visibility = d > 0 ? "" : "hidden"; // 圆头线帽：长度 0 时也会画出一个点
        if (follow) {
          const [px0, py0] = line.pointAt(0);
          const [px1, py1] = line.pointAt(d);
          gsap.set(follow, { x: px1 - px0, y: py1 - py0 });
        }
      };
      tl.fromTo(p, { v: 0 }, { v: 1, duration, ease, onUpdate: show }, at);
      show();
      return at + duration;
    };

    // 镜头：把世界层推到让 target（场景坐标的 {x,y,w,h} 或元素）占画面 fill 比例（按宽），中心对准画面中心
    m.camera = (world, target, { at, duration = 1.2, fill = 0.6, scale, ease = "power3.inOut" }) => {
      const b = target instanceof Element ? boxOf(target) : target;
      const k = scale ?? (fill * W) / b.w;
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      tl.to(world, { x: W / 2 - cx * k, y: H / 2 - cy * k, scale: k, transformOrigin: "0 0", duration, ease }, at);
      return at + duration;
    };

    // 扫描线：从 y0 走到 y1
    m.scan = (el, { at, from, to, duration = 1.2, ease = "power1.inOut" }) => {
      tl.fromTo(el, { autoAlpha: 1, y: from }, { y: to, duration, ease }, at);
      return at + duration;
    };

    return m;
  }

  // ───────── 单独预览：没有 Reveal 的页面 ─────────
  // <body> 里直接放 .mo-scene，最后调用 OrcaMotion.stage()。
  function stage({ hold = 1.0 } = {}) {
    const master = build(document.body);
    const params = new URLSearchParams(location.search);
    if (!params.has("capture")) master.play(0);
    window.__capture = {
      async go() {
        master.pause(0);
        return { transition: 0, hold: master.duration() * 1000 + hold * 1000, scene: master.duration() * 1000 };
      },
      seek(ms) { master.time(ms / 1000); },
      count: () => 1,
    };
    // 画布按窗口等比缩放
    const fit = () => {
      const s = Math.min(innerWidth / W, innerHeight / H);
      document.documentElement.style.setProperty("--mo-fit", s);
    };
    fit();
    addEventListener("resize", fit);
    return master;
  }

  window.OrcaMotion = { scene, build, stage, boxOf, FONT, W, H };
})();
