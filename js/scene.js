/* =========================================================
   Computer Map — 공통 장면 엔진
   부품 안쪽 화면(네트워크, CPU, 메모리 …)이 함께 쓰는
   아이소메트릭 그리기 도우미 + 호버/연결 강조 + 상세 패널 + 화면 전환
   ========================================================= */
(() => {
  const f = n => +(+n).toFixed(1);

  /* ---------- 아이소메트릭 도우미 ---------- */
  function iso(CX, CY) {
    const P = (x, y, z = 0) => [x - y + CX, (x + y) / 2 + CY - z];
    const pts = a => a.map(p => p.map(f).join(',')).join(' ');
    // 평면 좌표(x, y)로 그린 내용을 높이 z의 윗면에 투영
    const top = (z, inner) => `<g transform="matrix(1 .5 -1 .5 ${CX} ${CY - z})">${inner}</g>`;
    // 상자: 바닥 z0, 높이 h  (fa: 왼쪽 앞면, fb: 오른쪽 앞면, ft: 윗면)
    const box = (x, y, w, d, z0, h, cls = '', style = '') => {
      const z1 = z0 + h, st = style ? ` style="${style}"` : '';
      return `<polygon class="fa" points="${pts([P(x, y + d, z1), P(x + w, y + d, z1), P(x + w, y + d, z0), P(x, y + d, z0)])}"/>` +
        `<polygon class="fb" points="${pts([P(x + w, y, z1), P(x + w, y + d, z1), P(x + w, y + d, z0), P(x + w, y, z0)])}"/>` +
        `<polygon class="ft ${cls}"${st} points="${pts([P(x, y, z1), P(x + w, y, z1), P(x + w, y + d, z1), P(x, y + d, z1)])}"/>`;
    };
    const onFaceA = (Y, x1, x2, z1, z2, cls) => `<polygon class="${cls}" points="${pts([P(x1, Y, z2), P(x2, Y, z2), P(x2, Y, z1), P(x1, Y, z1)])}"/>`;
    const onFaceB = (X, y1, y2, z1, z2, cls) => `<polygon class="${cls}" points="${pts([P(X, y1, z2), P(X, y2, z2), P(X, y2, z1), P(X, y1, z1)])}"/>`;
    const flatPath = (arr, z = 0) => 'M' + arr.map(([x, y]) => P(x, y, z).map(f).join(',')).join(' L');
    // 상자 모양의 보이지 않는 감지 영역
    const hit = (x, y, w, d, z0, z1) =>
      `<polygon class="hit" points="${pts([P(x, y, z1), P(x + w, y, z1), P(x + w, y, z0), P(x + w, y + d, z0), P(x, y + d, z0), P(x, y + d, z1)])}"/>`;
    return { P, pts, top, box, onFaceA, onFaceB, flatPath, hit };
  }


  /* ---------- 설명창용 분해 그림 도구 (모든 부품이 같은 방식으로 펼쳐짐) ----------
     spots: [{short, ko, en, desc, shape, hi, action, goto}]
     layout 'row'   : 공정·구성 요소를 옆으로 늘어놓고 사이를 벌림 (라벨은 위)
     layout 'stack' : 층을 위아래로 띄워 벌림 (라벨은 오른쪽)                       */
  const SCENE_NAMES = { cpu: 'CPU', memory: '메모리', storage: '저장장치', network: '네트워크', gpu: 'GPU', chipset: '칩셋', software: '소프트웨어', os: '운영체제', runtime: '언어 · 실행', app: '응용 프로그램', net: '네트워크', data: '데이터', algo: '자료구조 · 알고리즘', security: '보안', eng: '소프트웨어 공학' };
  function explodeKit(spots, o = {}) {
    const I = iso(0, 0), { P, box, top, onFaceA, onFaceB } = I;
    const n = spots.length, layout = o.layout || 'row';
    const txt = (x, y, t) => `<text class="lbl${String(t).length <= 5 ? ' lbl--lg' : ''}" x="${f(x)}" y="${f(y)}">${t}</text>`;
    const cyl = (cx, cy, z, r, h, cls) => {
      const [bx, by] = P(cx, cy, z), [, ty] = P(cx, cy, z + h), rx = r * Math.SQRT2, ry = r / Math.SQRT2;
      return `<path class="fa" d="M${f(bx - rx)},${f(ty)} L${f(bx - rx)},${f(by)} A${f(rx)} ${f(ry)} 0 0 0 ${f(bx + rx)},${f(by)} L${f(bx + rx)},${f(ty)} Z"/>` +
        top(z + h, `<circle class="ft ${cls}" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>`);
    };
    // 조각 모양: g = {x, y, w, d, z, h}, 반환 {svg, top(라벨이 붙을 높이)}
    const SH = {
      block: (g, sp) => ({ svg: box(g.x, g.y, g.w, g.d, g.z, g.h, sp.hi ? 'cache-top' : 'core-block') + top(g.z + g.h, txt(g.x + 7, g.y + g.d * 0.62, sp.short)), top: g.z + g.h }),
      chip: (g, sp) => {
        const z1 = g.z + 4, h = Math.max(8, g.h * 0.5);
        let s = box(g.x, g.y, g.w, g.d, g.z, 4, 'dev-top');
        for (let i = 0; i < 5; i++) {
          const t = 5 + i * (g.w - 12) / 4;
          s += onFaceA(g.y + g.d, g.x + t, g.x + t + 3, g.z + 0.6, g.z + 3.4, 'gold') + onFaceB(g.x + g.w, g.y + t, g.y + t + 3, g.z + 0.6, g.z + 3.4, 'gold');
        }
        s += box(g.x + g.w * 0.16, g.y + g.d * 0.16, g.w * 0.68, g.d * 0.68, z1, h, sp.hi ? 'cache-top' : 'core-block') +
          top(z1 + h, txt(g.x + g.w * 0.16 + 5, g.y + g.d * 0.6, sp.short));
        return { svg: s, top: z1 + h };
      },
      disk: (g, sp) => {
        const cx = g.x + g.w / 2, cy = g.y + g.d / 2, r = g.w / 2, h = 7;
        const s = cyl(cx, cy, g.z, r, h, sp.hi ? 'cache-top' : 'core-block') +
          top(g.z + h, `<circle class="stroke-dim" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.7)}"/><circle class="stroke-dim" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.42)}"/>` +
            `<circle class="cell cell--hi" cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.14)}"/>`) +
          top(g.z + h, txt(g.x + 4, g.y + g.d * 0.98, sp.short));
        return { svg: s, top: g.z + h };
      },
      layers: (g, sp) => {
        let s = '';
        for (let i = 0; i < 3; i++) s += box(g.x + 3, g.y + 3, g.w - 6, g.d - 6, g.z + i * 10, 5, i === 2 && sp.hi ? 'cache-top' : 'core-block');
        return { svg: s + top(g.z + 25, txt(g.x + 9, g.y + g.d * 0.6, sp.short)), top: g.z + 25 };
      },
      cells: (g, sp) => {
        let s = box(g.x, g.y, g.w, g.d, g.z, 5, 'core-plate');
        const c = (g.w - 8) / 3;
        for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++)
          s += box(g.x + 4 + q * c, g.y + 4 + r * c, c - 4, c - 4, g.z + 5, 9, (r + q) % 3 === 1 ? 'cache-top blink' : 'core-block');
        return { svg: s, top: g.z + 14 };
      },
      board: (g, sp) => {
        let s = box(g.x, g.y, g.w, g.d, g.z, 4, 'dev-top') + onFaceA(g.y + g.d, g.x + 6, g.x + g.w - 6, g.z + 0.5, g.z + 3.5, 'gold');
        s += top(g.z + 4, `<path class="stroke-dim" d="M${f(g.x + 6)} ${f(g.y + 8)} H${f(g.x + g.w - 6)} M${f(g.x + 6)} ${f(g.y + 14)} H${f(g.x + g.w * 0.5)}"/>`);
        s += box(g.x + g.w * 0.45, g.y + g.d * 0.35, g.w * 0.42, g.d * 0.45, g.z + 4, 7, sp.hi ? 'cache-top' : 'core-block');
        return { svg: s + top(g.z + 4, txt(g.x + 6, g.y + g.d * 0.82, sp.short)), top: g.z + 11 };
      },
      tall: (g, sp) => {
        const h = g.h * 1.8;
        let s = box(g.x + 6, g.y + 6, g.w - 12, g.d - 12, g.z, h, sp.hi ? 'cache-top' : 'core-block');
        for (let i = 0; i < 4; i++) s += onFaceA(g.y + g.d - 6, g.x + 10, g.x + g.w - 16, g.z + 6 + i * (h - 8) / 4, g.z + 9 + i * (h - 8) / 4, 'cell cell--hi');
        return { svg: s + top(g.z + h, txt(g.x + 10, g.y + g.d * 0.6, sp.short)), top: g.z + h };
      },
      screen: (g, sp) => {
        const Y = g.y + g.d * 0.45, H = g.w * 0.62;
        let s = box(g.x + g.w * 0.3, g.y + g.d * 0.3, g.w * 0.4, g.d * 0.4, g.z, 4, 'dev-top') + box(g.x, Y, g.w, 6, g.z + 4, H, 'core-block');
        s += onFaceA(Y + 6, g.x + 4, g.x + g.w - 4, g.z + 8, g.z + H, sp.hi ? 'cell cell--hi' : 'cell');
        const [tx, ty] = P(g.x + 8, Y + 6, g.z + H * 0.55);
        return { svg: s + `<text class="lbl lbl--lg" x="${f(tx)}" y="${f(ty + 4)}" transform="skewY(26.57)" transform-origin="${f(tx)} ${f(ty)}">${sp.short}</text>`, top: g.z + 4 + H };
      },
      antenna: (g, sp) => {
        const b = SH.block({ ...g, h: g.h * 0.6 }, sp), [mx, my] = P(g.x + g.w * 0.75, g.y + g.d * 0.25, g.z + g.h * 0.6);
        const arcs = [10, 18].map(r => `<path class="stroke-lav" d="M${f(mx - r)},${f(my - 34 - r * 0.2)} A${r} ${r} 0 0 1 ${f(mx + r)},${f(my - 34 - r * 0.2)}"/>`).join('');
        return { svg: b.svg + `<path class="stroke-dim" d="M${f(mx)},${f(my)} V${f(my - 32)}"/><circle class="token" cx="${f(mx)}" cy="${f(my - 34)}" r="3"/>` + arcs, top: g.z + g.h * 0.6 + 26 };
      },
      wire: (g, sp) => {
        const ym = g.y + g.d / 2;
        let s = box(g.x, ym - 9, 12, 18, g.z, 10, 'dev-top') + box(g.x + g.w - 12, ym - 9, 12, 18, g.z, 10, 'dev-top');
        const d = I.flatPath([[g.x + 12, ym], [g.x + g.w - 12, ym]], g.z + 5);
        s += `<path class="wire" d="${d}"/><path class="packet" d="${d}" pathLength="100"/>`;
        s += box(g.x + 14, ym + 8, g.w - 28, 2, g.z, 1, sp.hi ? 'cache-top' : 'core-block');
        return { svg: s + top(g.z + 10, txt(g.x + 14, ym - 6, sp.short)), top: g.z + 10 };
      },
      globe: (g, sp) => {
        const b = box(g.x + g.w * 0.25, g.y + g.d * 0.25, g.w * 0.5, g.d * 0.5, g.z, 4, 'dev-top');
        const [cx, cy0] = P(g.x + g.w / 2, g.y + g.d / 2, g.z + 4), r = g.w * 0.42, cy = cy0 - r - 4;
        const s = b + `<circle class="ft core-block" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>` +
          `<ellipse class="stroke-dim" cx="${f(cx)}" cy="${f(cy)}" rx="${f(r * 0.45)}" ry="${f(r)}"/><ellipse class="stroke-dim" cx="${f(cx)}" cy="${f(cy)}" rx="${f(r)}" ry="${f(r * 0.35)}"/>` +
          `<text class="lbl lbl--lg" x="${f(cx)}" y="${f(cy + 4)}" text-anchor="middle">${sp.short}</text>`;
        return { svg: s, top: g.z + 4 + r * 2 + 4 };
      }
    };
    let s = '', top0;
    const numLabel = (k, sp, cx, cy, raise, o) =>
      `<g class="xp-label" data-spot="${k}" style="--d:${o}">` +
      `<path class="stroke-dim" pathLength="1" d="M${f(cx)},${f(cy - 4)} V${f(cy - 34 - raise)}"/>` +
      `<circle cx="${f(cx)}" cy="${f(cy - 48 - raise)}" r="12"/><text class="num" x="${f(cx)}" y="${f(cy - 44 - raise)}">${k + 1}</text>` +
      `<text class="en" x="${f(cx + 18)}" y="${f(cy - 56 - raise)}">${sp.en}</text><text class="ko" x="${f(cx + 18)}" y="${f(cy - 41 - raise)}">${sp.ko}</text></g>`;
    if (layout === 'stack') {
      const w = o.w || 180, d = o.d || 120, h = 12, gap = o.gap || (n > 5 ? 40 : 52), shrink = o.shrink || 0;
      const Lx = P(w / 2, -d / 2, 0)[0] + 46;
      spots.forEach((sp, k) => {
        const lv = n - 1 - k, z = lv * gap, ww = w - lv * shrink, dd = d - lv * shrink, x = -ww / 2, y = -dd / 2;
        const light = 13 + (lv / Math.max(1, n - 1)) * 14;
        let g = box(x, y, ww, dd, z, h, sp.hi ? 'cache-top' : 'layer-top', sp.hi ? '' : `fill:hsl(var(--h) calc(55% * var(--sat)) ${light.toFixed(0)}%)`) +
          top(z + h, `<path class="stroke-dim" d="${Array.from({ length: Math.floor((ww - 20) / 26) }, (_, i) => `M${f(x + 46 + i * 26)} ${f(y + 10)} V${f(y + dd - 10)}`).join(' ')}" opacity=".45"/>` +
            `<rect class="cell${sp.hi ? ' cell--hi' : ''}" x="${f(x + ww - 38)}" y="${f(y + dd - 26)}" width="26" height="14" rx="2"/>` + txt(x + 10, y + 24, sp.short));
        if (sp.deco) g += sp.deco(I, { x, y, w: ww, d: dd, z: z + h });
        s += `<g class="xp" data-spot="${k}" style="--fx:0px;--fy:${lv * (gap - h - 2)}px;--o:${lv};--d:${lv}">${g}</g>`;
        const [ax, ay] = P(x + ww, y, z + h / 2);
        s += `<g class="xp-label" data-spot="${k}" style="--d:${lv}">` +
          `<path class="stroke-dim" pathLength="1" d="M${f(ax + 5)},${f(ay)} H${f(Lx - 14)}"/>` +
          `<circle cx="${f(Lx)}" cy="${f(ay)}" r="12"/><text class="num" x="${f(Lx)}" y="${f(ay + 4)}">${k + 1}</text>` +
          `<text class="en" x="${f(Lx + 18)}" y="${f(ay - 5)}">${sp.en}</text><text class="ko" x="${f(Lx + 18)}" y="${f(ay + 11)}">${sp.ko}</text></g>`;
      });
    } else {
      const slot = o.slot || (n <= 3 ? 112 : n === 4 ? 100 : n === 5 ? 90 : 80), sz = Math.round(slot * 0.66);
      const span = n * slot - (slot - sz), x0 = -span / 2;
      s += `<g class="xp-base">${box(x0 - 16, -sz / 2 - 16, span + 32, sz + 32, 0, 6, 'core-plate')}</g>`;
      spots.forEach((sp, k) => {
        const x = x0 + k * slot, y = -sz / 2, gm = { x, y, w: sz, d: sz, z: 6, h: sp.h || 26 };
        const out = sp.draw ? sp.draw(I, gm) : (SH[sp.shape] || SH.block)(gm, sp);
        const off = ((n - 1) / 2 - k) * slot * 0.32;
        const o = Math.abs(k - (n - 1) / 2);
        s += `<g class="xp" data-spot="${k}" style="--fx:${f(off)}px;--fy:${f(off / 2)}px;--o:${o}">${out.svg}</g>`;
        const [cx, cy] = P(x + sz / 2, 0, out.top);
        s += numLabel(k, sp, cx, cy, n >= 6 && k % 2 ? 36 : 0, o);
      });
    }
    if (o.extra) s += `<g class="xp-label" style="--d:${n}">${o.extra(I)}</g>`;
    return { svg: s };
  }
  // 부품별 분해 정보 등록: Scene.spots(T, { id: { layout, spots: [[short, ko, en, desc, {shape, hi, action, goto}], …] } })
  function spots(T, map) {
    Object.entries(map).forEach(([id, def]) => {
      const t = T[id]; if (!t) return;
      let list = def.spots;
      if (def.fromChildren) list = (t.childOrder || t.children).map(c => [T[c].short || '', T[c].ko, T[c].en, T[c].desc, { goto: c, ...(def.each || {}) }]);
      t.spots = list.map(a => Array.isArray(a) ? { short: a[0], ko: a[1], en: a[2], desc: a[3], ...(a[4] || {}) } : a);
      t.xp = { layout: def.layout, shrink: def.shrink, gap: def.gap, w: def.w, d: def.d, slot: def.slot, extra: def.extra };
      if (def.label) t.spotLabel = def.label;
    });
  }

  /* ---------- 장면 만들기 ---------- */
  function create({ T, cx = 440, cy = 320 }) {
    const g = iso(cx, cy);

    const part = (id, i, inner, o = {}) =>
      `<g class="part ${o.cls || ''}" data-part="${id}" tabindex="0" role="button" aria-label="${T[id].ko} 자세히 보기">` +
      `${o.hit || ''}<g class="part__in" style="--i:${i}">${o.lift ? `<g class="lift">${inner}</g>` : inner}</g></g>`;

    // 상호작용 없는 보조 그룹(회로선 등)이지만 특정 주제와 함께 강조됨
    const linked = (id, inner, cls = '') => `<g class="linked ${cls}" data-part="${id}">${inner}</g>`;

    const floor = (R = 280, step = 40) => {
      let d = '';
      for (let v = -R; v <= R; v += step) d += `M${v} ${-R} V${R} M${-R} ${v} H${R} `;
      return `<g class="floor" mask="url(#floorFade)">${g.top(0, `<path d="${d}"/>`)}</g>`;
    };

    // 층 쌓기(탑/피라미드): ids는 아래 → 위 순서
    const stack = ({ ids, x, y, w, d = w, h = 10, gap = 24, shrink = 0, i0 = 3, label = n => '' }) => {
      let s = ''; const anchors = {}, leftAnchors = {};
      ids.forEach((id, k) => {
        const z0 = k * gap, ww = w - k * shrink, dd = d - k * shrink;
        const xx = x + (k * shrink) / 2, yy = y + (k * shrink) / 2;
        const light = 13 + (k / Math.max(1, ids.length - 1)) * 14;
        const lab = label(id, k);
        s += part(id, i0 + k * 0.4,
          g.box(xx, yy, ww, dd, z0, h, 'layer-top', `fill:hsl(var(--h) calc(55% * var(--sat)) ${light}%)`) +
          (lab ? g.top(z0 + h, `<text class="layer-num" x="${xx + 8}" y="${yy + 20}">${lab}</text>`) : ''),
          { cls: 'layer', lift: true, hit: g.hit(xx, yy, ww, dd, z0, z0 + gap) });
        anchors[id] = g.P(xx + ww, yy + dd / 2, z0 + h / 2);
        leftAnchors[id] = g.P(xx, yy + dd, z0 + h / 2);
      });
      return { svg: s, anchors, leftAnchors };
    };

    // 장비/부품 라벨: a=앵커(화면 좌표), l=라벨 위치, below=라벨이 아래쪽
    const tags = list => list.map(({ id, a, l, below, end }, i) => {
      const [lx, ly] = l;
      const e = end || (below ? [lx, ly - 40] : [lx, ly + 12]);
      const enY = below ? ly - 22 : ly - 24, koY = below ? ly + 4 : ly;
      return `<g class="tag" data-part="${id}" style="--i:${i}"><g class="tag__in">` +
        `<path class="tag__line" d="M${f(a[0])},${f(a[1])} L${f(e[0])},${f(e[1])}"/>` +
        `<circle class="tag__ring" cx="${f(a[0])}" cy="${f(a[1])}" r="4"/><circle class="tag__dot" cx="${f(a[0])}" cy="${f(a[1])}" r="3"/>` +
        `<text class="tag__en" x="${lx}" y="${enY}">${T[id].en}</text><text class="tag__ko" x="${lx}" y="${koY}">${T[id].ko}</text></g></g>`;
    }).join('');

    // 층 옆 라벨 (가로선 + 번호 + 이름): side='right' | 'left'
    const sideTags = (list, side = 'right') => list.map(({ id, a, lx, n }, i) => {
      const ly = f(a[1]) + 4, t = T[id], R = side === 'right';
      const lineEnd = R ? lx - 8 : lx + 8;
      const anchor = R ? 'start' : 'end';
      const sub = t.en.includes('· ') ? t.en.split('· ')[1] : t.en;
      return `<g class="ltag" data-part="${id}" style="--i:${i}"><g class="tag__in">` +
        `<path class="ltag__line" d="M${f(a[0]) + (R ? 4 : -4)},${f(a[1])} H${lineEnd}"/>` +
        (n ? `<text class="ltag__n" x="${lx}" y="${ly}" text-anchor="${anchor}">${n}</text>` : '') +
        `<text class="ltag__ko" x="${R ? lx + (n ? 24 : 0) : lx - (n ? 24 : 0)}" y="${ly}" text-anchor="${anchor}">${t.ko}</text>` +
        `<text class="ltag__en" x="${R ? lx + (n ? 24 : 0) : lx - (n ? 24 : 0)}" y="${ly + 11}" text-anchor="${anchor}">${sub}</text></g></g>`;
    }).join('');

    /* ---------- 붙이기 + 상호작용 ---------- */
    // board: 보드 화면(바탕 무채색, 부품마다 자기 색), sub: { 부품: 안쪽 화면 주소 } → 누르면 확대해 들어감
    function mount(content, { defaultHint = '눌러서 자세히 보기', viewBox, arrivals = {}, routes = {}, board = false, sub = {}, flowsLabel } = {}) {
      Object.values(T).forEach(t => { if (t.spots && !t.explode) t.explode = () => explodeKit(t.spots, t.xp || {}); });
      const svg = document.getElementById('board');
      if (viewBox) svg.setAttribute('viewBox', viewBox);
      svg.innerHTML =
        `<defs><radialGradient id="fadeGrad"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
        `<mask id="floorFade"><rect x="-200" y="-200" width="1500" height="1000" fill="url(#fadeGrad)"/></mask></defs>` +
        `<g class="world">${content}</g>`;
      if (window.stabilizeHover) stabilizeHover(svg, '.part');
      // 평면 장면: 부품이 떠오르며 커지면 겹쳐 그린 표시(실행 중 테두리 등)와 어긋나므로 빛 강조만
      document.body.classList.toggle('is-flat', routes.mode === 'flat');
      // 쌓인 층(stack): 한 층이 강조되면 위층은 위로, 아래층은 아래로 티 나게 밀려남
      const layers = [...svg.querySelectorAll('.part.layer')];
      if (layers.length > 1) {
        let lt = null;
        const spread = () => {
          const hot = layers.map((l, k) => ((l.classList.contains('is-hot') && !l.classList.contains('is-from')) || l.classList.contains('is-sel') ? k : -1)).filter(k => k >= 0);
          const i = hot.length === 1 ? hot[0] : -1;
          layers.forEach((l, k) => { const lf = l.querySelector('.lift'); if (lf) lf.style.transform = i < 0 || k === i ? '' : k > i ? 'translateY(-30px)' : 'translateY(16px)'; });
        };
        new MutationObserver(() => { clearTimeout(lt); lt = setTimeout(spread, 40); }).observe(svg, { subtree: true, attributes: true, attributeFilter: ['class'] });
      }
      window.evenPulse?.(svg);

      const $ = id => document.getElementById(id);
      const hint = $('hint'), stage = $('stage');
      const ORIGIN = ((document.getElementById('back')?.getAttribute('href') || '').match(/from-(\w+)/) || [])[1] || document.body.dataset.scene || '';
      // 이 화면의 주인공 색
      if (window.HUES && HUES[ORIGIN] != null) document.body.style.setProperty('--h', HUES[ORIGIN]);
      // 무채색 영역(운영체제): 밝은 회색
      if (window.NEUTRAL && NEUTRAL[ORIGIN]) { document.body.style.setProperty('--sat', 0); document.body.classList.add('is-neutral'); }
      const reduced = window.KB_REDUCED;
      const narrow = matchMedia('(max-width: 760px)').matches;
      const baseHint = narrow ? '좌우로 밀어 둘러보고, 눌러서 자세히 보기' : defaultHint;
      hint.textContent = baseHint;
      let hot = null, selected = null;

      const related = id => {
        if (!id || !T[id]) return { main: [], link: [] };
        return { main: [id, ...(T[id].children || [])], link: T[id].links || [] };
      };
      const mark = (cls, id) => {
        const { main, link } = related(id);
        svg.classList.toggle(cls === 'is-hot' ? 'has-hot' : 'has-sel', !!id);
        const linkCls = cls === 'is-hot' ? 'is-link' : 'is-link-sel';
        svg.querySelectorAll('[data-part]').forEach(n => {
          n.classList.toggle(cls, main.includes(n.dataset.part));
          n.classList.toggle(linkCls, link.includes(n.dataset.part));
        });
      };
      const setHot = id => {
        if (id === hot) return;
        hot = id; mark('is-hot', id);
        if (!id && tourAPI.active()) return tourAPI.paint();
        if (!selected) {
          hint.textContent = id ? `${T[id].ko} — ${T[id].desc}` : baseHint;
          hint.classList.toggle('is-on', !!id);
        }
      };
      const partOf = e => { const id = e.target.closest('[data-part]')?.dataset.part; return T[id] ? id : null; };
      svg.addEventListener('pointerover', e => setHot(partOf(e)));
      svg.addEventListener('pointerleave', () => setHot(null));
      svg.addEventListener('focusin', e => setHot(partOf(e)));
      svg.addEventListener('focusout', () => setHot(null));
      svg.addEventListener('click', e => { const id = partOf(e); if (!id) return; if (sub[id]) return dive(id); openDetail(id); });
      // 보드: 부품과 라벨마다 자기 색, 바탕은 무채색
      if (board) {
        document.body.style.setProperty('--sat', 0);
        svg.querySelectorAll('.part[data-part], .tag[data-part], .ltag[data-part]').forEach(n => { const h = HUES[n.dataset.part]; if (h != null) { n.style.setProperty('--h', h); const nt = !!(window.NEUTRAL && NEUTRAL[n.dataset.part]); n.style.setProperty('--sat', nt ? 0 : 1); if (nt && n.classList.contains('part')) n.classList.add('is-neutral'); } });
      }
      // 안쪽 화면으로 확대해 들어가기 / 돌아왔을 때 그 부품에서 빠져나오기
      const originOf = id => {
        const r = svg.querySelector(`.part[data-part="${id}"]`).getBoundingClientRect(), b = svg.getBoundingClientRect();
        return `${((r.left + r.width / 2 - b.left) / b.width) * 100}% ${((r.top + r.height / 2 - b.top) / b.height) * 100}%`;
      };
      function dive(id) {
        if (reduced) { location.href = sub[id]; return; }
        svg.style.transformOrigin = originOf(id);
        svg.querySelectorAll(`[data-part="${id}"]`).forEach(n => n.classList.add('is-dive-target'));
        document.body.classList.add('is-diving');
        setTimeout(() => { location.href = sub[id]; }, 850);
      }
      const fromSub = location.hash.match(/^#from-(\w+)$/);
      if (fromSub && sub[fromSub[1]]) {
        svg.style.transformOrigin = originOf(fromSub[1]);
        document.body.classList.add('from-sub');
        clearHash();
      }
      svg.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && T[e.target.dataset?.part]) { e.preventDefault(); openDetail(e.target.dataset.part); }
      });

      /* ---------- 상세 설명창: 왼쪽엔 부품이 날아와 분해되고, 오른쪽엔 설명 카드 ---------- */
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.hidden = true;
      modal.innerHTML =
        `<div class="modal__backdrop" data-close></div>` +
        `<div class="modal__card" role="dialog" aria-modal="true" aria-labelledby="mTitle">` +
        `<button class="modal__close" data-close aria-label="닫기"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>` +
        `<div class="modal__visual"><div class="modal__grid"></div><svg class="modal__svg" aria-hidden="true"></svg>` +
        `<button class="vnav vnav--prev" data-move="-1" aria-label="이전"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>` +
        `<button class="vnav vnav--next" data-move="1" aria-label="다음"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div>` +
        `<div class="modal__body"><p class="modal__en"></p><h2 class="modal__title" id="mTitle"></h2>` +
        `<div class="panel__chips modal__chips"></div><div class="modal__main"></div><div class="modal__lists"></div></div></div>`;
      document.body.appendChild(modal);
      const m = sel => modal.querySelector(sel);
      const mSvg = m('.modal__svg');
      const arrow = '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>';
      const note = '<p class="panel__note">※ 주제 목록은 예시예요. 3단계에서 실제 내용으로 채웁니다.</p>';
      const wait = ms => new Promise(r => setTimeout(r, ms));
      let flown = [];

      const partsFor = id => [id, ...(T[id].children || [])].map(i => svg.querySelector(`.part[data-part="${i}"]`)).filter(Boolean);
      const visualOf = p => p.querySelector(':scope > .vis') || p.querySelector(':scope > .part__in') || p;
      const unionRect = els => {
        const rs = els.map(e => e.getBoundingClientRect());
        const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top));
        return { left: l, top: t, width: Math.max(...rs.map(r => r.right)) - l, height: Math.max(...rs.map(r => r.bottom)) - t };
      };
      // (분해 그림이 없는 부품용) 누른 부품을 복제해 설명창 왼쪽 칸에 배치
      function buildVisual(id) {
        const parts = partsFor(id);
        let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
        parts.forEach(p => { const b = p.getBBox(); x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height); });
        const pad = Math.max(x2 - x1, y2 - y1) * 0.06 + 4;
        mSvg.setAttribute('viewBox', `${f(x1 - pad)} ${f(y1 - pad)} ${f(x2 - x1 + pad * 2)} ${f(y2 - y1 + pad * 2)}`);
        mSvg.innerHTML = `<g class="modal__float">${parts.map(p => {
          const c = p.cloneNode(true);
          c.removeAttribute('tabindex'); c.removeAttribute('role');
          c.setAttribute('class', 'part modal-part');
          c.querySelectorAll('.hit, .hitclone').forEach(n => n.remove());
          return c.outerHTML;
        }).join('')}</g>`;
      }
      // 분해 그림은 처음부터 "조립된 모습"으로 날아오고, 자리에 앉은 뒤 갈라짐
      function buildExploded(id) {
        const ex = T[id].explode();
        mSvg.setAttribute('viewBox', ex.viewBox || fitBox(ex.svg));
        mSvg.innerHTML = `<g class="modal__float xp-root">${ex.svg}</g>`;
      }
      // FLIP: 장면 속 위치 ↔ 설명창 위치 (가운데를 맞추고 비율을 유지한 채 확대·축소)
      function fly(parts, dir) {
        if (reduced || !parts.length) return;
        const src = unionRect(parts.map(visualOf));
        const pieces = [...mSvg.querySelectorAll('.xp')];
        const dst = pieces.length ? unionRect(pieces) : mSvg.querySelector('.modal__float').getBoundingClientRect();
        const box = mSvg.getBoundingClientRect();
        const dcx = dst.left + dst.width / 2, dcy = dst.top + dst.height / 2;
        const s = Math.sqrt((src.width / dst.width) * (src.height / dst.height));
        mSvg.style.transformOrigin = `${dcx - box.left}px ${dcy - box.top}px`;
        const from = `translate(${src.left + src.width / 2 - dcx}px, ${src.top + src.height / 2 - dcy}px) scale(${s})`;
        if (dir === 'in') {
          mSvg.style.transition = 'none'; mSvg.style.transform = from; mSvg.style.opacity = '0.4';
          void mSvg.getBoundingClientRect();
          mSvg.style.transition = 'transform .85s cubic-bezier(.2,.8,.2,1), opacity .5s ease'; mSvg.style.transform = ''; mSvg.style.opacity = '';
        } else {
          mSvg.style.transition = 'transform .5s cubic-bezier(.6,0,.8,.4), opacity .5s ease'; mSvg.style.transform = from; mSvg.style.opacity = '0';
        }
      }
      function fitBox(markup) {
        const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        tmp.setAttribute('class', 'modal__svg');
        tmp.style.cssText = 'position:fixed;left:-9999px;top:0;width:600px;height:460px;visibility:hidden';
        tmp.innerHTML = `<g class="xp-root">${markup}</g>`;
        document.body.appendChild(tmp);
        const b = tmp.firstChild.getBBox(); tmp.remove();
        const pad = 26, w = Math.max(b.width + pad * 2, 440), h = Math.max(b.height + pad * 2, 340);
        return `${f(b.x + b.width / 2 - w / 2)} ${f(b.y + b.height / 2 - h / 2)} ${f(w)} ${f(h)}`;
      }

      /* ----- 오른쪽 설명 카드 ----- */
      // '레지스터란?' / '파이프라인이란?' 처럼 받침에 맞는 조사
      const ranOf = w => {
        const c = w.trim().slice(-1), code = c.charCodeAt(0);
        if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 ? '이란' : '란';
        return /[LMNR]/i.test(c) ? '이란' : '란';
      };
      const ICON = {
        prev: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
        next: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
        play: '<svg class="i-play" viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
        pause: '<svg class="i-pause" viewBox="0 0 24 24"><path d="M8 5h3v14H8zM13 5h3v14h-3z"/></svg>'
      };
      const cardHTML = t =>
        `<div class="card" aria-live="polite"><div class="card__head"><span class="card__tag"></span>` +
        `<button class="card__play" data-play aria-label="순서대로 보기" title="순서대로 보기">${ICON.play}${ICON.pause}</button></div>` +
        `<h3 class="card__title"></h3><p class="card__text"></p><div class="card__acts"></div>` +
        `<div class="dots">${[-1, ...t.spots.keys()].map(k => `<button class="dot" data-k="${k}" aria-label="${k < 0 ? '개요' : t.spots[k].ko}"></button>`).join('')}</div></div>`;
      const actsHTML = (sp, k) =>
        (sp.action ? `<button class="spot__action" data-flow="${sp.action.route}" data-spot-k="${k}">${sp.action.label}<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>` : '') +
        (sp.goto ? `<button class="spot__action spot__action--ghost" data-goto="${sp.goto}">${T[sp.goto].ko} 자세히<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>` : '');

      // 타이핑: 한 글자씩 써지고, 카드를 누르면 바로 끝까지
      let typeTimer = null, typeFinish = null;
      function typeText(el, text) {
        typeFinish?.();
        return new Promise(res => {
          const finish = () => { clearInterval(typeTimer); typeTimer = null; typeFinish = null; el.textContent = text; el.classList.remove('is-typing'); res(); };
          typeFinish = finish;
          if (reduced) return finish();
          el.textContent = ''; el.classList.add('is-typing');
          let i = 0;
          typeTimer = setInterval(() => { i++; el.textContent = text.slice(0, i); if (i >= text.length) finish(); }, 22);
        });
      }
      let cur = -1;
      const setSpot = k => {
        modal.classList.toggle('has-spot', k != null);
        mSvg.querySelectorAll('[data-spot]').forEach(n => n.classList.toggle('is-on', k != null && n.dataset.spot === String(k)));
      };
      // k = -1: 부품 전체(개요), 0..: 조각
      function select(k) {
        const t = T[selected];
        if (!t || !t.spots) return Promise.resolve();
        k = Math.max(-1, Math.min(t.spots.length - 1, k));
        cur = k;
        const sp = k >= 0 ? t.spots[k] : null, card = m('.card');
        card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
        m('.card__tag').textContent = sp ? `${String(k + 1).padStart(2, '0')} · ${sp.en}` : 'OVERVIEW · 개요';
        m('.card__title').textContent = sp ? sp.ko : `${t.ko}${ranOf(t.ko)}?`;
        m('.card__acts').innerHTML = sp ? actsHTML(sp, k) : `<span class="card__hint">조각을 누르거나 양옆 화살표로 넘겨 보세요</span>`;
        modal.querySelectorAll('.dot').forEach(b => b.classList.toggle('is-on', +b.dataset.k === k));
        m('.vnav--prev').disabled = k <= -1;
        m('.vnav--next').disabled = k >= t.spots.length - 1;
        setSpot(sp ? k : null);
        return typeText(m('.card__text'), sp ? sp.desc : t.desc);
      }
      // ▶ 순서대로 보기: 조각을 하나씩 강조하며 설명을 자동으로 넘김
      let playToken = 0;
      const stopPlay = () => { playToken++; modal.classList.remove('is-playing'); };
      async function play() {
        const t = T[selected];
        if (!t || !t.spots) return;
        const token = ++playToken;
        modal.classList.add('is-playing');
        for (let k = cur >= t.spots.length - 1 ? 0 : cur + 1; k < t.spots.length; k++) {
          await select(k);
          if (token !== playToken) return;
          await wait(1800);
          if (token !== playToken) return;
        }
        stopPlay();
      }

      function fillText(id) {
        const t = T[id];
        m('.modal__en').innerHTML = `${t.en}${t.kind === 'concept' ? '<span class="modal__kind">개념 · 구조</span>' : ''}`;
        m('.modal__title').textContent = t.ko;
        m('.modal__chips').innerHTML = (t.chips || []).map(c => `<span>${c}</span>`).join('');
        m('.modal__main').innerHTML = t.spots ? cardHTML(t) : `<p class="modal__desc">${t.desc}</p>`;
        let html = '';
        if (t.flows) {
          html += `<p class="modal__label">밖으로 주고받기</p><div class="flows">` + t.flows.map(fl =>
            `<button class="flow" data-flow="${fl.route}"><span class="flow__icon"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="2.5"/><path d="M8 12h9M14 8l4 4-4 4"/></svg></span>` +
            `<span class="flow__txt"><b>${fl.label}</b><small>${fl.desc || ''}</small></span></button>`).join('') + `</div>`;
        }
        if (t.children && !t.spots) {
          html += `<p class="modal__label">${t.childLabel || '구성'}</p><ol class="panel__list modal__list">` +
            (t.childOrder || t.children).map((c, i) =>
              `<li style="--i:${i}"><a href="#" data-goto="${c}"><span class="n">${T[c].short || String(i + 1).padStart(2, '0')}</span>${T[c].ko}${arrow}</a></li>`).join('') + `</ol>`;
        }
        if (t.topics && !t.children) {
          const list = `<ol class="panel__list modal__list">` +
            t.topics.map((x, i) => `<li style="--i:${i}"><a href="#"><span class="n">${String(i + 1).padStart(2, '0')}</span>${x}${arrow}</a></li>`).join('') + `</ol>`;
          html += t.spots ? `<details class="more"><summary>다룰 주제 <em>${t.topics.length}</em></summary>${list}${note}</details>`
            : `<p class="modal__label">다룰 주제</p>${list}${note}`;
        }
        m('.modal__lists').innerHTML = html;
      }
      // 다른 화면으로 이어지는 흐름: 데이터가 튀어나가며 하드웨어 보드로 이동
      function launchRoute(route, fromEl, suffix = '') {
        // 떠나는 장치가 맥박치며 데이터를 내보냄 (예전의 화면 밖으로 날아가는 빛 대신)
        const src = selected && svg.querySelector(`.part[data-part="${selected}"]`);
        if (src && window.kbPulse) kbPulse(src);
        setTimeout(() => {
          modal.classList.add('is-closing'); modal.classList.remove('is-open'); document.body.classList.add('is-leaving');
          mSvg.style.transition = 'opacity .3s ease, transform .3s ease'; mSvg.style.opacity = '0'; mSvg.style.transform = 'scale(.96)';
        }, reduced ? 0 : 450);
        setTimeout(() => { location.href = `hardware.html#route-${route}@${ORIGIN}${suffix}`; }, reduced ? 0 : 1000);
      }
      let explodeTimer = null, introTimer = null;
      function openDetail(id) {
        const wasOpen = !modal.hidden, t = T[id];
        stopPlay(); typeFinish?.();
        clearTimeout(explodeTimer); clearTimeout(introTimer);
        selected = id; mark('is-sel', id);
        m('.arrive-box')?.remove();
        fillText(id);
        flown.forEach(p => p.classList.remove('is-flying'));
        const parts = partsFor(id);
        modal.classList.remove('is-exploding', 'is-exploded', 'has-spot');
        modal.classList.toggle('has-spots', !!t.spots);
        if (t.explode) { modal.classList.add('is-exploding'); buildExploded(id); } else buildVisual(id);
        modal.hidden = false;
        document.body.classList.add('modal-open');
        modal.classList.remove('is-open', 'is-swap'); void modal.offsetWidth;
        modal.classList.add('is-open');
        if (wasOpen) modal.classList.add('is-swap'); else fly(parts, 'in');
        // 날아와 자리에 앉은 뒤 잠깐 멈췄다가 갈라짐
        if (t.explode) explodeTimer = setTimeout(() => modal.classList.add('is-exploded'), reduced ? 0 : wasOpen ? 300 : 1000);
        cur = -1;
        if (t.spots) {
          modal.querySelectorAll('.dot').forEach(b => b.classList.toggle('is-on', b.dataset.k === '-1'));
          m('.vnav--prev').disabled = true; m('.vnav--next').disabled = false;
          introTimer = setTimeout(() => { if (selected === id) select(-1); }, reduced ? 0 : wasOpen ? 150 : 520);
        }
        parts.forEach(p => p.classList.add('is-flying'));
        flown = parts;
        hint.textContent = '';
        m('.modal__close').focus({ preventScroll: true });
      }
      function closeDetail() {
        if (modal.hidden || modal.classList.contains('is-closing')) return;
        const parts = flown;
        stopPlay(); typeFinish?.();
        clearTimeout(explodeTimer); clearTimeout(introTimer);
        modal.classList.add('is-closing');
        modal.classList.remove('is-open', 'is-exploded', 'has-spot'); // 닫힐 때는 다시 조립되며 돌아감
        document.body.classList.remove('modal-open');
        fly(parts, 'out');
        setTimeout(() => {
          modal.hidden = true;
          modal.classList.remove('is-closing', 'is-swap', 'is-exploding', 'is-playing');
          mSvg.style.transition = 'none'; mSvg.style.transform = ''; mSvg.style.opacity = '';
          parts.forEach(p => p.classList.remove('is-flying'));
          flown = [];
        }, reduced ? 0 : 480);
        selected = null; mark('is-sel', null);
        hint.textContent = baseHint; hint.classList.remove('is-on');
      }
      modal.addEventListener('click', e => {
        if (e.target.closest('[data-close]')) return closeDetail();
        const go = e.target.closest('[data-goto]');
        if (go) { e.preventDefault(); return openDetail(go.dataset.goto); }
        const fl = e.target.closest('[data-flow]');
        if (fl) {
          e.preventDefault(); stopPlay();
          const k = fl.dataset.spotK;
          if (k != null) setSpot(k);
          return launchRoute(fl.dataset.flow, k != null ? mSvg.querySelector(`.xp[data-spot="${k}"]`) : fl);
        }
        if (e.target.closest('[data-play]')) return modal.classList.contains('is-playing') ? stopPlay() : play();
        const mv = e.target.closest('[data-move]');
        if (mv) { stopPlay(); return select(cur + +mv.dataset.move); }
        const st = e.target.closest('.dot');
        if (st) { stopPlay(); return select(+st.dataset.k); }
        const sp = e.target.closest('.modal__svg [data-spot]');
        if (sp) { stopPlay(); const k = +sp.dataset.spot; return select(cur === k ? -1 : k); }
        if (e.target.closest('.card')) return typeFinish?.();
        if (e.target.closest('.modal__list a')) e.preventDefault();
      });
      // 그림 위에 올리면 미리 강조만 (설명은 누를 때 바뀜)
      modal.addEventListener('pointerover', e => {
        if (!modal.classList.contains('is-exploded') || !e.target.closest('.modal__visual')) return;
        const sp = e.target.closest('[data-spot]');
        setSpot(sp ? sp.dataset.spot : (cur >= 0 ? cur : null));
      });
      m('.modal__visual').addEventListener('pointerleave', () => { if (!modal.hidden) setSpot(cur >= 0 ? cur : null); });
      addEventListener('keydown', e => {
        if (e.key === 'Escape') return closeDetail();
        if (modal.hidden || !T[selected]?.spots) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); stopPlay(); select(cur + (e.key === 'ArrowRight' ? 1 : -1)); }
      });

      /* 화면 전환 */
      requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('is-entering')));
      // 뒤로 가기 버튼과 상단 경로 링크: 빠져나가는 연출 후 이동
      const back = $('back');
      document.querySelectorAll('[data-crumb-hw]').forEach(a => a.setAttribute('href', back.getAttribute('href')));
      document.querySelectorAll('[data-leave]').forEach(a => a.addEventListener('click', e => {
        e.preventDefault();
        document.body.classList.add('is-leaving');
        setTimeout(() => { location.href = a.getAttribute('href'); }, 550);
      }));
      addEventListener('pageshow', e => { if (e.persisted) location.reload(); });
      stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;

      /* 다른 화면에서 데이터 여정으로 도착했을 때: 관련 항목을 강조하고 데이터가 내려앉는 연출 */

      /* ---------- 흐름 패널: 이 장치 안에서 일어나는 흐름 ---------- */
      const sceneTours = (window.TOURS || []).filter(t => t.scope !== 'board' && t.steps.some(st => st.scene === ORIGIN));
      const centerOf = id => {
        const p = svg.querySelector(`.part[data-part="${id}"]`);
        if (!p) return null;
        const b = (p.querySelector(':scope > .hitclone') || p).getBBox();
        return [b.x + b.width / 2, b.y + b.height / 2];
      };
      const trailPtsFn = (prev, st) => {
        // alias: 다른 부품 '안에서' 일어나는 일 (예: OSI 계층은 클라이언트 안) → 그 부품으로 보고 이동하지 않음
        const al = routes.alias || {}, a = al[prev.ids[0]] || prev.ids[0], b = al[st.ids[0]] || st.ids[0];
        if (a === b) return null;
        const P3 = p => g.P(p[0], p[1], p[2] || 0);
        if (routes.mode === 'flat') {
          const A = routes.anchors?.[a], B = routes.anchors?.[b];
          if (!A || !B) return null;
          if (A[0] === B[0] || A[1] === B[1]) return [A, B];
          return [A, routes.vfirst?.includes(a) ? [A[0], B[1]] : [B[0], A[1]], B];
        }
        const fw = routes.paths?.[`${a}-${b}`], bw = routes.paths?.[`${b}-${a}`];
        if (fw) return fw.map(P3);
        if (bw) return [...bw].reverse().map(P3);
        const A = routes.anchors?.[a], B = routes.anchors?.[b], z0 = routes.plane || 0;
        if (A && B && routes.mode === 'lift') return [A, [A[0], A[1], B[2]], B].map(P3);
        if (A && B) {
          const pts = [A, [A[0], A[1], z0], [B[0], A[1], z0], [B[0], B[1], z0], B];
          return pts.filter((p, i) => !i || p.some((v, j) => v !== pts[i - 1][j])).map(P3);
        }
        const ca = centerOf(a), cb = centerOf(b);
        return ca && cb ? [ca, cb] : null;
      };
      const tourAPI = window.TourPanel ? TourPanel({
        svg, scene: ORIGIN, names: SCENE_NAMES, hint, baseHint, reduced,
        hueOf: board ? st => HUES[st.ids[0]] : undefined,
        lead: board ? '앱에서 시작한 일이 어떤 층을 거쳐 하드웨어까지 내려가는지 따라가요.' : undefined,
        groups: [
          { label: flowsLabel || '이 장치 안에서', tours: sceneTours.filter(t => t.steps.every(st => st.scene === ORIGIN)), meta: t => `${t.steps.length}단계` },
          { label: '다른 장치로 이어지는', tours: sceneTours.filter(t => !t.steps.every(st => st.scene === ORIGIN)),
            meta: t => [...new Set(t.steps.map(st => st.scene))].map(x => SCENE_NAMES[x]).join(' → ') }
        ],
        clear: () => mark('is-hot', null),
        blocked: () => !modal.hidden,
        // 이전 장치 → 지금 장치: 하드웨어 보드처럼 실제 선을 따라 이동
        //   routes.paths['a-b'] : 그려진 회로선·케이블 경로 (반대 방향은 뒤집어 씀)
        //   그 외: 출발 장치에서 바닥으로 내려와 격자를 따라 가로 → 세로로 간 뒤 도착 장치로 올라감
        trailPts: trailPtsFn,
        clipIds: ids => ids.map(i => (routes.alias && routes.alias[i]) || i),
        style: document.body.classList.contains('sw-page') ? 'soft' : 'wire',
        onAway: (k, st, fromEl, tour) => launchRoute(`${ORIGIN}-${st.scene}`, fromEl, `~tour=${tour.id}.${k}`)
      }) : { active: () => false, paint() {} };

      // 하드웨어 장면: 흐름이 지나는 길에 실제 선이 없으면 배선을 그려 둠 (장치 아래에 깔려서 장치가 자연스럽게 가림)
      if (!document.body.classList.contains('sw-page') && routes.autoTrace !== false) {
        const seen = new Set(); let tr = '';
        sceneTours.forEach(t => t.steps.forEach((st, i) => {
          const pv = t.steps[i - 1];
          if (!pv || pv.scene !== ORIGIN || st.scene !== ORIGIN || pv.ids[0] === st.ids[0]) return;
          const key = [pv.ids[0], st.ids[0]].sort().join('-');
          if (seen.has(key)) return; seen.add(key);
          const pts = trailPtsFn(pv, st);
          if (pts && pts.length > 1) tr += `<path class="auto-trace" d="M${roundPts(pts).map(p => p.map(v => (+v).toFixed(1)).join(',')).join(' L')}"/>`;
        }));
        if (tr) { const fl = svg.querySelector('.world > .floor'); const html = `<g class="auto-traces">${tr}</g>`; fl ? fl.insertAdjacentHTML('afterend', html) : svg.querySelector('.world').insertAdjacentHTML('afterbegin', html); }
      }

      const arr = location.hash.match(/^#arrive-([a-z]+)-([a-z]+)(?:~tour=([\w-]+)\.(\d+))?$/);
      if (arr && arr[3]) {
        clearHash();
        document.body.classList.add('is-quick');
        setTimeout(() => tourAPI.start(arr[3], +arr[4]), reduced ? 0 : 650);
      }
      const arrKey = arr && `${arr[1]}-${arr[2]}`, backRoute = arr && `${arr[2]}-${arr[1]}`;
      // 이 화면에 따로 정의된 도착 연출이 없으면(되돌아온 경우 등) 그 흐름이 시작되는 부품을 강조
      const starters = arr ? Object.keys(T).filter(id => (T[id].flows || []).some(x => x.route === backRoute) || (T[id].spots || []).some(x => x.action?.route === backRoute)) : [];
      const arrival = arr && !arr[3] && (arrivals[arrKey] || {
        ids: starters,
        text: `${SCENE_NAMES[arr[1]] || ''}에서 되돌아왔어요.` + (starters.length ? ` 빛나는 부품에서 이 흐름이 시작됩니다.` : '')
      });
      if (arrival) {
        clearHash();
        // 도착 연출 동안은 마우스 호버가 강조를 덮어쓰지 않게 잠시 막음
        document.body.classList.add('is-journey', 'is-quick');
        setTimeout(() => document.body.classList.remove('is-journey'), reduced ? 0 : 4300);
        setTimeout(() => {
          svg.classList.add('has-hot');
          const litIds = ids => svg.querySelectorAll('[data-part]').forEach(n => n.classList.toggle('is-hot', ids.includes(n.dataset.part)));
          // 도착한 부품(경로의 끝)의 설명창을 열어, 거기서 다음 흐름으로 계속 이어 갈 수 있게
          const destId = [...arrival.ids].reverse().find(id => T[id]);
          const openArrived = () => {
            if (!destId || tourAPI.active() || !modal.hidden) return;
            openDetail(destId);
            const from = SCENE_NAMES[arr[1]] || '';
            m('.modal__body').insertAdjacentHTML('afterbegin',
              `<div class="arrive-box"><p class="modal__label">방금 도착 · ${from}에서</p><p class="arrive-box__txt">${arrival.text}</p><div class="arrive-box__btns">` +
              `<button class="spot__action spot__action--ghost" data-flow="${backRoute}"><svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>${from}로 되돌아가기</button>` +
              (arrival.next ? `<button class="spot__action" data-flow="${arrival.next.route}">${arrival.next.label}<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>` : '') + `</div></div>`);
          };
          const flashIds = () => {
            litIds(arrival.ids);
            arrival.ids.forEach(id => { const el = svg.querySelector(`.part[data-part="${id}"]`); if (el && window.kbFlash) kbFlash(el); });
            setTimeout(openArrived, reduced ? 0 : 750);
          };
          hint.textContent = arrival.text; hint.classList.add('is-on');
          // 들어온 데이터가 배선을 타고 와서, 닿는 순간 해당 부품이 번쩍
          if (arrival.path && !reduced && window.wireTravel) {
            const nums = arrival.path.match(/-?\d+(\.\d+)?/g).map(Number), pts = [];
            for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
            litIds([]);
            wireTravel(svg, pts, { hA: HUES[arr[1]], hB: HUES[ORIGIN], done: flashIds });
          } else flashIds();
          // 앞(다음 단계)·뒤(왔던 길로 되돌아가기) 이동 버튼 — 도착 부품의 설명창을 열 수 없을 때만
          const nav = document.createElement('div');
          if (destId) nav.hidden = true;
          nav.className = 'arrival-nav';
          nav.innerHTML = `<button class="arrival-btn arrival-btn--back" data-r="${backRoute}"><svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg><span>이전</span>${SCENE_NAMES[arr[1]] || ''}로 되돌아가기</button>` +
            (arrival.next ? `<button class="arrival-btn arrival-btn--next" data-r="${arrival.next.route}"><span>다음</span>${arrival.next.label}<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>` : '');
          document.body.appendChild(nav);
          setTimeout(() => nav.classList.add('is-on'), reduced ? 0 : 2200);
          nav.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (!b) return; nav.classList.remove('is-on'); launchRoute(b.dataset.r, b); });
          setTimeout(() => {
            if (selected || hot) return;
            mark('is-hot', null);
            svg.querySelector('.arrival')?.classList.add('is-done');
            hint.textContent = baseHint; hint.classList.remove('is-on');
          }, 6000);
        }, reduced ? 0 : 750);
      }
    }

    return { ...g, f, part, linked, floor, stack, tags, sideTags, mount };
  }

  window.Scene = { iso, create, spots, explodeKit, SCENE_NAMES };
})();
