/* =========================================================
   Software / 언어 · 실행 — 정면 평면
   위(번역): 소스 코드 → 컴파일러 → 기계어 · 바이트코드
   아래 큰 상자(내 앱의 메모리): 실행 엔진 · 가비지 컬렉터 · 코드 영역 / 스택 · 힙
   C · Java · Python에 따라 상자 안의 모습이 바뀜
   ========================================================= */
(() => {
  const T = {
    source: { ko: '소스 코드', en: 'SOURCE CODE', desc: '사람이 읽고 쓰는 코드. 이대로는 CPU가 실행할 수 없어서 번역이 필요해요.', chips: ['문법', '타입'], topics: ['프로그래밍 언어의 종류', '정적 타입과 동적 타입', '컴파일 언어와 스크립트 언어'], links: ['compiler'] },
    compiler: { ko: '컴파일러', en: 'COMPILER', desc: '소스 코드를 읽어 구조(AST)로 바꾸고, 기계어나 바이트코드로 번역해요.', chips: ['파서', 'AST', '최적화'], topics: ['어휘 분석과 구문 분석', '추상 구문 트리 (AST)', '코드 최적화'], links: ['source', 'bytecode'] },
    bytecode: { ko: '바이트코드 · 기계어', en: 'BYTECODE · MACHINE CODE', desc: '번역된 결과. 기계어는 CPU가 바로 실행하고, 바이트코드는 가상 머신이 실행해요.', chips: ['.class', '.pyc', 'ELF'], topics: ['기계어와 어셈블리', '바이트코드', '실행 파일 형식'], links: ['compiler', 'code'] },
    code: { ko: '코드 영역', en: 'CODE AREA', desc: '번역 결과가 메모리에 올라와 있는 곳. 실행 엔진이 여기서 명령을 하나씩 꺼내 실행해요.', chips: ['PC', '명령어 꺼내기'], topics: ['프로그램 카운터 (PC)', '명령어 인출 · 해석 · 실행', 'JIT 코드 캐시'], links: ['bytecode', 'vm'] },
    vm: { ko: '실행 엔진', en: 'EXECUTION ENGINE', desc: '바이트코드를 해석해 실행하고, 자주 도는 부분은 JIT으로 기계어로 바꿔 빠르게 해요.', chips: ['JVM', 'V8', 'JIT'], topics: ['인터프리터와 컴파일러의 차이', 'JIT 컴파일', 'JVM 구조'], links: ['code', 'memory'] },
    memory: { ko: '런타임 메모리', en: 'STACK · HEAP', desc: '함수 호출마다 쌓이는 스택과 객체가 사는 힙. 실행 중인 프로그램의 작업 공간이에요.', chips: ['스택', '힙', '콜 스택'], topics: ['스택과 힙', '콜 스택과 스택 오버플로', '값 타입과 참조 타입'], links: ['vm', 'gc'] },
    gc: { ko: '가비지 컬렉터', en: 'GARBAGE COLLECTOR', desc: '더 이상 쓰지 않는 객체를 찾아 힙에서 치워 주는 청소부.', chips: ['마크', '스윕', '세대'], topics: ['참조 카운팅', '마크 앤 스윕', '세대별 GC'], links: ['memory'] }
  };

  // 언어마다 달라지는 설명 (설명창 · 아래 안내문에 쓰임)
  const L = (c, java, python) => ({ c, java, python });
  const BY = {
    source: L('C 소스(.c). 타입을 적고, 메모리를 직접 다룰 수 있어요.', 'Java 소스(.java). 모든 코드가 클래스 안에 있고, 타입을 적어요.', 'Python 소스(.py). 타입을 적지 않고 들여쓰기로 구조를 나눠요.'),
    compiler: L('gcc · clang이 실행 전에 기계어까지 한 번에 번역해요(AOT). 최적화를 많이 해서 빨라요.', 'javac가 실행 전에 JVM용 바이트코드(.class)로 번역해요. 기계어까지는 JVM이 맡아요.', 'CPython이 실행 직전에 바이트코드로 번역해요. 따로 컴파일 명령이 없을 뿐 번역 단계는 있어요.'),
    bytecode: L('결과는 CPU가 바로 읽는 기계어 실행 파일이에요. 대신 CPU · 운영체제마다 따로 빌드해야 해요.', '결과는 바이트코드(.class). JVM만 있으면 어느 컴퓨터에서나 같은 파일이 돌아요.', '결과는 바이트코드(.pyc). CPython의 평가 루프가 읽어요.'),
    vm: L('C에는 실행 엔진(가상 머신)이 없어요. 운영체제가 기계어를 올리면 CPU가 그대로 실행해요.', 'JVM이 바이트코드를 해석해 실행하고, 자주 도는 코드는 JIT으로 기계어로 바꿔 빠르게 해요.', 'CPython의 평가 루프가 바이트코드를 한 명령씩 실행해요. 기본적으로 JIT은 없어요(3.13부터 실험적).'),
    code: L('실행 파일의 기계어가 그대로 올라온 곳(TEXT). CPU의 프로그램 카운터(PC)가 다음 명령을 가리키며 하나씩 가져가 실행해요.', 'JVM이 불러온 클래스의 바이트코드가 사는 곳(메서드 영역). 실행 엔진이 여기서 명령을 하나씩 꺼내고, JIT이 만든 기계어는 코드 캐시에 따로 둬요.', 'CPython이 만든 코드 객체(바이트코드)가 사는 곳. 평가 루프가 여기서 명령을 하나씩 꺼내 실행해요.'),
    memory: L('지역 변수는 스택, malloc으로 받은 공간은 힙. 힙은 내가 직접 관리해요.', '기본 타입 지역 변수는 스택, new로 만든 객체는 힙. 힙은 GC가 관리해요.', '숫자 하나까지 모든 값이 힙의 객체예요. 변수 이름은 객체를 가리키는 참조예요.'),
    gc: L('C에는 가비지 컬렉터가 없어요. free()로 직접 돌려줘야 하고, 잊으면 메모리가 새요.', 'JVM의 GC가 아무도 가리키지 않는 객체를 찾아 치워요. 젊은 객체부터 자주 검사해요(세대별).', 'CPython은 참조 수가 0이 되는 순간 바로 치우고, 서로 가리키는 순환만 별도 GC가 맡아요.')
  };
  Object.entries(BY).forEach(([k, v]) => Object.defineProperty(T[k], 'desc', { get: () => (window.KBLang ? KBLang.pick(v) : v.java), configurable: true }));

  Scene.spots(T, {
    source: { spots: [
      ['TOKEN', '토큰', 'TOKENS', 'let, x, =, 1 처럼 의미 있는 가장 작은 조각들.', { shape: 'cells' }],
      ['SYNTAX', '문법', 'SYNTAX', '조각들이 어떤 순서로 와야 하는지 정한 규칙.', { shape: 'layers', hi: true }],
      ['TYPE', '타입', 'TYPES', '값이 숫자인지 글자인지 알려 주는 표시. 실수를 미리 잡아 줘요.', { shape: 'chip' }]
    ] },
    compiler: { label: '번역 순서', spots: [
      ['LEX', '어휘 분석', 'LEXER', '글자들을 토큰으로 잘라요.', { shape: 'cells' }],
      ['PARSE', '구문 분석', 'PARSER', '토큰을 문법에 맞춰 트리(AST)로 엮어요.', { shape: 'layers', hi: true }],
      ['OPT', '최적화', 'OPTIMIZER', '같은 결과를 더 빠르게 내도록 코드를 다듬어요.', { shape: 'chip' }],
      ['GEN', '코드 생성', 'CODEGEN', '기계어나 바이트코드를 만들어 내요.', { shape: 'block' }]
    ] },
    bytecode: { spots: [
      ['OPS', '명령어', 'OPCODES', 'LOAD, ADD, CALL 같은 단순한 명령의 나열.', { shape: 'cells', hi: true }],
      ['CONST', '상수 표', 'CONSTANTS', '코드에 쓰인 숫자와 문자열을 모아 둔 표.', { shape: 'layers' }],
      ['FILE', '실행 파일', 'BINARY', '이것들을 담은 파일. .exe, .class, .pyc 등.', { shape: 'disk' }]
    ] },
    code: { label: '실행되는 동안 계속', spots: [
      ['LOAD', '올리기', 'LOAD', '프로그램을 시작하면 번역 결과를 디스크에서 읽어 이곳에 올려요.', { shape: 'disk' }],
      ['PC', '다음 명령 위치', 'PROGRAM COUNTER', '지금 몇 번째 명령을 실행 중인지 가리키는 표시. 스레드마다 하나씩 있어요.', { shape: 'chip', hi: true }],
      ['FETCH', '꺼내서 실행', 'FETCH', 'PC가 가리키는 명령을 꺼내 실행하고 PC를 다음으로 옮겨요. 실행 내내 반복돼요.', { shape: 'wire' }],
      ['CACHE', 'JIT 코드 캐시', 'CODE CACHE', 'Java는 자주 도는 코드를 기계어로 바꿔 여기에 두고 바로 실행해요. C는 처음부터 기계어, Python은 기본적으로 없어요.', { shape: 'cells' }]
    ] },
    vm: { spots: [
      ['LOOP', '해석 루프', 'INTERPRETER', '명령어를 하나 꺼내 실행하고 다음으로 — 를 반복해요.', { shape: 'wire' }],
      ['HOT', '자주 도는 코드', 'HOT PATH', '수천 번 반복되는 부분을 찾아내요.', { shape: 'cells' }],
      ['JIT', 'JIT 컴파일', 'JIT', '그 부분만 실행 중에 기계어로 바꿔 몇 배 빠르게 해요.', { shape: 'chip', hi: true }]
    ] },
    memory: { spots: [
      ['STACK', '스택', 'STACK', '함수를 부를 때마다 지역 변수 칸이 위로 쌓이고, 끝나면 사라져요.', { shape: 'layers', hi: true }],
      ['HEAP', '힙', 'HEAP', 'new로 만든 객체가 사는 넓은 공간. 직접 치우거나 GC가 치워요.', { shape: 'cells' }],
      ['REF', '참조', 'REFERENCE', '스택의 변수가 힙의 객체를 가리키는 화살표.', { shape: 'wire' }]
    ] },
    gc: { label: 'GC 한 번의 순서', spots: [
      ['ROOT', '뿌리 찾기', 'ROOTS', '스택과 전역 변수에서 출발해요.', { shape: 'chip' }],
      ['MARK', '표시', 'MARK', '닿을 수 있는 객체에 모두 표시해요.', { shape: 'cells', hi: true }],
      ['SWEEP', '치우기', 'SWEEP', '표시 없는 객체를 지워 공간을 돌려받아요.', { shape: 'block' }]
    ] }
  });

  /* =========================================================
     정면 평면: 위 = 번역(소스 → 컴파일러 → 결과물), 아래 큰 상자 = 내 앱(P2)이 받은 메모리
     상자 안: 실행 엔진 · 가비지 컬렉터 · 코드 영역 / 스택 · 힙 — 언어마다 안의 모습이 달라짐
     ========================================================= */
  const S = Scene.create({ T });
  const { part, linked } = S;
  const ln = (c, j, p) => `<tspan class="l-c">${c}</tspan><tspan class="l-java">${j}</tspan><tspan class="l-python">${p}</tspan>`;
  const lg = (c, j, p) => `<g class="l-c">${c}</g><g class="l-java">${j}</g><g class="l-python">${p}</g>`;
  const tile = (x, y, w, h, en, ko, cls = 'ofl-k') => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="9"/>` +
    `<text class="ofl-k-en" x="${x + 12}" y="${y + 20}">${en}</text><text class="ofl-k-ko" x="${x + w - 12}" y="${y + 20}" text-anchor="end">${ko}</text>`;
  const arrow = (d, head) => `<path class="rtf-arrow" d="${d}"/><path class="rtf-head" d="${head}"/>`;

  /* ---------- 왼쪽 제목 ---------- */
  const heads = `<g class="deco">` +
    `<text class="ofl-title" x="30" y="58">BUILD</text>` +
    `<text class="ofl-sub" x="30" y="78">${ln('실행 전에 기계어까지', '실행 전에 바이트코드까지', '실행 직전에 자동으로')}</text>` +
    `<text class="ofl-zone" x="30" y="94">${ln('AOT · 한 번에 번역', 'javac', '따로 명령 없음')}</text>` +
    `<text class="ofl-title" x="30" y="196">RUN</text>` +
    `<text class="ofl-sub" x="30" y="216">내 앱(P2)이 받은</text><text class="ofl-sub" x="30" y="232">메모리 안에서 실행</text>` +
    `<text class="ofl-zone" x="30" y="250">${ln('C · 직접 관리', 'JAVA · JVM이 관리', 'PYTHON · CPYTHON이 관리')}</text>` + `</g>`;

  /* ---------- 위: 번역 ---------- */
  const PY = 24, PH = 80;
  const source = part('source', 0, tile(200, PY, 190, PH, ln('main.c', 'Main.java', 'main.py'), '소스 코드') +
    `<text class="rtf-code" x="212" y="${PY + 46}">${ln('int total = price * 3;', 'int total = price * 3;', 'total = price * 3')}</text>` +
    `<path class="ofl-grow" d="M212,${PY + 60} h120 M212,${PY + 68} h80"/>`);
  const compiler = part('compiler', 1, tile(430, PY, 230, PH, ln('GCC', 'JAVAC', 'CPYTHON'), '컴파일러') +
    ['LEX', 'PARSE', 'OPT', 'GEN'].map((n, k) => `<rect class="cell${k === 3 ? ' cell--hi' : ''}" x="${442 + k * 52}" y="${PY + 34}" width="46" height="32" rx="4"/><text class="ofl-seg-t" x="${465 + k * 52}" y="${PY + 54}" text-anchor="middle">${n}</text>`).join(''));
  const bytecode = part('bytecode', 2, tile(700, PY, 230, PH, ln('MACHINE CODE', '.CLASS', '.PYC'), ln('기계어', '바이트코드', '바이트코드')) +
    `<text class="rtf-code" x="712" y="${PY + 50}">${ln('imul eax, 3', 'iload_1 · iconst_3 · imul', 'LOAD_NAME · BINARY_OP *')}</text>` +
    `<text class="ofl-seg-k" x="712" y="${PY + 68}">${ln('CPU가 바로 읽는 명령', 'JVM이 읽는 명령', '평가 루프가 읽는 명령')}</text>`);
  const pipeArrows = `<g class="deco">${arrow(`M390,${PY + 40} H424`, `M418,${PY + 35} l6,5 l-6,5`)}${arrow(`M660,${PY + 40} H694`, `M688,${PY + 35} l6,5 l-6,5`)}</g>`;

  /* ---------- 큰 상자: 내 앱의 메모리 ---------- */
  const B = { x: 200, y: 150, w: 730, h: 470 };
  const box = `<g class="deco"><rect class="ofl-ram" x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" rx="16"/>` +
    `<text class="ofl-zone" x="${B.x + 18}" y="${B.y + 26}">PROCESS MEMORY · 운영체제가 내 앱(P2)에 준 메모리 — 이 안을 ${ln('내가 직접', 'JVM이', 'CPython이')} 관리해요</text>` +
    `<text class="ofl-zone" x="218" y="332">STACK · 스택 (함수마다 한 칸)</text>` +
    `<text class="ofl-zone" x="416" y="332">HEAP · 힙 ${ln('(malloc으로 받은 공간)', '(new로 만든 객체)', '(모든 값이 객체)')}</text></g>`;

  // 코드 영역: 번역 결과가 메모리에 올라간 곳. 실행 내내 PC가 가리키는 명령을 꺼내 감
  const R1 = 190, RH = 110;
  const pcRun = (cells, dur) => `<rect class="rtf-pc" x="${cells[0][0] - 2}" y="${cells[0][1] - 2}" width="${cells[0][2] + 4}" height="22" rx="4">` +
    `<animate attributeName="x" values="${cells.map(c => c[0] - 2).join(';')}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/>` +
    `<animate attributeName="y" values="${cells.map(c => c[1] - 2).join(';')}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/></rect>`;
  const grid = (n, cols, w, dx) => Array.from({ length: n }, (_, k) => [686 + (k % cols) * dx, R1 + 36 + Math.floor(k / cols) * 22, w]);
  const cC = grid(16, 8, 23, 27), cJ = grid(8, 4, 23, 27), cP = grid(12, 6, 32, 36);
  const cellsOf = (cs, hi) => cs.map(([x, y, w], k) => `<rect class="cell${hi(k) ? ' cell--hi' : ''}" x="${x}" y="${y}" width="${w}" height="18" rx="3"/>`).join('');
  const code = part('code', 6,
    tile(674, R1, 238, RH, ln('TEXT', 'METHOD AREA', 'CODE OBJECTS'), '코드 영역', 'rtf-region') +
    lg(cellsOf(cC, k => k % 7 === 3) + pcRun([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 4, 5, 6, 7].map(k => cC[k]), 6.4) + `<text class="ofl-seg-k" x="686" y="${R1 + 98}">기계어 · PC가 다음 명령을 가리켜요</text>`,
      cellsOf(cJ, () => false) + pcRun([0, 1, 2, 3, 4, 5, 6, 7].map(k => cJ[k]), 4) +
        `<rect class="rtf-jit" x="800" y="${R1 + 36}" width="100" height="40" rx="5"><animate attributeName="opacity" values="0.55;1;0.55" dur="2s" repeatCount="indefinite"/></rect><text class="ofl-seg-t" x="808" y="${R1 + 52}">JIT CACHE</text><text class="ofl-seg-k" x="808" y="${R1 + 68}">뜨거운 코드 → 기계어</text>` +
        `<text class="ofl-seg-k" x="686" y="${R1 + 98}">.class 바이트코드 · 하나씩 꺼내 감</text>`,
      cellsOf(cP, k => k === 5) + pcRun(cP, 7.2) + `<text class="ofl-seg-k" x="686" y="${R1 + 98}">.pyc 바이트코드 · 하나씩 꺼내 감</text>`),
    { cls: 'rtf-code-part' });
  const loadArrow = linked('code', arrow(`M815,${PY + PH} V${R1 - 4}`, `M810,${R1 - 10} l5,6 l5,-6`) + `<path class="packet" d="M815,${PY + PH} V${R1 - 4}" pathLength="100"/>`, 'ofl-call');

  // 실행 엔진
  const loop = (cx, cy) => `<circle class="stroke-lav" cx="${cx}" cy="${cy}" r="20"/><g><path class="rtf-head" d="M${cx},${cy - 20} l7,-5 v10 z"/><animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="2.4s" repeatCount="indefinite"/></g>`;
  const vm = part('vm', 3, tile(218, R1, 210, RH, ln('NO VM', 'JVM', 'EVAL LOOP'), '실행 엔진') +
    lg(`<text class="rtf-big" x="230" y="${R1 + 56}">실행 엔진 없음</text><text class="ofl-seg-k" x="230" y="${R1 + 76}">CPU가 기계어를 직접 실행해요</text>`,
      loop(258, R1 + 64) + `<text class="ofl-seg-t" x="290" y="${R1 + 54}">해석 실행</text><text class="ofl-seg-k" x="290" y="${R1 + 70}">1만 번 돌면</text><rect class="rtf-jit" x="352" y="${R1 + 42}" width="64" height="36" rx="5"/><text class="ofl-seg-t" x="384" y="${R1 + 65}" text-anchor="middle">JIT</text>`,
      loop(258, R1 + 64) + `<text class="ofl-seg-t" x="290" y="${R1 + 58}">한 명령씩</text><text class="ofl-seg-k" x="290" y="${R1 + 74}">꺼내서 실행 (JIT 없음)</text>`), { cls: 'na-c' });
  const fetchD = `M793,${R1 + RH} V318 H330 V${R1 + RH + 6}`;
  const runA = arrow(fetchD, `M325,${R1 + RH + 12} l5,-6 l5,6`) + `<path class="packet packet--fast" d="${fetchD}" pathLength="100"/>` + arrow(`M250,${R1 + RH} V340`, `M245,334 l5,6 l5,-6`);
  const runArrows = linked('code', `<g class="l-c">${arrow(`M793,${R1 + RH} V318 H250 V334`, `M245,334 l5,6 l5,-6`)}<path class="packet packet--fast" d="M793,${R1 + RH} V318 H250 V334" pathLength="100"/><text class="ofl-seg-k" x="560" y="313" text-anchor="middle">CPU가 한 명령씩 가져가 바로 실행</text></g><g class="l-java">${runA}</g><g class="l-python">${runA}</g>`, 'ofl-call');

  // 가비지 컬렉터
  const gc = part('gc', 5, tile(446, R1, 210, RH, ln('free()', 'G1 GC', 'REFCOUNT + GC'), ln('직접 해제', '가비지 컬렉터', '참조 카운트')) +
    lg(`<text class="rtf-big" x="458" y="${R1 + 56}">GC 없음</text><text class="ofl-seg-k" x="458" y="${R1 + 76}">다 쓴 메모리는 free()로 직접</text>`,
      ['MARK', 'SWEEP', 'COMPACT'].map((n, k) => `<rect class="cell${k === 1 ? ' cell--hi' : ''}" x="${458 + k * 64}" y="${R1 + 40}" width="58" height="30" rx="4"/><text class="ofl-seg-t" x="${487 + k * 64}" y="${R1 + 59}" text-anchor="middle">${n}</text>`).join('') + `<text class="ofl-seg-k" x="458" y="${R1 + 92}">젊은 객체부터 자주 검사 (세대별)</text>`,
      `<text class="ofl-seg-t" x="458" y="${R1 + 54}">ref 0 → 즉시 해제</text><text class="ofl-seg-k" x="458" y="${R1 + 72}">서로 가리키는 순환만</text><text class="ofl-seg-k" x="458" y="${R1 + 88}">따로 GC가 정리</text>`), { cls: 'na-c' });

  /* ---------- 스택: 함수 호출마다 한 칸 (calc는 불렸다 끝났다 반복) ---------- */
  const FX = 228, FW = 160;
  const POP = `<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.12;0.6;0.72;1" dur="6s" repeatCount="indefinite"/>`;
  const frame = (y, name, varHtml, anim = '') => `<g>${anim}<rect class="rtf-frame" x="${FX}" y="${y}" width="${FW}" height="50" rx="6"/>` +
    `<text class="ofl-seg-t" x="${FX + 10}" y="${y + 17}">${name}</text>` +
    `<rect class="rtf-var" x="${FX + 10}" y="${y + 25}" width="${FW - 20}" height="18" rx="3"/>${varHtml(y)}</g>`;
  const v = (label, ref) => y => `<text class="ofl-seg-k" x="${FX + 18}" y="${y + 38}">${label}</text>` + (ref ? `<circle class="rtf-dot" cx="${FX + FW - 20}" cy="${y + 34}" r="3.5"/>` : '');
  const fy = { main: 538, order: 480, calc: 422 };
  const R = (y, x2, y2) => { const x1 = FX + FW - 20, y1 = y + 34; return `<path class="rtf-ref" d="M${x1},${y1} C${x1 + 50},${y1} ${x2 - 50},${y2} ${x2},${y2}"/><circle class="rtf-dot" cx="${x2}" cy="${y2}" r="3"/>`; };
  const stack = frame(fy.main, ln('main()', 'main()', '&lt;module&gt;'), v('cart →', true)) + frame(fy.order, 'order()', v('item →', true)) +
    frame(fy.calc, 'calc()', y => lg(v('total = 30000')(y), v('total = 30000')(y), v('total →', true)(y) + R(y, 432, 472)), POP);

  /* ---------- 힙: 언어마다 다른 모습 ---------- */
  const obj = (x, y, w, h, t, s, cls = 'rtf-obj') => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/><text class="ofl-seg-t" x="${x + 10}" y="${y + 17}">${t}</text><text class="ofl-seg-k" x="${x + 10}" y="${y + h - 9}">${s}</text>`;
  const note = t => `<text class="ofl-seg-k rtf-note" x="432" y="584">${t}</text>`;
  const FADE = `<animate attributeName="opacity" values="1;1;0.15;0.15;1" keyTimes="0;0.5;0.62;0.95;1" dur="6s" repeatCount="indefinite"/>`;
  const heapC = obj(432, 372, 150, 44, 'cart', 'malloc(64)') + obj(600, 372, 170, 44, 'item', 'malloc(128)') +
    `<g>${obj(640, 452, 160, 44, 'buf', 'free(buf) → 반납')}<animate attributeName="opacity" values="1;1;0.12;0.12;1" keyTimes="0;0.45;0.55;0.9;1" dur="6s" repeatCount="indefinite"/></g>` +
    obj(432, 452, 190, 44, '누수 · leak', 'free() 안 함 · 아무도 안 가리킴', 'rtf-obj rtf-leak') +
    R(fy.main, 432, 394) + R(fy.order, 600, 394) + note('malloc으로 받고 free()로 직접 돌려줘요 · 잊으면 누수');
  const heapJ = `<rect class="rtf-gen" x="426" y="350" width="226" height="214" rx="8"/><text class="ofl-zone" x="438" y="370">YOUNG · 새 객체</text>` +
    `<rect class="rtf-gen" x="668" y="350" width="234" height="214" rx="8"/><text class="ofl-zone" x="680" y="370">OLD · 오래 산 객체</text>` +
    obj(438, 384, 96, 40, 'Item', 'new Item()') + obj(546, 384, 96, 40, 'String', '"주문"') +
    obj(680, 384, 100, 40, 'Cart', '오래 씀') + obj(792, 384, 100, 40, 'Config', '설정') + obj(680, 436, 100, 40, 'Cache', '캐시') +
    `<g>${obj(438, 500, 100, 40, 'Order', '살아남으면 → OLD')}<animateTransform attributeName="transform" type="translate" values="0 0;0 0;242 -12;242 -12" keyTimes="0;0.4;0.6;1" dur="6s" repeatCount="indefinite"/></g>` +
    R(fy.main, 680, 404) + R(fy.order, 438, 404) + note('new로 만든 객체는 힙에 · 아무도 안 쓰면 GC가 치워요');
  const heapP = obj(432, 380, 130, 44, 'list', 'cart · ref 1') + obj(600, 380, 130, 44, 'dict', 'item · ref 2') +
    obj(432, 450, 130, 44, 'int 30000', 'total · ref 1') + obj(600, 450, 130, 44, 'int 3', 'ref 5 · 여럿이 공유') +
    `<path class="rtf-ref" d="M562,402 H596"/><circle class="rtf-dot" cx="598" cy="402" r="3"/>` +
    R(fy.main, 432, 402) + R(fy.order, 600, 420) + note('숫자 하나까지 모두 힙의 객체 · 변수 이름은 가리키는 화살표예요');
  const memory = part('memory', 4, stack + lg(heapC, heapJ, heapP));

  // GC를 가리키면 치워질 객체가 함께 켜짐
  const garbage = linked('gc', lg('',
    `<g>${FADE}${obj(438, 436, 96, 40, 'Temp', '안 씀', 'rtf-obj rtf-dead')}${obj(546, 436, 96, 40, 'Temp', '안 씀', 'rtf-obj rtf-dead')}</g>`,
    `<g>${FADE}${obj(760, 380, 130, 44, 'str', 'ref 0 → 즉시 해제', 'rtf-obj rtf-dead')}</g>` +
      obj(760, 450, 58, 44, 'A', '순환', 'rtf-obj rtf-dead') + obj(832, 450, 58, 44, 'B', '순환', 'rtf-obj rtf-dead') +
      `<path class="rtf-ref" d="M818,462 H830 M832,482 H820"/>`), 'rtf-garbage');

  S.mount(heads + pipeArrows + source + compiler + bytecode + box + code + loadArrow + runArrows + vm + gc + memory + garbage, {
    defaultHint: '위에서 번역하고, 아래 상자(내 앱의 메모리) 안에서 실행돼요 · 오른쪽 위에서 언어를 바꿔 보세요',
    viewBox: '0 0 960 640',
    routes: {
      mode: 'flat',
      anchors: { code: [793, 318], source: [295, PY + PH / 2], compiler: [545, PY + PH / 2], bytecode: [815, PY + PH / 2], vm: [323, R1 + RH / 2], gc: [551, R1 + RH / 2], memory: [550, 460] }
    }
  });
})();
