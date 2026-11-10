// うみうしラボのトップ: 実在のウミウシ 7 種を、手続きで描く(背中から見た、図案化した絵)。
// 最初の画面の標本(部位の名前つき、押すと別の種)、製品の札にのる小さい個体、フッターを這う個体。
// 色と模様は seaslug.world の各種のページの「特徴」と写真に合わせた。同定に使える精度ではない。
// 動きを減らす設定のときは 1 こまだけ描いて止める。
(() => {
  'use strict';
  const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const en = document.documentElement.lang === 'en';
  const TAU = Math.PI * 2;

  // 同じ種はいつも同じ模様になる乱数
  const rng = (seed) => () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const hx = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16));
  const mix = (a, b, t, al) => {
    const A = hx(a), B = hx(b);
    const c = A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',');
    return al == null ? `rgb(${c})` : `rgba(${c},${al})`;
  };
  // 斑紋を散らす。o: {n, t:[min,max], s:[min,max], r:[min,max], e(細長さ), c(色), gap}
  const scatter = (seed, o) => {
    const r = rng(seed), out = [];
    for (let i = 0; i < o.n * 6 && out.length < o.n; i++) {
      const t = o.t[0] + r() * (o.t[1] - o.t[0]), s = (o.s[0] + r() * (o.s[1] - o.s[0])) * (o.both && r() < 0.5 ? -1 : 1), rad = o.r[0] + r() * (o.r[1] - o.r[0]);
      if (Math.abs(t - 0.77) < 0.1 && Math.abs(s) < 0.42) continue; // エラのまわりは空ける
      if (Math.abs(t - 0.15) < 0.05 && Math.abs(Math.abs(s) - 0.4) < 0.2) continue; // 触角の根元も
      if (out.some((q) => Math.hypot((q.t - t) * 5, q.s - s) < (o.gap || 0.3))) continue;
      out.push({ t, s, r: rad, e: o.e || 1, c: o.c });
    }
    return out;
  };
  // 線の上に等間隔で並べる
  const row = (o) => Array.from({ length: o.n }, (_, i) => ({ t: o.t[0] + (o.t[1] - o.t[0]) * (o.n > 1 ? i / (o.n - 1) : 0.5), s: o.s, r: o.r, e: o.e || 1, c: o.c }));

  // 種ごとの決めごと。bands は外套膜のふちの帯(外側から。[幅, 色])
  const SPECIES = {
    festiva: { // アオウミウシ: 青地、黄色いふち、正中線に黄色の線、両側に黄色の短い線。触角は橙、エラは白で軸が橙
      ja: 'アオウミウシ', sci: 'Hypselodoris festiva', mm: 30, type: 'dorid', slim: 0.17, frill: 0.03, frillN: 9,
      body: '#2552C2', foot: '#3B6BD8', bands: [[0.15, '#F4D522']],
      marks: [...row({ n: 4, t: [0.24, 0.66], s: 0, r: 0.05, e: 3.2, c: '#F4D522' }), ...row({ n: 3, t: [0.3, 0.62], s: 0.48, r: 0.05, e: 2.2, c: '#F4D522' }), ...row({ n: 3, t: [0.34, 0.66], s: -0.48, r: 0.05, e: 2.2, c: '#F4D522' }), ...scatter(11, { n: 6, t: [0.25, 0.9], s: [0.15, 0.3], both: 1, r: [0.035, 0.055], c: '#0C1B56', gap: 0.2 })],
      rhino: '#F26F2A', stalk: '#F26F2A', gillAxis: '#F26F2A', gillPin: '#FFF6EC', nGill: 7,
    },
    orientalis: { // シロウミウシ: 白地、正中線の両側に黒い斑、ふちは橙黄色。触角は柄が白で先が橙、エラは半透明の白で外縁が橙
      ja: 'シロウミウシ', sci: 'Chromodoris orientalis', mm: 20, type: 'dorid', slim: 0.2, frill: 0.03, frillN: 8,
      body: '#F8F6F0', foot: '#FFFFFF', bands: [[0.1, '#F5A623']],
      marks: scatter(23, { n: 14, t: [0.2, 0.9], s: [0.12, 0.66], both: 1, r: [0.045, 0.07], c: '#17171B', gap: 0.26 }),
      rhino: '#F5A02A', stalk: '#FFFFFF', gillAxis: '#FFFFFF', gillPin: '#F5B25A', nGill: 8,
    },
    apolegma: { // シンデレラウミウシ: 紫がかったマゼンタ、ふちは不透明な白でぼける。触角は橙黄色で柄が紫、エラは 5 枚で軸が紫、葉が黄色
      ja: 'シンデレラウミウシ', sci: 'Hypselodoris apolegma', mm: 80, type: 'dorid', slim: 0.165, frill: 0.035, frillN: 13,
      body: '#C566E6', foot: '#B255DC', bands: [[0.14, '#FBF3FE'], [0.24, '#E7BDF6'], [0.34, '#D592EE']],
      marks: [],
      rhino: '#F7A823', stalk: '#B255DC', gillAxis: '#B255DC', gillPin: '#F9CB2E', nGill: 5, gillSize: 1.3, pinW: 0.085,
    },
    babai: { // チギレユキイロウミウシ: 白地で、背中の中央が赤褐色〜橙。細長い楕円の白い斑。触角とエラは赤、エラは 5 枚
      ja: 'チギレユキイロウミウシ', sci: 'Hypselodoris babai', mm: 25, type: 'dorid', slim: 0.185, frill: 0.05, frillN: 8,
      body: '#EE8420', foot: '#FFF3F0', bands: [[0.2, '#FFF6F2'], [0.3, '#C2332A']],
      marks: [...row({ n: 4, t: [0.26, 0.64], s: 0, r: 0.055, e: 2.4, c: '#FFFFFF' }), ...scatter(31, { n: 7, t: [0.22, 0.9], s: [0.22, 0.5], both: 1, r: [0.045, 0.06], e: 2, c: '#FFFFFF', gap: 0.3 })],
      rhino: '#E8491E', stalk: '#F2A268', gillAxis: '#E8491E', gillPin: '#F0763A', nGill: 5, gillSize: 1.15,
    },
    cruenta: { // アカテンイロウミウシ: 中央は淡い黄色、その外に幅広い白い帯と赤い円斑の列、その外に濃い黄色の帯、いちばん外は細い白線。ふちが大きく波うつ
      ja: 'アカテンイロウミウシ', sci: 'Ardeadoris cruenta', mm: 40, type: 'dorid', slim: 0.25, frill: 0.16, frillN: 5,
      body: '#F0E2B4', foot: '#FFFDF4', bands: [[0.035, '#FFFFFF'], [0.2, '#F5C81C'], [0.42, '#FFFFFF']],
      marks: [...row({ n: 7, t: [0.14, 0.86], s: 0.6, r: 0.042, e: 1.3, c: '#D3202C' }), ...row({ n: 7, t: [0.14, 0.86], s: -0.6, r: 0.042, e: 1.3, c: '#D3202C' })],
      rhino: '#C9742A', stalk: '#F2B46A', gillAxis: '#FFFFFF', gillPin: '#E9DDB4', nGill: 8,
    },
    glaucus: { // アオミノウミウシ: 銀青色の体に濃い青。背側突起は左右 3 対の群で、放射状に広がる。触角は短い
      ja: 'アオミノウミウシ', sci: 'Glaucus atlanticus', mm: 30, type: 'glaucus', slim: 0.085, sway: 0.07,
      body: '#D5E6F7', band: '#1B2A66', stripe: '#AEB0BE', cer: '#2C49B4', sheen: '#8FB0FF',
    },
    yugoikedai: { // コガネミノウミウシ: 半透明の白い細い体に、レモン色の紡錘形の背側突起が 20〜25 本。刺胞嚢は先より少し根元寄りで黄橙色、先は半透明。触角は口触手とほぼ同じ長さ
      ja: 'コガネミノウミウシ', sci: 'Hantazuia yugoikedai', mm: 15, type: 'aeolid', slim: 0.075, sway: 0.14,
      body: '#F2EEE6', cer: '#F3D33A', sac: '#EFA42A', rhino: '#F6EFC8', nCer: 11,
    },
  };
  const ORDER = ['festiva', 'orientalis', 'apolegma', 'babai', 'cruenta', 'glaucus', 'yugoikedai'];
  ORDER.forEach((k, i) => { const sp = SPECIES[k]; sp.key = k; sp.no = i + 1; sp.sway = sp.sway || 0.12; sp.waves = 0.9 + (i % 3) * 0.12; });

  const prof = (sp, t) => {
    t = Math.min(1, Math.max(0, t));
    if (sp.type === 'dorid') return Math.pow(Math.sin(Math.PI * t), 0.5) * (1 - 0.15 * t);
    return Math.pow(Math.sin(Math.PI * Math.pow(t, sp.type === 'glaucus' ? 0.5 : 0.62)), 0.7);
  };

  // 背骨にあたる線。頭(t=0)が左、尾(t=1)が右。体の真ん中を原点に置く
  function spine(sp, time, L, bend, N) {
    const M = Math.round(N * 1.12), ds = L / N, pts = [];
    let x = 0, y = 0;
    for (let i = 0; i <= M; i++) {
      const t = i / N, tc = Math.min(t, 1);
      const a = sp.sway * Math.sin(TAU * (sp.waves * t - time * 0.11)) * (0.35 + 0.65 * tc) - bend * (1 - tc) * (1 - tc);
      pts.push({ x, y, a });
      x += Math.cos(a) * ds; y += Math.sin(a) * ds;
    }
    const c = pts[N >> 1], cx = c.x, cy = c.y;
    for (const p of pts) { p.x -= cx; p.y -= cy; }
    return pts;
  }

  function blob(ctx, P) {
    const n = P.length;
    let a = P[n - 1], b = P[0];
    ctx.beginPath();
    ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
    for (let i = 0; i < n; i++) {
      a = P[i]; b = P[(i + 1) % n];
      ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
    }
    ctx.closePath();
  }

  // 根元が太く先が細い、曲がった指の形(触角の柄、口触手、突起)
  function taper(ctx, B, C, T, w0, w1, col) {
    const Lp = [], Rp = [], K = 8;
    for (let i = 0; i <= K; i++) {
      const u = i / K, v = 1 - u;
      const x = v * v * B.x + 2 * v * u * C.x + u * u * T.x, y = v * v * B.y + 2 * v * u * C.y + u * u * T.y;
      let dx = 2 * v * (C.x - B.x) + 2 * u * (T.x - C.x), dy = 2 * v * (C.y - B.y) + 2 * u * (T.y - C.y);
      const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const w = w0 + (w1 - w0) * u;
      Lp.push({ x: x - dy * w, y: y + dx * w }); Rp.push({ x: x + dy * w, y: y - dx * w });
    }
    ctx.beginPath();
    ctx.moveTo(Lp[0].x, Lp[0].y);
    for (let i = 1; i <= K; i++) ctx.lineTo(Lp[i].x, Lp[i].y);
    for (let i = K; i >= 0; i--) ctx.lineTo(Rp[i].x, Rp[i].y);
    ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.arc(T.x, T.y, w1, 0, TAU); ctx.fill();
  }

  // 1 個体を描く。o: {cx, cy, L, rot, bend, dark, dpr, N, glow}。部位の位置(画面の座標)を返す
  function drawSlug(ctx, sp, time, o) {
    const N = o.N || 56, L = o.L, W = L * sp.slim, dpr = o.dpr || 1;
    const pts = spine(sp, time, L, o.bend || 0, N);
    const cs = Math.cos(o.rot || 0), sn = Math.sin(o.rot || 0);
    const scr = (p) => ({ x: o.cx + p.x * cs - p.y * sn, y: o.cy + p.x * sn + p.y * cs });
    const at = (t) => {
      const f = Math.min(pts.length - 1.001, Math.max(0, t * N)), i = Math.floor(f), u = f - i, p = pts[i], q = pts[i + 1];
      return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u, a: p.a + (q.a - p.a) * u };
    };
    // 体の上の点。s は中心線からの位置(-1〜1 が体の幅)
    const P = (t, s) => { const p = at(t), w = W * prof(sp, t) * s; return { x: p.x - Math.sin(p.a) * w, y: p.y + Math.cos(p.a) * w, a: p.a }; };
    const lineAlong = (t0, t1, s) => {
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) { const q = P(t0 + (t1 - t0) * i / 24, s); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }
    };
    const outline = (f0, f1) => { const O = []; for (let i = 0; i <= N; i++) O.push(P(i / N, f0(i / N))); for (let i = N; i >= 0; i--) O.push(P(i / N, -f1(i / N))); return O; };
    ctx.save();
    ctx.setTransform(dpr * cs, dpr * sn, -dpr * sn, dpr * cs, dpr * o.cx, dpr * o.cy);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    const aura = sp.type === 'glaucus' ? sp.sheen : sp.type === 'aeolid' ? sp.cer : sp.body;
    if (o.glow && o.dark) { // 暗い海でぼんやり光る
      const g = ctx.createRadialGradient(0, 0, W * 0.5, 0, 0, L * 0.62);
      g.addColorStop(0, mix(aura, '#ffffff', 0.15, 0.3)); g.addColorStop(1, mix(aura, '#ffffff', 0.15, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, L * 0.62, L * 0.4, 0, 0, TAU); ctx.fill();
    }
    const shadow = (on) => {
      ctx.shadowColor = on ? (o.dark ? 'rgba(0,0,0,.5)' : 'rgba(23,48,77,.28)') : 'transparent';
      ctx.shadowBlur = on ? L * 0.06 * dpr : 0; ctx.shadowOffsetY = on ? L * 0.03 * dpr : 0;
    };
    const edge = () => { ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = Math.max(0.75, L * 0.004); ctx.stroke(); };
    const anchors = {};

    // 触角(頭の左右に 1 本ずつ)。club: 先がふくらみ、ひだがある
    const rhino = (t, s, len, club) => {
      for (const sg of [1, -1]) {
        const B = P(t, s * sg), sw = sg * 0.14 * Math.sin(time * 1.4 + sg);
        let dx = -Math.cos(B.a) * 0.78 - Math.sin(B.a) * sg * 0.62, dy = -Math.sin(B.a) * 0.78 + Math.cos(B.a) * sg * 0.62;
        const c = Math.cos(sw), si = Math.sin(sw), d = Math.hypot(dx, dy);
        [dx, dy] = [(dx * c - dy * si) / d, (dx * si + dy * c) / d];
        const T = { x: B.x + dx * len, y: B.y + dy * len }, C = { x: B.x + dx * len * 0.5, y: B.y + dy * len * 0.5 };
        if (club) {
          ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.arc(B.x, B.y, W * 0.11, 0, TAU); ctx.fill();
          taper(ctx, B, C, { x: B.x + dx * len * 0.55, y: B.y + dy * len * 0.55 }, W * 0.075, W * 0.06, sp.stalk);
          ctx.fillStyle = sp.rhino;
          ctx.beginPath(); ctx.ellipse(B.x + dx * len * 0.7, B.y + dy * len * 0.7, len * 0.33, W * 0.13, Math.atan2(dy, dx), 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = Math.max(0.6, W * 0.028);
          for (let k = 0; k < 4; k++) { // ひだ(褶葉)
            const f = 0.5 + k * 0.12, h = W * 0.115 * Math.sin(Math.PI * (0.2 + k * 0.2));
            ctx.beginPath(); ctx.moveTo(B.x + dx * len * f - dy * h, B.y + dy * len * f + dx * h); ctx.lineTo(B.x + dx * len * f + dy * h, B.y + dy * len * f - dx * h); ctx.stroke();
          }
        } else taper(ctx, B, C, T, W * 0.15, W * 0.05, sp.rhino);
        if (sg === -1) anchors.rhino = scr(T);
      }
    };

    if (sp.type === 'dorid') {
      // 足(尾の先だけ外套膜から出る)
      const F = [];
      for (let i = 0; i <= 12; i++) { const u = i / 12, p = at(0.6 + 0.5 * u), w = W * 0.4 * Math.pow(1 - u, 0.6); F.push({ x: p.x - Math.sin(p.a) * w, y: p.y + Math.cos(p.a) * w }); }
      for (let i = 12; i >= 0; i--) { const u = i / 12, p = at(0.6 + 0.5 * u), w = W * 0.4 * Math.pow(1 - u, 0.6); F.push({ x: p.x + Math.sin(p.a) * w, y: p.y - Math.cos(p.a) * w }); }
      shadow(true); blob(ctx, F); ctx.fillStyle = sp.foot; ctx.fill(); shadow(false); edge();
      // 外套膜。ふちが波うつ
      const fr = (ph) => (t) => 1 + sp.frill * Math.sin(TAU * (sp.frillN * t - time * 0.32) + ph) * Math.sin(Math.PI * t);
      const O = outline(fr(0), fr(2.1));
      shadow(true); blob(ctx, O); ctx.fillStyle = sp.body; ctx.fill(); shadow(false);
      ctx.save(); ctx.clip();
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; // 背中の丸みのハイライト
      for (const w of [1.15, 0.75, 0.35]) { lineAlong(0.14, 0.86, 0); ctx.lineWidth = W * w; ctx.stroke(); }
      blob(ctx, O);
      for (let i = sp.bands.length - 1; i >= 0; i--) { ctx.strokeStyle = sp.bands[i][1]; ctx.lineWidth = W * sp.bands[i][0] * 2; ctx.stroke(); }
      for (const q of sp.marks) { // 斑紋。e > 1 は体の向きに細長い
        const p = P(q.t, q.s); ctx.fillStyle = q.c;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, W * q.r * q.e, W * q.r, p.a, 0, TAU); ctx.fill();
      }
      ctx.restore();
      blob(ctx, O); edge();
      anchors.mantle = scr(P(0.44, fr(0)(0.44)));

      rhino(0.15, 0.4, W * 0.95, true);

      // エラ(二次鰓)。花のように開いて、ゆっくり息をする
      const Cg = P(0.77, 0), br = 1 + 0.07 * Math.sin(time * 1.1), gs = sp.gillSize || 1;
      ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.arc(Cg.x, Cg.y, W * 0.34, 0, TAU); ctx.fill();
      for (let k = 0; k < sp.nGill; k++) {
        const u = sp.nGill > 1 ? k / (sp.nGill - 1) : 0.5, ang = Cg.a + (u - 0.5) * 4.9 + 0.08 * Math.sin(time * 0.9 + k * 1.7);
        const lg = W * 0.74 * gs * (1 - 0.3 * Math.abs(u - 0.5) * 2) * br, dx = Math.cos(ang), dy = Math.sin(ang), cv = (u < 0.5 ? -1 : 1) * 0.16;
        const T = { x: Cg.x + dx * lg, y: Cg.y + dy * lg }, M = { x: Cg.x + dx * lg * 0.5 - dy * lg * cv, y: Cg.y + dy * lg * 0.5 + dx * lg * cv };
        ctx.strokeStyle = sp.gillPin; ctx.lineWidth = Math.max(0.6, W * (sp.pinW || 0.055));
        for (let j = 1; j <= 6; j++) { // 羽のような枝
          const f = j / 7.5, v = 1 - f, qx = v * v * Cg.x + 2 * v * f * M.x + f * f * T.x, qy = v * v * Cg.y + 2 * v * f * M.y + f * f * T.y, l = lg * 0.17 * (1 - f * 0.4);
          for (const sg of [1, -1]) { ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(qx + (-dy * sg + dx * 1.15) * l, qy + (dx * sg + dy * 1.15) * l); ctx.stroke(); }
        }
        taper(ctx, Cg, M, T, lg * 0.1, lg * 0.035, sp.gillAxis);
        if (k === Math.floor(sp.nGill / 2)) anchors.gill = scr(M);
      }
      ctx.fillStyle = mix(sp.body, '#000000', 0.3); ctx.beginPath(); ctx.arc(Cg.x, Cg.y, W * 0.13, 0, TAU); ctx.fill();
    } else if (sp.type === 'aeolid') {
      // ミノウミウシ型: 半透明の細い体に、紡錘形の背側突起が左右に 1 列ずつ
      const O = outline(() => 1, () => 1);
      for (const sg of [1, -1]) { // 口触手
        const B = P(0.03, 0.5 * sg), len = W * 2.6, sw = sg * (0.5 + 0.12 * Math.sin(time * 1.1 + sg));
        const dx = -Math.cos(B.a + sw * 1.3), dy = -Math.sin(B.a + sw * 1.3);
        const T = { x: B.x + dx * len, y: B.y + dy * len }, C = { x: B.x - Math.cos(B.a) * len * 0.55, y: B.y - Math.sin(B.a) * len * 0.55 };
        taper(ctx, B, C, T, W * 0.2, W * 0.05, sp.body);
        if (sg === 1) anchors.oral = scr(T);
      }
      shadow(true); blob(ctx, O); ctx.fillStyle = sp.body; ctx.fill(); shadow(false);
      ctx.save(); ctx.clip();
      ctx.strokeStyle = 'rgba(190,170,150,.22)'; // 体の中が透けて見える
      lineAlong(0.14, 0.8, 0); ctx.lineWidth = W * 0.5; ctx.stroke();
      ctx.restore();
      blob(ctx, O); edge();
      const n = sp.nCer;
      for (let g = n - 1; g >= 0; g--) for (const sg of [1, -1]) {
        const tg = 0.2 + 0.66 * g / (n - 1) + (sg > 0 ? 0.02 : 0), B = P(tg, sg * 0.55);
        const ang = B.a + sg * (1.0 + 0.16 * Math.sin(time * 1.2 - tg * 7 + sg) + ((g * 7 + (sg > 0 ? 3 : 0)) % 5 - 2) * 0.07);
        const len = W * (2.0 - 1.0 * tg), dx = Math.cos(ang), dy = Math.sin(ang), rot = Math.atan2(dy, dx);
        const mid = (f) => ({ x: B.x + dx * len * f, y: B.y + dy * len * f });
        let m = mid(0.52);
        ctx.fillStyle = sp.cer; ctx.beginPath(); ctx.ellipse(m.x, m.y, len * 0.5, W * 0.24, rot, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.14)'; ctx.lineWidth = Math.max(0.5, L * 0.0025); ctx.stroke();
        m = mid(0.74); ctx.fillStyle = sp.sac; ctx.beginPath(); ctx.ellipse(m.x, m.y, len * 0.11, W * 0.12, rot, 0, TAU); ctx.fill(); // 刺胞嚢
        m = mid(0.95); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(m.x, m.y, len * 0.06, W * 0.07, rot, 0, TAU); ctx.fill(); // 先は半透明
        if (sg === -1 && g === Math.floor(n * 0.5)) anchors.cer = scr(mid(1));
      }
      rhino(0.12, 0.35, W * 2.3, false);
    } else {
      // アオミノウミウシ: 細い体の左右に、突起の群が 3 対
      const O = outline(() => 1, () => 1);
      const LOBES = [[0.27, 1.2, 9, 3.6, 0.3], [0.5, 1.0, 7, 2.7, 0], [0.7, 0.7, 5, 1.9, -0.3]];
      LOBES.forEach(([t, arm, n, fan, lean], i) => {
        for (const sg of [1, -1]) {
          const B = P(t, sg * 0.7), ang = B.a + sg * (Math.PI / 2 + lean + 0.07 * Math.sin(time * 0.8 + i + sg));
          const dx = Math.cos(ang), dy = Math.sin(ang), E = { x: B.x + dx * W * arm, y: B.y + dy * W * arm };
          for (let k = 0; k < n; k++) {
            const rel = (k / (n - 1) - 0.5) * 2.5, a2 = ang + rel + 0.05 * Math.sin(time * 1.1 + k + i), len = W * fan * (0.45 + 0.55 * Math.cos(rel * 0.95));
            const T = { x: E.x + Math.cos(a2) * len, y: E.y + Math.sin(a2) * len }, C = { x: E.x + Math.cos(a2 - rel * 0.18) * len * 0.5, y: E.y + Math.sin(a2 - rel * 0.18) * len * 0.5 };
            taper(ctx, E, C, T, W * 0.3, W * 0.06, sp.cer);
            taper(ctx, E, C, { x: E.x + (T.x - E.x) * 0.7, y: E.y + (T.y - E.y) * 0.7 }, W * 0.1, W * 0.02, sp.sheen);
            if (i === 0 && sg === -1 && k === Math.floor(n / 2)) anchors.cer = scr(T);
          }
          taper(ctx, B, { x: (B.x + E.x) / 2, y: (B.y + E.y) / 2 }, E, W * 0.5, W * 0.36, sp.body);
          ctx.fillStyle = '#F4F8FC'; ctx.beginPath(); ctx.arc(E.x, E.y, W * 0.36, 0, TAU); ctx.fill();
        }
      });
      shadow(true); blob(ctx, O); ctx.fillStyle = sp.body; ctx.fill(); shadow(false);
      ctx.save(); ctx.clip();
      lineAlong(0.02, 1, 0); ctx.strokeStyle = sp.band; ctx.lineWidth = W * 1.25; ctx.stroke();
      lineAlong(0.1, 0.82, 0); ctx.strokeStyle = sp.stripe; ctx.lineWidth = W * 0.3; ctx.stroke();
      ctx.restore();
      blob(ctx, O); edge();
      for (const sg of [1, -1]) { // 短い触角
        const B = P(0.06, sg * 0.6), a = B.a + Math.PI - sg * 0.9, T = { x: B.x + Math.cos(a) * W * 0.8, y: B.y + Math.sin(a) * W * 0.8 };
        taper(ctx, B, { x: (B.x + T.x) / 2, y: (B.y + T.y) / 2 }, T, W * 0.16, W * 0.06, sp.band);
        if (sg === -1) anchors.rhino = scr(T);
      }
    }
    ctx.restore();
    return anchors;
  }

  // 描く対象の一覧。画面に入っているものだけ毎こま描く
  const items = [];
  const isDark = () => !document.documentElement.classList.contains('light');
  function fit(cv) {
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    return { w: r.width, h: r.height, dpr };
  }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
    for (const e of es) { const it = items.find((i) => i.cv === e.target); if (it) it.vis = e.isIntersecting; }
  }, { rootMargin: '80px' }) : null;
  function add(cv, spec, opts) {
    const it = { cv, ctx: cv.getContext('2d'), spec, opts, vis: !io, size: fit(cv), bend: 0 };
    items.push(it);
    if (io) io.observe(cv);
    return it;
  }
  function paint(it, time) {
    const { w, h, dpr } = it.size, o = it.opts;
    it.ctx.setTransform(1, 0, 0, 1, 0, 0);
    it.ctx.clearRect(0, 0, it.cv.width, it.cv.height);
    const a = drawSlug(it.ctx, it.spec, time + it.spec.no * 3.1, { cx: w * (o.x || 0.5), cy: h * (o.y || 0.5), L: w * o.len * (it.spec.type !== 'dorid' ? 0.92 : it.spec.slim > 0.22 && !o.glow ? 0.84 : 1), rot: o.rot || 0, bend: it.bend, dark: isDark(), dpr, N: o.N, glow: o.glow });
    if (it.after) it.after(a, w, h);
  }

  const t0 = performance.now();
  function frame(now) {
    const time = (now - t0) / 1000;
    for (const it of items) if (it.vis) { if (it.tick) it.tick(); paint(it, time); }
    if (!reduce) requestAnimationFrame(frame);
  }
  const repaintAll = () => { for (const it of items) { it.size = fit(it.cv); if (it.layout) it.layout(); } if (reduce) for (const it of items) paint(it, 0); };
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(repaintAll, 120); });
  new MutationObserver(() => { if (reduce) for (const it of items) paint(it, 0); }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // --- 最初の画面の標本 ---
  const stage = document.querySelector('.specimen');
  if (stage) {
    const cv = stage.querySelector('canvas'), svg = stage.querySelector('.callouts'), plate = stage.querySelector('.plate');
    const guide = en ? 'https://en.seaslug.world/species/' : 'https://seaslug.world/species/';
    const NAMES = en
      ? { rhino: ['rhinophore', ''], gill: ['gills', ''], mantle: ['mantle', ''], cer: ['cerata', ''], oral: ['oral tentacle', ''] }
      : { rhino: ['触角', 'rhinophore'], gill: ['二次鰓', 'gills'], mantle: ['外套膜', 'mantle'], cer: ['背側突起', 'cerata'], oral: ['口触手', 'oral tentacle'] };
    const PARTS = { dorid: ['rhino', 'gill', 'mantle'], aeolid: ['rhino', 'cer', 'oral'], glaucus: ['rhino', 'cer'] };
    // 名前を置く場所(標本の枠に対する割合)。頭が左上を向くので、頭の部位は左、エラと突起は右上
    const SLOTS = { rhino: [0.02, 0.1, 'start'], gill: [0.98, 0.2, 'end'], cer: [0.98, 0.2, 'end'], mantle: [0.03, 0.86, 'start'], oral: [0.03, 0.86, 'start'] };
    const NS = 'http://www.w3.org/2000/svg';
    const el = (n, at) => { const e = document.createElementNS(NS, n); for (const k in at) e.setAttribute(k, at[k]); return e; };
    let labels = [];
    const it = add(cv, SPECIES[ORDER[0]], { len: 0.6, rot: 0.42, glow: true, N: 64 });

    it.layout = () => {
      const { w, h } = it.size, sp = it.spec;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.textContent = '';
      labels = PARTS[sp.type].map((key) => {
        const [fx, fy, anchor] = SLOTS[key], x = fx * w, y = fy * h;
        const g = el('g', {}), tx = el('text', { x, y, 'text-anchor': anchor });
        const a = el('tspan', { class: 'ja' }); a.textContent = NAMES[key][0];
        tx.appendChild(a);
        if (NAMES[key][1]) { const b = el('tspan', { class: 'la', dx: 8 }); b.textContent = NAMES[key][1]; tx.appendChild(b); }
        const path = el('path', {}), dot = el('circle', { r: 3 });
        g.append(path, dot, tx); svg.appendChild(g);
        const tw = tx.getComputedTextLength ? tx.getComputedTextLength() : 80;
        return { key, x, y: y + 7, x2: anchor === 'start' ? x + tw + 8 : x - tw - 8, path, dot };
      });
      // 物差し: 体長(mm)から 10mm の長さを出す
      const px = (w * it.opts.len) * 10 / sp.mm, sx = w * 0.99, sy = h * 0.95;
      const scale = el('g', { class: 'scale' });
      scale.appendChild(el('path', { d: `M${sx - px} ${sy - 5}v10M${sx - px} ${sy}H${sx}M${sx} ${sy - 5}v10` }));
      const st = el('text', { x: sx, y: sy - 11, 'text-anchor': 'end' }); st.textContent = '10 mm'; scale.appendChild(st);
      svg.appendChild(scale);
      cv.setAttribute('aria-label', en ? `Stylized drawing of ${sp.sci}, a sea slug, seen from above with its parts labelled` : `${sp.ja}(${sp.sci})を背中から見た、図案化した絵。部位の名前を添えています`);
      if (plate) {
        plate.hidden = false;
        plate.querySelector('.n').textContent = String(sp.no).padStart(2, '0');
        plate.querySelector('.mm').textContent = sp.mm;
        const a = plate.querySelector('.sp'); a.href = guide + sp.sci.toLowerCase().replace(/ /g, '_');
        const ja = a.querySelector('.ja'); if (ja) ja.textContent = sp.ja;
        a.querySelector('.sci').textContent = sp.sci;
        const note = stage.querySelector('.plate-note'); if (note) note.hidden = false;
      }
    };
    it.after = (a) => {
      for (const l of labels) {
        const p = a[l.key]; if (!p) continue;
        const x0 = Math.min(l.x, l.x2), x1 = Math.max(l.x, l.x2), near = Math.abs(p.x - x0) < Math.abs(p.x - x1) ? x0 : x1;
        l.path.setAttribute('d', `M${x0.toFixed(1)} ${l.y}H${x1.toFixed(1)}M${near.toFixed(1)} ${l.y}L${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
        l.dot.setAttribute('cx', p.x.toFixed(1)); l.dot.setAttribute('cy', p.y.toFixed(1));
      }
    };
    // ポインタのほうへ、頭をすこし向ける
    let want = 0;
    it.tick = () => { it.bend += (want - it.bend) * 0.04; };
    if (!reduce) {
      addEventListener('pointermove', (e) => {
        const r = cv.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const ly = -dx * Math.sin(it.opts.rot) + dy * Math.cos(it.opts.rot); // 体の向きに直した上下
        want = Math.max(-0.5, Math.min(0.5, ly / (r.width * 0.9)));
      }, { passive: true });
    }
    const again = stage.querySelector('.again');
    if (again) again.addEventListener('click', () => { // 次の種へ(一覧の順)
      stage.classList.add('swap');
      setTimeout(() => {
        it.spec = SPECIES[ORDER[it.spec.no % ORDER.length]];
        it.layout(); if (reduce) paint(it, 0);
        stage.classList.remove('swap');
      }, reduce ? 0 : 200);
    });
    it.layout();
  }

  // --- 製品の札の上にのる小さい個体(data-slug に種の名前) ---
  document.querySelectorAll('[data-slug]').forEach((card) => {
    const sp = SPECIES[card.dataset.slug]; if (!sp) return;
    const cv = document.createElement('canvas');
    cv.className = 'mini'; cv.setAttribute('aria-hidden', 'true'); cv.title = en ? sp.sci : sp.ja;
    card.appendChild(cv);
    add(cv, sp, { len: 0.74, N: 36, x: 0.48 });
  });

  // --- フッターの線の上を這う個体 ---
  const crawl = document.querySelector('.crawl');
  if (crawl) {
    const cv = document.createElement('canvas'); crawl.appendChild(cv);
    add(cv, SPECIES.festiva, { len: 0.74, N: 36, x: 0.48 });
  }

  if (reduce) for (const it of items) paint(it, 0); else requestAnimationFrame(frame);
})();
