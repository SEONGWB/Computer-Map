/* =========================================================
   Software / 운영체제 — 정면 평면: RAM 상자 안에 프로세스와 커널
   위(사용자 공간): P1 · P2(내 앱) · P3 — 스택 · 힙 · 데이터 · 코드
   경계: 시스템 콜 — 프로세스가 커널에 부탁하는 유일한 문
   아래(커널 공간): 스케줄러 · 메모리 관리 · 파일 시스템 · 드라이버
   바깥: CPU(지금 누가 쓰는지) · 장치(NIC · KEY · SSD)
   ========================================================= */
(() => {
  const T = {
    process: { ko: '프로세스', en: 'PROCESS', desc: '실행 중인 프로그램. 운영체제는 프로세스마다 자기만의 메모리와 상태를 따로 관리해요.', chips: ['PID', 'PCB', '스레드'], topics: ['프로세스와 스레드', '프로세스 상태 (준비 · 실행 · 대기)', 'PCB', '프로세스 간 통신 (IPC)'], links: ['syscall', 'scheduler'] },
    syscall: { ko: '시스템 콜', en: 'SYSTEM CALL', desc: '프로그램이 운영체제에 일을 부탁하는 유일한 문. 파일 읽기, 메모리 요청, 프로세스 만들기가 모두 시스템 콜이에요.', chips: ['read', 'write', 'fork'], topics: ['사용자 모드와 커널 모드', '시스템 콜의 종류', '트랩과 인터럽트'], links: ['process', 'fs', 'mm', 'scheduler'] },
    scheduler: { ko: '스케줄러', en: 'SCHEDULER', desc: '어느 프로세스가 지금 CPU를 쓸지 정하는 관리자. 아주 짧게 번갈아 쓰게 해서 동시에 도는 것처럼 보이게 해요.', chips: ['준비 큐', '타임 슬라이스'], topics: ['CPU 스케줄링 알고리즘', '컨텍스트 스위치', '선점과 비선점'], links: ['process', 'driver'] },
    mm: { ko: '메모리 관리', en: 'MEMORY MANAGER', desc: '프로세스마다 가상 주소 공간을 주고, 실제 RAM의 프레임을 나눠 주는 관리자.', chips: ['가상 메모리', '페이지'], topics: ['가상 메모리', '페이지 교체 알고리즘', '메모리 할당 (malloc의 뒤편)'], links: ['syscall', 'driver'] },
    fs: { ko: '파일 시스템', en: 'FILE SYSTEM', desc: '파일과 폴더라는 편한 개념을 만들어 디스크의 블록과 이어 주는 층.', chips: ['VFS', '페이지 캐시', '저널'], topics: ['inode와 디렉터리', '페이지 캐시', '저널링'], links: ['syscall', 'driver'] },
    driver: { ko: '드라이버 · 인터럽트', en: 'DRIVERS · INTERRUPTS', desc: '하드웨어와 직접 대화하는 맨 아래 층. 장치마다 드라이버가 있고, 장치가 보낸 인터럽트를 받아 처리해요.', chips: ['드라이버', 'IRQ', 'DMA'], topics: ['장치 드라이버', '인터럽트 처리 (상반부 · 하반부)', 'DMA와 드라이버'], links: ['fs', 'mm', 'scheduler'] }
  };

  Scene.spots(T, {
    process: { spots: [
      ['CODE', '코드 · 데이터', 'ADDRESS SPACE', '실행할 명령어와 변수가 담긴 자기만의 메모리 공간.', { shape: 'layers' }],
      ['PCB', '프로세스 제어 블록', 'PCB', 'PID, 상태, 레지스터 값, 열린 파일 목록 같은 프로세스의 신분증.', { shape: 'chip', hi: true }],
      ['STATE', '상태', 'STATE', '준비 → 실행 → 대기를 오가요. 상태를 바꾸는 건 운영체제의 몫이에요.', { shape: 'cells' }],
      ['THREAD', '스레드', 'THREAD', '한 프로세스 안에서 동시에 도는 실행 흐름. 메모리는 함께 씁니다.', { shape: 'layers' }]
    ] },
    syscall: { label: '시스템 콜 한 번의 순서', spots: [
      ['CALL', '호출', 'SYSCALL', '번호와 인자를 레지스터에 넣고 특별한 명령(syscall)을 실행해요.', { shape: 'wire' }],
      ['TRAP', '모드 전환', 'USER → KERNEL', 'CPU가 커널 모드로 바뀌고, 정해진 커널 코드로 점프해요.', { shape: 'chip', hi: true }],
      ['TABLE', '시스템 콜 표', 'SYSCALL TABLE', '번호마다 처리할 커널 함수가 적혀 있어요.', { shape: 'cells' }],
      ['RET', '복귀', 'RETURN', '결과를 레지스터에 담아 사용자 모드로 돌아가요.' ]
    ] },
    scheduler: { spots: [
      ['QUEUE', '준비 큐', 'READY QUEUE', 'CPU 차례를 기다리는 프로세스들의 줄.', { shape: 'layers' }],
      ['PICK', '고르기', 'POLICY', '우선순위, 공정함(CFS) 같은 규칙으로 다음 차례를 정해요.', { shape: 'chip', hi: true }],
      ['SLICE', '타임 슬라이스', 'TIME SLICE', '한 번에 쓸 수 있는 시간. 다 쓰면 타이머 인터럽트로 교대해요.', { shape: 'cells' }],
      ['SWITCH', '컨텍스트 스위치', 'CONTEXT SWITCH', '지금 레지스터 값을 저장하고 다음 프로세스의 값을 불러와 교대합니다.', { shape: 'wire' }]
    ] },
    mm: { spots: [
      ['VA', '가상 주소 공간', 'ADDRESS SPACE', '프로세스마다 0번지부터 시작하는 자기만의 주소.', { shape: 'layers' }],
      ['PT', '페이지 테이블', 'PAGE TABLE', '가상 페이지 → 물리 프레임 지도. 하드웨어 MMU가 이 표를 읽어요.', { shape: 'cells', hi: true }],
      ['ALLOC', '할당', 'ALLOCATOR', '빈 프레임을 찾아 나눠 주고, 다 쓰면 돌려받아요.', { shape: 'chip' }],
      ['SWAP', '스왑', 'PAGE OUT', 'RAM이 모자라면 덜 쓰는 페이지를 디스크로 내보내요.', { shape: 'disk' }]
    ] },
    fs: { spots: [
      ['VFS', '가상 파일 시스템', 'VFS', 'ext4든 NTFS든 같은 방법(open · read · write)으로 쓰게 해 줘요.', { shape: 'layers' }],
      ['CACHE', '페이지 캐시', 'PAGE CACHE', '최근 읽고 쓴 파일 내용을 메모리에 두어 디스크에 덜 가요.', { shape: 'cells', hi: true }],
      ['INODE', '메타데이터', 'INODE', '파일 크기, 권한, 블록 위치를 담아요.', { shape: 'chip' }],
      ['JRNL', '저널', 'JOURNAL', '바꾸기 전에 기록해 두어 정전이 나도 복구해요.']
    ] },
    driver: { spots: [
      ['DRV', '장치 드라이버', 'DEVICE DRIVER', '장치의 레지스터를 읽고 써서 명령을 내려요.', { shape: 'chip', hi: true }],
      ['ISR', '인터럽트 처리', 'INTERRUPT HANDLER', '장치가 보낸 신호를 받아 급한 일만 바로 처리해요.', { shape: 'wire' }],
      ['DMA', 'DMA 설정', 'DMA', '큰 데이터는 장치와 메모리가 직접 옮기게 맡겨요.', { shape: 'layers' }],
      ['HW', '하드웨어', 'HARDWARE', '여기서부터는 하드웨어 영역이에요.', { shape: 'cells' }]
    ] }
  });

  /* =========================================================
     정면 평면: 큰 네모 = RAM. 그 안에 프로세스들과 커널이 함께 들어 있음
     · 위쪽(사용자 공간): P1 · P2(내 앱) · P3 — 각자 스택 · 힙 · 데이터 · 코드
     · 가운데 선: 시스템 콜 — 사용자 공간과 커널 공간의 경계
     · 아래쪽(커널 공간): 스케줄러 · 메모리 관리 · 파일 시스템(페이지 캐시) · 드라이버
     · 바깥: 위 = CPU (지금 누가 쓰는지), 오른쪽 = 장치 (NIC · KEY · SSD)
     ========================================================= */
  const S = Scene.create({ T });
  const { part, linked } = S;
  const PC = { 1: 268, 2: 22, 3: 328 };             // 프로세스 색: P1 보라, P2 주황(내 앱), P3 분홍
  const pc = (n, l = 56, a = 1) => `hsl(${PC[n]} 78% ${l}% / ${a})`;

  const RAM = { x: 150, y: 110, w: 640, h: 450 };
  const UY = 146, UH = 248;                          // 사용자 공간 (프로세스 블록)
  const BY = 420;                                    // 시스템 콜 경계선
  const KY = 452, KH = 78;                           // 커널 관리자 칸
  const PX = { 1: 176, 2: 326, 3: 476 }, PW = 132;   // 프로세스 블록
  const FREE = { x: 626, w: 146 };

  /* ---------- RAM 상자 ---------- */
  const ramBox = `<g class="deco">` +
    `<rect class="ofl-ram" x="${RAM.x}" y="${RAM.y}" width="${RAM.w}" height="${RAM.h}" rx="16"/>` +
    `<text class="ofl-title" x="${RAM.x}" y="${RAM.y - 14}">RAM</text>` +
    `<text class="ofl-sub" x="${RAM.x + 60}" y="${RAM.y - 14}">물리 메모리 · 프로그램과 운영체제가 함께 사는 곳</text>` +
    `<text class="ofl-zone" x="${RAM.x + 16}" y="${UY - 12}">USER SPACE · 사용자 공간</text>` +
    `<text class="ofl-zone" x="${RAM.x + 16}" y="${KY - 8}">KERNEL SPACE · 커널 공간</text>` +
    // 빈 메모리
    `<rect class="ofl-free" x="${FREE.x}" y="${UY}" width="${FREE.w}" height="${UH}" rx="10"/>` +
    `<text class="ofl-seg-t ofl-free-t" x="${FREE.x + FREE.w / 2}" y="${UY + UH / 2 - 4}" text-anchor="middle">FREE</text>` +
    `<text class="ofl-seg-k" x="${FREE.x + FREE.w / 2}" y="${UY + UH / 2 + 12}" text-anchor="middle">빈 메모리</text>` +
    `</g>`;

  /* ---------- 사용자 공간: 프로세스 블록 (위 = 높은 주소) ---------- */
  // [이름, 한글, 높이] — 스택과 힙 사이의 빈틈은 서로를 향해 자라는 공간
  const SEG = [['STACK', '스택', 34], ['', '', 50], ['HEAP', '힙', 52], ['DATA', '데이터', 28], ['CODE', '코드', 44]];
  const proc = n => {
    const x = PX[n], top = UY + 32;
    let y = top, s = `<rect class="ofl-proc" x="${x}" y="${UY}" width="${PW}" height="${UH}" rx="10" style="stroke:${pc(n, 62, 0.7)}"/>` +
      `<text class="ofl-pname" x="${x + 12}" y="${UY + 21}" style="fill:${pc(n, 74)}">P${n}${n === 2 ? ' · 내 앱' : ''}</text>`;
    SEG.forEach(([en, ko, h]) => {
      const sx = x + 10, sw = PW - 20;
      if (!en) {   // 빈틈: 스택은 아래로, 힙은 위로 자람
        const cx = x + PW / 2;
        s += `<path class="ofl-grow" d="M${cx - 18},${y + 8} v12 m-4,-4 l4,4 l4,-4 M${cx + 18},${y + h - 8} v-12 m-4,4 l4,-4 l4,4"/>`;
      } else {
        const heap = en === 'HEAP' && n === 2;    // 내 앱의 힙이 커졌다 줄었다 (malloc / new)
        s += `<rect x="${sx}" y="${y}" width="${sw}" height="${h - 4}" rx="4" style="fill:${pc(n, en === 'CODE' ? 34 : en === 'DATA' ? 40 : 48)}">` +
          (heap ? `<animate attributeName="y" values="${y};${y - 22};${y - 22};${y}" keyTimes="0;0.35;0.8;1" dur="5s" repeatCount="indefinite"/><animate attributeName="height" values="${h - 4};${h + 18};${h + 18};${h - 4}" keyTimes="0;0.35;0.8;1" dur="5s" repeatCount="indefinite"/>` : '') +
          `</rect><text class="ofl-seg-t" x="${sx + 8}" y="${y + 15}">${en}</text><text class="ofl-seg-k" x="${sx + sw - 8}" y="${y + 15}" text-anchor="end">${ko}</text>`;
      }
      y += h;
    });
    return s;
  };
  const process = part('process', 0, proc(1) + proc(2) + proc(3));

  /* ---------- 시스템 콜: 사용자 공간과 커널 공간 사이의 문 ---------- */
  const GX = 420, GW = 112;
  const syscall = part('syscall', 1,
    `<path class="ofl-border" d="M${RAM.x + 12},${BY} H${GX} M${GX + GW},${BY} H${RAM.x + RAM.w - 12}"/>` +
    `<rect class="ofl-gate" x="${GX}" y="${BY - 13}" width="${GW}" height="26" rx="13"/>` +
    `<text class="ofl-gate-t" x="${GX + GW / 2}" y="${BY + 4}" text-anchor="middle">SYSCALL · 문</text>`);
  // 내 앱(P2)이 문을 지나 커널에 부탁하는 모습
  const callPath = `M${PX[2] + PW / 2},${UY + UH} V${BY - 2} H${GX + GW / 2} V${KY}`;
  const callFx = linked('syscall', `<path class="wire wire--dash" d="${callPath}"/><path class="packet" d="${callPath}" pathLength="100"/>`, 'ofl-call');

  /* ---------- 커널 공간: 관리자들 ---------- */
  const KX = { scheduler: 176, mm: 326, fs: 476, driver: 626 }, KW = 140;
  const kTile = (id, en, ko, inner) => {
    const x = KX[id];
    return `<rect class="ofl-k" x="${x}" y="${KY}" width="${KW}" height="${KH}" rx="9"/>` +
      `<text class="ofl-k-en" x="${x + 12}" y="${KY + 20}">${en}</text><text class="ofl-k-ko" x="${x + KW - 12}" y="${KY + 20}" text-anchor="end">${ko}</text>` + inner(x);
  };
  const scheduler = part('scheduler', 2, kTile('scheduler', 'SCHED', '준비 큐', x =>
    [2, 3, 1].map((n, k) => `<rect x="${x + 12 + k * 30}" y="${KY + 34}" width="24" height="30" rx="4" style="fill:${pc(n, 52)}"/><text class="ofl-q" x="${x + 24 + k * 30}" y="${KY + 54}" text-anchor="middle">P${n}</text>`).join('') +
    `<path class="ofl-grow" d="M${x + 106},${KY + 49} h22 m-5,-5 l5,5 l-5,5"/>`));
  const mm = part('mm', 3, kTile('mm', 'MEMORY', '페이지 테이블', x =>
    [0, 1, 2].map(r => `<rect class="ofl-cell" x="${x + 12}" y="${KY + 32 + r * 14}" width="40" height="11" rx="2"/><path class="ofl-grow" d="M${x + 56},${KY + 37 + r * 14} h20"/><rect class="ofl-cell ofl-cell--on" x="${x + 80}" y="${KY + 32 + r * 14}" width="48" height="11" rx="2"/>`).join('')));
  const fs = part('fs', 4, kTile('fs', 'FILE SYS', '페이지 캐시', x =>
    `<rect class="ofl-cache" x="${x + 12}" y="${KY + 34}" width="116" height="30" rx="4"/><text class="ofl-seg-t" x="${x + 22}" y="${KY + 53}">note.txt</text><text class="ofl-seg-k" x="${x + 118}" y="${KY + 53}" text-anchor="end">0~4KB</text>`));
  const driver = part('driver', 5, kTile('driver', 'DRIVERS', 'IRQ', x =>
    ['NVMe', 'NIC', 'KBD'].map((d, k) => `<text class="ofl-seg-k ofl-drv" x="${x + 14 + k * 42}" y="${KY + 54}">${d}</text>`).join('') +
    `<path class="ofl-grow" d="M${x + 12},${KY + 62} h116"/>`));

  /* ---------- 바깥: CPU (스케줄러가 차례를 정함) ---------- */
  const ORDER = [1, 2, 3, 2, 1, 3];                  // 1.2초마다 차례가 바뀜
  const dur = ORDER.length * 1.2;
  const cpu = linked('scheduler',
    `<rect class="ofl-dev" x="400" y="12" width="150" height="62" rx="10"/>` +
    `<text class="ofl-dev-t" x="414" y="34">CPU</text><text class="ofl-seg-k" x="414" y="50">지금 실행 중</text>` +
    `<rect x="492" y="22" width="44" height="42" rx="6">` +
    `<animate attributeName="fill" values="${ORDER.map(n => pc(n, 56)).join(';')}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/></rect>` +
    [1, 2, 3].map(n => `<text class="ofl-q" x="514" y="48" text-anchor="middle" opacity="0">P${n}<animate attributeName="opacity" values="${ORDER.map(o => +(o === n)).join(';')}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/></text>`).join('') +
    // 실행 중인 프로세스를 감싸는 테두리가 차례대로 옮겨 감
    `<g><rect class="ofl-run" x="${PX[1] - 5}" y="${UY - 5}" width="${PW + 10}" height="${UH + 10}" rx="13"/>` +
    `<text class="ofl-run-t" x="${PX[1] + PW / 2}" y="${UY - 10}" text-anchor="middle">▼ 실행 중</text>` +
    `<animateTransform attributeName="transform" type="translate" values="${ORDER.map(n => `${PX[n] - PX[1]} 0`).join(';')}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/></g>`, 'os-res');

  /* ---------- 바깥: 장치 ---------- */
  const DX = 830, DW = 120;
  const dev = (y, h, name, ko) => `<rect class="ofl-dev" x="${DX}" y="${y}" width="${DW}" height="${h}" rx="9"/><text class="ofl-dev-t" x="${DX + 12}" y="${y + 22}">${name}</text><text class="ofl-seg-k" x="${DX + DW - 12}" y="${y + 22}" text-anchor="end">${ko}</text>`;
  const FILE = [2, 7, 8, 13];
  const ssd = dev(300, 130, 'SSD', '디스크') +
    Array.from({ length: 16 }, (_, i) => `<rect class="${FILE.includes(i) ? 'res-file' : 'res-free'}" x="${DX + 12 + (i % 4) * 25}" y="${334 + Math.floor(i / 4) * 23}" width="21" height="19" rx="3"/>`).join('');
  const fsRes = linked('fs', ssd, 'os-res');
  const drvWire = `M${KX.driver + KW},${KY + 30} H806 V172 H${DX} M806,252 H${DX} M806,365 H${DX}`;
  const drvRes = linked('driver', dev(140, 64, 'NIC', '랜카드') + dev(220, 64, 'KEY', '키보드') +
    `<path class="wire wire--dash" d="${drvWire}"/><path class="packet" d="M${KX.driver + KW},${KY + 30} H806 V365 H${DX}" pathLength="100"/>`, 'os-res');

  /* ---------- 메모리 관리를 가리키면: 실제로는 페이지 단위로 흩어져 있다는 진실 ---------- */
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const COLS = 18, ROWS = 8, fw = 30, fh = 26, gx = RAM.x + 20, gy = UY + 2;
  let frames = '';
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const v = rnd(), n = v < 0.2 ? 1 : v < 0.45 ? 2 : v < 0.6 ? 3 : 0;
    const x = gx + c * (fw + 4), y = gy + r * (fh + 4);
    frames += (r === 3 && c === 9)   // 빈 칸이 P2에게 새로 할당되는 모습
      ? `<rect class="res-free" x="${x}" y="${y}" width="${fw}" height="${fh}" rx="3"><animate attributeName="fill" values="hsl(166 30% 16%);${pc(2, 56)};${pc(2, 56)};hsl(166 30% 16%)" keyTimes="0;0.3;0.85;1" dur="4s" repeatCount="indefinite"/></rect>`
      : n ? `<rect x="${x}" y="${y}" width="${fw}" height="${fh}" rx="3" style="fill:${pc(n, 52)}"/>` : `<rect class="res-free" x="${x}" y="${y}" width="${fw}" height="${fh}" rx="3"/>`;
  }
  const scatter = linked('mm',
    `<rect class="ofl-scatter-bg" x="${RAM.x + 8}" y="${UY - 26}" width="${RAM.w - 16}" height="${UH + 30}" rx="12"/>` + frames +
    `<rect class="ofl-pill" x="${RAM.x + RAM.w / 2 - 170}" y="${UY - 22}" width="340" height="20" rx="10"/>` +
    `<text class="ofl-pill-t" x="${RAM.x + RAM.w / 2}" y="${UY - 8}" text-anchor="middle">실제 RAM에서는 4KB 페이지 단위로 흩어져 있어요</text>`, 'ofl-scatter');

  const tags = S.tags([
    { id: 'process', a: [PX[1], UY + 60], l: [64, UY + 60] },
    { id: 'syscall', a: [RAM.x + 12, BY], l: [64, BY - 6] },
    { id: 'scheduler', a: [KX.scheduler, KY + 50], l: [64, KY + 56] },
    { id: 'mm', a: [KX.mm + KW / 2, KY + KH], l: [KX.mm + KW / 2, 612], below: true },
    { id: 'fs', a: [KX.fs + KW / 2, KY + KH], l: [KX.fs + KW / 2, 612], below: true },
    { id: 'driver', a: [KX.driver + KW / 2, KY + KH], l: [KX.driver + KW / 2, 612], below: true }
  ]);

  S.mount(ramBox + fsRes + drvRes + process + callFx + syscall + scheduler + mm + fs + driver + cpu + scatter + tags, {
    defaultHint: 'RAM 안에 프로세스와 커널이 함께 살아요 · 관리자를 가리키면 그 관리자가 다루는 것이 보여요',
    viewBox: '-20 0 990 640',
    routes: {
      mode: 'flat', vfirst: ['process'],
      anchors: { process: [PX[2] + PW / 2, UY + UH / 2], syscall: [GX + GW / 2, BY], scheduler: [KX.scheduler + KW / 2, KY + KH / 2], mm: [KX.mm + KW / 2, KY + KH / 2], fs: [KX.fs + KW / 2, KY + KH / 2], driver: [KX.driver + KW / 2, KY + KH / 2] }
    }
  });
})();
