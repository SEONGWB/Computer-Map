/* =========================================================
   Hardware / Memory — 메모리 계층 피라미드, DRAM, 가상 메모리
   ========================================================= */
(() => {
  const LEVELS = ['disk', 'ram', 'cache', 'reg']; // 아래 → 위
  const T = {
    hierarchy: { ko: '메모리 계층', en: 'MEMORY HIERARCHY', desc: '위로 갈수록 빠르고 비싸고 작으며, 아래로 갈수록 느리지만 싸고 큽니다. 이 차이를 메우는 것이 컴퓨터 성능의 핵심입니다.', children: LEVELS, childOrder: [...LEVELS].reverse(), childLabel: '계층 (빠른 순서)' },
    reg: { short: '01', ko: '레지스터', en: 'REGISTER', desc: 'CPU 안에 있는 가장 빠른 저장 공간. 수십 개, 몇 바이트 단위입니다.', chips: ['~0.3ns', '수백 B'], topics: ['레지스터의 종류', '레지스터와 명령어'] },
    cache: { short: '02', ko: '캐시 메모리', en: 'CACHE · SRAM', desc: 'CPU와 메인 메모리 사이에서 자주 쓰는 데이터를 미리 담아 두는 SRAM 기반 메모리.', chips: ['~1-10ns', 'KB~MB'], topics: ['캐시 매핑 방식', '지역성의 원리', '교체 정책 (LRU)'] },
    ram: { short: '03', ko: '메인 메모리', en: 'MAIN MEMORY · DRAM', desc: '실행 중인 프로그램과 데이터를 담는 주기억장치. 바이트마다 주소가 붙어 있고, 전원이 꺼지면 내용이 사라집니다.', chips: ['~100ns', 'GB'], topics: ['주소와 바이트', '메모리 대역폭', '휘발성'], links: ['dram', 'vm'] },
    disk: { short: '04', ko: '보조기억장치', en: 'STORAGE · SSD / HDD', desc: '전원이 꺼져도 데이터가 남는 큰 저장소. 메인 메모리가 모자라면 스왑 공간으로도 쓰입니다.', chips: ['~100µs-10ms', 'TB'], topics: ['스왑 메모리', 'SSD와 HDD 비교'] },
    dram: { ko: 'DRAM과 SRAM', en: 'DRAM · SRAM', desc: 'DRAM은 축전기에 전하를 담아 싸고 크게 만들 수 있고, SRAM은 트랜지스터로 만들어 빠르지만 비쌉니다.', chips: ['DDR5', '리프레시'], topics: ['DRAM의 구조와 리프레시', 'SRAM의 구조', 'DDR 세대별 차이'], links: ['ram'] },
    vm: { ko: '가상 메모리', en: 'VIRTUAL MEMORY', desc: '프로그램마다 독립된 큰 메모리가 있는 것처럼 보이게 하고, 실제 물리 메모리와는 따로 연결해 주는 기술.', topics: ['가상 주소와 물리 주소', '페이지 폴트', '스와핑'], links: ['paging', 'ram'] },
    paging: { ko: '페이지 테이블', en: 'PAGING · MMU', desc: '가상 주소의 페이지를 물리 메모리의 프레임으로 바꿔 주는 표. MMU가 이 표를 보고 주소를 변환합니다.', topics: ['페이징과 세그멘테이션', 'TLB', '다단계 페이지 테이블'], links: ['vm'] },
    layout: { ko: '프로세스 메모리 구조', en: 'PROCESS LAYOUT', desc: '실행 중인 프로그램의 메모리는 코드, 데이터, 힙, 스택 영역으로 나뉩니다. 명령어(코드)와 데이터가 같은 메모리에 함께 있는 것이 폰 노이만 구조의 핵심입니다.', chips: ['CODE', 'DATA', 'HEAP', 'STACK'], topics: ['폰 노이만 구조 (프로그램 내장 방식)', '스택과 힙의 차이', '스택 오버플로', '메모리 누수'] }
  };

  /* 밖으로 주고받기 (하드웨어 보드를 거쳐 다른 화면으로) */
  T.ram.flows = [
    { route: 'memory-cpu', label: 'CPU로 데이터 올려 보내기', desc: '메모리 버스 → 캐시 → 레지스터' },
    { route: 'memory-gpu', label: 'GPU로 데이터 복사하기', desc: 'CPU → PCIe 레인 → VRAM' }
  ];
  T.disk.flows = [{ route: 'storage-memory', label: '저장장치에서 프로그램 불러오기', desc: 'SSD → NVMe → 메모리 컨트롤러 → RAM' }];
  T.vm.flows = [{ route: 'storage-memory', label: '페이지 폴트: 디스크에서 페이지 가져오기', desc: '메모리에 없는 페이지를 저장장치에서 읽어 옴' }];

  /* ---------- 설명창 분해 그림: 구성 요소 ---------- */
  Scene.spots(T, {
    hierarchy: { layout: 'stack', fromChildren: true, shrink: 34, w: 220, d: 160, label: '계층 · 위로 갈수록 빠름' },
    reg: { spots: [
      ['GPR', '범용 레지스터', 'GENERAL', '계산 중인 값을 담습니다. 개수는 16~32개 정도예요.', { shape: 'cells', hi: true }],
      ['PC·SP', '특수 레지스터', 'SPECIAL', '다음 명령어 주소(PC), 스택 꼭대기(SP)처럼 정해진 역할이 있습니다.'],
      ['SIMD', '벡터 레지스터', 'VECTOR', '값 여러 개를 한 번에 담아 한 명령으로 동시에 계산합니다.', { shape: 'layers' }]
    ] },
    cache: { spots: [
      ['LINE', '캐시 라인', 'CACHE LINE', '메모리를 64바이트씩 묶어서 한꺼번에 가져옵니다. 옆 데이터도 곧 쓸 테니까요.', { shape: 'layers', hi: true }],
      ['TAG', '태그', 'TAG', '이 칸에 든 데이터가 원래 어느 메모리 주소의 것인지 표시합니다.'],
      ['SET', '세트 연관', 'SET ASSOCIATIVE', '주소마다 들어갈 수 있는 자리를 몇 군데로 정해 빨리 찾습니다.', { shape: 'cells' }],
      ['LRU', '교체 정책', 'REPLACEMENT', '꽉 차면 가장 오래 안 쓴 것부터 내보냅니다.']
    ] },
    ram: { spots: [
      ['ADDR', '주소', 'ADDRESS', '바이트마다 붙은 번호. CPU는 이 번호로 원하는 칸을 찾아 읽고 씁니다.', { shape: 'cells', hi: true }],
      ['DIMM', '메모리 모듈', 'MODULE', 'DRAM 칩 여러 개를 기판에 붙인 막대. 메인보드 슬롯에 꽂습니다.', { shape: 'board' }],
      ['CHIP', 'DRAM 칩', 'DRAM CHIP', '실제로 데이터를 담는 칩. 모듈 하나에 8~16개가 붙어 있습니다.', { shape: 'chip' }],
      ['BANK', '뱅크', 'BANK', '칩 안을 여러 구역으로 나눠, 동시에 여러 곳을 준비할 수 있게 합니다.', { shape: 'cells' }],
      ['CELL', '메모리 셀', 'CELL', '트랜지스터 1개와 축전기 1개가 1비트를 담습니다.']
    ] },
    disk: { spots: [
      ['SSD', 'SSD', 'FLASH', '플래시 메모리에 저장. 움직이는 부품이 없어 빠릅니다.', { shape: 'chip' }],
      ['HDD', 'HDD', 'MAGNETIC', '돌아가는 자기 원판에 저장. 느리지만 싸고 큽니다.', { shape: 'disk' }],
      ['SWAP', '스왑 공간', 'SWAP', 'RAM이 모자라면 디스크 일부를 메모리처럼 빌려 씁니다. 대신 아주 느려요.', { shape: 'layers', hi: true, action: { label: 'RAM으로 불러오기', route: 'storage-memory' } }]
    ] },
    dram: { spots: [
      ['DRAM', 'DRAM 셀', '1T · 1C', '축전기에 전하를 담습니다. 작고 싸지만 전하가 새서 계속 다시 채워야 해요.', { hi: true }],
      ['SRAM', 'SRAM 셀', '6T', '트랜지스터 6개로 만든 래치. 빠르고 리프레시가 필요 없지만 크고 비쌉니다.', { shape: 'chip' }],
      ['REF', '리프레시', 'REFRESH', '전하가 사라지기 전에 수십 ms마다 읽었다가 다시 써 줍니다.', { shape: 'cells' }],
      ['DDR', 'DDR 전송', 'DOUBLE DATA RATE', '클럭이 올라갈 때와 내려갈 때 두 번 데이터를 보냅니다.', { shape: 'wire' }]
    ] },
    vm: { spots: [
      ['VA', '가상 주소 공간', 'VIRTUAL', '프로그램마다 0번지부터 시작하는 자기만의 넓은 주소 공간입니다.', { shape: 'layers' }],
      ['MMU', '주소 변환 장치', 'MMU', '가상 주소를 실제 물리 주소로 바꿉니다. CPU 안에 있어요.', { shape: 'chip', hi: true }],
      ['PA', '물리 메모리', 'PHYSICAL', '실제 RAM. 페이지와 같은 크기의 프레임으로 나뉘어 있습니다.', { shape: 'cells' }],
      ['SWAP', '스왑', 'PAGE OUT', '잘 안 쓰는 페이지는 디스크로 내보내고, 필요하면 다시 가져옵니다(페이지 폴트).', { shape: 'disk', action: { label: '페이지 가져오기', route: 'storage-memory' } }]
    ] },
    paging: { spots: [
      ['VPN', '가상 페이지 번호', 'PAGE NUMBER', '가상 주소의 앞부분. 몇 번째 페이지인지 나타냅니다.'],
      ['TLB', '변환 캐시', 'TLB', '최근에 쓴 변환 결과를 담은 작은 캐시. 여기 있으면 표를 안 봐도 됩니다.', { shape: 'chip', hi: true }],
      ['TABLE', '페이지 테이블', 'PAGE TABLE', '페이지 번호 → 프레임 번호를 적어 둔 표. 메모리 안에 있습니다.', { shape: 'cells' }],
      ['PFN', '프레임 번호', 'FRAME + OFFSET', '찾은 프레임 번호에 원래 주소의 뒷부분(오프셋)을 붙이면 물리 주소가 됩니다.']
    ] },
    layout: { layout: 'stack', label: '영역 · 높은 주소부터', spots: [
      ['STACK', '스택', 'STACK', '함수를 부를 때마다 지역 변수와 돌아갈 주소가 쌓입니다. 아래로 자랍니다.', { hi: true }],
      ['HEAP', '힙', 'HEAP', 'malloc·new로 필요할 때 빌려 쓰는 공간. 위로 자랍니다.'],
      ['DATA', '데이터', 'DATA · BSS', '전역 변수와 static 변수가 사는 곳입니다.'],
      ['CODE', '코드', 'TEXT', '실행할 기계어 명령어. 데이터와 같은 메모리에 있어서(폰 노이만 구조) 프로그램을 바꿔 끼우기만 하면 다른 일을 합니다.']
    ] }
  });

  // 장치가 아니라 구조를 보여 주는 개념 항목 (설명창에 '개념 · 구조' 표시)
  ['hierarchy', 'vm', 'paging', 'layout'].forEach(k => { T[k].kind = 'concept'; });

  const S = Scene.create({ T, cx: 440, cy: 300 });
  const { P, f, top, box, onFaceA, part } = S;

  /* ---------- 계층 피라미드 ---------- */
  const NAMES = { disk: 'DISK', ram: 'RAM', cache: 'CACHE', reg: 'REG' };
  const pyramid = S.stack({ ids: LEVELS, x: -250, y: -190, w: 200, h: 14, gap: 30, shrink: 44, i0: 0, label: id => NAMES[id] });
  const levelTags = S.sideTags([...LEVELS].reverse().map(id => ({ id, a: pyramid.leftAnchors[id], lx: 150, n: T[id].short })), 'left');
  // 속도/용량 화살표
  const scale = (() => {
    const [x1, y1] = P(-30, -200, 110), [x2, y2] = P(-30, -200, 0);
    return `<g class="deco"><path class="stroke-dim" d="M${f(x1)},${f(y1)} V${f(y2)}" marker-end=""/>` +
      `<path class="stroke-lav" d="M${f(x1 - 5)},${f(y1 + 8)} L${f(x1)},${f(y1)} L${f(x1 + 5)},${f(y1 + 8)}"/>` +
      `<text class="lbl" x="${f(x1 + 10)}" y="${f(y1 + 10)}">빠름 · 비쌈</text><text class="lbl lbl--dim" x="${f(x2 + 10)}" y="${f(y2)}">느림 · 큼</text></g>`;
  })();

  /* ---------- DRAM 모듈 ---------- */
  const dram = part('dram', 4,
    box(30, -205, 190, 36, 0, 4, 'dev-top') +
    Array.from({ length: 8 }, (_, k) => box(38 + k * 22, -200, 17, 22, 4, 3, 'core-block')).join('') +
    onFaceA(-169, 34, 216, 0.4, 3.4, 'gold') +
    top(7, `<text class="lbl" x="40" y="-174">DDR5 · 16GB</text>`));

  /* ---------- 가상 메모리 (가상 페이지 → 물리 프레임) ---------- */
  const PERM = [3, 0, 5, 1, 4, 2];
  const vm = (() => {
    let s = '';
    for (let k = 0; k < 6; k++) s += box(20, 40, 40, 40, k * 14, 6, 'cache-top') + top(k * 14 + 6, `<text class="lbl" x="26" y="58">P${k}</text>`);
    s += PERM.map((p, k) => {
      const [x1, y1] = P(60, 60, k * 14 + 3), [x2, y2] = P(160, 60, p * 14 + 3);
      return `<path class="wire" d="M${f(x1)},${f(y1)} L${f(x2)},${f(y2)}"/><path class="packet" d="M${f(x1)},${f(y1)} L${f(x2)},${f(y2)}" pathLength="100" style="animation-delay:${-k * 0.5}s"/>`;
    }).join('');
    for (let k = 0; k < 6; k++) s += box(160, 40, 40, 40, k * 14, 6, 'core-block') + top(k * 14 + 6, `<text class="lbl" x="166" y="58">F${k}</text>`);
    s += `<text class="lbl lbl--dim" x="${f(P(20, 80, 0)[0] - 4)}" y="${f(P(20, 80, 0)[1] + 16)}">가상 주소</text>`;
    s += `<text class="lbl lbl--dim" x="${f(P(160, 80, 0)[0] - 4)}" y="${f(P(160, 80, 0)[1] + 16)}">물리 메모리</text>`;
    return part('vm', 5, s);
  })();
  const paging = part('paging', 6, box(96, 46, 30, 28, 0, 30, 'dev-top') +
    top(30, `<path class="stroke-dim" d="M100 55 H122 M100 62 H122 M100 69 H122 M110 50 V72"/>`));

  /* ---------- 프로세스 메모리 구조 ---------- */
  const layout = (() => {
    const segs = [['CODE', 0, 20], ['DATA', 22, 12], ['HEAP', 36, 20], ['STACK', 84, 20]];
    let s = '';
    segs.forEach(([name, z, h]) => {
      s += box(-150, 165, 50, 50, z, h, name === 'STACK' || name === 'HEAP' ? 'cache-top' : 'core-block');
      const [lx, ly] = P(-100, 190, z + h / 2);
      s += `<text class="lbl" x="${f(lx + 10)}" y="${f(ly + 3)}">${name}</text>`;
    });
    const [ax, ay] = P(-125, 215, 66);
    s += `<path class="stroke-lav" d="M${f(ax - 6)},${f(ay + 6)} v-10 m-4 4 l4 -4 l4 4 M${f(ax + 6)},${f(ay - 14)} v10 m-4 -4 l4 4 l4 -4"/>`;
    return part('layout', 7, s);
  })();

  const tags = S.tags([
    { id: 'hierarchy', a: P(-150, -90, 3 * 30 + 14), l: [500, 40] },
    { id: 'dram', a: P(125, -187, 7), l: [800, 170] },
    { id: 'vm', a: P(40, 60, 6 * 14), l: [330, 470], below: true, end: [330, 430] },
    { id: 'paging', a: P(111, 60, 30), l: [600, 300] },
    { id: 'layout', a: P(-125, 190, 104), l: [120, 500], below: true, end: [120, 460] }
  ]);

  // CPU의 MEM 단계에서 온 요청: 캐시를 먼저 확인하고, 없으면 RAM으로 내려감
  const linePath = a => 'M' + a.map(p => p.map(n => n.toFixed(1)).join(',')).join(' L');
  const arrivePath = 'M' + [P(-150, -90, 230), P(-150, -90, 2 * 30 + 14), pyramid.anchors.cache, pyramid.anchors.ram]
    .map(p => p.map(n => n.toFixed(1)).join(',')).join(' L');

  S.mount(S.floor(300) + pyramid.svg + scale + dram + vm + paging + layout + tags + levelTags, {
    viewBox: '20 0 900 520',
    routes: {
      plane: 0,
      // 피라미드 층의 가운데 (아래층 → 위층)
      anchors: { disk: [-150, -90, 7], ram: [-150, -90, 37], cache: [-150, -90, 67], reg: [-150, -90, 97], vm: [40, 60, 84], paging: [111, 60, 30], layout: [-125, 190, 104], dram: [125, -187, 7] },
      paths: { 'vm-paging': [[40, 60, 84], [60, 60, 40], [96, 60, 30], [111, 60, 30]] }
    },
    arrivals: {
      'cpu-memory': { ids: ['cache', 'ram'], path: arrivePath, text: 'CPU에서 온 요청이 도착했어요. 먼저 캐시를 확인하고, 없으면(캐시 미스) 메인 메모리(RAM)에서 가져옵니다.' },
      'storage-memory': { ids: ['disk', 'ram'], path: linePath([pyramid.anchors.disk, pyramid.anchors.ram]), text: '보조기억장치의 데이터가 메인 메모리로 올라왔어요. 프로그램은 메모리에 올라와야 CPU가 실행할 수 있습니다.' },
      'network-memory': {
        ids: ['ram'], path: linePath([P(60, -120, 230), pyramid.anchors.ram]),
        text: 'NIC가 DMA로 패킷을 메인 메모리에 직접 썼어요. 이 다음 과정은 하드웨어 보드의 "웹 페이지가 화면에 뜨기까지" 흐름에서 이어 볼 수 있어요.'
      }
    }
  });
})();
