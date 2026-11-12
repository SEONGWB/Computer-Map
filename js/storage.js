/* =========================================================
   Hardware / Storage — HDD, SSD, 인터페이스, RAID, 파일 시스템
   ========================================================= */
(() => {
  const T = {
    hdd: { ko: 'HDD', en: 'HARD DISK', desc: '자기 원판(플래터)이 빠르게 돌고, 헤드가 그 위를 움직이며 데이터를 읽고 쓰는 저장장치.', chips: ['플래터', '헤드', 'RPM'], topics: ['HDD의 구조와 동작', '탐색 시간과 회전 지연', '섹터와 트랙'] },
    ssd: { ko: 'SSD', en: 'SOLID STATE DRIVE', desc: '움직이는 부품 없이 NAND 플래시 메모리 칩에 데이터를 저장하는 장치. HDD보다 훨씬 빠릅니다.', chips: ['NAND', '컨트롤러', 'TRIM'], topics: ['NAND 플래시 (SLC·MLC·TLC)', '웨어 레벨링', 'SSD 컨트롤러와 FTL'], links: ['interface'] },
    interface: { ko: '인터페이스', en: 'NVMe · SATA', desc: '저장장치가 컴퓨터와 데이터를 주고받는 통로. SATA는 한 차선, NVMe는 PCIe 여러 차선을 써서 훨씬 빠릅니다.', chips: ['SATA', 'PCIe', 'NVMe'], topics: ['SATA와 NVMe 비교', 'PCIe 레인', 'AHCI와 NVMe 프로토콜'], links: ['hdd', 'ssd'] },
    raid: { ko: 'RAID', en: 'RAID', desc: '여러 디스크를 하나처럼 묶어 속도를 높이거나, 한 디스크가 고장 나도 데이터를 지키는 기술.', chips: ['RAID 0', 'RAID 1', 'RAID 5'], topics: ['RAID 레벨별 차이', '패리티', '스트라이핑과 미러링'] },
    fs: { ko: '파일 시스템', en: 'FILE SYSTEM', desc: '저장장치 위에 파일과 폴더를 어떻게 배치하고 찾을지 정하는 규칙.', chips: ['NTFS', 'ext4', 'APFS'], topics: ['파일 시스템의 구조', 'inode와 FAT', '저널링'] }
  };

  const LOAD = { route: 'storage-memory', label: '메모리로 프로그램 불러오기', desc: 'SSD → NVMe(PCIe) → 메모리 컨트롤러 → RAM' };
  T.ssd.flows = [LOAD]; T.hdd.flows = [LOAD]; T.interface.flows = [LOAD];

  /* ---------- 설명창 분해 그림: 구성 요소 ---------- */
  const LOADX = { label: 'RAM으로 불러오기', route: 'storage-memory' };
  Scene.spots(T, {
    hdd: { spots: [
      ['PLATTER', '플래터', 'PLATTER', '자성 물질을 입힌 원판. 동심원(트랙)을 따라 데이터가 기록됩니다.', { shape: 'disk', hi: true }],
      ['HEAD', '헤드', 'HEAD', '플래터 위 수 나노미터 높이에 떠서 자기 신호를 읽고 씁니다.'],
      ['ARM', '액추에이터 암', 'ACTUATOR', '헤드를 원하는 트랙으로 옮깁니다. 이 이동 시간이 HDD가 느린 이유예요.', { shape: 'wire' }],
      ['MOTOR', '스핀들 모터', 'SPINDLE', '플래터를 분당 5400~7200번 돌립니다.', { shape: 'disk' }],
      ['PCB', '컨트롤러 기판', 'CONTROLLER', '명령을 받아 헤드와 모터를 움직이고, 캐시 메모리도 갖고 있습니다.', { shape: 'board', action: LOADX }]
    ] },
    ssd: { spots: [
      ['M.2', '커넥터', 'M.2 · PCIe', '메인보드 M.2 슬롯에 꽂혀 PCIe 레인으로 이어집니다.', { shape: 'board' }],
      ['CTRL', '컨트롤러', 'CONTROLLER', '데이터를 여러 NAND 칩에 나눠 쓰고, 마모를 고르게 퍼뜨립니다.', { shape: 'chip', hi: true }],
      ['DRAM', 'DRAM 캐시', 'CACHE', '어느 데이터가 어느 칩에 있는지 적은 지도(매핑 표)를 담습니다.', { shape: 'chip' }],
      ['NAND', '플래시 칩', 'NAND FLASH', '전원 없이도 전하를 가두어 데이터를 지킵니다. 층층이 쌓아(3D NAND) 용량을 늘려요.', { shape: 'layers', action: LOADX }]
    ] },
    interface: { spots: [
      ['SATA', 'SATA', 'SATA · 1 LANE', '한 차선 도로. 최대 약 600MB/s로 HDD와 옛 SSD가 씁니다.', { shape: 'wire' }],
      ['PCIe', 'PCIe 레인', 'PCIe · x4', '여러 차선을 동시에 쓰는 도로. x4면 수 GB/s까지 나옵니다.', { shape: 'wire', hi: true }],
      ['NVMe', 'NVMe', 'PROTOCOL', 'SSD를 위해 새로 만든 명령 규칙. 줄(큐)을 수만 개 세워 동시에 처리합니다.', { shape: 'chip' }],
      ['HUB', '연결 지점', 'CPU · CHIPSET', 'NVMe는 CPU에 바로, SATA는 칩셋을 거쳐 연결됩니다.', { action: LOADX }]
    ] },
    raid: { spots: [
      ['RAID 0', '스트라이핑', 'STRIPING', '데이터를 쪼개 여러 디스크에 동시에 씁니다. 빠르지만 하나만 고장 나도 전부 잃어요.', { shape: 'disk' }],
      ['RAID 1', '미러링', 'MIRRORING', '같은 데이터를 두 디스크에 똑같이 씁니다. 하나가 고장 나도 안전합니다.', { shape: 'disk' }],
      ['RAID 5', '패리티', 'PARITY', '데이터와 함께 복구용 계산 값(패리티)을 나눠 저장해, 디스크 하나 고장까지 되살립니다.', { shape: 'disk', hi: true }],
      ['CTRL', 'RAID 컨트롤러', 'CONTROLLER', '여러 디스크를 하나처럼 보이게 묶어 관리합니다.', { shape: 'chip' }]
    ] },
    fs: { layout: 'stack', label: '파일을 찾아가는 순서', spots: [
      ['DIR', '디렉터리', 'DIRECTORY', '이름과 파일 번호(inode)를 짝지어 둔 목록입니다.', { hi: true }],
      ['INODE', '메타데이터', 'INODE', '파일 크기, 권한, 시간, 그리고 내용이 있는 블록의 위치를 담습니다.'],
      ['BLOCK', '데이터 블록', 'DATA BLOCKS', '실제 내용이 저장되는 4KB 조각들입니다.'],
      ['JOURNAL', '저널', 'JOURNAL', '바꾸기 전에 할 일을 먼저 적어 두어, 정전이 나도 복구할 수 있게 합니다.']
    ] }
  });

  // 장치가 아니라 구조를 보여 주는 개념 항목 (설명창에 '개념 · 구조' 표시)
  ['raid', 'fs'].forEach(k => { T[k].kind = 'concept'; });

  const S = Scene.create({ T, cx: 440, cy: 300 });
  const { P, f, top, box, onFaceA, onFaceB, flatPath, part } = S;

  /* ---------- HDD (뚜껑 연 모습) ---------- */
  const hdd = (() => {
    const cxp = -185, cyp = -105, r = 52;
    const tracks = [44, 36, 28, 20].map(t => `<circle class="track" cx="${cxp}" cy="${cyp}" r="${t}"/>`).join('');
    const spin = `<animateTransform attributeName="transform" type="rotate" from="0 ${cxp} ${cyp}" to="360 ${cxp} ${cyp}" dur="3s" repeatCount="indefinite"/>`;
    const swing = `<animateTransform attributeName="transform" type="rotate" values="0 -132 -52; -14 -132 -52; 6 -132 -52; 0 -132 -52" dur="2.6s" repeatCount="indefinite"/>`;
    return part('hdd', 0,
      box(-250, -170, 130, 130, 0, 14, 'dev-top') +
      top(14,
        `<circle class="platter" cx="${cxp}" cy="${cyp}" r="${r}"/>` +
        `<g>${tracks}<path class="stroke-lav" d="M${cxp} ${cyp - r + 4} v10"/>${spin}</g>` +
        `<circle class="cell cell--hi" cx="${cxp}" cy="${cyp}" r="8"/>` +
        `<g><path class="arm" d="M-132 -52 L-160 -82 L-170 -96"/><circle class="fill-lav" cx="-170" cy="-96" r="3"/>${swing}</g>` +
        `<circle class="cell" cx="-132" cy="-52" r="7"/>`));
  })();

  /* ---------- SSD (M.2) ---------- */
  const ssd = part('ssd', 1,
    box(-60, -205, 160, 62, 0, 4, 'dev-top') +
    box(-52, -196, 30, 30, 4, 4, 'core-block') + top(8, `<text class="lbl" x="-49" y="-178">CTRL</text>`) +
    [0, 1, 2].map(k => box(-14 + k * 36, -198, 30, 44, 4, 4, 'cache-top') + top(8, `<text class="lbl" x="${-10 + k * 36}" y="-174">NAND</text>`)).join('') +
    box(-52, -162, 20, 14, 4, 3, 'core-block') +
    onFaceB(100, -200, -148, 0.4, 3.4, 'gold'));

  /* ---------- 인터페이스 (SATA 1차선 / PCIe 4차선) ---------- */
  const interfacePart = (() => {
    const sata = flatPath([[-120, -82], [-60, -82], [-60, -36], [-10, -36]]);
    const lanes = [4, 13, 22, 31].map(x => flatPath([[x, -143], [x, -60]]));
    return part('interface', 2,
      `<path class="wire" d="${sata}" style="stroke-width:3"/><path class="packet" d="${sata}" pathLength="100" style="animation-duration:3.6s"/>` +
      lanes.map((d, i) => `<path class="wire" d="${d}"/><path class="packet packet--fast" d="${d}" pathLength="100" style="animation-delay:${-i * 0.25}s"/>`).join('') +
      box(-10, -60, 50, 50, 0, 14, 'dev-top') + top(14, `<text class="lbl" x="-4" y="-38">I/O HUB</text>`) +
      `<text class="lbl lbl--dim" x="${f(P(-90, -82)[0] - 10)}" y="${f(P(-90, -82)[1] + 14)}">SATA</text>` +
      `<text class="lbl lbl--dim" x="${f(P(40, -110)[0] + 8)}" y="${f(P(40, -110)[1])}">PCIe ×4</text>`);
  })();

  /* ---------- RAID (디스크 4개에 데이터를 나눠 저장) ---------- */
  const raid = (() => {
    const blocks = [['A1', 'B2', 'P'], ['A2', 'P', 'C1'], ['A3', 'B1', 'C2'], ['P', 'B3', 'C3']];
    let s = box(80, 34, 196, 70, 0, 4, 'core-plate');
    blocks.forEach((col, k) => {
      const x = 88 + k * 46;
      s += box(x, 42, 38, 54, 4, 30, 'dev-top');
      s += top(34, col.map((b, j) => `<rect class="cell${b === 'P' ? ' cell--hi' : ''}" x="${x + 4}" y="${46 + j * 16}" width="30" height="12" rx="2"/>` +
        `<text class="lbl" x="${x + 8}" y="${55 + j * 16}">${b}</text>`).join(''));
    });
    return part('raid', 3, s);
  })();

  /* ---------- 파일 시스템 (폴더 트리) ---------- */
  const fs = (() => {
    const links = [
      [[-180, 60], [-180, 80], [-230, 80], [-230, 100]],
      [[-180, 60], [-180, 100]],
      [[-180, 60], [-180, 80], [-125, 80], [-125, 100]],
      [[-230, 130], [-230, 150], [-238, 150], [-238, 160]],
      [[-230, 130], [-230, 150], [-210, 150], [-210, 160]]
    ].map(a => `<path class="wire" d="${flatPath(a)}"/>`).join('');
    const folder = (x, y, root) => box(x, y, 40, 30, 0, root ? 12 : 8, 'cache-top') +
      top(root ? 12 : 8, `<path class="stroke-lav" d="M${x + 6} ${y + 10} h10 l3 3 h14 v10 h-27 z"/>`);
    const file = (x, y) => box(x, y, 18, 24, 0, 4, 'core-block') + top(4, `<path class="stroke-dim" d="M${x + 4} ${y + 6} h10 M${x + 4} ${y + 11} h10 M${x + 4} ${y + 16} h6"/>`);
    return part('fs', 4, links + folder(-200, 30, true) + folder(-250, 100) + folder(-200, 100) + folder(-145, 100) + file(-247, 160) + file(-219, 160) +
      top(12, `<text class="lbl" x="-196" y="27">/</text>`));
  })();

  const tags = S.tags([
    { id: 'hdd', a: P(-185, -105, 14), l: [300, 60] },
    { id: 'ssd', a: P(20, -174, 8), l: [720, 120] },
    { id: 'interface', a: P(15, -35, 14), l: [300, 430], below: true },
    { id: 'raid', a: P(180, 69, 34), l: [780, 350] },
    { id: 'fs', a: P(-180, 45, 12), l: [110, 150] }
  ]);

  S.mount(S.floor(300) + hdd + ssd + interfacePart + fs + raid + tags, {
    routes: {
      plane: 0,
      anchors: { hdd: [-185, -105, 14], ssd: [20, -174, 8], interface: [15, -35, 14], raid: [180, 69, 34], fs: [-180, 45, 12] },
      // I/O 허브 → SSD: PCIe 레인 4개를 따라
      paths: { 'interface-ssd': [[15, -35, 14], [13, -60, 0], [13, -143, 0], [20, -174, 8]] }
    }, viewBox: '20 20 880 500' });
})();
