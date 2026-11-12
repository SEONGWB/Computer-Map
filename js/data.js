/* =========================================================
   Software / 데이터 — 데이터베이스 안쪽
   뒷줄(찾기): SQL → 옵티마이저 → 인덱스
   앞줄(저장): 버퍼 풀 → 로그(WAL) → 데이터 파일
   ========================================================= */
(() => {
  const T = {
    sql: { ko: 'SQL 질의', en: 'SQL QUERY', desc: '"주문 중 42번을 찾아 줘"처럼 원하는 결과를 말하는 언어. 어떻게 찾을지는 데이터베이스가 정해요.', chips: ['SELECT', 'INSERT', 'JOIN'], topics: ['SQL 기본 문법', 'JOIN', '집계와 GROUP BY'], links: ['planner', 'wal'] },
    planner: { ko: '옵티마이저', en: 'QUERY OPTIMIZER', desc: '같은 결과를 내는 여러 방법 중 가장 빠른 실행 계획을 골라요. 인덱스를 쓸지 전부 훑을지도 여기서 정해요.', chips: ['실행 계획', '비용 추정'], topics: ['실행 계획 읽기 (EXPLAIN)', '풀 스캔과 인덱스 스캔', '조인 순서'], links: ['sql', 'index'] },
    index: { ko: '인덱스', en: 'B+TREE INDEX', desc: '책 뒤의 찾아보기처럼, 값으로 행의 위치를 빠르게 찾게 해 주는 나무 구조.', chips: ['B+트리', '기본 키', '복합 인덱스'], topics: ['B+트리', '인덱스를 타는 조건', '커버링 인덱스'], links: ['planner', 'buffer'] },
    buffer: { ko: '버퍼 풀', en: 'BUFFER POOL', desc: '디스크의 페이지를 메모리에 올려 두는 캐시. 자주 쓰는 데이터는 디스크까지 가지 않아요.', chips: ['페이지', 'LRU', '더티 페이지'], topics: ['버퍼 풀과 캐시 적중률', '페이지 교체', '체크포인트'], links: ['index', 'files', 'wal'] },
    wal: { ko: '로그 · 트랜잭션', en: 'WRITE-AHEAD LOG', desc: '바꾸기 전에 "무엇을 바꿀지"를 먼저 기록해 둬요. 정전이 나도 이 기록으로 되살리고, 커밋을 보장해요.', chips: ['커밋', '롤백', 'ACID'], topics: ['트랜잭션과 ACID', '격리 수준', 'WAL과 복구'], links: ['sql', 'buffer', 'files'] },
    files: { ko: '데이터 파일', en: 'DATA FILES', desc: '표의 행들이 실제로 저장된 파일. 운영체제를 거쳐 SSD에 기록돼요.', chips: ['페이지', '테이블스페이스'], topics: ['행 저장 방식과 페이지', '행 기반과 열 기반', '파티셔닝'], links: ['buffer', 'wal'] }
  };

  Scene.spots(T, {
    sql: { spots: [
      ['PARSE', '해석', 'PARSER', 'SQL 문장을 읽어 구조로 바꿔요.', { shape: 'cells' }],
      ['WHAT', '무엇을', 'DECLARATIVE', '"어떻게"가 아니라 "무엇을" 원하는지만 말해요.', { shape: 'chip', hi: true }],
      ['RESULT', '결과', 'RESULT SET', '행과 열로 된 표로 돌아와요.', { shape: 'cells' }]
    ] },
    planner: { spots: [
      ['PLANS', '후보 계획', 'CANDIDATES', '풀 스캔, 인덱스 스캔, 조인 순서 조합들.', { shape: 'layers' }],
      ['COST', '비용 계산', 'COST MODEL', '통계로 읽을 페이지 수를 어림잡아요.', { shape: 'chip', hi: true }],
      ['PICK', '선택', 'PLAN', '가장 싼 계획을 실행기로 넘겨요.', { shape: 'block' }]
    ] },
    index: { label: '42번 찾기', spots: [
      ['ROOT', '뿌리', 'ROOT', '"42는 1~100 쪽"으로 내려가요.', { shape: 'chip' }],
      ['BRANCH', '가지', 'BRANCH', '"41~50 쪽"으로 한 번 더.', { shape: 'layers' }],
      ['LEAF', '잎', 'LEAF', '42번 행이 있는 페이지 위치를 얻어요. 백만 행이어도 3~4번이면 끝.', { shape: 'cells', hi: true }]
    ] },
    buffer: { spots: [
      ['HIT', '적중', 'CACHE HIT', '메모리에 있으면 바로 꺼내요.', { shape: 'cells', hi: true }],
      ['MISS', '미스', 'CACHE MISS', '없으면 디스크에서 페이지를 읽어 와요.', { shape: 'disk' }],
      ['DIRTY', '더티 페이지', 'DIRTY PAGE', '바뀌었지만 아직 디스크에 안 쓴 페이지. 나중에 모아서 써요.', { shape: 'layers' }]
    ] },
    wal: { label: '커밋 순서', spots: [
      ['LOG', '먼저 기록', 'LOG FIRST', '바꿀 내용을 로그 끝에 덧붙여요.', { shape: 'layers' }],
      ['FSYNC', '확실히 저장', 'FSYNC', '로그를 디스크에 확실히 써야 커밋 완료.', { shape: 'disk', hi: true }],
      ['REDO', '복구', 'REDO · UNDO', '정전 뒤엔 로그를 다시 읽어 되살려요.', { shape: 'wire' }]
    ] },
    files: { spots: [
      ['PAGE', '페이지', 'PAGE', '보통 8~16KB 단위로 행을 담아요.', { shape: 'cells', hi: true }],
      ['TABLE', '테이블 파일', 'TABLESPACE', '표마다 (또는 묶어서) 파일로.', { shape: 'disk' }],
      ['OS', '운영체제로', 'WRITE', '결국 write() 시스템 콜로 SSD에 내려가요.', { shape: 'wire' }]
    ] }
  });

  const S = Scene.create({ T, cx: 440, cy: 300 });
  const { P, f, top, box, part } = S;
  const mod = (x, y, w, d, h, name, extra = '', cls = 'core-block', z = 0) => box(x, y, w, d, z, h, cls) + top(z + h, `<text class="lbl lbl--lg" x="${x + 8}" y="${y + 18}">${name}</text>${extra}`);

  const sql = part('sql', 0, mod(-260, -190, 90, 70, 12, 'SQL',
    `<path class="stroke-lav" d="M-252 -160 h44 M-252 -150 h60 M-252 -140 h30"/>`, 'cache-top'));
  const planner = part('planner', 1, mod(-140, -190, 110, 70, 22, 'OPTIMIZER',
    `<path class="stroke-dim" d="M-85 -158 V-150 M-110 -150 H-60 M-110 -150 V-140 M-60 -150 V-140"/><rect class="cell" x="-120" y="-140" width="20" height="12"/><rect class="cell cell--hi" x="-70" y="-140" width="20" height="12"/>`));
  const tree = [[65, -168], [35, -150], [95, -150], [20, -134], [50, -134], [80, -134], [110, -134]];
  const index = part('index', 2, mod(0, -190, 130, 70, 30, 'INDEX',
    `<path class="stroke-dim" d="M65 -168 L35 -150 M65 -168 L95 -150 M35 -150 L20 -134 M35 -150 L50 -134 M95 -150 L80 -134 M95 -150 L110 -134"/>` +
    tree.map(([x, y], k) => `<circle class="${k === 4 || k === 1 || k === 0 ? 'fill-lav' : 'cell'}" cx="${x}" cy="${y}" r="4"/>`).join(''), 'cache-top'));
  const buffer = part('buffer', 3, mod(-260, -60, 190, 80, 14, 'BUFFER POOL',
    Array.from({ length: 14 }, (_, k) => `<rect class="cell${[3, 9].includes(k) ? ' cell--hi' : ''}" x="${-250 + (k % 7) * 25}" y="${-30 + Math.floor(k / 7) * 22}" width="20" height="16" rx="2"/>`).join('')));
  const wal = part('wal', 4, mod(-40, -60, 60, 80, 46, 'WAL',
    `<path class="stroke-lav" d="M-32 -30 h40 M-32 -20 h40 M-32 -10 h40 M-32 0 h24"/>`, 'cache-top'));
  const files = part('files', 5, box(50, -60, 90, 80, 0, 8, 'core-block') + box(50, -60, 90, 80, 12, 8, 'core-block') + box(50, -60, 90, 80, 24, 8, 'cache-top') +
    top(32, `<text class="lbl lbl--lg" x="58" y="-42">FILES</text><rect class="cell" x="58" y="-30" width="34" height="20"/><rect class="cell cell--hi" x="96" y="-30" width="34" height="20"/>`));

  const tags = S.tags([
    { id: 'sql', a: P(-215, -155, 12), l: [330, 10] },
    { id: 'planner', a: P(-85, -155, 22), l: [560, 40] },
    { id: 'index', a: P(65, -155, 30), l: [770, 140] },
    { id: 'buffer', a: P(-165, -20, 14), l: [60, 260] },
    { id: 'wal', a: P(-10, -20, 46), l: [380, 470], below: true, end: [380, 430] },
    { id: 'files', a: P(95, -20, 32), l: [700, 400] }
  ]);

  S.mount(S.floor(320) + sql + planner + index + buffer + wal + files + tags, {
    defaultHint: '구성 요소를 눌러 자세히 보기',
    viewBox: '0 -40 940 600',
    routes: { plane: 0, anchors: { sql: [-215, -155, 12], planner: [-85, -155, 22], index: [65, -155, 30], buffer: [-165, -20, 14], wal: [-10, -20, 46], files: [95, -20, 32] } }
  });
})();
