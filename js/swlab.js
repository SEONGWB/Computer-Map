/* =========================================================
   소프트웨어 화면 시안 비교 (정적 그림 + 호버 강조)
   A 평면 + 성격별 표현 / B 일정 배경 / C 동심원 / D 노선(흐름 중심)
   ========================================================= */
(() => {
  const H = { app: 332, runtime: 276, os: 200, net: 156, data: 38, algo: 62, security: 0, eng: 228 };
  const N = {
    app: ['응용 프로그램', 'APPLICATION'], runtime: ['언어 · 실행', 'LANGUAGE · RUNTIME'], os: ['운영체제', 'OPERATING SYSTEM'],
    net: ['네트워크', 'NETWORK'], data: ['데이터', 'DATA'], algo: ['자료구조 · 알고리즘', 'DATA STRUCTURES · ALGORITHMS'],
    security: ['보안', 'SECURITY'], eng: ['소프트웨어 공학', 'SOFTWARE ENGINEERING']
  };
  const TILES = {
    app: [[['UI', '화면'], ['LOGIC', '로직'], ['API', '외부와 연결']], [['WEB · MOBILE · DESKTOP', '웹 서비스 · 모바일 앱 · 데스크톱']]],
    runtime: [[['COMPILER', '코드 번역'], ['VM · INTERPRETER', '실행기']], [['GC', '메모리 청소'], ['THREADS · LIBRARY', '스레드 · 표준 라이브러리']]],
    os: [[['PROCESS', '프로세스'], ['MEMORY', '가상 메모리'], ['FILE SYS', '파일 시스템']], [['SCHEDULER', 'CPU 나눠 쓰기'], ['DRIVERS · SYSCALL', '드라이버 · 시스템 콜']]]
  };
  // 자료구조 렌즈: 그 칸에서 쓰는 자료구조
  const LENS = { 'API': '해시맵', 'COMPILER': '트리(AST)', 'GC': '그래프 탐색', 'SCHEDULER': '큐 · 힙', 'FILE SYS': 'B-트리', 'MEMORY': '페이지 테이블', 'DB ENGINE': 'B+트리', 'TCP / IP': '라우팅 그래프' };
  const COLS = {
    net: [['HTTP · REST', '웹 요청'], ['SOCKET API', '소켓'], ['TCP / IP', '커널 네트워크'], ['NIC', '랜카드']],
    data: [['SQL · ORM', '질의'], ['DB ENGINE', '데이터베이스'], ['FILES', '파일 · 블록'], ['SSD', '저장 장치']]
  };
  const PHASES = [['설계', 'DESIGN'], ['구현', 'BUILD'], ['테스트', 'TEST'], ['배포', 'DEPLOY'], ['운영', 'OPERATE']];

  const g = (k, inner, cls = '') => `<g class="g ${cls}"${k ? ` data-k="${k}" style="--h:${H[k]}"` : ''}>${inner}</g>`;
  const R = (x, y, w, h, cls, rx = 8) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
  const Tx = (x, y, s, cls, anchor) => `<text class="${cls}" x="${x}" y="${y}"${anchor ? ` text-anchor="${anchor}"` : ''}>${s}</text>`;
  const pk = (d, i = 0) => `<path class="wr" d="${d}"/><path class="pk" d="${d}" pathLength="100" style="animation-delay:${-i * 0.6}s"/>`;
  const badge = (x, y, s) => { const w = s.length * 8 + 12; return `<g class="badge">${R(x - w, y, w, 14, '', 7)}${Tx(x - w / 2, y + 10, s, '', 'middle')}</g>`; };
  const lock = (x, y, label) => `<g class="lock"><path d="M${x - 4},${y - 3} v-3 a4,4 0 0 1 8,0 v3"/>${R(x - 6, y - 3, 12, 9, '', 2)}${label ? Tx(x + 10, y + 5, label, '') : ''}</g>`;

  /* ---------- 공통: 평면 층 구조 (A, B) ---------- */
  function stack({ lens = false, top = 40 } = {}) {
    const BX = 230, BW = 540, BH = 100, GAP = 30;
    const Y = { app: top, runtime: top + BH + GAP, os: top + 2 * (BH + GAP) };
    const HWY = Y.os + BH + GAP, HWH = 56;
    const mid = { app: Y.app + BH / 2, runtime: Y.runtime + BH / 2, os: Y.os + BH / 2, hw: HWY + HWH / 2 };
    let s = '';
    // 층 ↔ 기둥 연결선
    ['app', 'runtime', 'os'].forEach((lv, i) => {
      s += g('net', pk(`M${178},${mid[lv]} H${BX}`, i), 'lk');
      s += g('data', pk(`M${BX + BW},${mid[lv]} H${822}`, i), 'lk');
    });
    // 층 사이 호출
    const AX = BX + BW - 34;
    [['함수 호출', Y.app + BH, Y.runtime], ['시스템 콜', Y.runtime + BH, Y.os], ['드라이버 · 인터럽트', Y.os + BH, HWY]].forEach(([t, a, b], i) => {
      s += `<g class="g">${pk(`M${AX},${a} V${b}`, i)}<path class="arw" d="M${AX - 4},${b - 7} L${AX},${b - 2} L${AX + 4},${b - 7}"/>${Tx(AX - 10, (a + b) / 2 + 4, t, 'call', 'end')}</g>`;
    });
    // 층
    ['app', 'runtime', 'os'].forEach(id => {
      const y = Y[id];
      let t = R(BX, y, BW, BH, 'bd', 14) + R(BX, y + 14, 4, BH - 28, 'ac', 2) + Tx(BX + 22, y + 46, N[id][0], 'ko') + Tx(BX + 22, y + 64, N[id][1], 'en');
      TILES[id].forEach((row, r) => {
        const x1 = BX + 180, x2 = BX + BW - 16, gp = 10, w = (x2 - x1 - gp * (row.length - 1)) / row.length;
        row.forEach(([en, ko], i) => {
          const x = x1 + i * (w + gp), yy = y + 14 + r * 40;
          t += R(x, yy, w, 34, 'tl', 7) + Tx(x + 9, yy + 14, en, 'te') + Tx(x + 9, yy + 27, ko, 'tk');
          if (lens && LENS[en]) t += badge(x + w - 4, yy - 7, LENS[en]);
        });
      });
      s += g(id, t);
    });
    // 하드웨어
    s += `<g class="g gray">${R(BX, HWY, BW, HWH, 'bd gray', 12)}${Tx(BX + 22, HWY + 26, '하드웨어', 'ko sm')}${Tx(BX + 22, HWY + 42, 'HARDWARE', 'en')}` +
      ['CPU', 'RAM', 'SSD', 'GPU', 'NIC'].map((c, i) => R(BX + 180 + i * 62, HWY + 14, 54, 28, 'tl', 5) + Tx(BX + 207 + i * 62, HWY + 32, c, 'te', 'middle')).join('') + '</g>';
    // 양옆 기둥
    const col = (id, x) => {
      const cx = x + 59;
      let t = R(x, top - 40, 118, HWY + HWH - top + 40, 'bd', 14) + Tx(cx, top - 16, N[id][0], 'ko sm', 'middle') + Tx(cx, top - 2, N[id][1], 'en', 'middle');
      ['app', 'runtime', 'os', 'hw'].forEach((lv, k) => {
        const y = mid[lv] - 21, [en, ko] = COLS[id][k];
        t += R(x + 10, y, 98, 42, lv === 'hw' ? 'tl gray-t' : 'tl', 8) + Tx(cx, y + 18, en, 'te', 'middle') + Tx(cx, y + 32, ko, 'tk', 'middle');
        if (lens && LENS[en]) t += badge(x + 112, y - 8, LENS[en]);
      });
      return g(id, t);
    };
    s += col('net', 60) + col('data', 822);
    return { svg: s, Y, mid, BX, BW, AX, bottom: HWY + HWH };
  }

  // 공학 일정 띠
  const timeline = (y, x0 = 60, x1 = 940, title = true) => {
    const w = (x1 - x0) / PHASES.length;
    let t = title ? Tx(x0, y - 10, '소프트웨어 공학 · 만드는 과정', 'cap') : '';
    PHASES.forEach(([ko, en], i) => {
      const x = x0 + i * w, a = 14;
      const d = `M${x},${y} H${x + w - 4} l${a},24 l${-a},24 H${x} ${i ? `l${a},-24 z` : 'z'}`;
      t += `<path class="chev" d="${d}"/>` + Tx(x + (i ? a : 0) + 16, y + 23, ko, 'chev-t') + Tx(x + (i ? a : 0) + 16, y + 37, en, 'chev-e');
    });
    return g('eng', t);
  };

  /* ---------- A: 평면 + 셋을 성격대로 ---------- */
  function A() {
    const st = stack({ lens: true, top: 40 });
    const fx = 40, fy = -24, fw = 920, fh = st.bottom - fy + 14;
    const sec = g('security',
      `<rect class="frame" x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="22"/>` +
      `<rect class="flabel-bg" x="${fx + 18}" y="${fy - 9}" width="226" height="18"/>` + Tx(fx + 26, fy + 4, '보안 · 모든 층을 감싸는 경계', 'flabel') +
      lock(st.AX, st.Y.os - 15, '권한 검사') + lock(204, st.mid.app - 12, 'TLS') + lock(796, st.mid.os - 12, '암호화') + lock(204, st.mid.os - 12, '방화벽'));
    const legend = g('algo', badge(220, 632, '노란 표시') + Tx(228, 643, '= 그 칸에서 쓰는 자료구조 (자료구조 · 알고리즘 렌즈: 누르면 켜짐)', 'cap'));
    return st.svg + sec + timeline(st.bottom + 40) + legend;
  }

  /* ---------- B: 일정 배경 위에 구조 ---------- */
  function B() {
    const x0 = 40, x1 = 960, w = (x1 - x0) / 5;
    let bg = '';
    PHASES.forEach(([ko, en], i) => {
      const x = x0 + i * w;
      if (i % 2 === 0) bg += `<rect class="gantt-col" x="${x}" y="-36" width="${w}" height="640"/>`;
      bg += `<line class="gantt-line" x1="${x}" y1="-36" x2="${x}" y2="604"/>` + Tx(x + 10, -20, `${ko}  ${en}`, 'gantt-h');
    });
    [[0, 1.6, 30], [1, 2.4, 150], [2.2, 1.4, 280], [3.3, 1.2, 410], [4, 1, 520]].forEach(([s, l, y]) => { bg += `<rect class="gantt-bar" x="${x0 + s * w}" y="${y}" width="${l * w}" height="10" rx="5"/>`; });
    const back = g('eng', bg, 'bgk');
    const st = stack({ top: 50 });
    const cards = ['algo', 'security'].map((id, i) => {
      const x = 230 + i * 275;
      return g(id, R(x, 560, 265, 52, 'bd', 12) + R(x, 572, 4, 28, 'ac', 2) + Tx(x + 18, 583, N[id][0], 'ko sm') + Tx(x + 18, 600, N[id][1], 'en'));
    }).join('');
    return back + st.svg + cards + Tx(500, 640, '배경 = 소프트웨어 공학의 일정 (설계 → 운영)', 'cap', 'middle');
  }

  /* ---------- C: 동심원 (하드웨어를 감싸는 층) ---------- */
  function C() {
    const cx = 500, cy = 290, Rr = { hw: 70, os: 140, runtime: 205, app: 268 };
    const pol = (r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
    const sector = (r1, r2, a1, a2) => {
      const [x1, y1] = pol(r2, a1), [x2, y2] = pol(r2, a2), [x3, y3] = pol(r1, a2), [x4, y4] = pol(r1, a1);
      return `M${x1},${y1} A${r2},${r2} 0 0 1 ${x2},${y2} L${x3},${y3} A${r1},${r1} 0 0 0 ${x4},${y4} Z`;
    };
    let s = '';
    // 보안: 가장 바깥 테두리
    s += g('security', `<circle class="frame" cx="${cx}" cy="${cy}" r="292"/>` +
      `<rect class="flabel-bg" x="${cx - 70}" y="${cy - 301}" width="140" height="18"/>` + Tx(cx, cy - 288, '보안 · 바깥 경계', 'flabel', 'middle') +
      lock(...pol(292, 180), '') + lock(...pol(292, 0), ''));
    // 층 (바깥부터)
    const ITEMS = { app: ['UI', 'LOGIC', 'API'], runtime: ['COMPILER', 'VM', 'GC'], os: ['PROCESS', 'MEMORY', 'FILE SYS'] };
    [['app', 'runtime'], ['runtime', 'os'], ['os', 'hw']].forEach(([id, inner]) => {
      const r = Rr[id], rin = Rr[inner], m = (r + rin) / 2;
      let t = `<circle class="bd ring" cx="${cx}" cy="${cy}" r="${r}"/>`;
      t += Tx(cx, cy - r + 24, N[id][0], 'ko sm', 'middle') + Tx(cx, cy - r + 38, N[id][1], 'en', 'middle');
      ITEMS[id].forEach((it, i) => {
        const a = 45 + i * 45, [x, y] = pol(m, a);
        t += Tx(x, y + 4, it, 'te', 'middle');
        const lens = { GC: '그래프', 'FILE SYS': 'B-트리', PROCESS: '큐 · 힙', API: '해시맵' }[it];
        if (lens) t += badge(x + (lens.length * 8 + 12) / 2, y + 9, lens);
      });
      s += g(id, t);
    });
    s += `<g class="g gray"><circle class="bd gray" cx="${cx}" cy="${cy}" r="${Rr.hw}"/>${Tx(cx, cy - 4, '하드웨어', 'ko sm', 'middle')}${Tx(cx, cy + 14, 'CPU · RAM · SSD', 'en', 'middle')}</g>`;
    // 네트워크(왼쪽)·데이터(오른쪽): 모든 층을 가로지르는 부채꼴
    const SHORT = { net: ['HTTP', 'SOCKET', 'TCP/IP'], data: ['SQL', 'DB', 'FILES'] };
    const wedge = (id, a1, a2, side) => {
      let t = `<path class="wedge" d="${sector(Rr.hw - 2, Rr.app, a1, a2)}"/>`;
      const names = COLS[id], rings = [[Rr.app, Rr.runtime], [Rr.runtime, Rr.os], [Rr.os, Rr.hw]];
      rings.forEach(([a, b], k) => { const [x, y] = pol((a + b) / 2, (a1 + a2) / 2); t += Tx(x, y + 3, SHORT[id][k], 'te', 'middle'); });
      const [lx, ly] = pol(Rr.app + 44, (a1 + a2) / 2);
      t += Tx(lx, ly - 4, N[id][0], 'ko sm', side) + Tx(lx, ly + 10, N[id][1], 'en', side);
      return g(id, t);
    };
    s += wedge('net', 165, 195, 'end') + wedge('data', -15, 15, 'start');
    // 호출: 바깥 → 안쪽
    { const A = 232, [ax, ay] = pol(Rr.app - 6, A), [bx, by] = pol(Rr.hw + 4, A);
      s += `<g class="g">${pk(`M${ax},${ay} L${bx},${by}`)}` + [['함수 호출', Rr.app], ['시스템 콜', Rr.runtime], ['드라이버', Rr.os]].map(([t, r]) => { const [x, y] = pol(r, A); return Tx(x + 8, y + 4, t, 'call'); }).join('') + '</g>'; }
    return s + timeline(612) + g('algo', badge(110, 610 - 40, '노란 표시') + Tx(118, 581, '= 자료구조 렌즈', 'cap'));
  }

  /* ---------- D: 노선도 (흐름으로 구조 이해) ---------- */
  function D() {
    const L = { app: [20, 120], runtime: [130, 230], os: [240, 340], hw: [350, 430] };
    const my = k => (L[k][0] + L[k][1]) / 2;
    let s = '';
    Object.entries(L).forEach(([k, [a, b]]) => {
      const gray = k === 'hw';
      s += `<g class="g${gray ? ' gray' : ''}"${gray ? '' : ` data-k="${k}" style="--h:${H[k]}"`}>${R(150, a, 810, b - a, gray ? 'bd gray' : 'lane', 12)}` +
        R(20, a, 120, b - a, gray ? 'bd gray' : 'bd', 12) + Tx(34, (a + b) / 2 + 2, gray ? '하드웨어' : N[k][0], 'ko sm') + Tx(34, (a + b) / 2 + 17, gray ? 'HARDWARE' : N[k][1].split(' · ')[0], 'en') + '</g>';
    });
    // 보안: 운영체제 경계를 지날 때 권한 검사
    s += g('security', `<line class="frame" x1="150" y1="235" x2="960" y2="235"/>` + Tx(955, 230, '보안 · 사용자 ↔ 커널 경계', 'flabel', 'end'));
    const route = (stops, h, off, name) => {
      const P = stops.map(([x, k]) => [x, my(k) + off]);
      let d = `M${P[0][0]},${P[0][1]}`;
      for (let i = 1; i < P.length; i++) { const [ax, ay] = P[i - 1], [bx, by] = P[i], m = (ax + bx) / 2; d += ` C${m},${ay} ${m},${by} ${bx},${by}`; }
      let t = `<path class="route" d="${d}" style="stroke:hsl(${h} 85% 62%)"/><path class="pk" d="${d}" pathLength="100"/>`;
      P.forEach(([x, y], i) => {
        const [, , t1, t2, tag] = stops[i];
        t += `<circle class="stn" cx="${x}" cy="${y}" r="6" style="stroke:hsl(${h} 85% 62%)"/>` + Tx(x + 10, y - 9, t1, 'stn-t') + Tx(x + 10, y + 16, t2, 'stn-s');
        if (tag) t += `<text class="tagc" x="${x + 10}" y="${y + 28}" style="fill:hsl(${H[tag]} 90% 70%)">${tag === 'net' ? '● 네트워크' : '● 데이터'}</text>`;
      });
      return `<g class="g">${t}${Tx(stops[0][0] - 8, my(stops[0][1]) + off - 22, name, 'cap')}</g>`;
    };
    s += route([[200, 'app', "onClick('저장')", '버튼 클릭'], [330, 'runtime', 'fs.writeFile()', '라이브러리'], [460, 'os', 'write()', '시스템 콜'], [590, 'hw', 'SSD 기록', '블록 #88120', 'data'], [720, 'os', '완료 인터럽트', 'IRQ'], [860, 'app', '"저장됨"', '결과 표시']], 332, -14, '흐름 1 · 저장 버튼');
    s += route([[220, 'hw', 'NIC 도착', 'GET /orders/42', 'net'], [350, 'os', '소켓 수신', 'TCP/IP'], [480, 'runtime', '요청 해석', '프레임워크'], [610, 'app', '주문 조회', '서버 코드'], [740, 'os', 'DB 파일 읽기', 'read()', 'data'], [880, 'app', '응답', '200 OK', 'net']], 156, 18, '');
    return s + timeline(480) + Tx(60, 580, '자료구조 · 알고리즘은 역 정보에 표시 (예: 스케줄러 큐)', 'cap');
  }

  /* ---------- E: 건물 단면 (비유) ---------- */
  function E() {
    const X0 = 260, X1 = 740, GY = 420, FH = 100, FL = [['app', 90], ['runtime', 200], ['os', 310]];
    let s = `<rect class="ground" x="30" y="${GY}" width="940" height="120"/><line class="groundline" x1="30" y1="${GY}" x2="970" y2="${GY}"/>`;
    // 보안: 울타리
    s += g('security', `<rect class="frame" x="${X0 - 24}" y="40" width="${X1 - X0 + 48}" height="${GY - 40}" rx="6"/>` +
      `<rect class="flabel-bg" x="${X0 - 6}" y="31" width="168" height="18"/>` + Tx(X0, 44, '보안 · 울타리와 출입문', 'flabel') +
      lock(X0 - 24, 140, '') + lock(X0 - 24, 360, '') + lock(X1 + 24, 268, ''));
    // 지붕 + 안테나
    s += `<g class="g"><path class="roof" d="M${X0 - 8},${FL[0][1]} H${X1 + 8}"/><path class="pole" d="M${X0 + 60},${FL[0][1]} V60 M${X0 + 50},68 H${X0 + 70}"/></g>`;
    // 층
    FL.forEach(([id, y], f) => {
      let t = R(X0, y, X1 - X0, FH, 'bd', 4) + Tx(X0 + 14, y + 30, `${3 - f}F`, 'floor-n') + Tx(X0 + 14, y + 56, N[id][0], 'ko sm') + Tx(X0 + 14, y + 72, N[id][1].split(' · ')[0], 'en');
      const rooms = TILES[id][0], x1 = X0 + 150, x2 = X1 - 62, w = (x2 - x1 - 8 * (rooms.length - 1)) / rooms.length;
      rooms.forEach(([en, ko], i) => {
        const x = x1 + i * (w + 8);
        t += R(x, y + 14, w, FH - 22, 'tl', 4) + `<rect class="win" x="${x + 8}" y="${y + 22}" width="${w - 16}" height="20" rx="2"/>` + Tx(x + 8, y + 60, en, 'te') + Tx(x + 8, y + 74, ko, 'tk');
        if (LENS[en]) t += badge(x + w - 4, y + 6, LENS[en]);
      });
      s += g(id, t);
    });
    // 엘리베이터 = 호출
    const SX = X1 - 48;
    s += `<g class="g">${R(SX, FL[0][1] + 6, 34, GY - FL[0][1] + 8, 'shaft', 3)}<rect class="car" x="${SX + 4}" y="${FL[0][1] + 12}" width="26" height="24" rx="3"><animate attributeName="y" values="${FL[0][1] + 12};${GY - 20};${FL[0][1] + 12}" dur="6s" repeatCount="indefinite"/></rect>` +
      Tx(SX + 17, FL[0][1] - 8, '엘리베이터 = 호출', 'call', 'middle') + '</g>';
    // 하드웨어: 지하 기초
    s += `<g class="g gray">${R(X0, GY + 16, X1 - X0, 72, 'bd gray', 6)}${Tx(X0 + 16, GY + 46, '하드웨어 · 기초', 'ko sm')}${Tx(X0 + 16, GY + 62, 'FOUNDATION', 'en')}` +
      ['CPU', 'RAM', 'SSD', 'GPU', 'NIC'].map((c, i) => R(X0 + 190 + i * 52, GY + 32, 44, 38, 'tl', 4) + Tx(X0 + 212 + i * 52, GY + 55, c, 'te', 'middle')).join('') + '</g>';
    // 네트워크: 전봇대와 통신선
    s += g('net', `<path class="pole" d="M120,80 V${GY} M96,94 H144"/>` +
      `<path class="cable" d="M96,94 Q170,150 ${X0 - 24},140 H${X0}"/><path class="cable" d="M144,94 Q200,330 ${X0 - 24},360 H${X0}"/>` +
      pk(`M144,94 Q200,330 ${X0 - 24},360 H${X0}`) +
      Tx(120, 56, '네트워크', 'ko sm', 'middle') + Tx(120, 70, '바깥과 잇는 통신선', 'tk', 'middle') +
      Tx(176, 132, 'HTTP', 'te') + Tx(206, 300, 'TCP / IP', 'te') + Tx(120, GY + 20, 'NIC', 'te', 'middle'));
    // 데이터: 옆 창고와 연결 통로
    const WX = 800, WY = 250;
    s += g('data', `<rect class="bd" x="${X1}" y="${232}" width="${WX - X1}" height="16"/><rect class="bd" x="${X1}" y="${352}" width="${WX - X1}" height="16"/>` +
      `<path class="bd" d="M${WX - 6},${WY} L${WX + 75},${WY - 36} L${WX + 156},${WY} Z"/>` + R(WX, WY, 150, GY - WY, 'bd', 2) +
      [0, 1, 2].map(i => `<path class="shelf" d="M${WX + 14},${WY + 50 + i * 36} H${WX + 136}"/>` + [0, 1, 2, 3].map(j => R(WX + 20 + j * 28, WY + 30 + i * 36, 20, 18, 'tl', 2)).join('')).join('') +
      Tx(WX + 75, WY - 50, '데이터 · 창고', 'ko sm', 'middle') + Tx(WX + 75, WY + 18, 'SQL · DB · FILES', 'te', 'middle') + Tx(WX + 75, GY + 20, 'SSD', 'te', 'middle'));
    // 공학: 크레인
    s += g('eng', `<path class="crane" d="M940,${WY - 40} V70 M760,78 H960 M940,70 L900,78 M800,78 V120"/>` + R(780, 120, 40, 22, 'tl', 3) + Tx(800, 135, '새 기능', 'tk', 'middle') +
      Tx(950, 50, '소프트웨어 공학 · 짓고 고치는 과정', 'cap', 'end') + Tx(950, 100, '설계 → 구현 → 테스트 → 배포 → 운영', 'tk', 'end'));
    return s;
  }

  /* ---------- F: 벤토 카드 (공부 대시보드) ---------- */
  function F() {
    const ICON = {
      app: '<rect x="1" y="3" width="22" height="18" rx="3"/><path d="M1 8 H23"/>',
      runtime: '<path d="M8 6 L2 12 L8 18 M16 6 L22 12 L16 18"/>',
      os: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 1 V5 M12 19 V23 M1 12 H5 M19 12 H23"/>',
      net: '<path d="M2 8 H22 M18 4 L22 8 L18 12 M22 17 H2 M6 13 L2 17 L6 21"/>',
      data: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5 V19 C3 21 21 21 21 19 V5 M3 12 C3 14 21 14 21 12"/>',
      algo: '<circle cx="12" cy="4" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M11 6 L6 17 M13 6 L18 17"/>',
      security: '<path d="M12 2 L21 6 V12 C21 17 17 21 12 23 C7 21 3 17 3 12 V6 Z"/><path d="M8 12 L11 15 L16 9"/>',
      eng: '<rect x="2" y="4" width="20" height="18" rx="2"/><path d="M2 9 H22 M7 2 V6 M17 2 V6 M7 15 L10 18 L17 12"/>'
    };
    const INFO = {
      app: ['사용자가 직접 쓰는 프로그램', 'UI · 로직 · API'], runtime: ['코드를 실행 가능한 형태로 바꾸고 돌림', '컴파일러 · VM · GC'],
      os: ['하드웨어를 나눠 쓰게 관리', '프로세스 · 메모리 · 파일'], net: ['다른 컴퓨터와 주고받기', 'HTTP · TCP/IP · 소켓'],
      data: ['오래, 안전하게 저장하고 찾기', 'SQL · 인덱스 · 트랜잭션'], algo: ['담는 법과 처리 순서', '배열 · 트리 · 그래프'],
      security: ['지키는 일', '암호화 · 인증 · 권한'], eng: ['함께, 오래 만드는 방법', 'Git · 테스트 · CI/CD']
    };
    const card = (id, x, y, w, h, n, big) => {
      const [d, c] = INFO[id];
      return g(id, R(x, y, w, h, 'bd', 16) + `<g class="ic" transform="translate(${x + 20} ${y + 20}) scale(${big ? 1.5 : 1.2})">${ICON[id]}</g>` +
        (n ? Tx(x + w - 18, y + 36, n, 'bnum', 'end') : '') +
        Tx(x + 20, y + (big ? 86 : 72), N[id][0], big ? 'ko' : 'ko sm') + Tx(x + 20, y + (big ? 103 : 87), N[id][1], 'en') +
        Tx(x + 20, y + (big ? 128 : 108), d, 'bdesc') + Tx(x + 20, y + h - 16, c, 'te'));
    };
    let s = card('app', 40, 0, 600, 180, '01', true) + card('net', 650, 0, 310, 180, '', true) +
      card('runtime', 40, 190, 295, 160, '02') + card('os', 345, 190, 295, 160, '03') + card('data', 650, 190, 310, 160, '');
    s += `<g class="g gray">${R(40, 360, 600, 60, 'bd gray', 14)}${Tx(60, 396, '하드웨어', 'ko sm')}${Tx(140, 396, 'CPU · RAM · SSD · GPU · NIC  →  하드웨어 화면으로', 'tk')}</g>`;
    s += Tx(960, 396, '01 → 03 : 위에서 아래로 호출', 'cap', 'end');
    s += card('algo', 40, 440, 300, 130) + card('security', 350, 440, 300, 130) + card('eng', 660, 440, 300, 130);
    return s;
  }

  /* ---------- G: 아코디언 (한 층씩 펼쳐 보기) ---------- */
  const DETAIL = {
    app: [['UI', '화면', '버튼 · 입력창처럼 사용자가 보는 부분'], ['LOGIC', '로직', '주문 처리처럼 앱이 실제로 하는 일'], ['API', '외부와 연결', '다른 서비스와 약속된 창구'], ['WEB', '웹', '브라우저에서 도는 서비스'], ['MOBILE', '모바일', '휴대폰 앱'], ['DESKTOP', '데스크톱', 'PC에 설치하는 프로그램']],
    runtime: [['COMPILER', '컴파일러', '코드를 기계어로 미리 번역'], ['INTERPRETER', '인터프리터', '한 줄씩 읽으며 실행'], ['VM', '가상 머신', 'JVM처럼 중간 코드를 실행'], ['GC', '가비지 컬렉터', '안 쓰는 메모리를 자동 정리'], ['THREADS', '스레드', '여러 작업을 동시에'], ['LIBRARY', '표준 라이브러리', '파일 · 네트워크 같은 기본 도구']],
    os: [['PROCESS', '프로세스', '실행 중인 프로그램 하나'], ['SCHEDULER', '스케줄러', 'CPU를 누구에게 줄지 결정'], ['MEMORY', '가상 메모리', '프로그램마다 따로인 주소 공간'], ['FILE SYS', '파일 시스템', '디스크를 파일 · 폴더로'], ['DRIVERS', '드라이버', '장치를 다루는 코드'], ['SYSCALL', '시스템 콜', '프로그램이 커널에 부탁하는 창구']]
  };
  let openK = 'os';
  function G() {
    let y = 0, s = '';
    const LVL = { app: 0, runtime: 1, os: 2 };
    ['app', 'runtime', 'os'].forEach(id => {
      const open = id === openK, h = open ? 250 : 56;
      let t = R(60, y, 880, h, 'bd', 14) + R(60, y + 12, 4, h - 24, 'ac', 2);
      const pill = (k, x) => { const [en] = COLS[k][LVL[id]]; return `<g style="--h:${H[k]}">${R(x, y + 15, 120, 26, 'tl', 13)}${Tx(x + 60, y + 32, `${k === 'net' ? '네트워크' : '데이터'} · ${en}`, 'te', 'middle')}</g>`; };
      if (open) {
        t += Tx(84, y + 46, N[id][0], 'ko') + Tx(84, y + 64, N[id][1], 'en') + Tx(84, y + 92, '펼친 층', 'cap');
        DETAIL[id].forEach(([en, ko, d], i) => {
          const c = i % 3, r = Math.floor(i / 3), x = 290 + c * 214, yy = y + 70 + r * 86;
          t += R(x, yy, 204, 76, 'tl', 10) + Tx(x + 14, yy + 22, en, 'te') + Tx(x + 14, yy + 42, ko, 'tko2') + Tx(x + 14, yy + 62, d, 'tk');
        });
        t += pill('net', 556) + pill('data', 686) + (id === 'os' ? Tx(920, y + 32, '들어가기 →', 'te', 'end') : '');
      } else {
        t += Tx(84, y + 35, N[id][0], 'ko sm') + Tx(84 + N[id][0].length * 15 + 14, y + 35, N[id][1], 'en') + pill('net', 556) + pill('data', 686) + Tx(920, y + 34, '펼치기 +', 'tk', 'end');
      }
      s += g(id, t);
      y += h + 10;
    });
    s += `<g class="g gray">${R(60, y, 880, 48, 'bd gray', 12)}${Tx(84, y + 30, '하드웨어', 'ko sm')}${Tx(170, y + 30, 'CPU · RAM · SSD · GPU · NIC', 'tk')}</g>`;
    y += 72;
    s += Tx(60, y, '모든 층에서 쓰는 기초', 'cap');
    ['algo', 'security', 'eng'].forEach((id, i) => { s += g(id, R(60 + i * 296, y + 12, 288, 44, 'bd', 12) + Tx(80 + i * 296, y + 39, N[id][0], 'ko sm')); });
    return s;
  }

  /* ---------- H: 마인드맵 (지식 지도) ---------- */
  function H_() {
    const cx = 500, cy = 300;
    const TOP = {
      app: ['프론트엔드 · 백엔드', 'API 설계', '아키텍처 패턴'], runtime: ['컴파일 · 인터프리트', '가상 머신', 'GC'], os: ['프로세스 · 스레드', '스케줄링', '가상 메모리'],
      data: ['관계형 DB', '인덱스', '트랜잭션'], security: ['암호화', '인증 · 인가', '웹 취약점'], eng: ['설계 원칙', '테스트', 'Git · 협업'],
      algo: ['시간 복잡도', '정렬 · 탐색', '트리 · 그래프'], net: ['HTTP · REST', 'TCP · UDP', 'DNS']
    };
    const ANG = { app: -90, runtime: -45, os: 0, data: 45, security: 90, eng: 135, algo: 180, net: -135 };
    const at = (rx, ry, a) => [cx + rx * Math.cos(a * Math.PI / 180), cy + ry * Math.sin(a * Math.PI / 180)];
    let s = '';
    Object.entries(ANG).forEach(([id, a]) => {
      const [nx, ny] = at(255, 190, a);
      let t = `<path class="mm-edge" d="M${cx},${cy} Q${(cx + nx) / 2},${cy} ${nx},${ny}"/>`;
      TOP[id].forEach((tp, i) => {
        const la = a + (i - 1) * 13, [lx, ly] = at(385, 270, la);
        const c = Math.cos(la * Math.PI / 180), anchor = c > 0.35 ? 'start' : c < -0.35 ? 'end' : 'middle';
        t += `<path class="mm-leaf-e" d="M${nx},${ny} L${lx},${ly}"/><circle class="mm-dot" cx="${lx}" cy="${ly}" r="3"/>` +
          Tx(lx + (anchor === 'start' ? 8 : anchor === 'end' ? -8 : 0), ly + (anchor === 'middle' ? (ly < cy ? -8 : 16) : 4), tp, 'mm-leaf', anchor);
      });
      t += R(nx - 72, ny - 22, 144, 44, 'bd', 22) + Tx(nx, ny - 1, N[id][0], 'tko2', 'middle') + Tx(nx, ny + 13, N[id][1].split(' · ')[0], 'en', 'middle');
      s += g(id, t);
    });
    s += `<g class="g"><circle class="mm-c" cx="${cx}" cy="${cy}" r="54"/>${Tx(cx, cy + 2, '소프트웨어', 'ko sm', 'middle')}${Tx(cx, cy + 18, 'SOFTWARE', 'en', 'middle')}</g>`;
    return s;
  }

  const V = {
    A: { name: '평면 + 성격별', fn: A, vb: '0 -50 1000 710',
      title: 'A. 평면 구조 + 셋을 성격대로', sub: '지금 평면 시안에 기초 세 가지를 각자 다르게 표현',
      pro: ['층 구조가 그대로 읽힘', '보안 = 감싸는 테두리, 공학 = 과정, 알고리즘 = 칸 안의 표시로 각자 의미가 드러남', '지금 만든 흐름·호버를 그대로 쓸 수 있음'],
      con: ['요소가 많아 첫인상이 빽빽할 수 있음', '노란 표시는 평소엔 숨기고 눌렀을 때만 켜야 깔끔함'] },
    B: { name: '일정 배경', fn: B, vb: '0 -50 1000 710',
      title: 'B. 일정 배경 위에 구조', sub: '말씀하신 아이디어: 프로젝트 일정 같은 배경 위에 층',
      pro: ['소프트웨어 공학이 바로 눈에 들어옴', '배경이 있어 화면이 덜 비어 보임'],
      con: ['세로(층)와 가로(시간) 두 축이 겹쳐 "가로가 시간인가?" 헷갈림', '보안·알고리즘은 여전히 카드로 남음', '흐름 선과 배경 선이 겹침'] },
    C: { name: '동심원', fn: C, vb: '0 -30 1000 710',
      title: 'C. 동심원 (양파 구조)', sub: '운영체제 교과서 그림처럼 하드웨어를 층이 감쌈',
      pro: ['"안쪽일수록 하드웨어에 가깝다"가 한눈에 보임', '보안이 바깥 테두리로 아주 자연스러움', '네트워크·데이터가 모든 층을 가로지르는 게 부채꼴로 보임'],
      con: ['둥근 판 위라 글자 배치 공간이 좁음', '흐름 선이 위→아래보다 덜 직관적', '하드웨어 화면과 모양이 많이 달라짐'] },
    D: { name: '노선도', fn: D, vb: '0 -10 1000 610',
      title: 'D. 노선도 (흐름 중심)', sub: '층은 가로 레인, 대표 흐름이 지하철 노선처럼 지나감',
      pro: ['"실제로 무슨 일이 일어나는지"가 바로 보여 공부에 좋음', '네트워크·데이터가 역 표시로 자연스럽게 등장'],
      con: ['전체 구조를 한 장에 정리해 보여주는 힘은 약함', '흐름이 많아지면 노선이 엉킴', '오른쪽 흐름 패널과 역할이 겹침'] },
    E: { name: '건물 단면', fn: E, vb: '0 20 1000 540',
      title: 'E. 건물 단면 (비유)', sub: '층 = 건물의 층, 하드웨어 = 지하 기초, 호출 = 엘리베이터',
      pro: ['처음 보는 사람도 바로 이해되는 비유', '네트워크 = 바깥 통신선, 데이터 = 옆 창고, 보안 = 울타리, 공학 = 크레인처럼 기초 셋도 자연스럽게 자리 잡음', '하드웨어 화면처럼 "물건 같은" 형태가 생김'],
      con: ['비유가 정확하지 않은 부분이 생김 (예: 알고리즘은 건물로 표현하기 어려움)', '그림 요소가 많아 그리고 다듬는 데 손이 많이 감', '깊이 공부할수록 비유가 방해될 수 있음'] },
    F: { name: '벤토 카드', fn: F, vb: '20 -20 960 610',
      title: 'F. 벤토 카드 (공부 대시보드)', sub: '크기가 다른 카드에 아이콘 · 한 줄 설명 · 핵심 키워드',
      pro: ['글자가 가장 잘 읽힘, 정보 밀도가 높음', '요즘 웹사이트처럼 깔끔하고 세련됨', '내용 채우기 단계와 가장 잘 이어짐'],
      con: ['층의 위아래 관계가 약해짐 (번호로만 표시)', '구조 그림이라기보다 목차에 가까움', '하드웨어 화면의 입체 세계와 분위기가 많이 다름'] },
    G: { name: '아코디언', fn: G, vb: '40 -20 920 680', click: k => { if (DETAIL[k]) { openK = k; return true; } },
      title: 'G. 아코디언 (한 층씩 펼쳐 보기)', sub: '층을 누르면 그 층만 크게 펼쳐지고 나머지는 접힘 — 직접 눌러 보세요',
      pro: ['한 번에 한 층만 자세히 보여서 복잡하지 않음', '층 순서는 그대로 유지', '펼친 층 안에 설명까지 넣을 수 있음', '네트워크 · 데이터가 그 층에서 무엇인지 알약 표시로 보임'],
      con: ['전체를 한눈에 비교하긴 어려움', '흐름 투어 때 여러 층을 오가면 펼침이 계속 바뀜'] },
    H: { name: '마인드맵', fn: H_, vb: '-40 -10 1080 640',
      title: 'H. 마인드맵 (지식 지도)', sub: '소프트웨어를 가운데 두고 영역과 공부 주제가 가지처럼 뻗음',
      pro: ['"무엇을 공부해야 하는지"가 한눈에 보임', '영역 여덟 개를 똑같이 다뤄 빠짐이 없음', '주제를 누르면 바로 노트로 이어지게 만들기 좋음'],
      con: ['층 구조(누가 누구를 부르는지)가 사라짐', '흐름 투어를 보여줄 자리가 없음', '하드웨어와의 연결이 드러나지 않음'] }
  };

  const svg = document.getElementById('lab'), note = document.getElementById('note'), tabs = document.getElementById('tabs');
  tabs.innerHTML = Object.entries(V).map(([k, v]) => `<button class="lab__tab" data-v="${k}"><b>${k}</b>${v.name}</button>`).join('');
  const li = a => a.map(x => `<li>${x}</li>`).join('');
  let cur = 'A';
  function show(k) {
    const v = V[k]; cur = k;
    svg.setAttribute('viewBox', v.vb);
    svg.innerHTML = v.fn();
    note.innerHTML = `<h2>${v.title}</h2><p class="sub">${v.sub}</p><h3>좋은 점</h3><ul class="pro">${li(v.pro)}</ul><h3>아쉬운 점</h3><ul class="con">${li(v.con)}</ul><h3>HOVER</h3><p>영역에 마우스를 올리면 그 영역만 강조돼요.</p>`;
    tabs.querySelectorAll('.lab__tab').forEach(b => b.classList.toggle('is-on', b.dataset.v === k));
    try { localStorage.setItem('kb-lab', k); } catch (e) {}
  }
  tabs.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) show(b.dataset.v); });
  svg.addEventListener('click', e => { const k = e.target.closest('[data-k]')?.dataset.k, v = V[cur]; if (k && v.click && v.click(k)) { svg.innerHTML = v.fn(); svg.classList.remove('hot'); } });
  svg.addEventListener('pointerover', e => {
    const k = e.target.closest('[data-k]')?.dataset.k;
    svg.classList.toggle('hot', !!k);
    svg.querySelectorAll('.g').forEach(n => n.classList.toggle('on', !!k && n.dataset.k === k));
  });
  svg.addEventListener('pointerleave', () => { svg.classList.remove('hot'); svg.querySelectorAll('.g.on').forEach(n => n.classList.remove('on')); });
  let start = 'A'; try { start = localStorage.getItem('kb-lab') || 'A'; } catch (e) {}
  show(V[start] ? start : 'A');
})();
