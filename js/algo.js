/* =========================================================
   Software / 자료구조 · 알고리즘 — 데이터를 담는 여섯 가지 모양
   뒷줄: 배열 · 연결 리스트 · 스택과 큐
   앞줄: 해시 테이블 · 트리 · 그래프
   ========================================================= */
(() => {
  const T = {
    array: { ko: '배열', en: 'ARRAY', desc: '같은 크기의 칸을 한 줄로 붙여 놓은 구조. 번호로 바로 찾을 수 있지만, 중간에 끼워 넣기는 느려요.', chips: ['인덱스', 'O(1) 접근'], topics: ['배열과 동적 배열', '이진 탐색', '정렬 알고리즘'], links: ['list', 'hash'] },
    list: { ko: '연결 리스트', en: 'LINKED LIST', desc: '각 칸이 다음 칸의 위치를 들고 있는 구조. 끼워 넣기는 빠르지만, 찾으려면 처음부터 따라가야 해요.', chips: ['노드', '포인터'], topics: ['단일 · 이중 연결 리스트', '배열과 리스트 비교', '포인터 다루기'], links: ['array', 'stackq'] },
    stackq: { ko: '스택 · 큐', en: 'STACK · QUEUE', desc: '넣고 빼는 순서가 정해진 구조. 스택은 나중에 넣은 것부터(되돌리기), 큐는 먼저 넣은 것부터(줄 서기).', chips: ['LIFO', 'FIFO', '우선순위 큐'], topics: ['스택과 재귀', '큐와 BFS', '힙과 우선순위 큐'], links: ['list', 'graph'] },
    hash: { ko: '해시 테이블', en: 'HASH TABLE', desc: '키를 해시 함수로 칸 번호로 바꿔 바로 찾아가는 구조. 평균적으로 한 번에 찾아요.', chips: ['해시 함수', '충돌', 'O(1)'], topics: ['해시 함수', '충돌 해결 (체이닝 · 개방 주소)', '해시맵 활용'], links: ['array'] },
    tree: { ko: '트리', en: 'TREE', desc: '뿌리에서 가지가 뻗는 계층 구조. 정렬된 트리에서는 반씩 줄여 가며 빠르게 찾아요.', chips: ['이진 탐색 트리', '균형', 'O(log n)'], topics: ['이진 탐색 트리', '균형 트리 (AVL · 레드블랙)', 'B-트리'], links: ['graph', 'hash'] },
    graph: { ko: '그래프', en: 'GRAPH', desc: '점(노드)과 선(간선)으로 관계를 나타내는 구조. 지도 길 찾기, 친구 추천, 네트워크 경로가 모두 그래프 문제예요.', chips: ['BFS', 'DFS', '최단 경로'], topics: ['그래프 표현 (인접 행렬 · 리스트)', 'BFS와 DFS', '다익스트라'], links: ['tree', 'stackq'] }
  };

  Scene.spots(T, {
    array: { spots: [
      ['IDX', '번호로 접근', 'INDEX', 'a[3]처럼 번호만 알면 한 번에 가요. O(1)', { shape: 'cells', hi: true }],
      ['INSERT', '끼워 넣기', 'INSERT', '중간에 넣으려면 뒤 칸을 전부 밀어야 해요. O(n)', { shape: 'layers' }],
      ['BIN', '이진 탐색', 'BINARY SEARCH', '정렬돼 있으면 반씩 잘라 찾아요. O(log n)', { shape: 'chip' }]
    ] },
    list: { spots: [
      ['NODE', '노드', 'NODE', '값 + 다음 노드의 주소.', { shape: 'chip', hi: true }],
      ['LINK', '연결', 'POINTER', '주소만 바꾸면 끼워 넣기 끝. O(1)', { shape: 'wire' }],
      ['WALK', '따라가기', 'TRAVERSE', '찾으려면 처음부터 하나씩. O(n)', { shape: 'cells' }]
    ] },
    stackq: { spots: [
      ['STACK', '스택', 'LIFO', '접시 쌓기. 함수 호출, 되돌리기(Ctrl+Z).', { shape: 'layers', hi: true }],
      ['QUEUE', '큐', 'FIFO', '줄 서기. 작업 대기열, 너비 우선 탐색.', { shape: 'cells' }],
      ['HEAP', '우선순위 큐', 'HEAP', '가장 급한 것부터 꺼내요. 스케줄러가 써요.', { shape: 'chip' }]
    ] },
    hash: { spots: [
      ['FN', '해시 함수', 'HASH()', '"apple" → 7번 칸.', { shape: 'chip', hi: true }],
      ['BUCKET', '칸', 'BUCKETS', '키를 칸 번호로 바로 찾아가요. O(1)', { shape: 'cells' }],
      ['COLL', '충돌', 'COLLISION', '두 키가 같은 칸이면 줄줄이 매달아요.', { shape: 'layers' }]
    ] },
    tree: { label: '7 찾기', spots: [
      ['ROOT', '뿌리', 'ROOT', '8보다 작으니 왼쪽으로.', { shape: 'chip' }],
      ['LEFT', '왼쪽 가지', 'BRANCH', '5보다 크니 오른쪽으로.', { shape: 'layers' }],
      ['FOUND', '찾음', 'FOUND', '단계마다 반씩 줄어서 O(log n).', { shape: 'cells', hi: true }]
    ] },
    graph: { spots: [
      ['NODES', '노드와 간선', 'NODES · EDGES', '도시와 도로, 사람과 친구 관계.', { shape: 'globe', hi: true }],
      ['BFS', '너비 우선', 'BFS', '가까운 곳부터 넓게 — 큐를 써요.', { shape: 'cells' }],
      ['SHORT', '최단 경로', 'DIJKSTRA', '가중치(거리)를 따져 가장 짧은 길.', { shape: 'wire' }]
    ] }
  });

  const S = Scene.create({ T, cx: 440, cy: 300 });
  const { P, f, top, box, part } = S;
  const name = (z, x, y, t) => top(z, `<text class="lbl lbl--lg" x="${x}" y="${y}">${t}</text>`);

  // 배열: 붙어 있는 칸
  const array = part('array', 0, box(-270, -200, 160, 70, 0, 4, 'layer-top') + name(4, -262, -184, 'ARRAY') +
    [0, 1, 2, 3, 4, 5].map(k => box(-264 + k * 25, -170, 22, 30, 4, 16, k === 3 ? 'cache-top' : 'core-block')).join('') +
    top(20, [0, 1, 2, 3, 4, 5].map(k => `<text class="lbl lbl--dim" x="${-257 + k * 25}" y="-150">${k}</text>`).join('')));
  // 연결 리스트: 떨어진 노드와 화살표
  const list = part('list', 1, box(-80, -200, 150, 70, 0, 4, 'layer-top') + name(4, -72, -184, 'LINKED LIST') +
    [0, 1, 2].map(k => box(-72 + k * 50, -168, 30, 28, 4, 16, k === 0 ? 'cache-top' : 'core-block')).join('') +
    top(20, `<path class="stroke-lav" d="M-42 -154 h14 M-32 -158 l4 4 l-4 4 M8 -154 h14 M18 -158 l4 4 l-4 4"/>`));
  // 스택 · 큐: 쌓인 판
  const stackq = part('stackq', 2, [0, 1, 2, 3].map(k => box(100, -200, 80, 70, k * 13, 9, k === 3 ? 'cache-top' : 'core-block')).join('') + name(48, 108, -184, 'STACK · QUEUE') +
    top(48, `<path class="stroke-lav" d="M140 -150 V-136 M134 -144 l6 -6 l6 6"/>`));
  // 해시 테이블: 칸 + 매달린 체인
  const hash = part('hash', 3, box(-270, -60, 160, 80, 0, 8, 'core-block') + name(8, -262, -44, 'HASH TABLE') +
    top(8, [0, 1, 2, 3, 4].map(k => `<rect class="cell${k === 2 ? ' cell--hi' : ''}" x="-262" y="${-34 + k * 10}" width="22" height="8"/>`).join('') +
      `<path class="stroke-dim" d="M-238 -12 h18 M-238 8 h18 M-200 8 h14"/><rect class="cell" x="-220" y="-16" width="20" height="8"/><rect class="cell" x="-220" y="4" width="20" height="8"/><rect class="cell" x="-186" y="4" width="20" height="8"/>`));
  // 트리
  const tn = [[-5, -40, '8'], [-40, -18, '5'], [30, -18, '12'], [-58, 4, '2'], [-22, 4, '7'], [12, 4, '10']];
  const tree = part('tree', 4, box(-80, -60, 150, 80, 0, 8, 'core-block') + name(8, -72, -44, 'TREE') +
    top(8, `<path class="stroke-dim" d="M-5 -40 L-40 -18 M-5 -40 L30 -18 M-40 -18 L-58 4 M-40 -18 L-22 4 M30 -18 L12 4"/>` +
      tn.map(([x, y, v], k) => `<circle class="${[0, 1, 4].includes(k) ? 'fill-lav' : 'cell'}" cx="${x}" cy="${y}" r="7"/><text class="lbl" x="${x - 3}" y="${y + 3}" style="font-size:7px;fill:#111">${v}</text>`).join('')));
  // 그래프
  const gn = [[115, -30], [150, -42], [185, -24], [130, 4], [170, 8], [200, 0]];
  const graph = part('graph', 5, box(100, -60, 110, 80, 0, 8, 'core-block') + name(8, 108, -44, 'GRAPH') +
    top(8, `<path class="stroke-dim" d="M115 -30 L150 -42 L185 -24 L200 0 L170 8 L130 4 L115 -30 M150 -42 L130 4 M185 -24 L170 8"/>` +
      gn.map(([x, y], k) => `<circle class="${k < 2 ? 'fill-lav' : 'cell'}" cx="${x}" cy="${y}" r="5"/>`).join('')));

  const tags = S.tags([
    { id: 'array', a: P(-190, -165, 20), l: [250, 0] },
    { id: 'list', a: P(-5, -165, 20), l: [560, 50] },
    { id: 'stackq', a: P(140, -165, 48), l: [790, 150] },
    { id: 'hash', a: P(-190, -20, 8), l: [50, 260] },
    { id: 'tree', a: P(-5, -20, 8), l: [380, 470], below: true, end: [380, 430] },
    { id: 'graph', a: P(155, -20, 8), l: [700, 460], below: true, end: [700, 420] }
  ]);

  S.mount(S.floor(320) + array + list + stackq + hash + tree + graph + tags, {
    defaultHint: '자료구조를 눌러 자세히 보기',
    viewBox: '0 -40 940 600',
    routes: { plane: 0, anchors: { array: [-190, -165, 20], list: [-5, -165, 20], stackq: [140, -165, 48], hash: [-190, -20, 8], tree: [-5, -20, 8], graph: [155, -20, 8] } }
  });
})();
