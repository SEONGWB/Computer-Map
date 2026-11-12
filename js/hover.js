/* =========================================================
   움직임 설정 · 주소 정리 (모든 화면 공통, 가장 먼저 실행)
   · 애니메이션이 이 사이트의 핵심이라 운영체제의 '애니메이션 줄이기' 설정과 상관없이 기본으로 켬
     (직접 끄려면 localStorage 'kb-motion' = 'reduce')
   · 서버 없이 파일을 바로 열면(file://) history.replaceState가 보안 오류를 낼 수 있어 감싸 둠
   ========================================================= */
(() => {
  let r = false;
  try { r = localStorage.getItem('kb-motion') === 'reduce'; } catch (e) {}
  window.KB_REDUCED = r;
  if (r) document.documentElement.classList.add('kb-reduce');
  window.clearHash = () => { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} };
})();

/* =========================================================
   호버 떨림 방지
   부품이 강조되며 떠오르거나 커질 때 포인터 아래에서 벗어나면
   강조가 풀렸다 다시 걸리며 흔들립니다. 그래서 각 부품의 모양을
   그대로 복제한 '움직이지 않는 투명 감지 영역'을 깔고,
   눈에 보이는 그림(.vis)만 움직이게 합니다.
   ========================================================= */
window.stabilizeHover = (root, selector) => {
  const NS = 'http://www.w3.org/2000/svg';
  root.querySelectorAll(selector).forEach(p => {
    if (p.querySelector(':scope > .hit, :scope > .hitclone')) return; // 이미 감지 영역이 있는 경우
    const vis = document.createElementNS(NS, 'g');
    vis.setAttribute('class', 'vis');
    while (p.firstChild) vis.appendChild(p.firstChild);
    const clone = vis.cloneNode(true);
    clone.setAttribute('class', 'hitclone');
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('animate, animateTransform, animateMotion').forEach(a => a.remove());
    clone.querySelectorAll('[class], [style]').forEach(n => { n.removeAttribute('class'); n.removeAttribute('style'); });
    p.append(clone, vis);
  });
};

/* =========================================================
   데이터 이동: 빛나는 흐름선과 데이터(하얀 공)를 한 시계로 움직임
   선은 공이 지나간 곳까지만 매 프레임 다시 그려서, 화면이 확대·축소돼도
   항상 공 바로 뒤에 붙어 있음 (경로는 'M x,y L x,y …' 꺾은선)
   ========================================================= */
window.travel = (path, dot, dur, done) => {
  const pts = (path.getAttribute('d').match(/-?\d+(\.\d+)?/g) || []).map(Number)
    .reduce((a, n, i) => (i % 2 ? a[a.length - 1].push(n) : a.push([n]), a), []);
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  path.style.animation = 'none'; path.style.strokeDasharray = 'none'; path.style.strokeDashoffset = '0';
  path.removeAttribute('pathLength');
  const place = e => {
    let left = e * total, d = `M${pts[0][0]},${pts[0][1]}`, end = pts[0];
    for (let i = 0; i < seg.length; i++) {
      const a = pts[i], b = pts[i + 1];
      if (left >= seg[i]) { d += ` L${b[0]},${b[1]}`; end = b; left -= seg[i]; continue; }
      const t = seg[i] ? left / seg[i] : 0;
      end = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      d += ` L${end[0].toFixed(1)},${end[1].toFixed(1)}`;
      break;
    }
    path.setAttribute('d', d);
    dot.setAttribute('cx', (+end[0]).toFixed(1)); dot.setAttribute('cy', (+end[1]).toFixed(1));
  };
  place(0);
  if (window.KB_REDUCED) { place(1); done && done(); return; }
  const t0 = performance.now();
  const step = now => {
    const p = Math.min(1, (now - t0) / (dur * 1000));
    place(ease(p));
    if (p < 1) requestAnimationFrame(step); else if (done) done();
  };
  requestAnimationFrame(step);
};

/* 꺾은선의 모서리를 살짝 둥글게 (선을 따라가되 딱딱하지 않게) */
window.roundPts = (pts, r = 10) => {
  if (pts.length < 3) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const [a, b, c] = [pts[i - 1], pts[i], pts[i + 1]];
    const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const k = Math.min(r, l1 / 2, l2 / 2);
    if (k < 1) { out.push(b); continue; }
    const p = [b[0] + (a[0] - b[0]) * k / l1, b[1] + (a[1] - b[1]) * k / l1];
    const q = [b[0] + (c[0] - b[0]) * k / l2, b[1] + (c[1] - b[1]) * k / l2];
    for (let t = 0; t <= 1.0001; t += 0.2) {
      const u = 1 - t;
      out.push([u * u * p[0] + 2 * u * t * b[0] + t * t * q[0], u * u * p[1] + 2 * u * t * b[1] + t * t * q[1]]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
window.polyLen = pts => pts.reduce((s, p, i) => i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);

/* 영역마다 고유한 색상(hue). CSS의 --h에 넣으면 그 영역의 모든 강조색이 바뀜 */
window.HUES = {
  board: 256, cpu: 264, memory: 188, storage: 38, network: 156, gpu: 322, chipset: 214, input: 96, monitor: 6,   // 하드웨어 (input = 키보드 · 마우스)
  software: 256, os: 166, runtime: 276, app: 332, net: 156, data: 38, algo: 62, security: 0, eng: 228   // 소프트웨어 (네트워크·데이터는 하드웨어와 같은 색)
};
// 설명 언어의 색: 언어마다 달라지는 영역(응용 프로그램, 언어 · 실행)은 고른 언어의 색을 따름
window.LANG_HUES = { c: 48, java: 16, python: 212 };
// 무채색으로 그리는 영역: 운영체제는 언어와 상관없는 공통 영역이라 밝은 회색
window.NEUTRAL = {};   // 지금은 없음 (운영체제는 청록 · 민트)
['app', 'runtime'].forEach(k => Object.defineProperty(window.HUES, k, { get: () => LANG_HUES[(window.KBLang && KBLang.get()) || 'java'], enumerable: true, configurable: true }));

// 출발 색 → 도착 색으로 바뀌는 선 (데이터 흐름이 어디서 어디로 가는지 색으로도 보이게)
window.gradStroke = (svg, pts, hA, hB) => {
  if (hA == null || hB == null || hA === hB) return '';
  const id = 'g' + Math.random().toString(36).slice(2, 8), a = pts[0], b = pts[pts.length - 1];
  return { id, def: `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}">` +
    `<stop offset="0" stop-color="hsl(${hA} 92% 78%)"/><stop offset="1" stop-color="hsl(${hB} 92% 78%)"/></linearGradient>` };
};

/* 선 위를 흐르는 빛 조각: 선이 길든 짧든 같은 속도로 (짧은 선에서 느리고 긴 선에서 휙 지나가지 않게) */
window.evenPulse = (root, speed = 42) => root.querySelectorAll('.packet, .bus__pulse').forEach(p => {
  try {
    const m = p.getCTM(), sc = m ? Math.hypot(m.a, m.b) : 1, len = p.getTotalLength() * sc;
    if (len > 0) p.style.animationDuration = Math.min(9, Math.max(1.4, len / speed)).toFixed(2) + 's';
  } catch (e) {}
});

/* =========================================================
   새 흐름 표현 (흐름 패널 · 장치 사이 이동 · 도착 연출이 함께 씀)
   wireTravel: 굵은 배선 + 그 위를 달리는 빛 조각 셋, 일정한 속도. 끝에 닿으면 물결 + done()
   kbPulse / kbFlash: 출발 장치의 맥박 · 도착 장치의 번쩍임 (부품 등장 애니메이션과 겹치지 않게 WAAPI)
   ========================================================= */
(() => {
  const innerOf = nd => nd.querySelector(':scope > .vis') || nd.querySelector(':scope > .part__in') || nd;
  const glow = 'hsl(var(--h) calc(95% * var(--sat)) 80%)';
  window.kbPulse = nd => window.KB_REDUCED ? null : innerOf(nd).animate([{ filter: 'brightness(1)' }, { filter: `brightness(1.45) drop-shadow(0 0 6px ${glow})` }, { filter: 'brightness(1)' }], { duration: 1100, iterations: Infinity, easing: 'ease-in-out' });
  window.kbFlash = nd => window.KB_REDUCED ? null : innerOf(nd).animate([{ filter: 'brightness(2.4) drop-shadow(0 0 16px #fff)' }, { filter: `brightness(1.6) drop-shadow(0 0 12px ${glow})`, offset: 0.35 }, { filter: 'brightness(1) drop-shadow(0 0 0 transparent)' }], { duration: 950, easing: 'cubic-bezier(.2, .8, .2, 1)' });
  window.wireTravel = (svg, pts, { hA, hB, done, speed = 250, maxDur = 2.2 } = {}) => {
    const len = polyLen(pts), dur = Math.min(maxDur, Math.max(0.4, len / speed));
    const gr = hA != null && window.gradStroke ? gradStroke(svg, pts, hA, hB) : '';
    const d = 'M' + pts.map(p => p.map(v => (+v).toFixed(1)).join(',')).join(' L');
    svg.querySelector('.world').insertAdjacentHTML('beforeend',
      `<g class="tour-trail tour-trail--wire kb-travel"${hB != null ? ` style="--th:${hB}"` : ''}>${gr ? `<defs>${gr.def}</defs>` : ''}` +
      `<path class="tour-wire" d="${d}"${gr ? ` style="stroke:url(#${gr.id})"` : ''}/>` + [0, 1, 2].map(k => `<path class="tour-bit" data-k="${k}" d=""/>`).join('') + `</g>`);
    const g = [...svg.querySelectorAll('.kb-travel')].pop(), end = pts[pts.length - 1];
    let landed = false;
    const land = () => {
      if (landed) return; landed = true;
      g.querySelectorAll('.tour-bit').forEach(b => b.classList.add('is-gone'));
      if (!window.KB_REDUCED) g.insertAdjacentHTML('beforeend', `<circle class="tour-ripple" cx="${(+end[0]).toFixed(1)}" cy="${(+end[1]).toFixed(1)}" r="4"/>`);
      g.classList.add('is-done');
      done && done(end);
    };
    if (window.KB_REDUCED) { land(); return g; }
    const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    const at = t => { let left = Math.max(0, Math.min(len, t)); for (let i = 0; i < seg.length; i++) { if (left <= seg[i] || i === seg.length - 1) { const k = seg[i] ? Math.min(1, left / seg[i]) : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } left -= seg[i]; } return end; };
    const piece = (a, b) => { if (b <= 0 || a >= len) return ''; a = Math.max(0, a); b = Math.min(len, b); const q = []; for (let j = 0; j <= 4; j++) q.push(at(a + (b - a) * j / 4)); return 'M' + q.map(p => p.map(v => v.toFixed(1)).join(',')).join(' L'); };
    const bits = [...g.querySelectorAll('.tour-bit')], LEN = 14, GAP = 12, t0 = performance.now();
    const tick = now => {
      if (!g.isConnected || landed) return;
      const p = Math.min(1, (now - t0) / (dur * 1000)), head = p * len;
      bits.forEach((b, k) => b.setAttribute('d', piece(head - LEN - k * (LEN + GAP), head - k * (LEN + GAP))));
      if (p < 1) requestAnimationFrame(tick); else land();
    };
    requestAnimationFrame(tick);
    setTimeout(land, dur * 1000 + 450);   // 창이 가려져 애니메이션이 멈춰도 도착은 반드시
    return g;
  };
})();
