/* =========================================================
   Hardware / GPU — 병렬 코어, VRAM, 렌더링 전용 장치, 텐서 코어
   ========================================================= */
(() => {
  const T = {
    cores: { ko: '병렬 코어', en: 'PARALLEL CORES', desc: '단순한 코어 수천 개가 같은 연산을 동시에 처리합니다. 복잡한 일 하나보다 쉬운 일 수천 개에 강합니다.', chips: ['SM', 'SIMT', 'Warp'], topics: ['CPU와 GPU의 구조 차이', 'SM과 워프(Warp)', 'SIMD와 SIMT'], links: ['vram'] },
    vram: { ko: 'VRAM', en: 'VIDEO MEMORY', desc: 'GPU 전용 고속 메모리. 텍스처, 모델, 연산 데이터를 담고 코어에 빠르게 공급합니다.', chips: ['GDDR6', 'HBM', '대역폭'], topics: ['GDDR과 HBM', '메모리 대역폭', 'VRAM 용량과 성능'], links: ['cores'] },
    geometry: { ko: '지오메트리 엔진', en: 'GEOMETRY ENGINE', desc: '3D 모델의 꼭짓점을 읽어 와 잘게 나누고(테셀레이션), 화면 좌표로 옮기는 준비를 하는 전용 회로.', chips: ['정점', '테셀레이션'], topics: ['정점 셰이더', '테셀레이션', '좌표 변환과 원근'], links: ['raster', 'cores'] },
    raster: { ko: '래스터 엔진', en: 'RASTER ENGINE', desc: '삼각형이 화면의 어느 픽셀을 덮는지 계산해 픽셀 조각으로 바꾸는 전용 회로.', chips: ['래스터화', 'Z-Cull'], topics: ['래스터화', '가려진 면 제거', '레이 트레이싱과의 차이'], links: ['geometry', 'cores'] },
    rop: { ko: 'ROP', en: 'RENDER OUTPUT UNIT', desc: '겹친 픽셀의 앞뒤를 비교하고 색을 섞어, 완성된 픽셀을 프레임 버퍼에 쓰는 회로.', chips: ['깊이', '블렌딩', 'AA'], topics: ['깊이 버퍼', '알파 블렌딩', '안티에일리어싱'], links: ['cores', 'vram'] },
    display: { ko: '디스플레이 엔진', en: 'DISPLAY ENGINE', desc: '완성된 프레임을 모니터의 주사율에 맞춰 HDMI·DisplayPort로 내보내는 회로.', chips: ['HDMI', 'DP', 'Hz'], topics: ['프레임 버퍼와 더블 버퍼링', '주사율과 V-Sync', 'HDMI와 DisplayPort'], links: ['vram'] },
    tensor: { ko: '텐서 코어', en: 'TENSOR CORE', desc: 'AI 계산의 대부분인 행렬 곱셈을 한 번에 처리하는 전용 연산기. SM마다 몇 개씩 들어 있습니다.', chips: ['행렬 곱', 'FP16', 'INT8'], topics: ['행렬 곱과 딥러닝', '정밀도 (FP32 · FP16 · INT8)', 'GPGPU와 CUDA'], links: ['cores'] }
  };

  T.vram.flows = [{ route: 'memory-gpu', label: '메모리에서 데이터 받아오기', desc: 'RAM → PCIe 레인 → VRAM (DMA)' }];

  /* ---------- 설명창 분해 그림: 구성 요소 ---------- */
  Scene.spots(T, {
    cores: { spots: [
      ['SM', '스트리밍 멀티프로세서', 'SM', '코어 수십~수백 개와 스케줄러, 공유 메모리를 묶은 단위입니다.', { shape: 'cells', hi: true }],
      ['WARP', '워프 스케줄러', 'WARP', '스레드 32개를 한 묶음으로 같은 명령을 동시에 실행시킵니다(SIMT).', { shape: 'chip' }],
      ['CORE', '연산 코어', 'CUDA CORE', '덧셈·곱셈만 하는 단순한 연산기. 대신 수천 개가 있습니다.'],
      ['SHARED', '공유 메모리', 'SHARED MEMORY', '같은 SM의 코어들이 함께 쓰는 아주 빠른 메모리입니다.', { shape: 'layers' }],
      ['TMU', '텍스처 유닛', 'TEXTURE UNIT', '텍스처 이미지에서 색을 꺼내 픽셀에 입힙니다.', { shape: 'chip' }]
    ] },
    vram: { spots: [
      ['GDDR', 'GDDR 칩', 'GDDR6', '그래픽용 고속 DRAM. GPU 칩 둘레에 여러 개가 붙어 있습니다.', { shape: 'chip', hi: true, action: { label: '메모리에서 받아오기', route: 'memory-gpu' } }],
      ['BUS', '메모리 버스', 'WIDE BUS', '256·384비트처럼 아주 넓은 길로 대역폭을 크게 냅니다.', { shape: 'wire' }],
      ['HBM', '적층 메모리', 'HBM', 'DRAM을 층층이 쌓아 GPU 바로 옆에 붙인 메모리. AI 가속기에 많이 씁니다.', { shape: 'layers' }],
      ['L2', 'GPU 캐시', 'L2 CACHE', '모든 SM이 함께 쓰는 캐시. VRAM까지 가는 횟수를 줄입니다.', { shape: 'cells' }]
    ] },
    geometry: { spots: [
      ['FETCH', '정점 가져오기', 'VERTEX FETCH', 'VRAM에서 꼭짓점 좌표와 속성을 읽어 옵니다.', { shape: 'layers' }],
      ['TESS', '테셀레이션', 'TESSELLATION', '삼각형을 잘게 쪼개 표면을 더 매끄럽게 만듭니다.', { shape: 'cells', hi: true }],
      ['VIEW', '화면 좌표 변환', 'VIEWPORT', '3D 좌표를 화면의 2D 좌표로 바꿉니다(원근 적용).', { shape: 'chip' }]
    ] },
    raster: { spots: [
      ['SETUP', '삼각형 준비', 'TRIANGLE SETUP', '세 꼭짓점으로 삼각형의 가장자리를 계산합니다.', { shape: 'chip' }],
      ['SCAN', '픽셀 덮기', 'SCAN CONVERSION', '삼각형이 덮는 픽셀(프래그먼트)을 찾아냅니다.', { shape: 'cells', hi: true }],
      ['Z-CULL', '가려진 것 버리기', 'Z-CULL', '다른 물체에 가려 안 보일 픽셀은 미리 버려 일을 줄입니다.', { shape: 'layers' }]
    ] },
    rop: { spots: [
      ['DEPTH', '깊이 비교', 'DEPTH TEST', '같은 자리에 겹친 픽셀 중 더 앞에 있는 것만 남깁니다.', { shape: 'layers' }],
      ['BLEND', '색 섞기', 'BLENDING', '반투명한 색을 뒤에 있는 색과 섞습니다.', { hi: true }],
      ['AA', '계단 현상 줄이기', 'ANTI-ALIASING', '가장자리의 계단 모양을 부드럽게 다듬습니다.', { shape: 'cells' }],
      ['WRITE', '프레임 버퍼 쓰기', 'FRAMEBUFFER', '완성된 픽셀을 VRAM의 프레임 버퍼에 씁니다.', { shape: 'chip' }]
    ] },
    display: { spots: [
      ['SCAN', '프레임 읽기', 'SCANOUT', '프레임 버퍼를 한 줄씩 읽어 냅니다.', { shape: 'layers' }],
      ['SYNC', '주사율 맞추기', 'REFRESH · VRR', '모니터의 주사율(60·144Hz)에 맞춰 내보내 화면 찢어짐을 막습니다.', { shape: 'chip' }],
      ['PORT', '출력 포트', 'HDMI · DP', '케이블을 통해 모니터로 신호를 보냅니다.', { shape: 'screen', hi: true }]
    ] },
    tensor: { spots: [
      ['A×B', '행렬 곱', 'MATRIX MULTIPLY', '작은 행렬끼리의 곱을 한 번에 계산합니다. 일반 코어라면 수십 번 할 일을 한 번에요.', { shape: 'cells', hi: true }],
      ['FMA', '곱하고 더하기', 'FUSED MULTIPLY-ADD', '곱한 결과를 바로 더해 누적합니다 (D = A × B + C).', { shape: 'chip' }],
      ['FP16', '낮은 정밀도', 'PRECISION', '숫자를 적은 비트로 표현해 더 많이, 더 빨리 계산합니다.', { shape: 'layers' }],
      ['AI', 'AI 학습 · 추론', 'DEEP LEARNING', '신경망 계산의 대부분이 행렬 곱이라 텐서 코어가 AI를 크게 빠르게 만듭니다.'] ] }
  });

  const S = Scene.create({ T, cx: 440, cy: 300 });
  const { P, f, top, box, part } = S;

  /* ---------- 그래픽카드 기판 + 다이 ---------- */
  const board = `<g class="deco">${box(-268, -210, 410, 340, -16, 10)}${box(-205, -150, 268, 222, -6, 6, 'die')}` +
    top(0, `<text class="lbl lbl--dim" x="-198" y="66">KB · GPU G1</text>`) + `</g>`;

  /* ---------- 병렬 코어 (격자) ---------- */
  const cores = (() => {
    let s = '';
    for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
      const x = -196 + c * 36, y = -144 + r * 35;
      const delay = ((r * 7 + c) * 0.37) % 2.4;
      s += box(x, y, 28, 27, 0, 8, 'core-block blink').replace('blink"', `blink" style="animation-delay:${f(delay)}s"`);
    }
    return part('cores', 0, s);
  })();

  /* ---------- VRAM ---------- */
  const vram = part('vram', 1,
    [-150, -95, -40, 15].map(y => box(-256, y, 32, 40, 0, 5, 'cache-top') + top(5, `<text class="lbl" x="-252" y="${y + 22}">GDDR</text>`)).join('') +
    [-172, -112, -52, 8].map(x => box(x, -202, 44, 30, 0, 5, 'cache-top') + top(5, `<text class="lbl" x="${x + 6}" y="-184">GDDR</text>`)).join(''));

  /* ---------- 렌더링 전용 장치 (다이 오른쪽 열) ---------- */
  const geometry = part('geometry', 2,
    box(78, -150, 58, 46, 0, 14, 'core-block') +
    top(14, `<path class="stroke-lav" d="M88 -140 L118 -130 L96 -114 Z"/><circle class="fill-lav" cx="88" cy="-140" r="2.5"/><circle class="fill-lav" cx="118" cy="-130" r="2.5"/><circle class="fill-lav" cx="96" cy="-114" r="2.5"/><text class="lbl" x="84" y="-108">GEOMETRY</text>`));
  const raster = part('raster', 4,
    box(78, -92, 58, 46, 0, 14, 'core-block') +
    top(14, [0, 1, 2, 3].map(i => [0, 1].map(j => `<rect class="cell${(i + j) % 2 ? ' cell--hi' : ''}" x="${86 + i * 10}" y="${-84 + j * 10}" width="9" height="9"/>`).join('')).join('') + `<text class="lbl" x="84" y="-50">RASTER</text>`));
  const rop = part('rop', 5,
    box(78, -34, 58, 46, 0, 14, 'cache-top') +
    top(14, `<rect class="cell" x="86" y="-26" width="18" height="14"/><rect class="cell cell--hi" x="94" y="-20" width="18" height="14"/><text class="lbl lbl--lg" x="84" y="8">ROP</text>`));
  const display = part('display', 6,
    box(78, 24, 58, 40, 0, 10, 'core-block') +
    top(10, `<rect class="cell cell--hi" x="86" y="30" width="28" height="18" rx="2"/><path class="stroke-lav" d="M90 44 l6 -6 l4 4 l8 -8"/><text class="lbl" x="84" y="60">DISPLAY</text>`) +
    box(96, 74, 34, 12, 0, 10, 'dev-top') + box(96, 90, 34, 12, 0, 10, 'dev-top') +
    top(10, `<text class="lbl" x="99" y="83">HDMI</text><text class="lbl" x="102" y="99">DP</text>`));

  /* ---------- 텐서 코어 (행렬 곱 큐브) ---------- */
  const tensor = (() => {
    let s = '';
    const order = [];
    for (let z = 0; z < 3; z++) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) order.push([z, i, j]);
    order.sort((a, b) => a[0] - b[0] || (a[1] + a[2]) - (b[1] + b[2]));
    order.forEach(([z, i, j]) => {
      s += box(-200 + i * 18, 110 + j * 18, 14, 14, z * 18, 14, z === 2 && (i + j) % 2 === 0 ? 'cache-top blink' : 'core-block');
    });
    s += top(0, `<text class="lbl lbl--dim" x="-204" y="176">D = A×B + C</text>`);
    return part('tensor', 3, s);
  })();

  const tags = S.tags([
    { id: 'cores', a: P(-70, -40, 8), l: [470, 80] },
    { id: 'vram', a: P(-240, -75, 5), l: [220, 70] },
    { id: 'geometry', a: P(107, -127, 14), l: [690, 120] },
    { id: 'raster', a: P(107, -69, 14), l: [800, 230] },
    { id: 'rop', a: P(107, -11, 14), l: [810, 340] },
    { id: 'display', a: P(113, 88, 10), l: [700, 480], below: true, end: [700, 440] },
    { id: 'tensor', a: P(-173, 137, 54), l: [110, 140] }
  ]);

  const linePath = a => 'M' + a.map(p => p.map(n => n.toFixed(1)).join(',')).join(' L');
  S.mount(S.floor(300) + board + vram + cores + geometry + raster + rop + display + tensor + tags, {
    viewBox: '20 20 880 500',
    routes: {
      plane: 0,
      anchors: { vram: [-240, -75, 5], cores: [-70, -40, 8], geometry: [107, -127, 14], raster: [107, -69, 14], rop: [107, -11, 14], display: [107, 44, 10], tensor: [-173, 137, 54] },
      paths: {
        // VRAM은 다이 가장자리를 돌아 오른쪽 렌더링 장치 열로
        'vram-geometry': [[-240, -75, 5], [-240, -75, 0], [-240, -160, 0], [107, -160, 0], [107, -127, 14]],
        'rop-display': [[107, -11, 14], [107, 44, 10]],
        // 코어 격자 → 아래쪽 텐서 코어 큐브
        'cores-tensor': [[-70, -40, 8], [-70, -40, 0], [-70, 128, 0], [-160, 128, 0], [-173, 137, 54]],
        'tensor-vram': [[-173, 137, 54], [-173, 137, 0], [-240, 137, 0], [-240, -75, 5]]
      }
    },
    arrivals: {
      'memory-gpu': {
        ids: ['vram', 'cores'], path: linePath([P(-240, -75, 150), P(-240, -75, 5), P(-180, -60, 8), P(-70, -40, 8)]),
        text: 'VRAM에 데이터가 도착했어요. 이제 수천 개의 코어가 이 데이터를 나눠 동시에 처리합니다.'
      }
    }
  });
})();
