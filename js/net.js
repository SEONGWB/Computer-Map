/* =========================================================
   Software / 네트워크 — 프로토콜 층 쌓기
   가운데 탑(아래 → 위): IP → TCP → TLS → HTTP
   옆: DNS(주소 찾기), 소켓(프로그램이 네트워크를 쓰는 입구)
   ========================================================= */
(() => {
  const T = {
    ip: { ko: 'IP', en: 'INTERNET PROTOCOL', desc: '데이터를 패킷으로 쪼개 주소(IP 주소)를 붙이고, 라우터를 거쳐 목적지까지 보내요. 도착은 보장하지 않아요.', chips: ['IP 주소', '패킷', '라우팅'], topics: ['IPv4와 IPv6', '서브넷과 라우팅', 'NAT'], links: ['tcp'] },
    tcp: { ko: 'TCP', en: 'TRANSMISSION CONTROL', desc: '패킷이 빠짐없이, 순서대로 도착하게 책임지는 층. 잃어버리면 다시 보내요.', chips: ['3-way 핸드셰이크', '포트', '재전송'], topics: ['TCP와 UDP', '연결 수립과 종료', '흐름 제어와 혼잡 제어'], links: ['ip', 'tls', 'socket'] },
    tls: { ko: 'TLS', en: 'TRANSPORT LAYER SECURITY', desc: '주고받는 내용을 암호화하는 층. https의 s가 바로 이것이에요.', chips: ['인증서', '암호화', '핸드셰이크'], topics: ['TLS 핸드셰이크', '인증서와 CA', '대칭키와 공개키'], links: ['tcp', 'http'] },
    http: { ko: 'HTTP', en: 'HYPERTEXT TRANSFER', desc: '웹의 언어. "이 주소의 자료를 주세요(GET)" 같은 요청과 응답의 형식을 정해요.', chips: ['GET · POST', '상태 코드', '헤더'], topics: ['HTTP 메서드와 상태 코드', '헤더와 쿠키', 'HTTP/1.1 · 2 · 3'], links: ['tls'] },
    dns: { ko: 'DNS', en: 'DOMAIN NAME SYSTEM', desc: 'shop.com 같은 이름을 93.184.216.34 같은 IP 주소로 바꿔 주는 인터넷의 전화번호부.', chips: ['도메인', '리졸버', '캐시'], topics: ['DNS 조회 과정', '레코드 종류 (A · CNAME · MX)', 'DNS 캐시'], links: ['socket'] },
    socket: { ko: '소켓', en: 'SOCKET API', desc: '프로그램이 네트워크를 쓰는 입구. 운영체제가 주는 연결 손잡이로, 여기에 쓰고 읽으면 데이터가 오가요.', chips: ['connect', 'send', 'recv'], topics: ['소켓 프로그래밍', '포트 번호', '블로킹과 논블로킹 I/O'], links: ['tcp', 'dns'] }
  };

  Scene.spots(T, {
    ip: { spots: [
      ['HDR', 'IP 헤더', 'HEADER', '보내는 주소, 받는 주소, 남은 수명(TTL).', { shape: 'cells', hi: true }],
      ['ROUTE', '라우팅', 'ROUTING', '라우터마다 다음에 갈 곳을 골라 넘겨요.', { shape: 'globe' }],
      ['FRAG', '패킷', 'PACKET', '보통 1500바이트 이하로 쪼개요.', { shape: 'layers' }]
    ] },
    tcp: { label: '연결 맺기', spots: [
      ['SYN', '연결 요청', 'SYN', '"연결해도 될까요?"', { shape: 'wire' }],
      ['ACK', '수락', 'SYN-ACK · ACK', '"좋아요" → "확인" — 세 번 오가면 연결 완료.', { shape: 'wire', hi: true }],
      ['SEQ', '순서 번호', 'SEQUENCE', '바이트마다 번호를 매겨 빠진 걸 찾아 다시 보내요.', { shape: 'cells' }]
    ] },
    tls: { spots: [
      ['CERT', '인증서', 'CERTIFICATE', '"이 서버가 진짜 shop.com"임을 증명해요.', { shape: 'chip', hi: true }],
      ['KEY', '키 합의', 'KEY EXCHANGE', '공개키로 둘만 아는 대칭키를 만들어요.', { shape: 'layers' }],
      ['ENC', '암호화', 'ENCRYPTION', '이후의 모든 데이터를 그 키로 잠가요.', { shape: 'block' }]
    ] },
    http: { spots: [
      ['LINE', '요청 줄', 'REQUEST LINE', 'GET /products HTTP/1.1', { shape: 'cells', hi: true }],
      ['HDRS', '헤더', 'HEADERS', '쿠키, 언어, 받을 형식 같은 부가 정보.', { shape: 'layers' }],
      ['BODY', '본문', 'BODY', 'POST라면 보낼 데이터(JSON 등).', { shape: 'block' }],
      ['CODE', '상태 코드', 'STATUS', '200 성공, 404 없음, 500 서버 오류.', { shape: 'chip' }]
    ] },
    dns: { spots: [
      ['CACHE', '캐시 확인', 'CACHE', '최근에 찾아본 적 있으면 바로 답해요.', { shape: 'cells' }],
      ['RESOLVE', '물어보기', 'RESOLVER', '루트 → .com → shop.com 서버 순으로 물어봐요.', { shape: 'globe', hi: true }],
      ['ANS', '답', 'A RECORD', 'shop.com = 93.184.216.34', { shape: 'chip' }]
    ] },
    socket: { spots: [
      ['OPEN', '열기', 'socket()', '운영체제에게 연결 손잡이를 받아요.', { shape: 'chip' }],
      ['CONN', '연결', 'connect()', '상대 IP와 포트로 TCP 연결을 맺어요.', { shape: 'wire', hi: true }],
      ['IO', '읽고 쓰기', 'send · recv', '파일처럼 쓰고 읽으면 데이터가 오가요.', { shape: 'layers' }]
    ] }
  });

  const S = Scene.create({ T, cx: 440, cy: 300 });
  const { P, f, top, box, part, linked } = S;
  const GAP = 46, X = -200, Y = -120, W = 200, D = 150;
  // 층마다 이름을 판 앞쪽 가장자리에 (위층에 가리지 않게)
  const IDS = ['ip', 'tcp', 'tls', 'http'], leftA = {};
  const layers = IDS.map((id, k) => {
    const z0 = k * GAP, light = 13 + k * 5;
    leftA[id] = P(X, Y + D, z0 + 6);
    return part(id, k * 0.4,
      box(X, Y, W, D, z0, 12, 'layer-top', `fill:hsl(var(--h) calc(55% * var(--sat)) ${light}%)`) +
      top(z0 + 12, `<text class="layer-num" x="${X + 12}" y="${Y + D - 12}">${T[id].ko}</text><text class="lbl lbl--dim" x="${X + 12 + T[id].ko.length * 9 + 10}" y="${Y + D - 12}">${T[id].en}</text>`),
      { cls: 'layer', lift: true, hit: S.hit(X, Y, W, D, z0, z0 + GAP) });
  }).join('');
  const st = { svg: layers, leftAnchors: leftA };

  const mod = (x, y, w, d, h, name, extra = '', cls = 'core-block') => box(x, y, w, d, 0, h, cls) + top(h, `<text class="lbl lbl--lg" x="${x + 8}" y="${y + 18}">${name}</text>${extra}`);
  const dns = part('dns', 4, mod(60, -230, 80, 70, 34, 'DNS',
    `<path class="stroke-dim" d="M68 -200 h40 M68 -190 h56 M68 -180 h32"/><rect class="cell cell--hi" x="110" y="-200" width="22" height="14" rx="2"/>`, 'cache-top'));
  const socket = part('socket', 5, mod(60, -90, 80, 70, 20, 'SOCKET',
    `<circle class="stroke-lav" cx="100" cy="-48" r="14"/><circle class="fill-lav" cx="100" cy="-48" r="4"/>`));

  // 소켓 ↔ TCP 층, DNS ↔ 소켓
  const zT = GAP + 6;
  const toTcp = [P(60, -55, 10), P(X + W, -55, 10), P(X + W, -55, zT)].map(p => p.map(f).join(',')).join(' L');
  const toDns = [P(100, -90, 10), P(100, -160, 10)].map(p => p.map(f).join(',')).join(' L');
  const wires = linked('socket', `<path class="wire wire--dash" d="M${toTcp}"/><path class="packet" d="M${toTcp}" pathLength="100"/><path class="wire wire--dash" d="M${toDns}"/>`);

  const side = S.sideTags(['ip', 'tcp', 'tls', 'http'].map((id, k) => ({ id, a: st.leftAnchors[id], lx: 150, n: `L${[3, 4, 5, 7][k]}` })), 'left');
  const tags = S.tags([
    { id: 'dns', a: P(100, -195, 34), l: [790, 140] },
    { id: 'socket', a: P(100, -55, 20), l: [700, 440], below: true, end: [700, 400] }
  ]);

  const A = k => [X + W / 2, Y + D / 2, k * GAP + 12];
  S.mount(S.floor(320) + wires + st.svg + dns + socket + side + tags, {
    defaultHint: '층이나 구성 요소를 눌러 자세히 보기',
    viewBox: '0 -40 940 600',
    routes: { plane: 0, mode: 'lift', anchors: { ip: A(0), tcp: A(1), tls: A(2), http: A(3), dns: [100, -195, 34], socket: [100, -55, 20] } }
  });
})();
