/* =========================================================
   Hardware / Chipset · I/O — 칩셋(PCH), 버스, PCIe, 입출력 장치, DMA, 인터럽트
   ========================================================= */
(() => {
  const T = {
    pch: { ko: '칩셋', en: 'CHIPSET · PCH', desc: 'CPU 혼자 다 연결할 수 없는 USB, SATA, 오디오, 추가 PCIe 장치들을 모아 CPU에 이어 주는 메인보드의 교차로.', chips: ['PCH', 'DMI', 'USB · SATA'], topics: ['칩셋(PCH)의 역할', '노스브리지와 사우스브리지', 'CPU 직결 레인과 칩셋 레인'], links: ['bus', 'pcie', 'io'] },
    bus: { ko: '시스템 버스', en: 'SYSTEM BUS', desc: '장치들이 데이터를 주고받는 통로. 전통적으로 주소 버스, 데이터 버스, 제어 버스로 나눠 설명합니다.', chips: ['ADDRESS', 'DATA', 'CONTROL'], topics: ['주소·데이터·제어 버스', '버스 폭과 대역폭', '공유 버스에서 점대점 연결로'], links: ['pch'] },
    pcie: { ko: 'PCIe', en: 'PCI EXPRESS', desc: '그래픽카드, NVMe SSD, 랜카드 같은 고속 장치를 잇는 점대점 연결. 레인 수(x1, x4, x16)만큼 빨라집니다.', chips: ['x1', 'x4', 'x16'], topics: ['레인과 링크', 'PCIe 세대별 속도', '슬롯과 장치'], links: ['pch'] },
    io: { ko: '입출력 장치', en: 'I/O DEVICES', desc: '키보드, 마우스, 모니터처럼 컴퓨터가 바깥 세상과 데이터를 주고받는 장치. 장치 컨트롤러가 버스와 장치 사이를 통역합니다.', topics: ['입출력 방식 (폴링·인터럽트·DMA)', '장치 컨트롤러와 드라이버', '메모리 맵 입출력'], links: ['interrupt', 'pch'] },
    dma: { ko: 'DMA', en: 'DIRECT MEMORY ACCESS', desc: 'CPU를 거치지 않고 장치가 메모리와 직접 데이터를 주고받는 방식. CPU는 시작과 끝만 챙깁니다.', topics: ['DMA 전송 과정', '버스 마스터링', 'DMA와 캐시 일관성'], links: ['io', 'interrupt'] },
    interrupt: { ko: '인터럽트', en: 'INTERRUPT', desc: '장치가 CPU에게 "지금 처리해 줘"라고 신호를 보내, 하던 일을 잠시 멈추고 먼저 처리하게 하는 방식.', topics: ['하드웨어·소프트웨어 인터럽트', '인터럽트 처리 과정', '인터럽트 벡터'], links: ['io', 'dma'] }
  };

  const IRQ = { route: 'chipset-cpu', label: 'CPU에 인터럽트 전달하기', desc: '칩셋 → CPU, 하던 일을 잠시 멈추고 먼저 처리' };
  T.interrupt.flows = [IRQ]; T.io.flows = [IRQ]; T.dma.flows = [IRQ]; T.pch.flows = [IRQ];

  /* ---------- 설명창 분해 그림: 구성 요소 ---------- */
  const IRQX = { label: 'CPU에 전달하기', route: 'chipset-cpu' };
  Scene.spots(T, {
    pch: { spots: [
      ['DMI', 'CPU 연결', 'DMI LINK', 'CPU와 칩셋을 잇는 전용 고속 통로입니다.', { shape: 'wire' }],
      ['USB', 'USB 컨트롤러', 'USB', '키보드, 마우스, 저장장치처럼 USB 장치를 관리합니다.', { shape: 'chip' }],
      ['SATA', 'SATA 컨트롤러', 'SATA', 'HDD와 2.5인치 SSD를 연결합니다.', { shape: 'chip' }],
      ['PCIe', '추가 PCIe 레인', 'PCIe SWITCH', 'CPU에 바로 붙지 않는 랜카드, 추가 SSD 같은 장치에 레인을 나눠 줍니다.', { shape: 'cells', hi: true }]
    ] },
    bus: { layout: 'stack', label: '세 갈래 버스', w: 220, d: 90, spots: [
      ['ADDRESS', '주소 버스', 'ADDRESS BUS', '어느 칸을 읽고 쓸지 주소를 보냅니다. CPU → 메모리 한 방향.'],
      ['DATA', '데이터 버스', 'DATA BUS', '실제 값이 오가는 길. 양방향입니다.', { hi: true }],
      ['CONTROL', '제어 버스', 'CONTROL BUS', '읽기인지 쓰기인지, 인터럽트인지 같은 신호를 보냅니다.']
    ] },
    pcie: { spots: [
      ['LANE', '레인', 'LANE', '보내는 선 한 쌍과 받는 선 한 쌍. 레인을 여러 개 묶을수록 빨라집니다.', { shape: 'wire', hi: true }],
      ['x16', '그래픽카드 슬롯', 'x16 SLOT', '레인 16개짜리 가장 긴 슬롯. 보통 GPU를 꽂습니다.', { shape: 'board' }],
      ['x4', 'NVMe · M.2', 'x4', 'NVMe SSD는 레인 4개로 수 GB/s를 냅니다.', { shape: 'chip' }],
      ['GEN', '세대', 'GEN 3 → 5', '세대가 하나 오를 때마다 레인당 속도가 약 두 배가 됩니다.', { shape: 'layers' }]
    ] },
    io: { spots: [
      ['INPUT', '입력 장치', 'INPUT', '키보드, 마우스, 센서처럼 바깥에서 데이터를 받아들입니다.'],
      ['CTRL', '장치 컨트롤러', 'CONTROLLER', '장치와 버스 사이의 통역사. 장치마다 따로 있습니다.', { shape: 'chip', hi: true, action: IRQX }],
      ['DRIVER', '드라이버', 'DRIVER', '운영체제가 컨트롤러를 다루는 방법을 담은 프로그램입니다.', { shape: 'layers' }],
      ['OUTPUT', '출력 장치', 'OUTPUT', '모니터, 스피커처럼 결과를 바깥으로 내보냅니다.', { shape: 'screen' }]
    ] },
    dma: { label: 'DMA 전송 순서', spots: [
      ['SETUP', '전송 준비', 'SETUP', 'CPU가 "어디서, 어디로, 얼마나" 옮길지 DMA 컨트롤러에 알려 줍니다.', { shape: 'chip' }],
      ['COPY', '직접 전송', 'TRANSFER', '장치와 메모리가 CPU 없이 데이터를 주고받습니다. 그동안 CPU는 다른 일을 합니다.', { shape: 'wire', hi: true }],
      ['DONE', '완료 알림', 'INTERRUPT', '다 옮기면 인터럽트로 CPU에 끝났다고 알립니다.', { action: IRQX }]
    ] },
    interrupt: { label: '인터럽트 처리 순서', spots: [
      ['IRQ', '인터럽트 요청', 'IRQ', '장치가 "지금 처리해 줘" 하고 신호를 보냅니다.', { shape: 'wire', action: IRQX }],
      ['APIC', '인터럽트 컨트롤러', 'APIC', '여러 요청을 받아 우선순위를 정해 CPU에 전달합니다.', { shape: 'chip' }],
      ['IVT', '벡터 테이블', 'VECTOR TABLE', '인터럽트 번호마다 처리할 코드의 주소를 적어 둔 표입니다.', { shape: 'cells' }],
      ['ISR', '처리 루틴', 'HANDLER', '실제로 처리하는 코드. 끝나면 저장해 둔 상태로 돌아가 하던 일을 이어 합니다.', { hi: true }]
    ] }
  });

  // 장치가 아니라 구조를 보여 주는 개념 항목 (설명창에 '개념 · 구조' 표시)
  ['bus'].forEach(k => { T[k].kind = 'concept'; });

  const S = Scene.create({ T, cx: 440, cy: 300 });
  const { P, f, top, box, onFaceA, onFaceB, flatPath, part, linked } = S;
  const wire = (pts, z = 0, i = 0, cls = '') => {
    const d = flatPath(pts, z);
    return `<path class="wire ${cls}" d="${d}"/><path class="packet" d="${d}" pathLength="100" style="animation-delay:${-i * 0.5}s"/>`;
  };

  /* ---------- CPU (이 화면에선 연결 대상으로만, 흐릿하게) ---------- */
  const cpuStub = `<g class="deco">${box(-260, -200, 110, 110, 0, 26, 'dev-top')}` +
    top(26, `<rect class="cell" x="-246" y="-186" width="82" height="82" rx="3"/><text class="lbl lbl--lg" x="-232" y="-138">CPU</text>`) + `</g>`;

  /* ---------- 시스템 버스 (CPU ↔ 칩셋) ---------- */
  const LINES = [-150, -138, -126];
  const bus = part('bus', 0,
    box(-150, -160, 170, 44, 0, 3, 'core-plate') +
    top(3, LINES.map(y => `<path class="stroke-lav" d="M-145 ${y} H15"/>`).join('') +
      `<text class="lbl lbl--dim" x="-120" y="-153">ADDRESS</text><text class="lbl lbl--dim" x="-120" y="-141">DATA</text><text class="lbl lbl--dim" x="-120" y="-129">CONTROL</text>`) +
    LINES.map((y, i) => {
      const d = i === 1 ? flatPath([[15, y], [-145, y]], 3) : flatPath([[-145, y], [15, y]], 3);
      return `<path class="packet" d="${d}" pathLength="100" style="animation-duration:3s;animation-delay:${-i * 0.8}s"/>`;
    }).join(''));

  /* ---------- 칩셋 (PCH) ---------- */
  const pch = part('pch', 1,
    box(20, -190, 120, 120, 0, 8, 'dev-top') +
    box(45, -165, 70, 70, 8, 12, 'pch') +
    top(20, `<path class="fins" d="M52 -156 H108 M52 -146 H108 M52 -136 H108 M52 -126 H108 M52 -116 H108 M52 -106 H108"/>`) +
    top(8, `<text class="lbl lbl--lg" x="28" y="-76">PCH</text>`) +
    Array.from({ length: 6 }, (_, k) => onFaceA(-70, 28 + k * 18, 36 + k * 18, 1, 6, 'gold')).join(''));

  /* ---------- PCIe 슬롯 ---------- */
  const pcie = part('pcie', 2,
    box(190, -200, 22, 200, 0, 10, 'dev-top') + onFaceB(212, -196, -4, 2, 8, 'gold') +
    box(232, -200, 22, 90, 0, 10, 'dev-top') + onFaceB(254, -196, -114, 2, 8, 'gold') +
    top(10, `<text class="lbl" x="194" y="-160" transform="rotate(90 194 -160)">PCIe x16</text><text class="lbl" x="236" y="-170" transform="rotate(90 236 -170)">x4</text>`) +
    wire([[140, -150], [190, -150]], 0, 0) + wire([[140, -120], [165, -120], [165, -170], [232, -170]], 0, 1));

  /* ---------- 입출력 장치 (모니터, 키보드, 마우스) ---------- */
  const io = part('io', 3,
    box(-60, 70, 160, 90, 0, 5, 'core-plate') +
    box(-40, 84, 8, 50, 5, 40, 'dev-top') + onFaceB(-32, 88, 130, 10, 42, 'screen') +
    box(-46, 102, 20, 14, 5, 6) +
    box(10, 92, 50, 28, 5, 3, 'dev-top') +
    top(8, Array.from({ length: 3 }, (_, r) => Array.from({ length: 6 }, (_, c) => `<rect class="cell" x="${13 + c * 8}" y="${95 + r * 8}" width="6" height="6" rx="1"/>`).join('')).join('')) +
    box(72, 130, 12, 18, 5, 4, 'dev-top'));
  // 칩셋 → 입출력 장치 (USB)
  const usb = linked('io', wire([[90, -70], [90, 20], [30, 20], [30, 70]], 0, 0) + top(0, `<text class="lbl lbl--dim" x="96" y="0">USB</text>`));

  /* ---------- DMA 컨트롤러 ---------- */
  const dma = part('dma', 4,
    box(-160, -20, 70, 56, 0, 14, 'cache-top') +
    top(14, `<text class="lbl lbl--lg" x="-152" y="6">DMA</text><path class="stroke-dim" d="M-152 14 H-100 M-152 22 H-112"/>`) +
    wire([[-125, -20], [-125, -116]], 0, 2) + wire([[-90, 8], [20, 8], [20, -70]], 0, 3));

  /* ---------- 인터럽트 (입출력 → 칩셋 → CPU 신호) ---------- */
  const interrupt = (() => {
    const a = P(-36, 100, 46), b = P(-205, -145, 26);
    const c = [a[0] - 230, (a[1] + b[1]) / 2 + 20];
    const d = `M${f(a[0])},${f(a[1])} Q${f(c[0])},${f(c[1])} ${f(b[0])},${f(b[1])}`;
    const m = [0.25 * a[0] + 0.5 * c[0] + 0.25 * b[0], 0.25 * a[1] + 0.5 * c[1] + 0.25 * b[1]];
    return part('interrupt', 5,
      `<path class="wire wire--dash" d="${d}" style="stroke-width:2"/><path class="packet packet--fast" d="${d}" pathLength="100"/>` +
      `<circle class="globe" cx="${f(m[0])}" cy="${f(m[1])}" r="17"/>` +
      `<path class="stroke-lav" d="M${f(m[0] + 3)},${f(m[1] - 10)} l-8 11 h7 l-4 9 l10 -12 h-7 z" style="fill:var(--lav)"/>`);
  })();

  const tags = S.tags([
    { id: 'pch', a: P(80, -130, 20), l: [560, 60] },
    { id: 'bus', a: P(-40, -126, 3), l: [530, 330], below: true, end: [530, 290] },
    { id: 'pcie', a: P(222, -150, 10), l: [800, 140] },
    { id: 'io', a: P(20, 115, 8), l: [330, 500], below: true },
    { id: 'dma', a: P(-125, 8, 14), l: [130, 390], below: true, end: [130, 350] },
    { id: 'interrupt', a: [0, 0], l: [110, 200] }
  ]);

  const linePath = a => 'M' + a.map(p => p.map(n => n.toFixed(1)).join(',')).join(' L');
  S.mount(S.floor(300) + cpuStub + bus + pch + pcie + usb + io + dma + interrupt + tags, {
    viewBox: '20 0 900 540',
    routes: {
      plane: 0,
      anchors: { io: [20, 115, 8], pch: [80, -130, 20], dma: [-125, 8, 14], interrupt: [-183, 48, 30], bus: [-65, -138, 3], pcie: [222, -150, 10] },
      paths: {
        'io-pch': [[20, 115, 8], [30, 70, 0], [30, 20, 0], [90, 20, 0], [90, -70, 0], [80, -130, 20]],
        'dma-pch': [[-125, 8, 14], [-90, 8, 0], [20, 8, 0], [20, -70, 0], [80, -130, 20]]
      }
    },
    arrivals: {}
  });
  // 인터럽트 라벨 앵커는 번개 배지 위치로 보정
  const badge = document.querySelector('.part[data-part="interrupt"] circle.globe');
  const tag = document.querySelector('.tag[data-part="interrupt"]');
  if (badge && tag) {
    const x = badge.getAttribute('cx'), y = +badge.getAttribute('cy') - 17;
    tag.querySelector('.tag__line').setAttribute('d', `M${x},${y} L110,212`);
    tag.querySelectorAll('circle').forEach(c => { c.setAttribute('cx', x); c.setAttribute('cy', y); });
  }
})();
