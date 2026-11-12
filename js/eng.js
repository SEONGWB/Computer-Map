/* =========================================================
   Software / 소프트웨어 공학 — 만들고, 내보내고, 다시 고치는 순환
   뒷줄(→): 설계 → 버전 관리 → 테스트
   앞줄(←): CI/CD → 배포 → 운영 · 모니터링 → 다시 설계로
   ========================================================= */
(() => {
  const T = {
    design: { ko: '설계', en: 'DESIGN', desc: '무엇을 만들지(요구사항)와 어떻게 나눌지(구조)를 정해요. 나중에 고치기 쉬운 모양을 고르는 단계.', chips: ['요구사항', '아키텍처', 'SOLID'], topics: ['요구사항 정리', '설계 원칙 (SOLID)', '디자인 패턴'], links: ['vcs', 'monitor'] },
    vcs: { ko: '버전 관리', en: 'VERSION CONTROL · GIT', desc: '코드의 모든 변경을 기록하고, 여러 사람이 가지(브랜치)를 나눠 동시에 작업한 뒤 합쳐요.', chips: ['commit', 'branch', 'PR'], topics: ['Git 기본 (commit · branch · merge)', '브랜치 전략', '코드 리뷰'], links: ['design', 'test'] },
    test: { ko: '테스트', en: 'TESTING', desc: '코드가 의도대로 도는지 자동으로 확인해요. 고칠 때 다른 곳이 망가지지 않았는지도 잡아 줘요.', chips: ['단위', '통합', 'E2E'], topics: ['단위 테스트', '테스트 피라미드', 'TDD'], links: ['vcs', 'ci'] },
    ci: { ko: 'CI/CD', en: 'CONTINUOUS INTEGRATION', desc: '코드가 올라올 때마다 빌드 → 테스트 → 배포 준비를 자동으로 돌리는 컨베이어 벨트.', chips: ['빌드', '파이프라인', '자동화'], topics: ['지속적 통합 (CI)', '지속적 배포 (CD)', '파이프라인 설계'], links: ['test', 'deploy'] },
    deploy: { ko: '배포', en: 'DEPLOYMENT', desc: '만든 것을 실제 서버에 올려 사용자에게 내보내요. 조금씩 바꿔 끼우면 사고가 나도 바로 되돌릴 수 있어요.', chips: ['컨테이너', '롤백', '카나리'], topics: ['컨테이너와 도커', '무중단 배포', '롤백 전략'], links: ['ci', 'monitor'] },
    monitor: { ko: '운영 · 모니터링', en: 'OPERATIONS · MONITORING', desc: '돌아가는 서비스를 지켜보며 오류와 느려짐을 잡아요. 여기서 얻은 교훈이 다음 설계로 돌아가요.', chips: ['로그', '지표', '알림'], topics: ['로그와 지표', '장애 대응', '회고와 개선'], links: ['deploy', 'design'] }
  };

  Scene.spots(T, {
    design: { spots: [
      ['REQ', '요구사항', 'REQUIREMENTS', '사용자가 무엇을 할 수 있어야 하나.', { shape: 'cells' }],
      ['ARCH', '구조 나누기', 'ARCHITECTURE', '모듈과 경계를 정해요.', { shape: 'layers', hi: true }],
      ['DOC', '문서', 'SPEC', '팀이 같은 그림을 보게 적어 둬요.', { shape: 'block' }]
    ] },
    vcs: { spots: [
      ['COMMIT', '커밋', 'COMMIT', '변경 하나를 설명과 함께 저장해요.', { shape: 'chip' }],
      ['BRANCH', '브랜치', 'BRANCH', '내 작업용 가지를 따로 뻗어요.', { shape: 'wire', hi: true }],
      ['MERGE', '합치기 · 리뷰', 'PULL REQUEST', '동료가 읽어 보고 본 줄기에 합쳐요.', { shape: 'layers' }]
    ] },
    test: { spots: [
      ['UNIT', '단위 테스트', 'UNIT', '함수 하나가 맞는지. 가장 많고 빨라요.', { shape: 'cells', hi: true }],
      ['INTEG', '통합 테스트', 'INTEGRATION', '여러 부품이 함께 잘 도는지.', { shape: 'layers' }],
      ['E2E', '끝에서 끝', 'E2E', '사용자처럼 화면을 눌러 보며.', { shape: 'screen' }]
    ] },
    ci: { label: '파이프라인', spots: [
      ['BUILD', '빌드', 'BUILD', '코드를 실행 가능한 결과물로.', { shape: 'block' }],
      ['RUN', '테스트 실행', 'TEST', '실패하면 여기서 멈춰요.', { shape: 'cells', hi: true }],
      ['PKG', '포장', 'ARTIFACT', '배포할 이미지를 만들어 둬요.', { shape: 'chip' }]
    ] },
    deploy: { spots: [
      ['IMG', '컨테이너', 'CONTAINER', '어디서든 똑같이 도는 상자.', { shape: 'block', hi: true }],
      ['CANARY', '조금씩', 'CANARY', '일부 사용자에게만 먼저 내보내요.', { shape: 'layers' }],
      ['BACK', '되돌리기', 'ROLLBACK', '문제가 보이면 이전 버전으로.', { shape: 'wire' }]
    ] },
    monitor: { spots: [
      ['LOG', '로그', 'LOGS', '무슨 일이 있었는지 기록.', { shape: 'layers' }],
      ['METRIC', '지표', 'METRICS', '응답 시간, 오류율, 사용량.', { shape: 'cells', hi: true }],
      ['ALERT', '알림', 'ALERT', '이상하면 담당자를 깨워요.', { shape: 'antenna' }]
    ] }
  });

  const S = Scene.create({ T, cx: 440, cy: 300 });
  const { P, f, top, box, part } = S;
  const mod = (x, y, w, d, h, name, extra = '', cls = 'core-block') => box(x, y, w, d, 0, h, cls) + top(h, `<text class="lbl lbl--lg" x="${x + 8}" y="${y + 18}">${name}</text>${extra}`);

  // 순환 벨트 (바닥)
  const loop = [[-210, -110], [60, -110], [60, -60], [-210, -60]];
  const belt = `<g class="deco"><path class="wire wire--dash" d="M${[...loop, loop[0]].map(p => P(p[0], p[1], 0).map(f).join(',')).join(' L')}"/>` +
    `<path class="packet" d="M${[...loop, loop[0]].map(p => P(p[0], p[1], 0).map(f).join(',')).join(' L')}" pathLength="100"/></g>`;

  const design = part('design', 0, mod(-260, -190, 100, 70, 14, 'DESIGN',
    `<path class="stroke-dim" d="M-252 -160 h84 M-252 -148 h84 M-252 -136 h84 M-230 -170 v40 M-200 -170 v40"/><rect class="cell cell--hi" x="-228" y="-158" width="26" height="20"/>`, 'cache-top'));
  const vcs = part('vcs', 1, mod(-130, -190, 110, 70, 10, 'GIT',
    `<path class="stroke-lav" d="M-120 -146 H-30 M-100 -146 Q-90 -132 -76 -132 H-56 Q-46 -132 -40 -146"/>` +
    [-120, -100, -76, -56, -30].map((x, k) => `<circle class="${k === 2 ? 'fill-lav' : 'cell'}" cx="${x}" cy="${k === 2 || k === 3 ? -132 : -146}" r="4"/>`).join('')));
  const test = part('test', 2, mod(10, -190, 100, 70, 20, 'TEST',
    [0, 1, 2].map(k => `<rect class="cell${k === 2 ? '' : ' cell--hi'}" x="18" y="${-166 + k * 14}" width="10" height="10" rx="2"/><path class="stroke-dim" d="M34 ${-161 + k * 14} h50"/>`).join('')));
  const ci = part('ci', 3, mod(10, -40, 100, 70, 16, 'CI/CD',
    ['BUILD', 'TEST', 'PKG'].map((n, k) => `<rect class="cell${k === 1 ? ' cell--hi' : ''}" x="${18 + k * 30}" y="-14" width="26" height="22" rx="2"/><text class="lbl lbl--dim" x="${19 + k * 30}" y="0" style="font-size:6px">${n}</text>`).join('')));
  const deploy = part('deploy', 4, box(-130, -40, 110, 70, 0, 4, 'layer-top') +
    [0, 1, 2].map(k => box(-122 + k * 34, -20, 26, 40, 4, 34, k === 0 ? 'cache-top' : 'core-block')).join('') + top(4, `<text class="lbl lbl--lg" x="-122" y="-26">DEPLOY</text>`));
  const monitor = part('monitor', 5, mod(-260, -40, 100, 70, 20, 'MONITOR',
    `<path class="stroke-lav" d="M-252 10 L-236 -4 L-222 2 L-206 -14 L-190 -6 L-172 -18"/><path class="stroke-dim" d="M-252 14 h84"/>`));

  const tags = S.tags([
    { id: 'design', a: P(-210, -155, 14), l: [250, 0] },
    { id: 'vcs', a: P(-75, -155, 10), l: [540, 50] },
    { id: 'test', a: P(60, -155, 20), l: [770, 150] },
    { id: 'ci', a: P(60, -5, 16), l: [640, 450], below: true, end: [640, 410] },
    { id: 'deploy', a: P(-75, -5, 38), l: [330, 470], below: true, end: [330, 430] },
    { id: 'monitor', a: P(-210, -5, 20), l: [40, 250] }
  ]);

  S.mount(S.floor(320) + belt + design + vcs + test + ci + deploy + monitor + tags, {
    defaultHint: '단계를 눌러 자세히 보기',
    viewBox: '0 -40 940 600',
    routes: { plane: 0, anchors: { design: [-210, -155, 14], vcs: [-75, -155, 10], test: [60, -155, 20], ci: [60, -5, 16], deploy: [-75, -5, 38], monitor: [-210, -5, 20] } }
  });
})();
