/* =========================================================
   흐름 패널 (오른쪽) — 하드웨어 보드와 부품 화면이 함께 씀
   위는 지금 이동하는 데이터, 아래는 단계 설명(타이핑).
   장면에서는 그 단계의 장치가 빛나고, 이전 장치 → 지금 장치로 데이터가 이동.

   TourPanel({
     svg, scene, groups: [{ label, tours, meta(t) }],
     names: { scene: '이름' }, hint, baseHint, reduced,
     clear(),                 // 강조 지우기
     trailPts(prev, step),    // 데이터가 지나갈 꺾은선 좌표 [[x,y]…] (없으면 null)
     extraPaint(step, prev),  // 장치 외의 추가 강조 (회로선 등)
     onAway(k, step, fromEl), // 다른 화면의 단계로 넘어갈 때
     blocked(),               // 설명창이 열려 있는 등 키보드를 받지 않을 때
     style: 'wire' | 'soft',  // 하드웨어는 굵은 배선 위 빛 조각, 소프트웨어는 빛 점
     clip                     // false면 출발 · 도착 장치 가장자리에서 자르지 않음
   }) → { start, paint, active, stop }
   ========================================================= */
window.TourPanel = o => {
  const tours = o.groups.flatMap(g => g.tours);
  const api = { start() {}, paint() {}, active: () => false, stop() {} };
  if (!tours.length) return api;
  const { svg, scene, names = {} } = o;
  let tour = null, tk = 0;

  document.body.classList.add('has-tours');
  const aside = document.createElement('aside');
  aside.className = 'tours';
  aside.setAttribute('aria-label', '흐름');
  let n = 0;
  const hueOf = st => (o.hueOf ? o.hueOf(st) : null);
  const nodeStyle = st => { const h = hueOf(st); return h != null ? ` style="--nh:${h}"` : ''; };
  // 같은 장치가 연달아 나오면 점 하나로 (목록의 미니 노선용)
  const stops = t => t.steps.filter((st, i) => !i || (st.ids[0] !== t.steps[i - 1].ids[0]));
  const item = (t, meta) => `<button class="tour-item" data-tour="${t.id}" style="--i:${n++}">` +
    `<span class="ti-route">${stops(t).map(st => `<i${nodeStyle(st)}></i>`).join('')}</span>` +
    `<span class="ti-txt"><b>${t.title}</b><small>${t.desc}</small></span>` +
    `<span class="ti-meta">${meta(t)}<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></span></button>`;
  aside.innerHTML =
    `<div class="tours__list"><p class="tours__eyebrow">FLOWS</p><h2 class="tours__title">흐름</h2>` +
    `<p class="tours__lead">${o.lead || '이 화면에서 따라가 볼 수 있는 과정이에요.'}</p>` +
    o.groups.filter(g => g.tours.length).map(g => `<p class="tours__label">${g.label}</p>${g.tours.map(t => item(t, g.meta)).join('')}`).join('') + `</div>` +
    `<div class="tours__view"><button class="tours__back" data-tback><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>흐름 목록</button>` +
    `<p class="tours__eyebrow tv-where"></p><h2 class="tours__title tv-title"></h2><div class="tv-line"></div>` +
    `<div class="tv-data"><div class="tv-data__head"><span class="tv-data__label"></span><span class="tv-data__tag">DATA</span></div>` +
    `<p class="tv-data__value"></p><p class="tv-data__sub"></p></div>` +
    `<div class="tv-step" aria-live="polite"><span class="tv-step__n" aria-hidden="true"></span><h3 class="tv-step__title"></h3><p class="tv-step__text"></p></div>` +
    `<div class="tv-nav"><button class="tv-btn tv-btn--prev" data-tmove="-1" aria-label="이전 단계"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>` +
    `<span class="tv-count"></span>` +
    `<button class="tv-btn tv-btn--next" data-tmove="1"><span class="tv-next">다음</span><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button></div></div>`;
  document.body.appendChild(aside);
  const q = s => aside.querySelector(s);
  // 처음 한 번만: 흐름 패널이 무엇인지 짧게 안내
  const TIP = 'kb-tour-tip';
  let seen = false;
  try { seen = localStorage.getItem(TIP) === '1'; } catch (e) { seen = true; }
  const tip = document.createElement('div');
  if (!seen) {
    tip.className = 'tour-tip';
    tip.innerHTML = `<b>흐름을 골라 보세요</b><span>데이터가 장치 사이를 어떻게 오가는지 단계별로 따라가요. 그림 속 장치를 눌러 들어가도 돼요.</span><button type="button">알겠어요</button>`;
    aside.appendChild(tip);
    setTimeout(() => tip.classList.add('is-on'), o.reduced ? 0 : 1800);
  }
  const hideTip = () => { tip.classList.remove('is-on'); try { localStorage.setItem(TIP, '1'); } catch (e) {} };
  tip.addEventListener('click', e => { if (e.target.closest('button')) hideTip(); });
  const sceneOf = st => st.scene || scene;
  const whereOf = st => st.where || names[sceneOf(st)] || '';

  // 설명 타이핑
  let tTimer = null, tFinish = null;
  const typeTour = (el, text) => {
    tFinish?.();
    const finish = () => { clearInterval(tTimer); tFinish = null; el.textContent = text; el.classList.remove('is-typing'); };
    tFinish = finish;
    if (o.reduced) return finish();
    el.textContent = ''; el.classList.add('is-typing');
    let i = 0;
    tTimer = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) finish(); }, 20);
  };
  // 데이터 값이 바뀔 때: 무작위 글자가 왼쪽부터 원래 값으로 맞춰짐 (데이터가 도착하는 느낌)
  let dTimer = null;
  const GLYPH = '01ABCDEF#%$@&*<>/=+';
  const decode = (el, text) => {
    clearInterval(dTimer);
    if (o.reduced) { el.textContent = text; return; }
    let f = 0; const total = 14;
    dTimer = setInterval(() => {
      f++;
      const keep = Math.floor((f / total) * text.length);
      el.textContent = [...text].map((c, i) => (i < keep || c === ' ' ? c : GLYPH[(Math.random() * GLYPH.length) | 0])).join('');
      if (f >= total) { clearInterval(dTimer); el.textContent = text; }
    }, 28);
  };
  // 장치 강조 (마우스를 치우면 다시 이 강조로 돌아옴)
  //   이동 중(phase 'go'): 출발 장치만 빛나며 맥박 · 도착 장치는 아직 꺼져 있음
  //   도착(phase 'here'): 데이터가 닿는 순간 도착 장치가 번쩍 → 은은하게 머무름
  let phase = 'here', fromIds = [];
  const innerOf = nd => nd.querySelector(':scope > .vis') || nd.querySelector(':scope > .part__in') || nd;
  const glow = 'hsl(var(--h) calc(95% * var(--sat)) 80%)';
  const PULSE = [{ filter: 'brightness(1)' }, { filter: `brightness(1.45) drop-shadow(0 0 6px ${glow})` }, { filter: 'brightness(1)' }];
  const FLASH = [{ filter: 'brightness(2.4) drop-shadow(0 0 16px #fff)' }, { filter: `brightness(1.6) drop-shadow(0 0 12px ${glow})`, offset: 0.35 }, { filter: 'brightness(1) drop-shadow(0 0 0 transparent)' }];
  const lit = () => (phase === 'go' ? fromIds : (tour.steps[tk].ids || []));
  const paint = () => {
    if (!tour) return;
    const st = tour.steps[tk], ids = lit();
    svg.classList.add('has-hot');
    svg.querySelectorAll('[data-part]').forEach(nd => {
      nd.classList.toggle('is-hot', ids.includes(nd.dataset.part));
      const from = phase === 'go' && fromIds.includes(nd.dataset.part);
      nd.classList.toggle('is-from', from);
      // 출발 맥박: 부품의 등장 애니메이션을 건드리지 않도록 별도 애니메이션(WAAPI)으로
      if (from && !nd._pulse && !o.reduced && nd.classList.contains('part')) nd._pulse = innerOf(nd).animate(PULSE, { duration: 1100, iterations: Infinity, easing: 'ease-in-out' });
      if (!from && nd._pulse) { nd._pulse.cancel(); nd._pulse = null; }
    });
    o.extraPaint?.(st, tour.steps[tk - 1]);
  };
  const arrive = (pt) => {
    phase = 'here'; paint();
    const ids = tour.steps[tk].ids || [];
    svg.querySelectorAll('[data-part]').forEach(nd => {
      if (!ids.includes(nd.dataset.part)) return;
      if (!nd.classList.contains('part') || o.reduced) return;
      nd._flash?.cancel();
      nd._flash = innerOf(nd).animate(FLASH, { duration: 950, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    });
    if (pt && !o.reduced) {
      const g = svg.querySelector('.tour-trail');
      g?.insertAdjacentHTML('beforeend', `<circle class="tour-ripple" cx="${(+pt[0]).toFixed(1)}" cy="${(+pt[1]).toFixed(1)}" r="4"/>`);
    }
    svg.querySelector('.tour-trail')?.classList.add('is-done');
  };

  /* ----- 지나갈 길 다듬기: 출발 장치를 벗어나는 곳에서 시작해 도착 장치에 닿는 곳에서 멈춤 ----- */
  const sample = (pts, step = 3) => {
    const out = [];
    for (let i = 1; i < pts.length; i++) {
      const [a, b] = [pts[i - 1], pts[i]], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(len / step));
      for (let j = i === 1 ? 0 : 1; j <= n; j++) out.push([a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n]);
    }
    return out;
  };
  // 화면 좌표의 그 점 아래에 해당 장치의 그림이 있는지 (가려져 있어도 OK)
  const under = (p, ids) => {
    const m = svg.getScreenCTM(); if (!m) return false;
    const x = m.a * p[0] + m.c * p[1] + m.e, y = m.b * p[0] + m.d * p[1] + m.f;
    return document.elementsFromPoint(x, y).some(el => { const pt = el.closest?.('.part[data-part], .tag[data-part]'); return pt && pt.classList.contains('part') && ids.includes(pt.dataset.part); });
  };
  // 소프트웨어(평면 상자): 상자의 사각 영역으로 판단 — 화면 상태와 상관없이 항상 정확
  const boxesOf = ids => ids.map(i => svg.querySelector(`.part[data-part="${i}"]`)).filter(p => p && getComputedStyle(p).display !== 'none')
    .map(p => { try { return (p.querySelector(':scope > .part__in, :scope > .vis') || p).getBBox(); } catch (e) { return null; } }).filter(Boolean);
  const inBox = (p, boxes) => boxes.some(b => p[0] >= b.x - 1 && p[0] <= b.x + b.width + 1 && p[1] >= b.y - 1 && p[1] <= b.y + b.height + 1);
  const clipPath = (pts, fromIds, toIds) => {
    if (o.clipIds) { fromIds = o.clipIds(fromIds); toIds = o.clipIds(toIds); }
    if (o.style !== 'wire') {
      const s = sample(pts), A = boxesOf(fromIds), B = boxesOf(toIds);
      if (s.length < 4) return pts;
      let i0 = 0, i1 = s.length - 1;
      while (i0 < s.length - 2 && inBox(s[i0], A)) i0++;
      for (let i = i0 + 1; i < s.length; i++) if (inBox(s[i], B)) { i1 = i; break; }
      return i1 - i0 < 2 ? s : s.slice(i0, i1 + 1);
    }
    const s = sample(pts);
    if (s.length < 4) return pts;
    let i0 = 0, i1 = s.length - 1;
    if (o.clip !== false) {
      while (i0 < s.length - 2 && under(s[i0], fromIds)) i0++;
      for (let i = i0 + 1; i < s.length; i++) if (under(s[i], toIds)) { i1 = i; break; }
    }
    if (i1 - i0 < 3) { i0 = 0; i1 = s.length - 1; }
    return s.slice(i0, i1 + 1);
  };

  // 이전 장치 → 지금 장치로 데이터 이동. 속도는 거리와 상관없이 일정 (멀면 오래 걸림)
  const SPEED = 250;   // 화면 단위 / 초
  let trailToken = 0;
  const trail = (prev, st) => {
    svg.querySelector('.tour-trail')?.remove();
    const token = ++trailToken;
    const raw = prev && o.trailPts(prev, st);
    if (!raw || raw.length < 2) { phase = 'here'; fromIds = []; paint(); return; }
    fromIds = prev.ids || [];
    phase = 'go'; paint();
    const pts = clipPath(roundPts(raw), fromIds, st.ids || []);
    const len = polyLen(pts), dur = Math.min(2.2, Math.max(0.4, len / SPEED));
    const hA = o.hueOf?.(prev), hB = o.hueOf?.(st);
    const gr = hA != null && window.gradStroke ? gradStroke(svg, pts, hA, hB) : '';
    const color = gr ? `url(#${gr.id})` : '';
    const d = 'M' + pts.map(p => p.map(v => (+v).toFixed(1)).join(',')).join(' L');
    const wire = o.style === 'wire';
    svg.querySelector('.world').insertAdjacentHTML('beforeend',
      `<g class="tour-trail${wire ? ' tour-trail--wire' : ''}"${hB != null ? ` style="--th:${hB}"` : ''}>${gr ? `<defs>${gr.def}</defs>` : ''}` +
      (wire
        ? `<path class="tour-wire" d="${d}"${color ? ` style="stroke:${color}"` : ''}/>` + [0, 1, 2].map(k => `<path class="tour-bit" data-k="${k}" d=""/>`).join('')
        : `<path class="journey__path" d="${d}"${color ? ` style="stroke:${color}"` : ''}/><circle class="journey__dot" r="6"/>`) + `</g>`);
    const g = svg.querySelector('.tour-trail'), end = pts[pts.length - 1];
    let landed = false;
    const done = () => { if (token === trailToken && !landed) { landed = true; arrive(end); } };
    // 창이 가려져 애니메이션이 멈춰도 도착은 반드시 일어나게
    setTimeout(done, dur * 1000 + 450);
    if (!wire) return travel(g.querySelector('path'), g.querySelector('circle'), dur, done);
    // 하드웨어: 굵은 배선 위로 짧은 빛 조각 셋이 줄지어 달려감 (메인보드 회로선의 빛과 같은 모양)
    const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    const at = t => { let left = Math.max(0, Math.min(len, t)); for (let i = 0; i < seg.length; i++) { if (left <= seg[i] || i === seg.length - 1) { const k = seg[i] ? Math.min(1, left / seg[i]) : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } left -= seg[i]; } return end; };
    const piece = (a, b) => { if (b <= 0 || a >= len) return ''; a = Math.max(0, a); b = Math.min(len, b); const n = 4, q = []; for (let j = 0; j <= n; j++) q.push(at(a + (b - a) * j / n)); return 'M' + q.map(p => p.map(v => v.toFixed(1)).join(',')).join(' L'); };
    const bits = [...g.querySelectorAll('.tour-bit')], LEN = 14, GAP = 12;
    if (o.reduced) { done(); return; }
    const t0 = performance.now(), total = dur * 1000;
    const tick = now => {
      if (token !== trailToken) return;
      const p = Math.min(1, (now - t0) / total), head = p * len;
      bits.forEach((b, k) => b.setAttribute('d', piece(head - LEN - k * (LEN + GAP), head - k * (LEN + GAP))));
      if (p < 1) requestAnimationFrame(tick); else { bits.forEach(b => b.classList.add('is-gone')); done(); }
    };
    requestAnimationFrame(tick);
  };
  const pk = v => (window.KBLang ? KBLang.pick(v) : v);
  const render = prevK => {
    const st = tour.steps[tk], next = tour.steps[tk + 1];
    const N = tour.steps.length;
    q('.tv-where').textContent = whereOf(st);
    // 진행 화면의 강조색은 지금 데이터가 있는 장치의 색을 따라감 (보드)
    const h = hueOf(st), view = q('.tours__view');
    if (h != null) { view.style.setProperty('--h', h); view.style.setProperty('--sat', window.NEUTRAL && st.ids && NEUTRAL[st.ids[0]] ? 0 : 1); }
    aside.querySelectorAll('.tv-node').forEach((b, i) => { b.classList.toggle('is-done', i < tk); b.classList.toggle('is-on', i === tk); });
    q('.tv-line').style.setProperty('--p', N > 1 ? tk / (N - 1) : 1);
    const box = q('.tv-data');
    box.classList.remove('is-in'); void box.offsetWidth; box.classList.add('is-in');
    q('.tv-data__label').textContent = pk(st.data.label);
    decode(q('.tv-data__value'), pk(st.data.value));
    q('.tv-data__sub').textContent = pk(st.data.sub) || '';
    q('.tv-step__n').textContent = String(tk + 1).padStart(2, '0');
    q('.tv-count').innerHTML = `<b>${String(tk + 1).padStart(2, '0')}</b> / ${String(N).padStart(2, '0')}`;
    q('.tv-step__title').textContent = pk(st.title);
    typeTour(q('.tv-step__text'), pk(st.text));
    q('[data-tmove="-1"]').disabled = tk === 0;
    const away = !!next && sceneOf(next) !== scene;
    q('.tv-next').textContent = !next ? '처음으로' : away ? `다음 · ${names[sceneOf(next)]}로 이동` : '다음';
    q('.tv-btn--next').classList.toggle('is-away', away);
    paint();
    // 데이터 이동은 바로 다음 단계로 한 칸 나아갈 때만 (건너뛰기 · 뒤로 가기는 없는 길이 그려지므로 장치만 바로 켬)
    trail(prevK != null && prevK === tk - 1 ? tour.steps[prevK] : null, st);
    o.hint.textContent = '';
  };
  // 언어를 바꾸면: 목록의 미니 노선 점 · 진행 화면의 단계 점 색을 다시 칠하고, 보던 단계를 다시 그림
  const allTours = o.groups.flatMap(g => g.tours);
  const repaintHues = () => {
    aside.querySelectorAll('.tour-item').forEach(b => {
      const t = allTours.find(x => x.id === b.dataset.tour); if (!t) return;
      const dots = b.querySelectorAll('.ti-route i');
      stops(t).forEach((st, i) => { const h = hueOf(st); if (dots[i] && h != null) dots[i].style.setProperty('--nh', h); });
    });
    if (tour) aside.querySelectorAll('.tv-node').forEach((b, i) => { const h = tour.steps[i] && hueOf(tour.steps[i]); if (h != null) b.style.setProperty('--nh', h); });
  };
  window.KBLang?.on(() => { repaintHues(); if (tour) render(); });
  const go = k => {
    if (!tour) return;
    if (k >= tour.steps.length) k = 0;
    k = Math.max(0, k);
    const st = tour.steps[k];
    if (sceneOf(st) !== scene) { aside.classList.add('is-leaving'); return o.onAway?.(k, st, q('.tv-data'), tour); }
    const prev = tk;
    tk = k;
    render(prev !== k && sceneOf(tour.steps[prev]) === scene ? prev : null);
  };
  const start = (id, k) => {
    tour = tours.find(t => t.id === id) || (window.TOURS || []).find(t => t.id === id);
    if (!tour) return;
    if (k == null) k = Math.max(0, tour.steps.findIndex(s => sceneOf(s) === scene));
    tk = k;
    q('.tv-title').textContent = tour.title;
    q('.tv-line').innerHTML = tour.steps.map((s, i) =>
      `<button class="tv-node${sceneOf(s) !== scene ? ' is-away' : ''}" data-k="${i}"${nodeStyle(s)} aria-label="${i + 1}단계 · ${pk(s.title)}" title="${pk(s.title)}"><span></span></button>`).join('');
    document.body.classList.add('touring');
    aside.classList.add('is-view');
    hideTip();
    go(k);
    q('.tv-btn--next').focus({ preventScroll: true });
  };
  const stop = () => {
    tour = null; trailToken++; phase = 'here'; fromIds = []; tFinish?.(); clearInterval(dTimer);
    document.body.classList.remove('touring');
    aside.classList.remove('is-view');
    svg.querySelector('.tour-trail')?.remove();
    o.clear();
    o.hint.textContent = o.baseHint; o.hint.classList.remove('is-on');
  };
  aside.addEventListener('click', e => {
    const it = e.target.closest('[data-tour]');
    if (it) return start(it.dataset.tour);
    if (e.target.closest('[data-tback]')) return stop();
    const mv = e.target.closest('[data-tmove]');
    if (mv) return go(tk + +mv.dataset.tmove);
    const nd = e.target.closest('.tv-node');
    if (nd) return go(+nd.dataset.k);
    if (e.target.closest('.tv-step')) tFinish?.();
  });
  addEventListener('keydown', e => {
    if (!tour || o.blocked?.()) return;
    if (e.key === 'ArrowRight') go(tk + 1);
    else if (e.key === 'ArrowLeft' && tk > 0) go(tk - 1);
    else if (e.key === 'Escape') stop();
  });
  return { start, paint, stop, active: () => !!tour };
};
