/* =========================================================
   Software / 보안 — 요청이 데이터에 닿기까지의 관문들
   한 줄로: 전송 암호화 → 인증(문) → 인가(명단) → 격리(울타리) → 저장 암호화(금고)
   앞쪽: 이 관문들을 뚫으려는 공격(취약점)
   ========================================================= */
(() => {
  const T = {
    tls: { ko: '전송 암호화', en: 'ENCRYPTION IN TRANSIT', desc: '오가는 길에서 엿보거나 바꾸지 못하게 내용을 잠가요. https가 대표적이에요.', chips: ['TLS', 'HTTPS', '인증서'], topics: ['대칭키와 공개키', 'TLS와 인증서', '중간자 공격'], links: ['auth'] },
    auth: { ko: '인증', en: 'AUTHENTICATION', desc: '"당신이 누구인지" 확인하는 문. 비밀번호, 일회용 코드, 생체 정보로 신원을 확인해요.', chips: ['로그인', 'MFA', '세션 · 토큰'], topics: ['비밀번호 저장 (해시 · 솔트)', '세션과 JWT', '다중 인증 (MFA)'], links: ['tls', 'authz'] },
    authz: { ko: '인가', en: 'AUTHORIZATION', desc: '"그 일을 해도 되는지" 확인하는 명단. 로그인했어도 남의 주문은 볼 수 없어야 해요.', chips: ['권한', '역할', '최소 권한'], topics: ['역할 기반 접근 제어 (RBAC)', '최소 권한 원칙', 'OAuth'], links: ['auth', 'sandbox'] },
    sandbox: { ko: '격리', en: 'ISOLATION · SANDBOX', desc: '하나가 뚫려도 피해가 번지지 않게 칸막이를 쳐요. 프로세스, 컨테이너, 브라우저 탭이 각자 갇혀 있어요.', chips: ['프로세스', '컨테이너', '샌드박스'], topics: ['프로세스 격리와 권한 분리', '컨테이너 보안', '브라우저 샌드박스'], links: ['authz', 'crypto'] },
    crypto: { ko: '저장 암호화', en: 'ENCRYPTION AT REST', desc: '디스크를 통째로 도둑맞아도 읽을 수 없게 데이터를 잠가 둬요. 비밀번호는 아예 되돌릴 수 없게 해시로.', chips: ['AES', '해시', '키 관리'], topics: ['AES와 대칭키 암호', '해시 함수와 비밀번호', '키 관리'], links: ['sandbox'] },
    vuln: { ko: '취약점 · 공격', en: 'VULNERABILITIES', desc: '관문의 빈틈을 노리는 공격들. 입력값에 코드를 섞거나(인젝션), 남의 권한을 훔쳐 써요.', chips: ['SQL 인젝션', 'XSS', 'CSRF'], topics: ['OWASP Top 10', 'SQL 인젝션과 방어', 'XSS와 CSRF'], links: ['auth', 'authz'] }
  };

  Scene.spots(T, {
    tls: { spots: [
      ['HELLO', '인사', 'HANDSHAKE', '쓸 수 있는 암호 방식을 서로 맞춰요.', { shape: 'wire' }],
      ['CERT', '인증서 확인', 'CERTIFICATE', '진짜 그 서버인지 확인해요.', { shape: 'chip', hi: true }],
      ['LOCK', '잠그기', 'ENCRYPT', '둘만 아는 키로 모든 내용을 잠가요.', { shape: 'block' }]
    ] },
    auth: { label: '로그인 순서', spots: [
      ['ID', '아이디 · 비밀번호', 'CREDENTIALS', '사용자가 입력해요.', { shape: 'cells' }],
      ['HASH', '해시 비교', 'HASH CHECK', '저장된 해시와 비교해요. 원래 비밀번호는 서버도 몰라요.', { shape: 'chip', hi: true }],
      ['TOKEN', '출입증 발급', 'SESSION · TOKEN', '이후 요청엔 이 출입증만 보여 주면 돼요.', { shape: 'layers' }]
    ] },
    authz: { spots: [
      ['ROLE', '역할', 'ROLE', '관리자 · 판매자 · 고객.', { shape: 'layers' }],
      ['RULE', '규칙', 'POLICY', '"주문은 주인만 볼 수 있다"', { shape: 'cells', hi: true }],
      ['DENY', '거절', '403', '권한 없으면 403 Forbidden.', { shape: 'chip' }]
    ] },
    sandbox: { spots: [
      ['PROC', '프로세스 분리', 'PROCESS', '서로의 메모리를 볼 수 없어요.', { shape: 'layers', hi: true }],
      ['CONT', '컨테이너', 'CONTAINER', '파일 · 네트워크까지 따로 보이게 가둬요.', { shape: 'block' }],
      ['LEAST', '최소 권한', 'LEAST PRIVILEGE', '꼭 필요한 권한만 줘요.', { shape: 'chip' }]
    ] },
    crypto: { spots: [
      ['AES', '대칭키 암호', 'AES', '같은 키로 잠그고 풀어요. 빠르고 튼튼해요.', { shape: 'chip', hi: true }],
      ['HASHPW', '비밀번호 해시', 'BCRYPT', '되돌릴 수 없게 바꿔 저장해요.', { shape: 'cells' }],
      ['KMS', '키 보관', 'KEY MANAGEMENT', '키를 데이터와 따로, 더 깊이 숨겨요.', { shape: 'disk' }]
    ] },
    vuln: { spots: [
      ['SQLI', 'SQL 인젝션', 'SQL INJECTION', "입력에 ' OR 1=1 같은 코드를 섞어 DB를 속여요. → 파라미터 바인딩으로 막아요.", { shape: 'cells', hi: true }],
      ['XSS', 'XSS', 'CROSS-SITE SCRIPTING', '남의 화면에 스크립트를 심어요. → 출력할 때 이스케이프.', { shape: 'screen' }],
      ['CSRF', 'CSRF', 'REQUEST FORGERY', '로그인된 사용자 몰래 요청을 보내게 해요. → 토큰으로 확인.', { shape: 'wire' }]
    ] }
  });

  const S = Scene.create({ T, cx: 440, cy: 300 });
  const { P, f, top, box, part, linked } = S;
  const name = (z, x, y, t) => top(z, `<text class="lbl lbl--lg" x="${x}" y="${y}">${t}</text>`);

  const tls = part('tls', 0, box(-290, -60, 70, 70, 0, 12, 'core-block') + name(12, -284, -42, 'TLS') +
    top(12, `<path class="stroke-lav" d="M-266 -16 v-6 a8 8 0 0 1 16 0 v6"/><rect class="cell cell--hi" x="-270" y="-16" width="24" height="18" rx="2"/>`));
  const auth = part('auth', 1, box(-190, -60, 60, 12, 0, 54, 'core-block') + box(-190, -2, 60, 12, 0, 54, 'core-block') + box(-190, -60, 60, 70, 54, 6, 'cache-top') + name(60, -184, -42, 'LOGIN'));
  const authz = part('authz', 2, box(-100, -60, 70, 70, 0, 30, 'core-block') + name(30, -94, -42, 'ACL') +
    top(30, [0, 1, 2].map(k => `<path class="stroke-lav" d="M-92 ${-30 + k * 12} l3 3 l6 -6"/><path class="stroke-dim" d="M-78 ${-30 + k * 12} h36"/>`).join('')));
  const sandbox = part('sandbox', 3, box(0, -60, 90, 70, 0, 6, 'layer-top') + box(20, -45, 50, 40, 6, 26, 'cache-top') + name(32, 26, -28, 'APP') +
    top(46, `<rect class="stroke-dim" x="4" y="-56" width="82" height="62" rx="3" style="stroke-dasharray:4 3"/>`) + name(6, 6, 2, 'SANDBOX'));
  const crypto = part('crypto', 4, box(120, -60, 80, 70, 0, 40, 'cache-top') + name(40, 126, -42, 'VAULT') +
    top(40, `<circle class="stroke-lav" cx="160" cy="-18" r="12"/><path class="stroke-lav" d="M160 -18 l7 -5"/>`));
  const vuln = part('vuln', 5, box(-220, 70, 170, 50, 0, 8, 'core-block') + name(8, -212, 86, 'ATTACK') +
    top(8, `<path class="stroke-lav" d="M-120 108 l10 -18 l10 18 z M-110 96 v5 M-110 104 v1"/><text class="lbl lbl--dim" x="-212" y="106">' OR 1=1 --</text>`));

  // 요청이 관문을 차례로 지나는 길
  const road = [P(-255, 20, 1), P(165, 20, 1)].map(p => p.map(f).join(',')).join(' L');
  const path = linked('auth', `<path class="wire wire--dash" d="M${road}"/><path class="packet" d="M${road}" pathLength="100"/>`);
  const atk = [P(-135, 70, 1), P(-135, 20, 1)].map(p => p.map(f).join(',')).join(' L');
  const attack = linked('vuln', `<path class="wire wire--dash" d="M${atk}"/>`);

  const tags = S.tags([
    { id: 'tls', a: P(-255, -25, 12), l: [40, 90] },
    { id: 'auth', a: P(-160, -25, 60), l: [250, 10] },
    { id: 'authz', a: P(-65, -25, 30), l: [470, 70] },
    { id: 'sandbox', a: P(45, -25, 32), l: [680, 140] },
    { id: 'crypto', a: P(160, -25, 40), l: [770, 290] },
    { id: 'vuln', a: P(-135, 95, 8), l: [180, 460], below: true, end: [180, 420] }
  ]);

  S.mount(S.floor(320) + path + attack + tls + auth + authz + sandbox + crypto + vuln + tags, {
    defaultHint: '관문을 눌러 자세히 보기',
    viewBox: '0 -40 940 600',
    routes: { plane: 1, anchors: { tls: [-255, -25, 12], auth: [-160, -25, 60], authz: [-65, -25, 30], sandbox: [45, -25, 32], crypto: [160, -25, 40], vuln: [-135, 95, 8] } }
  });
})();
