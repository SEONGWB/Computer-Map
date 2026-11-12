/* =========================================================
   Hardware / Network — 네트워크 장비 구성도 + OSI 7계층 탑
   ========================================================= */
(() => {
  const OSI = ['osi1', 'osi2', 'osi3', 'osi4', 'osi5', 'osi6', 'osi7'];
  const T = {
    internet: { ko: '인터넷', en: 'INTERNET · WAN', desc: '전 세계 네트워크가 서로 연결된 거대한 망. ISP를 통해 집과 회사의 네트워크가 여기에 이어집니다.', topics: ['ISP와 WAN', 'IP 주소 체계', 'DNS 동작 원리'] },
    router: { ko: '라우터', en: 'ROUTER', desc: '서로 다른 네트워크 사이에서 패킷이 갈 길을 정해 전달하는 장비. 3계층(네트워크)에서 동작합니다.', topics: ['라우팅 테이블', 'NAT', '기본 게이트웨이'], links: ['osi3'] },
    switch: { ko: '스위치', en: 'SWITCH', desc: '같은 네트워크 안의 장비들을 연결하고, MAC 주소를 보고 필요한 곳에만 프레임을 보내는 장비. 2계층에서 동작합니다.', topics: ['MAC 주소와 스위칭', 'VLAN', '허브와 스위치의 차이'], links: ['osi2'] },
    client: { ko: '클라이언트', en: 'CLIENT', desc: '서비스를 요청하는 쪽의 컴퓨터. 랜카드(NIC)와 케이블로 네트워크에 연결됩니다.', topics: ['클라이언트-서버 모델', 'NIC와 이더넷', 'DHCP'], links: ['osi7', 'osi4'] },
    server: { ko: '서버', en: 'SERVER', desc: '요청을 받아 응답을 돌려주는 컴퓨터. 웹, 파일, DB 등 다양한 서비스를 제공합니다.', topics: ['웹 서버와 HTTP', '포트와 소켓', '로드 밸런싱'], links: ['osi7', 'osi4'] },
    wifi: { ko: '무선 네트워크', en: 'WIRELESS', desc: '케이블 대신 전파로 연결하는 네트워크. AP(무선 공유기)가 유선망과 무선 기기를 이어줍니다.', topics: ['Wi-Fi 표준', 'AP와 SSID', '무선 보안 (WPA)'], links: ['osi2', 'osi1'] },
    cable: { ko: '케이블', en: 'CABLE', desc: '' },
    osi: { ko: 'OSI 7계층', en: 'OSI MODEL', desc: '네트워크 통신을 7개의 층으로 나눠 설명하는 표준 모델. 각 층은 아래층의 기능을 이용해 위층에 서비스를 제공합니다.', children: OSI, childOrder: [...OSI].reverse(), childLabel: '계층 (위에서 아래로)' },
    osi7: { short: 'L7', ko: '응용 계층', en: 'L7 · APPLICATION', desc: '사용자가 쓰는 프로그램이 네트워크와 만나는 층.', chips: ['HTTP', 'DNS', 'SMTP', 'FTP'], topics: ['HTTP 요청과 응답', 'DNS 질의 과정'], links: ['client', 'server'] },
    osi6: { short: 'L6', ko: '표현 계층', en: 'L6 · PRESENTATION', desc: '데이터의 형식을 바꾸고, 암호화와 압축을 담당하는 층.', chips: ['TLS', 'JPEG', 'UTF-8'], topics: ['인코딩과 압축', 'TLS 암호화'] },
    osi5: { short: 'L5', ko: '세션 계층', en: 'L5 · SESSION', desc: '통신하는 양쪽의 연결(세션)을 만들고 유지하고 끝내는 층.', chips: ['세션', 'RPC'], topics: ['세션 관리', '동기화와 재개'] },
    osi4: { short: 'L4', ko: '전송 계층', en: 'L4 · TRANSPORT', desc: '데이터가 빠짐없이, 순서대로 도착하도록 책임지는 층. 포트 번호로 프로그램을 구분합니다.', chips: ['TCP', 'UDP', '포트'], topics: ['TCP 3-way 핸드셰이크', 'TCP와 UDP 비교', '흐름 제어와 혼잡 제어'], links: ['client', 'server'] },
    osi3: { short: 'L3', ko: '네트워크 계층', en: 'L3 · NETWORK', desc: 'IP 주소로 목적지를 찾고, 여러 네트워크를 거쳐 가는 경로를 정하는 층.', chips: ['IP', 'ICMP', '라우팅'], topics: ['IPv4와 IPv6', '서브넷 마스크', 'ICMP와 ping'], links: ['router'] },
    osi2: { short: 'L2', ko: '데이터 링크 계층', en: 'L2 · DATA LINK', desc: '같은 네트워크 안에서 MAC 주소로 옆 장비에게 프레임을 전달하는 층.', chips: ['Ethernet', 'MAC', 'ARP'], topics: ['이더넷 프레임', 'ARP', '오류 검출'], links: ['switch', 'wifi'] },
    osi1: { short: 'L1', ko: '물리 계층', en: 'L1 · PHYSICAL', desc: '0과 1을 전기, 빛, 전파 신호로 바꿔 실제로 보내는 층.', chips: ['케이블', '광섬유', '전파'], topics: ['UTP 케이블과 광케이블', '신호와 대역폭'], links: ['cable', 'wifi'] }
  };

  T.client.flows = [{ route: 'network-memory', label: '패킷이 컴퓨터 안으로 들어가기까지', desc: '랜 포트 → NIC → 칩셋 → RAM (DMA)' }];
  T.wifi.flows = [{ route: 'network-memory', label: '받은 패킷이 메모리에 도착하기까지', desc: 'NIC → 칩셋 → RAM (DMA) → CPU 인터럽트' }];

  /* ---------- 설명창 분해 그림: 구성 요소 ---------- */
  const PKT = { label: 'RAM까지 따라가기', route: 'network-memory' };
  Scene.spots(T, {
    internet: { spots: [
      ['ISP', '인터넷 서비스 제공자', 'ISP', '집과 회사를 인터넷에 이어 주는 통신사의 망입니다.', { shape: 'tall' }],
      ['IX', '인터넷 교환점', 'EXCHANGE POINT', '여러 ISP가 한곳에 모여 서로의 트래픽을 넘겨주는 곳입니다.', { shape: 'chip' }],
      ['BACKBONE', '백본망', 'BACKBONE', '나라와 대륙을 잇는 초고속 광케이블 중심망. 해저 케이블도 여기에 속합니다.', { shape: 'wire' }],
      ['DNS', 'DNS 서버', 'DNS', '도메인 이름(example.com)을 IP 주소로 바꿔 주는 인터넷의 전화번호부입니다.', { shape: 'globe' }]
    ] },
    router: { spots: [
      ['WAN', 'WAN 포트', 'WAN PORT', '바깥 인터넷(ISP)과 이어지는 포트. 공인 IP를 받습니다.', { shape: 'block' }],
      ['NAT', '주소 변환', 'NAT', '집 안의 사설 IP 여러 개를 공인 IP 하나로 바꿔 내보내고, 돌아온 응답을 다시 나눠 줍니다.', { shape: 'chip', hi: true }],
      ['TABLE', '라우팅 테이블', 'ROUTING TABLE', '목적지 IP를 보고 패킷을 어느 쪽으로 보낼지 정하는 표입니다.', { shape: 'cells' }],
      ['LAN', 'LAN 포트', 'LAN PORTS', '집 안의 장비들이 연결되는 포트. 보통 DHCP로 사설 IP를 나눠 줍니다.', { shape: 'block' }]
    ] },
    switch: { spots: [
      ['PORT', '포트', 'PORTS', '장비마다 하나씩 케이블이 꽂히는 자리. 포트마다 따로 통신해 충돌이 없습니다.', { shape: 'block' }],
      ['MAC', 'MAC 주소 테이블', 'MAC TABLE', '어느 포트 뒤에 어떤 MAC 주소가 있는지 스스로 배워 두는 표입니다.', { shape: 'cells' }],
      ['ASIC', '스위칭 칩', 'SWITCH ASIC', '프레임의 목적지 MAC을 보고 맞는 포트로만 순식간에 전달하는 전용 칩입니다.', { shape: 'chip', hi: true }],
      ['VLAN', '가상 랜', 'VLAN', '스위치 하나를 여러 개의 독립된 네트워크처럼 나눠 씁니다.', { shape: 'layers' }]
    ] },
    client: { spots: [
      ['APP', '응용 프로그램', 'BROWSER', '브라우저처럼 실제로 요청을 만들어 보내는 프로그램입니다.', { shape: 'screen' }],
      ['TCP/IP', '네트워크 스택', 'OS NETWORK STACK', '운영체제 안에서 데이터를 TCP/IP 패킷으로 포장하고 푸는 부분입니다.', { shape: 'layers' }],
      ['NIC', '랜카드', 'NETWORK CARD', '컴퓨터를 네트워크에 잇는 장치. 고유한 MAC 주소가 있고, 받은 패킷을 RAM에 바로 씁니다(DMA).', { shape: 'board', hi: true, action: PKT }]
    ] },
    server: { spots: [
      ['NIC', '네트워크 카드', 'NETWORK CARD', '수많은 요청을 받아들이는 고속 랜카드. 10G·25G처럼 빠른 것을 씁니다.', { shape: 'board' }],
      ['WEB', '웹 서버', 'WEB SERVER', '80·443번 포트에서 HTTP 요청을 기다리다가 응답을 돌려줍니다.', { shape: 'tall', hi: true }],
      ['APP', '애플리케이션', 'APPLICATION', '로그인, 주문처럼 요청을 실제로 처리하는 프로그램 로직입니다.', { shape: 'chip' }],
      ['DB', '데이터베이스', 'DATABASE', '데이터를 저장하고 빠르게 찾아 주는 곳입니다.', { shape: 'disk' }]
    ] },
    wifi: { spots: [
      ['AP', '무선 AP', 'ACCESS POINT', '유선망과 무선 기기를 이어 주는 장치. 전파를 쏘고 받습니다.', { shape: 'antenna', hi: true }],
      ['SSID', '네트워크 이름', 'SSID', 'AP가 주변에 알리는 이름. 기기는 이 이름을 보고 접속합니다.', { shape: 'block' }],
      ['BAND', '주파수 대역', '2.4 · 5 · 6 GHz', '2.4GHz는 멀리 가고, 5·6GHz는 빠르지만 벽에 약합니다.', { shape: 'layers' }],
      ['WPA3', '무선 암호화', 'SECURITY', '공중으로 퍼지는 전파를 남이 엿보지 못하게 암호화합니다.', { shape: 'chip' }],
      ['STA', '무선 단말', 'STATION', '노트북, 스마트폰처럼 AP에 접속하는 기기입니다.', { shape: 'screen', action: PKT }]
    ] },
    osi: { layout: 'stack', fromChildren: true, label: '7계층 · 눌러서 강조', gap: 40 },
    osi7: { spots: [
      ['HTTP', 'HTTP', 'WEB', '웹 페이지와 데이터를 요청하고 응답받는 규칙입니다.', { hi: true }],
      ['DNS', 'DNS', 'NAME', '도메인 이름을 IP 주소로 바꿔 줍니다.', { shape: 'globe' }],
      ['SMTP', 'SMTP', 'MAIL', '메일을 보내는 규칙입니다.'],
      ['FTP', 'FTP', 'FILE', '파일을 주고받는 규칙입니다.']
    ] },
    osi6: { spots: [
      ['TLS', 'TLS 암호화', 'ENCRYPTION', '주고받는 내용을 암호화해 중간에서 엿보지 못하게 합니다(HTTPS).', { shape: 'chip', hi: true }],
      ['JPEG', '압축 형식', 'COMPRESSION', '이미지·영상을 작게 줄여 보내는 형식입니다.', { shape: 'layers' }],
      ['UTF-8', '문자 인코딩', 'ENCODING', '글자를 바이트로 바꾸는 약속. 한글도 여기서 바이트가 됩니다.']
    ] },
    osi5: { spots: [
      ['OPEN', '세션 열기', 'ESTABLISH', '통신할 양쪽이 대화를 시작하기로 약속합니다.'],
      ['KEEP', '세션 유지', 'MAINTAIN', '대화가 이어지는 동안 상태를 기억하고 관리합니다.', { hi: true }],
      ['SYNC', '동기화·재개', 'CHECKPOINT', '중간에 끊겨도 마지막 확인 지점부터 다시 이어 갑니다.'],
      ['CLOSE', '세션 닫기', 'TERMINATE', '대화를 깔끔하게 끝냅니다.']
    ] },
    osi4: { spots: [
      ['TCP', 'TCP', 'RELIABLE', '연결을 맺고, 순서를 맞추고, 잃어버린 건 다시 보냅니다. 느리지만 확실합니다.', { hi: true }],
      ['UDP', 'UDP', 'FAST', '확인 없이 바로 보냅니다. 빠르지만 일부가 사라질 수 있어요(게임, 영상통화).'],
      ['PORT', '포트 번호', 'PORT', '한 컴퓨터 안에서 어느 프로그램에게 갈 데이터인지 구분하는 번호입니다.', { shape: 'cells' }]
    ] },
    osi3: { spots: [
      ['IP', 'IP 주소', 'ADDRESS', '목적지를 찾아가는 주소. IPv4와 IPv6가 있습니다.', { hi: true }],
      ['ROUTE', '라우팅', 'ROUTING', '여러 네트워크를 거쳐 가는 경로를 고릅니다.', { shape: 'cells' }],
      ['ICMP', 'ICMP', 'CONTROL', '오류와 상태를 알리는 메시지. ping이 이것을 씁니다.']
    ] },
    osi2: { spots: [
      ['FRAME', '이더넷 프레임', 'ETHERNET', '데이터를 프레임이라는 단위로 포장해 옆 장비에 보냅니다.', { shape: 'layers' }],
      ['MAC', 'MAC 주소', 'MAC ADDRESS', '랜카드마다 붙은 고유 주소. 같은 네트워크 안에서 상대를 찾을 때 씁니다.', { hi: true }],
      ['ARP', 'ARP', 'IP → MAC', 'IP 주소로 상대의 MAC 주소를 알아내는 방법입니다.']
    ] },
    osi1: { spots: [
      ['UTP', '구리선', 'COPPER', '전기 신호로 0과 1을 보냅니다. 랜선이 여기에 속해요.', { shape: 'wire' }],
      ['FIBER', '광섬유', 'FIBER', '빛으로 신호를 보내 아주 멀리, 아주 빠르게 갑니다.', { shape: 'wire', hi: true }],
      ['RADIO', '전파', 'RADIO', '공기 중으로 퍼지는 전파로 보냅니다. Wi-Fi와 LTE가 여기에 속해요.', { shape: 'antenna' }]
    ] }
  });

  // 장치가 아니라 구조를 보여 주는 개념 항목 (설명창에 '개념 · 구조' 표시)
  ['osi', 'osi1', 'osi2', 'osi3', 'osi4', 'osi5', 'osi6', 'osi7'].forEach(k => { T[k].kind = 'concept'; });

  const S = Scene.create({ T, cx: 440, cy: 320 });
  const { P, f, pts, top, box, onFaceA, onFaceB, flatPath, part } = S;

  /* ---------- 케이블 ---------- */
  const GLOBE = (() => { const [x, y] = P(-200, -170, 0); return [x, y - 72]; })();
  const ROUTER_TOP = P(-130, -80, 16);
  const CABLES = [
    flatPath([[-130, -60], [-130, -24], [-40, -24], [-40, -8]]),
    flatPath([[-85, 28], [-85, 42], [-190, 42]]),
    flatPath([[-70, 28], [-70, 108], [-175, 108]]),
    flatPath([[-55, 28], [-55, 166], [-110, 166]]),
    flatPath([[5, 28], [5, 152], [90, 152]]),
    flatPath([[-100, -86], [10, -86], [10, -62], [25, -62]])
  ];
  const BEAM = `M${GLOBE[0]},${GLOBE[1] + 38} L${f(ROUTER_TOP[0])},${f(ROUTER_TOP[1] - 4)}`;
  const cables = S.linked('cable',
    CABLES.map(d => `<path class="wire" d="${d}"/>`).join('') + `<path class="wire wire--dash" d="${BEAM}"/>` +
    [...CABLES, BEAM].map((d, i) => `<path class="packet" d="${d}" pathLength="100" style="animation-delay:${-i * 0.45}s"/>`).join(''));

  /* ---------- 장비 ---------- */
  const internet = (() => {
    const [x, y] = GLOBE, r = 36;
    return part('internet', 0,
      `<circle class="globe-glow" cx="${x}" cy="${y}" r="${r + 14}"/><circle class="globe" cx="${x}" cy="${y}" r="${r}"/>` +
      `<g class="globe-lines"><ellipse cx="${x}" cy="${y}" rx="${r * 0.42}" ry="${r}"/><ellipse cx="${x}" cy="${y}" rx="${r * 0.8}" ry="${r}"/>` +
      `<path d="M${x - r} ${y} H${x + r} M${x - r * 0.87} ${y - r * 0.5} H${x + r * 0.87} M${x - r * 0.87} ${y + r * 0.5} H${x + r * 0.87}"/></g>` +
      `<ellipse class="orbit" cx="${x}" cy="${y}" rx="${r + 22}" ry="11" transform="rotate(-18 ${x} ${y})"/>` +
      `<circle class="satellite" r="3.5"><animateMotion dur="5s" repeatCount="indefinite" path="M${x - r - 22},${y} a${r + 22},11 0 1,0 ${2 * (r + 22)},0 a${r + 22},11 0 1,0 ${-2 * (r + 22)},0"/></circle>`);
  })();

  const router = (() => {
    const a1 = P(-155, -98, 16), a2 = P(-105, -98, 16);
    let leds = '';
    for (let k = 0; k < 5; k++) { const [lx, ly] = P(-152 + k * 9, -60, 9); leds += `<circle class="led" cx="${f(lx)}" cy="${f(ly)}" r="2" style="animation-delay:${k * 0.23}s"/>`; }
    return part('router', 1,
      box(-160, -100, 60, 40, 0, 16, 'dev-top') + leds +
      `<path class="antenna" d="M${f(a1[0])},${f(a1[1])} v-34 M${f(a2[0])},${f(a2[1])} v-34"/>` +
      `<circle class="antenna-tip" cx="${f(a1[0])}" cy="${f(a1[1] - 34)}" r="2.6"/><circle class="antenna-tip" cx="${f(a2[0])}" cy="${f(a2[1] - 34)}" r="2.6"/>` +
      top(16, `<text class="mini" x="-152" y="-76">ROUTER</text>`));
  })();

  const pc = (x, y) =>
    box(x, y, 16, 30, 0, 34, 'dev-top') + onFaceB(x + 16, y + 6, y + 10, 26, 28, 'led-strip') +
    box(x + 26, y + 16, 6, 8, 0, 10) + box(x + 24, y - 2, 4, 40, 10, 28, 'dev-top') +
    onFaceB(x + 28, y + 2, y + 34, 13, 35, 'screen') + onFaceA(y + 46, x + 2, x + 20, 0, 1.5, 'keyboard');
  // 보드의 랜카드가 이어지는 '내 컴퓨터' 표시
  const here = (() => { const [x, y] = P(-222, 35, 64); return `<g class="here"><path class="here__line" d="M${f(x)},${f(y + 10)} V${f(y + 26)}"/><rect class="here__pill" x="${f(x - 30)}" y="${f(y - 9)}" width="60" height="19" rx="9.5"/><text class="here__txt" x="${f(x)}" y="${f(y + 4)}">내 컴퓨터</text></g>`; })();
  const client = part('client', 2, pc(-230, 20) + pc(-215, 90) + pc(-150, 150) + here);

  const sw = (() => {
    let ports = '', leds = '';
    for (let k = 0; k < 8; k++) ports += onFaceA(28, -84 + k * 13, -76 + k * 13, 3, 9, 'port-hole');
    for (let k = 0; k < 8; k++) { const [lx, ly] = P(-82 + k * 13, 22, 12); leds += `<circle class="led" cx="${f(lx)}" cy="${f(ly)}" r="1.8" style="animation-delay:${(k * 0.37) % 1.5}s"/>`; }
    return part('switch', 3, box(-90, -8, 110, 36, 0, 12, 'dev-top') + ports + leds + top(12, `<text class="mini" x="-82" y="10">SWITCH</text>`));
  })();

  const wifi = (() => {
    const [ax, ay] = P(40, -60, 10);
    const waves = [14, 26, 38].map((r, k) =>
      `<path class="wave" style="animation-delay:${k * 0.35}s" d="M${f(ax - r)} ${f(ay - 8)} A${r} ${r * 0.6} 0 0 1 ${f(ax + r)} ${f(ay - 8)}"/>`).join('');
    const lap = [P(100, -10, 3), P(136, -10, 3), P(136, -16, 27), P(100, -16, 27)];
    const lapScreen = [P(103, -11, 6), P(133, -11, 6), P(133, -15, 24), P(103, -15, 24)];
    return part('wifi', 4,
      box(28, -72, 24, 24, 0, 6, 'dev-top') +
      `<ellipse class="ap-dome" cx="${f(ax)}" cy="${f(ay)}" rx="14" ry="6"/><circle class="led" cx="${f(ax)}" cy="${f(ay)}" r="2"/>` + waves +
      box(100, -10, 36, 26, 0, 3, 'dev-top') +
      `<polygon class="ft dev-top" points="${pts(lap)}"/><polygon class="screen" points="${pts(lapScreen)}"/>` +
      box(158, -42, 12, 20, 0, 2, 'dev-top') + top(2, `<rect class="phone-screen" x="160" y="-40" width="8" height="16" rx="1.5"/>`));
  })();

  const server = (() => {
    let units = '';
    for (let k = 0; k < 6; k++) {
      const z = 8 + k * 13;
      units += onFaceA(174, 92, 132, z, z + 9, 'unit') + onFaceB(134, 132, 172, z, z + 9, 'unit');
      const [lx, ly] = P(98, 174, z + 4.5);
      units += `<circle class="led" cx="${f(lx)}" cy="${f(ly)}" r="1.8" style="animation-delay:${k * 0.31}s"/>`;
    }
    return part('server', 6, box(90, 130, 44, 44, 0, 86, 'dev-top') + units);
  })();

  /* ---------- OSI 탑 ---------- */
  const tower = S.stack({ ids: OSI, x: 150, y: -210, w: 80, h: 11, gap: 25, i0: 4, label: id => T[id].short });
  const layerTags = S.sideTags([...OSI].reverse().map(id => ({ id, a: tower.anchors[id], lx: 892, n: T[id].short })));

  const tags = S.tags([
    { id: 'internet', a: [GLOBE[0] - 50, GLOBE[1]], l: [300, 66], end: [342, 62] },
    { id: 'router', a: [f(ROUTER_TOP[0]) - 30, f(ROUTER_TOP[1])], l: [260, 175], end: [304, 170] },
    { id: 'client', a: P(-206, 25, 38), l: [150, 128] },
    { id: 'switch', a: P(-35, 10, 12), l: [290, 438], below: true, end: [290, 400] },
    { id: 'wifi', a: P(40, -60, 26), l: [600, 232] },
    { id: 'server', a: P(134, 152, 50), l: [560, 484], below: true, end: [560, 446] },
    { id: 'osi', a: P(190, -170, 6 * 25 + 11), l: [800, 108] }
  ]);

  S.mount(S.floor() + cables + internet + router + client + sw + wifi + tower.svg + server + tags + layerTags,
    { defaultHint: '랜카드를 지나 컴퓨터 밖으로 나왔어요 · 장비나 계층을 눌러 자세히 보기',
    routes: {
      plane: 0,
      // 계층(L1~L7)은 클라이언트 안에서 일어나는 일 → 데이터는 클라이언트에 머물고 그 계층만 강조
      alias: { osi1: 'client', osi2: 'client', osi3: 'client', osi4: 'client', osi5: 'client', osi6: 'client', osi7: 'client' },
      autoTrace: false,
      anchors: {
        client: [-214, 35, 20], switch: [-35, 10, 12], router: [-130, -80, 16], internet: [-200, -170, 72], server: [112, 152, 60], wifi: [40, -60, 10],
        osi7: [230, -130, 155], osi6: [230, -130, 130], osi5: [230, -130, 105], osi4: [230, -130, 80], osi3: [230, -130, 55], osi2: [230, -130, 30], osi1: [230, -130, 5]
      },
      paths: {
        // 바닥의 랜선 그대로
        'client-switch': [[-214, 35, 20], [-190, 42, 0], [-85, 42, 0], [-85, 28, 0], [-35, 10, 12]],
        'switch-router': [[-35, 10, 12], [-40, -8, 0], [-40, -24, 0], [-130, -24, 0], [-130, -60, 0], [-130, -80, 16]],
        'switch-internet': [[-35, 10, 12], [-40, -8, 0], [-40, -24, 0], [-130, -24, 0], [-130, -60, 0], [-130, -80, 16], [-200, -170, 72]],
        'router-internet': [[-130, -80, 16], [-200, -170, 72]],
        'switch-server': [[-35, 10, 12], [5, 28, 0], [5, 152, 0], [90, 152, 0], [112, 152, 60]]
      }
    }, });
})();
