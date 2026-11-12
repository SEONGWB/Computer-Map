/* =========================================================
   Software — 구조 시안
   소프트웨어는 정해진 모양이 없어서 '구조'를 그림으로 보여 줌:
   · 층: 응용 프로그램 → 언어·실행 → 운영체제 → (하드웨어 바닥)
   · 설명 언어(C · Java · Python)를 고르면 언어마다 달라지는 층(응용 프로그램, 언어 · 실행)만
     그 언어의 색으로 바뀌고, 언어와 상관없는 층(운영체제, 하드웨어)은 그대로
   ========================================================= */
(() => {
  const T = {
    app: { ko: '응용 프로그램', en: 'APPLICATION', desc: '사용자가 직접 쓰는 프로그램. 웹 서비스, 모바일 앱, 데스크톱 프로그램이 여기에 있어요.', chips: ['웹', '앱', 'API'], topics: ['프론트엔드와 백엔드', 'API 설계', '아키텍처 패턴'], links: ['runtime'] },
    runtime: { ko: '언어 · 실행', en: 'LANGUAGE · RUNTIME', desc: '사람이 쓴 코드를 기계가 실행할 수 있게 바꾸고, 실행되는 동안 메모리와 스레드를 관리하는 층.', chips: ['컴파일러', '인터프리터', 'GC'], topics: ['컴파일과 인터프리트', '런타임과 가상 머신', '메모리 관리와 GC'], links: ['app', 'os'] },
    os: { ko: '운영체제', en: 'OPERATING SYSTEM', desc: '하드웨어를 나눠 쓰게 관리하고, 프로그램에게 프로세스·메모리·파일 같은 편한 도구를 주는 층.', chips: ['커널', '시스템 콜'], topics: ['프로세스와 스레드', 'CPU 스케줄링', '가상 메모리', '파일 시스템'], links: ['runtime'] }
  };
  

  const S = Scene.create({ T, cx: 470, cy: 330 });
  const { P, f, top, box, part } = S;
  const Z = { hw: 0, os: 140, runtime: 280, app: 420 };   // 층 높이
  const X0 = -150, Y0 = -95, W = 300, D = 190;           // 층 판의 크기

  // 층 판 위에 놓이는 작은 구성 요소 타일
  const tile = (x, y, w, d, z, label, hi) =>
    box(x, y, w, d, z, 6, hi ? 'cache-top' : 'core-block') + top(z + 6, `<text class="lbl" x="${x + 6}" y="${y + d / 2 + 4}">${label}</text>`);
  const plate = z => box(X0, Y0, W, D, z, 5, 'layer-top');
  // 층 이름은 판 위 앞쪽 가장자리에 (따로 라벨을 빼지 않아 글자가 겹치지 않음)
  const LANGTAG = { app: '<tspan class="l-c">C로 작성</tspan><tspan class="l-java">Java로 작성</tspan><tspan class="l-python">Python으로 작성</tspan>', runtime: '<tspan class="l-c">C · gcc · 기계어</tspan><tspan class="l-java">Java · JVM · GC</tspan><tspan class="l-python">Python · CPython</tspan>', os: '모든 언어 공통' };
  const layerName = (z, id) => top(z + 5, `<text class="plate-lang${id === 'os' ? ' plate-lang--same' : ''}" x="${X0 + 12}" y="${Y0 + D - 34}">${LANGTAG[id]}</text>` +
    `<text class="plate-ko" x="${X0 + 12}" y="${Y0 + D - 14}">${T[id].ko}</text><text class="plate-en" x="${X0 + 12 + T[id].ko.length * 15 + 10}" y="${Y0 + D - 14}">${T[id].en}</text>`);

  /* ---------- 하드웨어 바닥: 실제 메인보드 그림을 무채색 실루엣으로 ---------- */
  const hw = (() => {
    const [cx, cy] = P(0, 0, 0), k = 0.78;
    const m = Mainboard(cx, cy).svg
      .replace(/ class="part"/g, ' class="mb-part"').replace(/ data-part="[^"]*"/g, '')
      .replace(/ tabindex="0" role="button" aria-label="[^"]*"/g, '').replace(/ style="--h:[^"]*"/g, '');
    return `<g class="sw-mb" aria-hidden="true" transform="translate(${f(cx)} ${f(cy)}) scale(${k}) translate(${f(-cx)} ${f(-cy)})">${m}</g>` +
      (() => { const [x, y] = P(150, 175, 0); return `<text class="lbl sw-mb__lbl" x="${f(x)}" y="${f(y + 26)}">HARDWARE · 하드웨어</text>`;  })();
  })();

  /* ---------- 층 ----------
     마우스가 닿는 영역(hit)은 제자리에 고정하고, 보이는 그림(lift)만 움직여서
     옆 층이 밀려나도 강조 대상이 바뀌며 떨리지 않게 함 */
  const fixedHit = z => ({ lift: true, cls: 'sw-layer', hit: S.hit(X0, Y0, W, D, z, z + 12) });
  const os = part('os', 0, plate(Z.os) + layerName(Z.os, 'os') +
    tile(-130, -80, 70, 50, Z.os + 5, 'PROCESS', true) + tile(-50, -80, 70, 50, Z.os + 5, 'MEMORY') +
    tile(30, -80, 90, 50, Z.os + 5, 'FILE SYS') + tile(-130, -15, 110, 45, Z.os + 5, 'SCHEDULER') + tile(-10, -15, 130, 45, Z.os + 5, 'DRIVERS · SYSCALL'), fixedHit(Z.os));
  const runtime = part('runtime', 1, plate(Z.runtime) + layerName(Z.runtime, 'runtime') +
    tile(-130, -80, 110, 50, Z.runtime + 5, 'COMPILER', true) + tile(-10, -80, 130, 50, Z.runtime + 5, 'VM · INTERPRETER') +
    tile(-130, -15, 80, 45, Z.runtime + 5, 'GC') + tile(-40, -15, 160, 45, Z.runtime + 5, 'THREADS · LIBRARY'), fixedHit(Z.runtime));
  const app = part('app', 2, plate(Z.app) + layerName(Z.app, 'app') +
    tile(-130, -80, 80, 50, Z.app + 5, 'UI', true) + tile(-40, -80, 80, 50, Z.app + 5, 'LOGIC') + tile(50, -80, 70, 50, Z.app + 5, 'API') +
    tile(-130, -15, 250, 45, Z.app + 5, 'WEB · MOBILE · DESKTOP'), fixedHit(Z.app));

  S.mount(S.floor(320) + hw + os + runtime + app, {
    defaultHint: '층을 눌러 안으로 들어가기 · 오른쪽 위에서 설명 언어 바꾸기',
    viewBox: '90 -250 820 800',
    board: true,
    flowsLabel: '앱에서 하드웨어까지',
    sub: { os: 'os.html', runtime: 'runtime.html', app: 'app.html' },
    routes: {
      mode: 'lift',
      anchors: { app: [60, -40, Z.app + 11], runtime: [60, -40, Z.runtime + 11], os: [60, -40, Z.os + 11] }
    }
  });
  /* ---------- 강조된 층 주변이 밀려나기 (마우스 호버 · 흐름 단계 모두) ----------
     위에 있는 층은 위로 크게, 아래에 있는 층은 아래로 조금. 하드웨어 바닥은 그대로 */
  const ORDER = ['os', 'runtime', 'app'];      // 아래 → 위
  const UP = -56, DOWN = 28;
  const svg = document.getElementById('board');
  const liftOf = id => svg.querySelector(`.part[data-part="${id}"] .lift`);
  let last = null, timer = 0;
  const spread = () => {
    const hotEl = svg.querySelector('.part.is-hot[data-part]:not(.is-from), .part.is-sel[data-part]');
    const hot = hotEl && ORDER.includes(hotEl.dataset.part) ? hotEl.dataset.part : null;
    if (hot === last) return;
    last = hot;
    const k = ORDER.indexOf(hot);
    ORDER.forEach((id, i) => {
      const el = liftOf(id);
      if (!el) return;
      el.style.transform = hot == null || i === k ? '' : `translateY(${i > k ? UP : DOWN}px)`;
    });
    svg.classList.toggle('is-spread', hot != null);
  };
  // 층 사이를 빠르게 지나갈 때 덜컹거리지 않게 아주 짧게 기다렸다가 움직임
  new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(spread, 70); })
    .observe(svg, { subtree: true, attributes: true, attributeFilter: ['class'] });
})();
