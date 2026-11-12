/* =========================================================
   IT Knowledge Base — Hardware sub page
   메인보드를 아이소메트릭으로 그리고, 부품마다 상호작용을 붙입니다.
   ========================================================= */
(() => {
  /* ---------- 부품 정보 (주제 목록은 3단계에서 실제 내용으로 교체) ---------- */
  const PARTS = {
    chipset: {
      ko: '칩셋 · 입출력', en: 'CHIPSET · I/O',
      desc: 'CPU와 USB·SATA·PCIe 주변 장치를 이어 주는 메인보드의 교차로.',
      topics: ['칩셋(PCH)의 역할', '버스와 PCIe', '인터럽트와 DMA', '입출력 장치']
    },
    cpu: {
      ko: 'CPU', en: 'PROCESSOR',
      desc: '명령어를 읽고 해석해 연산하는 컴퓨터의 두뇌.',
      topics: ['명령어 파이프라인', '캐시 계층', '멀티코어와 스레드', '클럭과 성능']
    },
    memory: {
      ko: '메모리', en: 'MEMORY',
      desc: '실행 중인 프로그램과 데이터를 잠시 담아 두는 빠른 작업 공간.',
      topics: ['DRAM과 SRAM', '메모리 계층 구조', '가상 메모리', '페이징과 세그멘테이션']
    },
    storage: {
      ko: '저장장치', en: 'STORAGE',
      desc: '전원이 꺼져도 데이터를 보관하는 장치. SSD, HDD, NVMe 등.',
      topics: ['HDD와 SSD', 'NVMe와 SATA', 'RAID', '파일 시스템']
    },
    network: {
      ko: '네트워크', en: 'NETWORK',
      desc: '컴퓨터를 다른 컴퓨터와 연결하는 장치와 통신 방식.',
      topics: ['OSI 7계층', 'TCP/IP', '이더넷과 Wi-Fi', '라우터와 스위치']
    },
    input: {
      ko: '키보드 · 마우스', en: 'INPUT DEVICES',
      desc: '사람의 손짓을 신호로 바꾸는 입력 장치. USB 케이블로 뒷면 단자에 꽂혀 칩셋으로 들어가요.',
      topics: ['스캔 코드', 'USB와 폴링', '인터럽트로 알리기']
    },
    monitor: {
      ko: '모니터', en: 'DISPLAY',
      desc: 'GPU가 그린 화면을 보여 주는 출력 장치. 그래픽카드의 HDMI · DP 단자에서 케이블로 이어져요.',
      topics: ['해상도와 주사율', 'HDMI와 DisplayPort', '프레임 버퍼에서 화면까지']
    },
    gpu: {
      ko: 'GPU', en: 'GRAPHICS',
      desc: '수천 개의 코어로 대량의 연산을 동시에 처리하는 병렬 처리 장치.',
      topics: ['병렬 처리 구조', 'VRAM', '렌더링 파이프라인', 'GPGPU와 CUDA']
    }
  };

  /* ---------- 메인보드 그림: 공용 파일(mainboard.js)에서 가져옴 (소프트웨어 바닥에도 씀) ---------- */
  const MB = Mainboard(500, 350, PARTS);
  const { P, pts, top, box, onFaceA, onFaceB, line, BUS, neighbors } = MB;

  /* ---------- 라벨 ---------- */
  const TAGS = [
    { id: 'storage', a: P(-157, -9, 3), l: [300, 175], up: true },
    { id: 'cpu', a: P(0, -20, 15), l: [520, 200], up: true },
    { id: 'network', a: [P(190, -165, 28)[0], P(190, -165, 28)[1] - 70], l: [880, 185], up: true },
    { id: 'memory', a: P(92, -15, 39), l: [705, 245], up: true },
    { id: 'gpu', a: P(-10, 107, 22), l: [330, 535], up: false },
    { id: 'input', a: P(-110, 228, -12), l: [150, 540], up: false },
    { id: 'monitor', a: P(-296, 55, 118), l: [150, 56], up: true },
    { id: 'chipset', a: P(172, 27, 8), l: [770, 520], up: false }
  ];
  const tags = () => TAGS.map(({ id, a, l, up }, i) => {
    const [lx, ly] = l;
    const end = up ? [lx, ly + 12] : [lx, ly - 40];
    const enY = up ? ly - 24 : ly - 22;
    const koY = up ? ly : ly + 4;
    return `<g class="tag" data-part="${id}" style="--i:${i};--h:${HUES[id]};--sat:1"><g class="tag__in">` +
      `<path class="tag__line" d="M${a[0]},${a[1]} L${end[0]},${end[1]}"/>` +
      `<circle class="tag__ring" cx="${a[0]}" cy="${a[1]}" r="4"/><circle class="tag__dot" cx="${a[0]}" cy="${a[1]}" r="3"/>` +
      `<text class="tag__en" x="${lx}" y="${enY}">${PARTS[id].en}</text>` +
      `<text class="tag__ko" x="${lx}" y="${koY}">${PARTS[id].ko}</text></g></g>`;
  }).join('');

  /* ---------- 입출력 장치: 보드 바깥 책상 위 (뒤 = 모니터, 앞 = 키보드 · 마우스) ---------- */
  const Z0 = -18;   // 책상 높이 (보드 밑면)
  const pp = a => a.map(([x, y, z]) => P(x, y, z).map(v => +v.toFixed(1)).join(',')).join(' L');
  const cable = (pts, cls = 'io-cable') => `<path class="${cls}" d="M${pp(pts)}"/>`;
  const ioPart = (id, i, inner) => `<g class="part" data-part="${id}" style="--h:${HUES[id]};--sat:1" tabindex="0" role="button" aria-label="${PARTS[id].ko}">` +
    `<g class="part__in" style="--i:${i}">${inner}</g></g>`;
  // 케이블 경로 (흐름도 이 선을 그대로 따라감)
  const USB_CABLE = [[-110, 205, Z0 + 2], [-110, 192, Z0], [-258, 192, Z0], [-258, -188, Z0], [-100, -188, Z0], [-100, -172, 12]];
  const USB_TRACE = [[-90, -150, 0], [-90, -130, 0], [140, -130, 0], [140, 20, 0], [148, 20, 0]];
  const HDMI_CABLE = [[-150, 107, 8], [-172, 107, Z0], [-270, 107, Z0], [-270, 60, Z0], [-300, 60, Z0 + 3]];
  const monitor = ioPart('monitor', 6,
    box(-322, 38, 34, 44, Z0, 3) + box(-308, 52, 8, 16, Z0 + 3, 34) +
    box(-302, -30, 6, 170, 12, 106, 'mon-body') +
    onFaceB(-296, -22, 132, 18, 112, 'mon-screen') +
    `<polygon class="mon-glyph" points="${[P(-296, 40, 50), P(-296, 52, 86), P(-296, 64, 50), P(-296, 59, 50), P(-296, 52, 72), P(-296, 45, 50)].map(p => p.map(v => +v.toFixed(1)).join(',')).join(' ')}"/>` +
    `<polygon class="mon-glyph" points="${[P(-296, 46, 62), P(-296, 58, 62), P(-296, 57, 66), P(-296, 47, 66)].map(p => p.map(v => +v.toFixed(1)).join(',')).join(' ')}"/>`);
  const input = ioPart('input', 7,
    box(-180, 205, 140, 45, Z0, 6, 'kb-top') +
    top(Z0 + 6, Array.from({ length: 36 }, (_, k) => `<rect class="key${k === 13 ? ' key--hit' : ''}" x="${-174 + (k % 12) * 11}" y="${211 + Math.floor(k / 12) * 11}" width="9" height="9" rx="1.5"/>`).join('') +
      `<rect class="key" x="-140" y="244" width="60" height="4" rx="1.5"/>`) +
    box(-22, 214, 16, 26, Z0, 6, 'mouse-top') + top(Z0 + 6, `<path class="mouse-line" d="M-14 214 V224"/>`));
  const usbBus = `<g class="bus" data-link="chipset input">${top(0, `<path class="bus__line" d="M-90 -150 V-130 H140 V20 H148"/><path class="bus__pulse" d="M-90 -150 V-130 H140 V20 H148" pathLength="100"/>`)}</g>`;
  const backCables = `<g class="io-cables">${cable(USB_CABLE)}${cable([[-14, 214, Z0 + 3], [-14, 196, Z0], [-110, 196, Z0]])}${cable(HDMI_CABLE)}</g>`;

  /* ---------- 그리기 (뒤 → 앞 순서) ---------- */
  const svg = document.getElementById('board');
  svg.innerHTML = `<g class="world">${backCables}${monitor}${MB.svg}${usbBus}${input}${tags()}</g>`;
  if (window.stabilizeHover) stabilizeHover(svg, '.part');

  /* ---------- 상호작용 ---------- */
  const hint = document.getElementById('hint');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const narrow = matchMedia('(max-width: 760px)').matches;
  const defaultHint = narrow ? '좌우로 밀어 둘러보고, 부품을 눌러 안으로 들어가기' : '부품을 눌러 안으로 들어가기';
  hint.textContent = defaultHint;
  let hot = null, selected = null;
  // 부품마다 안쪽 화면으로 들어감 (안쪽 화면이 없는 부품은 상세 패널로 대체)
  const SUB_PAGES = { chipset: 'chipset.html', cpu: 'cpu.html', memory: 'memory.html', storage: 'storage.html', network: 'network.html', gpu: 'gpu.html' };

  // 호버한 부품은 강하게, 회로선으로 이어진 부품은 약하게(확대 없이 조금 밝게), 그 사이 선만 켜짐
  const mark = (cls, id) => {
    svg.classList.toggle(cls === 'is-hot' ? 'has-hot' : 'has-sel', !!id);
    const near = neighbors(id), nearCls = cls === 'is-hot' ? 'is-near' : 'is-near-sel';
    svg.querySelectorAll('[data-part]').forEach(n => {
      n.classList.toggle(cls, n.dataset.part === id);
      n.classList.toggle(nearCls, near.includes(n.dataset.part));
    });
    svg.querySelectorAll('[data-link]').forEach(n => {
      const on = !!id && n.dataset.link.split(' ').includes(id);
      n.classList.toggle(cls, on);
      if (on) { n.style.setProperty('--h', HUES[id]); n.style.setProperty('--sat', 1); }
      else if (cls === 'is-hot') { n.style.removeProperty('--h'); n.style.removeProperty('--sat'); }
    });
  };
  const setHot = id => {
    if (id === hot) return;
    hot = id; mark('is-hot', id);
    if (!id && boardTours.active()) return boardTours.paint();
    if (!selected) {
      hint.textContent = id ? `${PARTS[id].ko} — ${PARTS[id].desc}${SUB_PAGES[id] ? '  ·  눌러서 안으로 들어가기' : ''}` : defaultHint;
      hint.classList.toggle('is-on', !!id);
    }
  };

  svg.addEventListener('pointerover', e => setHot(e.target.closest('[data-part]')?.dataset.part || null));
  svg.addEventListener('pointerleave', () => setHot(null));
  svg.addEventListener('focusin', e => setHot(e.target.closest('[data-part]')?.dataset.part || null));
  svg.addEventListener('focusout', () => setHot(null));
  const $ = id => document.getElementById(id);
  const activate = id => { if (SUB_PAGES[id]) diveInto(id); };
  const touch = matchMedia('(hover: none)').matches;
  svg.addEventListener('click', e => {
    const id = e.target.closest('[data-part]')?.dataset.part;
    if (touch && id && SUB_PAGES[id] && hot !== id) {
      setHot(id);
      hint.textContent = `${PARTS[id].ko} — 한 번 더 누르면 안으로 들어가요`;
      hint.classList.add('is-on');
      return;
    }
    if (touch && !id) setHot(null);
    activate(id);
  });
  svg.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.part) { e.preventDefault(); activate(e.target.dataset.part); }
  });

  /* ---------- 부품 안으로 확대해 들어가기 ---------- */
  const originOf = id => {
    const r = svg.querySelector(`.part[data-part="${id}"]`).getBoundingClientRect();
    const b = svg.getBoundingClientRect();
    return `${((r.left + r.width / 2 - b.left) / b.width) * 100}% ${((r.top + r.height / 2 - b.top) / b.height) * 100}%`;
  };
  const reducedMotion = window.KB_REDUCED;
  // replace=true: 여정 중간의 보드 화면은 방문 기록에 남기지 않음 (브라우저 뒤로가기 → 출발 화면)
  function diveInto(id, hash = '', replace = false) {
    const goTo = () => replace ? location.replace(SUB_PAGES[id] + hash) : (location.href = SUB_PAGES[id] + hash);
    if (reducedMotion) { goTo(); return; }
    svg.style.transformOrigin = originOf(id);
    svg.querySelectorAll(`[data-part="${id}"]`).forEach(n => n.classList.add('is-dive-target'));
    document.body.classList.add('is-diving');
    setTimeout(goTo, 850);
  }
  // 하위 화면에서 돌아왔을 때: 그 부품에서 밖으로 빠져나오는 연출
  const fromSub = location.hash.match(/^#from-(\w+)$/);
  if (fromSub && SUB_PAGES[fromSub[1]]) {
    svg.style.transformOrigin = originOf(fromSub[1]);
    document.body.classList.add('from-sub');
    clearHash();
  }

  /* ---------- 데이터 여정: 한 부품에서 나온 데이터가 보드 위 회로를 따라 다른 부품으로 ---------- */
  // 경로는 보드 위에 실제로 그려진 회로선(버스)을 따라갑니다
  const MEM_BUS = [[0, -20, 15], [36, -30, 4], [70, -30, 0], [88, -30, 39]];          // CPU → RAM
  const DMI = [[172, 27, 8], [148, 30, 0], [140, 30, 0], [140, 70, 0], [52, 70, 0], [52, 10, 0], [36, 10, 0], [0, -20, 15]]; // 칩셋 → CPU
  const JOURNEYS = {
    'input-chipset': {
      from: 'input', to: 'chipset',
      text: '키보드의 신호가 USB 케이블을 타고 뒷면 단자로 들어가, 보드 위 선을 따라 칩셋에 도착합니다',
      path: [[-110, 228, Z0 + 6], ...USB_CABLE, ...USB_TRACE, [172, 27, 8]]
    },
    'gpu-monitor': {
      from: 'gpu', to: 'monitor',
      text: 'GPU가 완성한 화면이 HDMI · DP 케이블을 타고 모니터로 나갑니다',
      path: [[-10, 107, 22], ...HDMI_CABLE, [-296, 55, 60]]
    },
    'cpu-memory': {
      from: 'cpu', to: 'memory',
      text: 'CPU의 요청이 메모리 버스를 타고 RAM으로 이동합니다',
      path: MEM_BUS
    },
    'memory-cpu': {
      from: 'memory', to: 'cpu',
      text: 'RAM에서 읽은 데이터(캐시 라인)가 메모리 버스를 타고 CPU로 올라갑니다',
      path: [...MEM_BUS].reverse()
    },
    'storage-memory': {
      from: 'storage', to: 'memory',
      text: 'SSD의 프로그램이 NVMe(PCIe) 선을 타고 RAM으로 바로 올라갑니다 (DMA)',
      path: [[-157, -9, 3], [-110, -8, 0], [-90, -8, 0], [-90, -10, 0], [-36, -10, 0], ...MEM_BUS]
    },
    'memory-gpu': {
      from: 'memory', to: 'gpu',
      text: 'GPU가 PCIe 레인으로 RAM의 데이터를 VRAM에 직접 복사합니다 (DMA)',
      path: [...MEM_BUS].reverse().concat([[-8, 16, 0], [-8, 85, 0], [-10, 107, 22]])
    },
    'network-memory': {
      from: 'network', to: 'memory',
      text: '랜 포트로 들어온 패킷을 NIC가 RAM에 바로 씁니다 (DMA · CPU 코어는 일하지 않음)',
      path: [[175, -155, 28], [166, -102, 4], [172, -89, 0], [172, 5, 0], ...DMI.slice(1), ...MEM_BUS.slice(1)]
    },
    'chipset-cpu': {
      from: 'chipset', to: 'cpu',
      text: '입출력 장치의 인터럽트 신호가 칩셋을 거쳐 CPU에 전달됩니다',
      path: DMI
    }
  };
  // #route-<흐름>@<출발 화면>
  const route = location.hash.match(/^#route-([a-z]+-[a-z]+)(?:@(\w+))?(~tour=[\w.-]+)?$/);
  const tourSuffix = (route && route[3]) || '';
  // 정의된 흐름의 반대 방향(되돌아가기)은 같은 회로선을 거꾸로 따라감
  const reverseOf = key => {
    const [a, b] = key.split('-'), fw = JOURNEYS[`${b}-${a}`];
    return fw && { from: fw.to, to: fw.from, via: fw.via, path: [...fw.path].reverse(), text: `되돌아가는 중 · ${PARTS[fw.to].ko} → ${PARTS[fw.from].ko}` };
  };
  const journey = route && (JOURNEYS[route[1]] || reverseOf(route[1]));
  if (journey) {
    const key = route[1], origin = SUB_PAGES[route[2]] ? route[2] : journey.from;
    const { from, to } = journey;
    clearHash();
    svg.style.transformOrigin = originOf(origin);
    document.body.classList.add('from-sub', 'is-journey', 'is-quick');
    const pts = roundPts(journey.path.map(([x, y, z]) => P(x, y, z)));
    // 출발 장치만 맥박 → 굵은 배선 위로 빛 조각이 달려감 → 닿는 순간 도착 장치가 번쩍 → 안으로 들어감
    const go = () => {
      const lit = ids => svg.querySelectorAll('[data-part]').forEach(n => n.classList.toggle('is-hot', ids.includes(n.dataset.part)));
      svg.classList.add('has-hot');
      lit([from]);
      const fromEl = svg.querySelector(`.part[data-part="${from}"]`), pulse = fromEl && window.kbPulse ? kbPulse(fromEl) : null;
      svg.querySelectorAll('[data-link]').forEach(n => { const l = n.dataset.link.split(' '); n.classList.toggle('is-hot', l.includes(from) && l.includes(to)); });
      hint.textContent = journey.text; hint.classList.add('is-on');
      wireTravel(svg, pts, { hA: HUES[from], hB: HUES[to], done: () => {
        pulse?.cancel();
        lit([to, ...(journey.via || [])]);
        const toEl = svg.querySelector(`.part[data-part="${to}"]`);
        if (toEl && window.kbFlash) kbFlash(toEl);
        setTimeout(() => diveInto(to, `#arrive-${key}${tourSuffix}`, true), 750);
      } });
    };
    if (reducedMotion) location.replace(SUB_PAGES[to] + `#arrive-${key}${tourSuffix}`);
    else setTimeout(go, 800);
  }
  // 뒤로가기 캐시로 돌아오면(여정이 멈춘 화면 등) 깨끗한 상태로 다시 그림
  /* ---------- 흐름 패널: 입력부터 출력까지 장치를 넘나드는 큰 흐름 ---------- */
  const boardCenter = id => {
    const p = svg.querySelector(`.part[data-part="${id}"]`);
    if (!p) return null;
    const b = (p.querySelector(':scope > .hitclone') || p).getBBox();
    return [b.x + b.width / 2, b.y + b.height / 2];
  };
  window.evenPulse?.(svg);
  var boardTours = window.TourPanel ? TourPanel({
    svg, scene: 'board', hint, baseHint: defaultHint, reduced: reducedMotion,
    style: 'wire',
    names: { board: '메인보드' },
    lead: '키를 누르거나 프로그램을 실행했을 때, 입력부터 화면 출력까지 장치들 사이로 데이터가 어떻게 오가는지 따라가요.',
    groups: [{ label: '입력부터 출력까지', tours: (window.TOURS || []).filter(t => t.scope === 'board'), meta: t => `${t.steps.length}단계` }],
    clear: () => mark('is-hot', null),
    hueOf: st => HUES[st.ids[0]],
    // 장치 사이 이동은 보드 위 실제 회로선을 따라감
    trailPts: (prev, st) => {
      const a = prev.ids[0], b = st.ids[0];
      if (a === b) return null;
      const j = JOURNEYS[`${a}-${b}`] || reverseOf(`${a}-${b}`);
      if (j) return j.path.map(([x, y, z]) => P(x, y, z));
      const p1 = boardCenter(a), p2 = boardCenter(b);
      return p1 && p2 ? [p1, [(p1[0] + p2[0]) / 2, Math.min(p1[1], p2[1]) - 40], p2] : null;
    },
    // 두 장치를 직접 잇는 회로선도 함께 켬
    extraPaint: (st, prev) => {
      const on = [...(st.ids || []), ...((prev && prev.ids) || [])];
      svg.querySelectorAll('[data-link]').forEach(n => {
        const l = n.dataset.link.split(' '), lit = !!prev && l.every(x => on.includes(x));
        n.classList.toggle('is-hot', lit);
        if (lit) { n.style.setProperty('--h', HUES[st.ids[0]]); n.style.setProperty('--sat', 1); }
      });
    }
  }) : { active: () => false, paint() {} };

  if (route && !journey) {
    const [a, b] = route[1].split('-');
    if (SUB_PAGES[b]) {
      clearHash();
      if (SUB_PAGES[a]) svg.style.transformOrigin = originOf(a);
      document.body.classList.add('from-sub', 'is-journey', 'is-quick');
      setTimeout(() => diveInto(b, `#arrive-${route[1]}${tourSuffix}`, true), 900);
    }
  }
  addEventListener('pageshow', e => { if (e.persisted) location.reload(); });

  /* ---------- 페이지 전환 ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('is-entering')));
  // 뒤로 가기 버튼과 상단 경로 링크: 빠져나가는 연출 후 메인으로
  [$('back'), ...document.querySelectorAll('[data-leave]')].forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(() => { location.href = 'index.html#from-hw'; }, 550);
  }));
  // 뒤로가기 캐시로 돌아왔을 때 상태 복구

  // 모바일: 가로로 넓은 보드를 가운데부터 보여주기
  const stage = document.getElementById('stage');
  stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
})();
