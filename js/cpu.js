/* =========================================================
   Hardware / CPU — 칩 내부(다이) + 명령어 파이프라인
   ========================================================= */
(() => {
  const T = {
    cu: { ko: '제어 장치', en: 'CONTROL UNIT', desc: '명령어를 메모리에서 가져와(인출) 해석하고(해독) 실행시키는 일을 끝없이 반복하며, 각 장치에 신호를 보내 지휘하는 부분.', chips: ['인출', '해독', '실행'], topics: ['명령어 사이클 (인출·해독·실행)', '제어 신호', '마이크로 연산'], links: ['isa'] },
    isa: { ko: '명령어 집합', en: 'ISA', desc: 'CPU가 알아듣는 명령어들의 목록과 규칙. 소프트웨어와 하드웨어가 만나는 약속입니다.', chips: ['x86', 'ARM', 'RISC-V'], topics: ['명령어의 구조 (opcode·operand)', 'CISC와 RISC', '어셈블리어'], links: ['cu'] },
    alu: { ko: '연산 장치', en: 'ALU', desc: '덧셈, 뺄셈 같은 산술 연산과 AND, OR 같은 논리 연산을 실제로 수행하는 부분.', topics: ['산술 연산과 논리 연산', '플래그 레지스터', '부동소수점 연산(FPU)'], links: ['reg'] },
    reg: { ko: '레지스터', en: 'REGISTER', desc: 'CPU 안에 있는 가장 빠르고 가장 작은 저장 공간. 지금 처리 중인 값을 담습니다.', topics: ['범용 레지스터', 'PC와 IR', '스택 포인터'], links: ['alu', 'cache'] },
    cache: { ko: '캐시', en: 'CACHE · L1 / L2 / L3', desc: '자주 쓰는 데이터를 메모리보다 훨씬 빠르게 꺼내 쓰도록 CPU 가까이에 둔 저장소.', topics: ['캐시 계층 (L1·L2·L3)', '지역성의 원리', '캐시 히트와 미스', '캐시 일관성'], links: ['reg'] },
    multicore: { ko: '멀티코어', en: 'MULTI-CORE', desc: '하나의 칩 안에 여러 개의 코어를 두어 여러 작업을 동시에 처리하는 구조.', topics: ['코어와 스레드', '하이퍼스레딩', '병렬 처리와 동시성'] },
    clock: { ko: '클럭', en: 'CLOCK', desc: 'CPU의 모든 동작 박자를 맞추는 신호. 1초에 몇 번 뛰는지(GHz)가 속도의 기준이 됩니다.', topics: ['클럭 속도와 성능', '오버클럭', '전력과 발열'] }
  };

  T.cache.flows = [{ route: 'cpu-memory', label: '캐시 미스: 메모리에서 찾기', desc: '캐시에 없으면 메모리 버스를 타고 RAM까지' }];
  T.cu.flows = [{ route: 'cpu-memory', label: '메모리에 읽기·쓰기 요청 보내기', desc: 'CPU → 메모리 버스 → RAM' }];

  /* ---------- 설명창 분해 그림: 구성 요소 ---------- */
  Scene.spots(T, {
    isa: { spots: [
      ['OPCODE', '연산 코드', 'OPCODE', '명령어의 앞부분. 더하기, 불러오기처럼 무슨 일을 할지 정합니다.', { hi: true }],
      ['OPERAND', '피연산자', 'OPERAND', '연산에 쓸 값이나 레지스터, 메모리 주소입니다.', { shape: 'layers' }],
      ['MODE', '주소 지정 방식', 'ADDRESSING', '피연산자를 어디서 찾을지(즉시값, 레지스터, 메모리) 정하는 규칙입니다.', { shape: 'cells' }],
      ['CISC', 'CISC와 RISC', 'x86 · ARM', '복잡한 명령이 많은 x86(CISC)과, 단순한 명령을 빠르게 처리하는 ARM(RISC).', { shape: 'chip' }]
    ] },
    cu: { label: '명령어 사이클 · 인출 → 해독 → 실행', spots: [
      ['PC', '프로그램 카운터', 'PROGRAM COUNTER', '다음에 실행할 명령어의 메모리 주소를 가리킵니다. 이 주소로 메모리에서 명령어를 가져옵니다(인출).', { action: { label: '메모리에서 인출', route: 'cpu-memory' } }],
      ['IR', '명령어 레지스터', 'INSTRUCTION REG', '메모리에서 가져온 명령어를 잠시 담아 둡니다.', { shape: 'layers' }],
      ['DEC', '해독기', 'DECODER', '명령어의 비트를 보고 어떤 연산인지, 무엇을 쓸지 알아냅니다.', { shape: 'chip', hi: true }],
      ['SIG', '제어 신호', 'CONTROL SIGNALS', 'ALU, 레지스터, 메모리에 지금 무엇을 할지 신호를 보냅니다. 실행이 끝나면 다시 인출로 돌아갑니다.', { shape: 'wire' }]
    ] },
    alu: { spots: [
      ['A · B', '입력 값', 'OPERANDS', '레지스터에서 계산할 두 값을 받아옵니다.', { shape: 'layers' }],
      ['ADD', '산술 회로', 'ARITHMETIC', '덧셈, 뺄셈 같은 계산을 합니다. 곱셈과 나눗셈도 이 회로를 바탕으로 합니다.', { shape: 'chip', hi: true }],
      ['LOGIC', '논리 회로', 'LOGIC', 'AND, OR, NOT, XOR 연산과 비트를 미는 시프트 연산을 합니다.', { shape: 'chip' }],
      ['FLAG', '플래그', 'FLAGS', '결과가 0인지, 음수인지, 넘쳤는지를 표시해 다음 분기에 씁니다.', { shape: 'cells' }]
    ] },
    reg: { spots: [
      ['PC', '프로그램 카운터', 'PC', '다음 명령어의 주소. 실행할 때마다 자동으로 늘어납니다.'],
      ['IR', '명령어 레지스터', 'IR', '지금 실행 중인 명령어를 담습니다.'],
      ['R0-15', '범용 레지스터', 'GENERAL PURPOSE', '계산 중인 값을 담는 레지스터. x86의 RAX, ARM의 X0 같은 것들입니다.', { shape: 'cells', hi: true }],
      ['SP', '스택 포인터', 'STACK POINTER', '함수 호출 스택의 꼭대기 주소를 가리킵니다.'],
      ['FLAGS', '상태 레지스터', 'STATUS', 'ALU 연산 결과의 상태(0, 음수, 자리올림 등)를 담습니다.']
    ] },
    cache: { layout: 'stack', shrink: 36, w: 220, d: 150, label: '캐시 계층 · 눌러서 강조', spots: [
      ['L1', 'L1 캐시', 'L1 · ~1ns', '코어마다 하나씩, 32~64KB. 명령어용과 데이터용으로 나뉘어 있습니다.', { hi: true }],
      ['L2', 'L2 캐시', 'L2 · ~4ns', '코어마다 하나씩, 수백 KB~수 MB. L1에서 놓친 것을 찾습니다.'],
      ['L3', 'L3 캐시', 'L3 · ~10ns', '모든 코어가 함께 쓰는 수십 MB의 캐시. 여기에도 없으면 RAM으로 갑니다.', { action: { label: '캐시 미스 → 메모리', route: 'cpu-memory' } }]
    ] },
    multicore: { spots: [
      ['CORE', '코어', 'CORE', '혼자서 명령어를 가져오고 실행할 수 있는 처리 단위. 여러 개가 동시에 일합니다.', { shape: 'chip', hi: true }],
      ['SMT', '하이퍼스레딩', 'SMT', '코어 하나가 스레드 두 개를 번갈아 처리해, 쉬는 틈을 메웁니다.', { shape: 'layers' }],
      ['RING', '코어 연결망', 'INTERCONNECT', '코어와 캐시를 잇는 링·메시 모양의 내부 도로입니다.', { shape: 'wire' }],
      ['L3', '공유 캐시', 'SHARED CACHE', '모든 코어가 함께 쓰는 캐시. 코어끼리 데이터를 나누는 곳입니다.', { shape: 'cells' }]
    ] },
    clock: { spots: [
      ['XTAL', '수정 발진기', 'CRYSTAL', '수정 결정이 일정하게 떨리며 기준 박자(예: 100MHz)를 만듭니다.', { shape: 'chip' }],
      ['PLL', '배수기', 'PLL', '기준 박자를 수십 배로 곱해 GHz 단위의 클럭으로 올립니다.', { hi: true }],
      ['TREE', '클럭 분배망', 'CLOCK TREE', '칩 전체에 같은 순간 박자가 닿도록 신호를 퍼뜨립니다.', { shape: 'wire' }],
      ['DVFS', '전압·주파수 조절', 'BOOST', '일이 적으면 느리게, 많으면 빠르게(부스트) 바꿔 전력과 열을 조절합니다.', { shape: 'layers' }]
    ] }
  });

  // 장치가 아니라 구조를 보여 주는 개념 항목 (설명창에 '개념 · 구조' 표시)
  ['isa'].forEach(k => { T[k].kind = 'concept'; });

  const S = Scene.create({ T, cx: 440, cy: 300 });
  const { P, f, pts, top, box, onFaceA, onFaceB, flatPath, part } = S;

  /* ---------- 다이(칩 바탕) ---------- */
  const die = (() => {
    let pads = '';
    for (let k = 0; k < 18; k++) pads += `<rect class="cell" x="${-232 + k * 22}" y="-176" width="10" height="4"/><rect class="cell" x="${-232 + k * 22}" y="112" width="10" height="4"/>`;
    for (let k = 0; k < 13; k++) pads += `<rect class="cell" x="-238" y="${-166 + k * 22}" width="4" height="10"/><rect class="cell" x="152" y="${-166 + k * 22}" width="4" height="10"/>`;
    return `<g class="deco">${box(-245, -185, 410, 310, -20, 6)}${box(-240, -180, 400, 300, -14, 14, 'die')}` +
      top(0, pads + `<text class="lbl lbl--dim" x="-224" y="104">KB · CPU X1 · DIE</text>`) +
      // 코어 0 바탕 + 메모리 컨트롤러
      box(-232, -172, 146, 150, 0, 4, 'core-plate') + top(4, `<text class="lbl" x="-226" y="-28">CORE 0</text>`) +
      box(-232, 4, 146, 40, 0, 10, 'core-block') + top(10, `<text class="lbl lbl--dim" x="-224" y="28">MEMORY CTRL</text>`) +
      `</g>`;
  })();

  /* ---------- 클럭 신호선 (클럭과 함께 강조) ---------- */
  const CLK = [
    flatPath([[-200, 60], [-200, 50], [-60, 50], [-60, 46]]),
    flatPath([[-180, 60], [-180, 54], [130, 54], [130, -80]]),
    flatPath([[-215, 60], [-240 + 4, 60]])
  ];
  const clockLines = S.linked('clock', CLK.map(d => `<path class="wire" d="${d}"/>`).join('') +
    CLK.map((d, i) => `<path class="packet packet--fast" d="${d}" pathLength="100" style="animation-delay:${-i * 0.3}s"/>`).join(''));

  /* ---------- 코어 0 내부 ---------- */
  const cu = part('cu', 0, box(-224, -164, 60, 52, 4, 16, 'core-block') +
    top(20, `<text class="lbl lbl--lg" x="-216" y="-140">CU</text><path class="stroke-dim" d="M-216 -132 H-176 M-216 -125 H-186 M-216 -118 H-180"/>`));
  const alu = part('alu', 1, box(-156, -164, 62, 52, 4, 22, 'core-block') +
    top(26, `<text class="lbl lbl--lg" x="-148" y="-140">ALU</text><path class="stroke-lav" d="M-146 -126 h10 M-141 -131 v10 M-128 -131 l8 8 M-120 -131 l-8 8"/>`));
  const reg = part('reg', 2, [0, 1, 2, 3, 4, 5].map(k =>
    box(-224 + k * 21, -104, 15, 15, 4, 12, `core-block${k % 2 ? '' : ' blink'}`)).join('') +
    top(16, `<text class="lbl" x="-222" y="-92">R0</text>`));
  // 캐시: 코어 0의 L1, 코어별 L2, 공유 L3
  const cache = part('cache', 3,
    box(-224, -82, 130, 22, 4, 8, 'cache-top') + top(12, `<text class="lbl" x="-216" y="-67">L1  I$ · D$</text>`) +
    box(-232, -16, 146, 16, 0, 8, 'cache-top') + top(8, `<text class="lbl" x="-224" y="-5">L2</text>`) +
    [-76, 0, 76].map(x => box(x, -86, 68, 14, 0, 8, 'cache-top')).join('') +
    box(-76, -62, 220, 100, 0, 10, 'cache-top') +
    top(10, Array.from({ length: 6 }, (_, k) => `<path class="stroke-dim" d="M${-68 + k * 36} -54 V30"/>`).join('') +
      `<path class="stroke-dim" d="M-68 -12 H136"/><text class="lbl lbl--lg" x="-60" y="-24">L3 CACHE</text>`));
  const multicore = part('multicore', 4, [-76, 0, 76].map((x, k) =>
    box(x, -172, 68, 80, 0, 14, 'core-block') +
    top(14, `<text class="lbl" x="${x + 8}" y="-156">CORE ${k + 1}</text>` +
      `<rect class="cell" x="${x + 8}" y="-146" width="22" height="18"/><rect class="cell" x="${x + 36}" y="-146" width="24" height="18"/>` +
      `<rect class="cell cell--hi" x="${x + 8}" y="-122" width="52" height="10"/>`)).join(''));

  /* ---------- 클럭 발생기 ---------- */
  const clock = (() => {
    const [x, y] = P(-200, 82, 12);
    const w = 'M0,0 h10 v-14 h12 v14 h12 v-14 h12 v14 h12 v-14 h12 v14 h10';
    return part('clock', 5, box(-228, 62, 56, 38, 0, 12, 'core-block') +
      top(12, `<text class="lbl" x="-222" y="80">CLK</text><rect class="cell cell--hi" x="-222" y="86" width="40" height="8" rx="4"/>`) +
      `<g transform="translate(${f(x - 40)},${f(y - 30)})"><path class="stroke-dim" d="${w}"/><path class="clockwave" d="${w}"/></g>`);
  })();

  /* ---------- 명령어 집합 (명령어 카드 묶음) ---------- */
  const isa = part('isa', 7, ['MOV', 'ADD', 'LOAD', 'JMP'].map((op, k) =>
    box(30, 150 + k * 2, 64, 42, k * 12, 5, 'cache-top') +
    top(k * 12 + 5, `<text class="lbl lbl--lg" x="37" y="${174 + k * 2}">${op}</text><text class="lbl lbl--dim" x="37" y="${186 + k * 2}">${['1011 0001', '0000 0011', '1000 1011', '1110 1001'][k]}</text>`)).join(''));

  const linePath = a => 'M' + a.map(p => p.map(n => n.toFixed(1)).join(',')).join(' L');
  const tags = S.tags([
    { id: 'cu', a: P(-194, -138, 20), l: [300, 70] },
    { id: 'alu', a: P(-125, -138, 26), l: [470, 60] },
    { id: 'reg', a: P(-170, -96, 16), l: [190, 140] },
    { id: 'multicore', a: P(38, -132, 14), l: [690, 150] },
    { id: 'cache', a: P(40, -12, 10), l: [470, 470], below: true },
    { id: 'clock', a: P(-200, 82, 12), l: [130, 380], below: true },
    { id: 'isa', a: P(62, 173, 41), l: [200, 480], below: true, end: [200, 440] }
  ]);

  S.mount(S.floor(300) + die + clockLines + cu + alu + reg + cache + multicore + clock + isa + tags,
    {
      defaultHint: '칩 안의 구성 요소를 눌러 자세히 보기', viewBox: '50 30 790 500',
      routes: {
        plane: 4,
        anchors: { reg: [-161, -96, 16], cache: [-159, -71, 12], cu: [-194, -138, 20], alu: [-125, -138, 26], clock: [-200, 81, 12], multicore: [34, -132, 14], isa: [62, 171, 41] },
        // 클럭은 칩 위 클럭 신호선을 따라 코어로
        paths: { 'reg-clock': [[-161, -96, 16], [-161, -96, 4], [-180, -96, 4], [-180, 54, 0], [-200, 54, 0], [-200, 60, 0], [-200, 81, 12]] }
      },
      arrivals: {
        'memory-cpu': {
          ids: ['cache', 'reg'], path: linePath([P(40, -12, 160), P(40, -12, 10), P(-159, -8, 8), P(-159, -71, 12), P(-170, -96, 16)]),
          text: '메모리에서 온 데이터가 L3 → L2 → L1 캐시를 거쳐 레지스터까지 올라왔어요. 다음에 또 쓰면 캐시에서 바로 꺼냅니다(캐시 히트).'
        },
        'chipset-cpu': {
          ids: ['cu'], path: linePath([P(260, 60, 0), P(40, -12, 10), P(-194, -138, 20)]),
          text: '인터럽트 도착! CPU는 하던 명령어를 마무리하고, 현재 상태(PC·레지스터)를 저장한 뒤 인터럽트 처리 루틴을 실행하고 원래 일로 돌아갑니다.'
        }
      }
    });
})();
