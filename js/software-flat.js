/* =========================================================
   Software — 평면 시안
   소프트웨어는 모양이 아니라 '관계'라서 입체 대신 평면 구조도로:
   · 가운데: 응용 프로그램 → 언어·실행 → 운영체제 → 하드웨어 (위에서 아래로 호출)
   · 양옆 기둥: 네트워크(왼쪽), 데이터(오른쪽) — 층 높이마다 그 층에서 쓰는 이름
   · 맨 아래: 모든 층에서 쓰는 기초
   ========================================================= */
(() => {
  const T = {
    app: { ko: '응용 프로그램', en: 'APPLICATION', desc: '사용자가 직접 쓰는 프로그램. 웹 서비스, 모바일 앱, 데스크톱 프로그램이 여기에 있어요.', chips: ['웹', '앱', 'API'], topics: ['프론트엔드와 백엔드', 'API 설계', '아키텍처 패턴'], links: ['runtime', 'net', 'data'] },
    runtime: { ko: '언어 · 실행', en: 'LANGUAGE · RUNTIME', desc: '사람이 쓴 코드를 기계가 실행할 수 있게 바꾸고, 실행되는 동안 메모리와 스레드를 관리하는 층.', chips: ['컴파일러', '인터프리터', 'GC'], topics: ['컴파일과 인터프리트', '런타임과 가상 머신', '메모리 관리와 GC'], links: ['app', 'os'] },
    os: { ko: '운영체제', en: 'OPERATING SYSTEM', desc: '하드웨어를 나눠 쓰게 관리하고, 프로그램에게 프로세스·메모리·파일 같은 편한 도구를 주는 층.', chips: ['커널', '시스템 콜'], topics: ['프로세스와 스레드', 'CPU 스케줄링', '가상 메모리', '파일 시스템'], links: ['runtime', 'net', 'data'] },
    net: { ko: '네트워크', en: 'NETWORK', desc: '다른 컴퓨터와 데이터를 주고받는 기둥. 위로는 HTTP, 아래로는 소켓과 TCP/IP를 거쳐 랜카드까지 이어져요.', chips: ['HTTP', 'TCP/IP', '소켓'], topics: ['HTTP와 REST', 'TCP와 UDP', 'DNS', '소켓 프로그래밍'], links: ['app', 'os'] },
    data: { ko: '데이터', en: 'DATA', desc: '데이터를 오래, 안전하게 저장하고 빠르게 찾는 기둥. 위로는 SQL, 아래로는 파일과 디스크까지 이어져요.', chips: ['SQL', '인덱스', '트랜잭션'], topics: ['관계형 데이터베이스', '인덱스', '트랜잭션과 격리', 'NoSQL'], links: ['app', 'os'] },
    algo: { ko: '자료구조 · 알고리즘', en: 'DATA STRUCTURES · ALGORITHMS', desc: '모든 층에서 쓰는 생각의 도구. 데이터를 어떻게 담고, 어떤 순서로 처리할지에 대한 이야기.', chips: ['배열', '트리', '그래프'], topics: ['시간 복잡도', '정렬과 탐색', '트리와 그래프'] },
    security: { ko: '보안', en: 'SECURITY', desc: '모든 층에 걸쳐 있는 지키는 일. 암호화, 인증, 권한, 취약점.', chips: ['암호화', '인증', '권한'], topics: ['대칭키와 공개키', '인증과 인가', '웹 취약점'] },
    eng: { ko: '소프트웨어 공학', en: 'SOFTWARE ENGINEERING', desc: '소프트웨어를 함께, 오래 만드는 방법. 설계, 테스트, 버전 관리, 배포.', chips: ['Git', '테스트', 'CI/CD'], topics: ['설계 원칙', '테스트', '버전 관리와 협업'] }
  };
  ['algo', 'security', 'eng'].forEach(k => { T[k].kind = 'concept'; });
  T.os.desc += ' 눌러서 안으로 들어가 볼 수 있어요.';

  const S = Scene.create({ T });
  const { part, linked } = S;

  /* ---------- 배치 (평면, 위 → 아래) ---------- */
  const BX = 210, BW = 580;                                   // 가운데 층 띠
  const B = { app: 20, runtime: 170, os: 320 }, BH = 110;    // 층마다 위쪽 y
  const HW = { y: 470, h: 60 };                               // 하드웨어 띠
  const mid = { app: B.app + BH / 2, runtime: B.runtime + BH / 2, os: B.os + BH / 2, hw: HW.y + HW.h / 2 };
  const COL = { net: 40, data: 830 }, CW = 130, CT = -40, CB = HW.y + HW.h;   // 양옆 기둥

  // 띠 안의 구성 요소 타일: [영문, 한글]
  const tiles = (y0, rows) => rows.map((row, r) => {
    const x1 = BX + 196, x2 = BX + BW - 18, gap = 10;
    const w = (x2 - x1 - gap * (row.length - 1)) / row.length;
    return row.map(([en, ko], i) => {
      const x = x1 + i * (w + gap), y = y0 + 16 + r * 42;
      return `<rect class="fl-tile" x="${x}" y="${y}" width="${w}" height="36" rx="7"/>` +
        `<text class="fl-tile-en" x="${x + 10}" y="${y + 15}">${en}</text><text class="fl-tile-ko" x="${x + 10}" y="${y + 29}">${ko}</text>`;
    }).join('');
  }).join('');

  const band = (id, i, rows) => {
    const y = B[id];
    return part(id, i,
      `<rect class="fl-band" x="${BX}" y="${y}" width="${BW}" height="${BH}" rx="14"/>` +
      `<rect class="fl-accent" x="${BX}" y="${y + 14}" width="4" height="${BH - 28}" rx="2"/>` +
      `<text class="fl-ko" x="${BX + 22}" y="${y + 50}">${T[id].ko}</text>` +
      `<text class="fl-en" x="${BX + 22}" y="${y + 68}">${T[id].en}</text>` + tiles(y, rows));
  };

  const app = band('app', 2, [[['UI', '화면'], ['LOGIC', '로직'], ['API', '외부와 연결']], [['WEB · MOBILE · DESKTOP', '웹 서비스 · 모바일 앱 · 데스크톱 프로그램']]]);
  const runtime = band('runtime', 1, [[['COMPILER', '코드 번역'], ['VM · INTERPRETER', '실행기']], [['GC', '메모리 청소'], ['THREADS · LIBRARY', '스레드 · 표준 라이브러리']]]);
  const os = band('os', 0, [[['PROCESS', '프로세스'], ['MEMORY', '가상 메모리'], ['FILE SYS', '파일 시스템']], [['SCHEDULER', 'CPU 나눠 쓰기'], ['DRIVERS · SYSCALL', '장치 드라이버 · 시스템 콜']]]);

  /* ---------- 하드웨어 띠: 무채색, 누르면 하드웨어 화면으로 ---------- */
  const chips = ['CPU', 'RAM', 'SSD', 'GPU', 'NIC'];
  const hw = `<a href="hardware.html" class="fl-hw" data-leave aria-label="하드웨어 화면으로">` +
    `<rect class="fl-hw__band" x="${BX}" y="${HW.y}" width="${BW}" height="${HW.h}" rx="12"/>` +
    `<text class="fl-hw__ko" x="${BX + 22}" y="${HW.y + 28}">하드웨어</text><text class="fl-en fl-hw__en" x="${BX + 22}" y="${HW.y + 44}">HARDWARE</text>` +
    chips.map((c, i) => { const w = 52, x = BX + 196 + i * (w + 8); return `<rect class="fl-hw__chip" x="${x}" y="${HW.y + 16}" width="${w}" height="28" rx="5"/><text class="fl-hw__chipt" x="${x + w / 2}" y="${HW.y + 34}" text-anchor="middle">${c}</text>`; }).join('') +
    `<text class="fl-hw__go" x="${BX + BW - 18}" y="${HW.y + 34}" text-anchor="end">하드웨어로 →</text></a>`;

  /* ---------- 층 사이 호출: 위 → 아래 요청 (오른쪽 끝 화살표) ---------- */
  const CALLS = [
    ['runtime', B.app + BH, B.runtime, '함수 호출'],
    ['os', B.runtime + BH, B.os, '시스템 콜'],
    ['os', B.os + BH, HW.y, '드라이버 · 인터럽트']
  ];
  const AX = BX + BW - 40;
  const calls = CALLS.map(([id, y1, y2, label], i) => linked(id,
    `<path class="wire wire--dash" d="M${AX},${y1} V${y2}"/><path class="packet" d="M${AX},${y1} V${y2}" pathLength="100" style="animation-delay:${-i * 0.6}s"/>` +
    `<path class="fl-arrow" d="M${AX - 4},${y2 - 7} L${AX},${y2 - 2} L${AX + 4},${y2 - 7}"/>` +
    `<text class="fl-call" x="${AX - 12}" y="${(y1 + y2) / 2 + 4}" text-anchor="end">${label}</text>`)).join('');

  /* ---------- 양옆 기둥: 네트워크(왼쪽), 데이터(오른쪽) ----------
     기둥 칸이 층 높이마다 하나씩 있고, 그 층에서 쓰는 이름이 적혀 있음 */
  const LV = ['app', 'runtime', 'os', 'hw'];
  const column = (id, i, names) => {
    const x = COL[id], cx = x + CW / 2;
    let s = `<rect class="fl-band fl-col" x="${x}" y="${CT}" width="${CW}" height="${CB - CT}" rx="14"/>` +
      `<text class="fl-ko fl-ko--sm" x="${cx}" y="${CT + 26}" text-anchor="middle">${T[id].ko}</text>` +
      `<text class="fl-en" x="${cx}" y="${CT + 42}" text-anchor="middle">${T[id].en}</text>` +
      `<path class="fl-spine" d="M${cx},${mid.app} V${mid.hw}"/><path class="packet" d="M${cx},${mid.app} V${mid.hw}" pathLength="100" style="animation-delay:${-i}s"/>`;
    LV.forEach((lv, k) => {
      const y = mid[lv] - 22;
      s += `<rect class="fl-tile fl-seg${lv === 'hw' ? ' fl-seg--hw' : ''}" x="${x + 12}" y="${y}" width="${CW - 24}" height="44" rx="8"/>` +
        `<text class="fl-tile-en" x="${cx}" y="${y + 19}" text-anchor="middle">${names[k][0]}</text><text class="fl-tile-ko" x="${cx}" y="${y + 34}" text-anchor="middle">${names[k][1]}</text>`;
    });
    return part(id, 3 + i, s);
  };
  const net = column('net', 0, [['HTTP · REST', '웹 요청'], ['SOCKET API', '소켓'], ['TCP / IP', '커널 네트워크'], ['NIC', '랜카드']]);
  const data = column('data', 1, [['SQL · ORM', '질의'], ['DB ENGINE', '데이터베이스'], ['FILES', '파일 · 블록'], ['SSD', '저장 장치']]);
  // 층 ↔ 기둥 연결 (같은 높이에서 가로로)
  const links = (id, x1, x2) => linked(id, ['app', 'runtime', 'os'].map((lv, i) => {
    const d = `M${x1},${mid[lv]} H${x2}`;
    return `<path class="wire wire--dash" d="${d}"/><path class="packet" d="${d}" pathLength="100" style="animation-delay:${-i * 0.5}s"/>`;
  }).join(''));
  const netLinks = links('net', COL.net + CW - 12, BX), dataLinks = links('data', BX + BW, COL.data + 12);

  /* ---------- 모든 층에서 쓰는 기초: 맨 아래 가로로 ---------- */
  const FY = 590, FW = (COL.data + CW - COL.net - 20) / 3;
  const fCap = `<g class="fl-fcap"><path d="M${COL.net},${FY - 26} H${500 - 150} M${500 + 150},${FY - 26} H${COL.data + CW}"/>` +
    `<text x="500" y="${FY - 22}" text-anchor="middle">FOUNDATIONS · 모든 층에서 쓰는 기초</text></g>`;
  const card = (id, i) => {
    const x = COL.net + i * (FW + 10);
    return part(id, 5 + i,
      `<rect class="fl-band fl-card" x="${x}" y="${FY}" width="${FW}" height="58" rx="12"/>` +
      `<rect class="fl-accent" x="${x}" y="${FY + 12}" width="4" height="34" rx="2"/>` +
      `<text class="fl-ko fl-ko--sm" x="${x + 20}" y="${FY + 27}">${T[id].ko}</text>` +
      `<text class="fl-en" x="${x + 20}" y="${FY + 44}">${T[id].en}</text>` +
      `<text class="fl-tile-ko" x="${x + FW - 16}" y="${FY + 34}" text-anchor="end">${T[id].chips.join(' · ')}</text>`);
  };
  const algo = card('algo', 0), security = card('security', 1), eng = card('eng', 2);

  S.mount(hw + netLinks + dataLinks + calls + os + runtime + app + net + data + fCap + algo + security + eng, {
    defaultHint: '층이나 기둥을 눌러 자세히 보기',
    viewBox: '20 -60 960 730',
    board: true,
    flowsLabel: '앱에서 하드웨어까지',
    sub: { os: 'os.html' },
    routes: {
      mode: 'flat', vfirst: ['net', 'data'],
      anchors: {
        app: [BX + 2, mid.app], runtime: [BX + 2, mid.runtime], os: [BX + 2, mid.os],
        net: [COL.net + CW / 2, mid.runtime], data: [COL.data + CW / 2, mid.runtime],
        algo: [COL.net + FW / 2, FY], security: [500, FY], eng: [COL.data + CW - FW / 2, FY]
      }
    }
  });
})();
