/* =========================================================
   Software / 응용 프로그램 — 내가 짠 코드와 그 코드가 다루는 것
   왼쪽: 메모 앱 창(직접 눌러 보는 곳) · UI 스레드의 이벤트 루프 · 앱의 상태
   오른쪽: 그 앱의 소스 코드(언어마다 다름) · 아래 층에 부탁하는 일
   '저장'을 누르면 실행되는 줄이 차례로 강조되고 상태와 화면이 바뀜
   ========================================================= */
(() => {
  const L = (c, java, python) => ({ c, java, python });
  const T = {
    ui: { ko: '앱 화면', en: 'USER INTERFACE', desc: '사용자가 보고 누르는 창. 버튼을 누르면 운영체제가 받은 마우스 신호가 앱의 클릭 이벤트가 되어 도착해요.', chips: ['버튼', '편집창', '이벤트'], topics: ['UI 프레임워크', '이벤트와 콜백', '화면 갱신'], links: ['loop', 'state'] },
    loop: { ko: '이벤트 루프', en: 'EVENT LOOP · UI THREAD', desc: 'UI 스레드가 도는 반복문. 클릭 · 키 입력 같은 이벤트를 큐에서 하나씩 꺼내, 연결해 둔 내 함수를 불러요.', chips: ['이벤트 큐', 'UI 스레드', '콜백'], topics: ['이벤트 루프의 구조', '화면이 멈추는 이유', 'UI 스레드 규칙'], links: ['ui', 'handler'] },
    handler: { ko: '내 코드', en: 'MY CODE', desc: '내가 짠 부분. 버튼이 눌렸을 때 무엇을 할지 적혀 있어요. 실행되는 줄이 강조돼요.', chips: ['함수', '콜백', '스레드 요청'], topics: ['이벤트 처리 함수', '긴 작업을 다른 스레드로', '함수 호출과 스택'], links: ['loop', 'state', 'io'] },
    state: { ko: '앱 상태', en: 'STATE', desc: '앱이 기억하는 값. 메모 내용, 저장 중인지, 저장됐는지. 화면은 이 값을 따라 그려져요.', chips: ['변수', '객체', '화면 = f(상태)'], topics: ['상태와 화면', '상태 관리', '공유 상태와 동기화'], links: ['ui', 'handler'] },
    io: { ko: '아래 층에 부탁', en: 'CALLS DOWN', desc: '내 코드가 혼자 못 하는 일. 스레드 만들기, 파일 쓰기는 언어 · 실행과 운영체제에 부탁해야 해요.', chips: ['라이브러리', '시스템 콜'], topics: ['표준 라이브러리', '스레드 생성의 뒤편', '파일 쓰기의 뒤편'], links: ['handler'] }
  };
  const BY = {
    handler: L('C로 짠 메모 앱(GTK). 버튼에 on_save를 연결해 두고, 저장은 pthread로 만든 작업 스레드가 해요.', 'Java로 짠 메모 앱. 버튼에 onSave를 연결해 두고, 저장은 new Thread로 만든 작업 스레드가 해요.', 'Python으로 짠 메모 앱. 버튼에 on_save를 연결해 두고, 저장은 threading.Thread로 만든 작업 스레드가 해요.'),
    io: L('pthread_create · fputs는 C 표준 라이브러리(libc)가 받아 운영체제에 넘겨요.', 'Thread.start · Files.writeString은 JVM이 받아 운영체제에 넘겨요.', 'threading · f.write는 CPython(속은 C)이 받아 운영체제에 넘겨요.')
  };
  Object.entries(BY).forEach(([k, v]) => Object.defineProperty(T[k], 'desc', { get: () => (window.KBLang ? KBLang.pick(v) : v.java), configurable: true }));

  Scene.spots(T, {
    ui: { spots: [
      ['EDIT', '편집창', 'EDITOR', '글자를 입력하는 곳. 내용은 앱의 상태로 기억돼요.', { shape: 'screen' }],
      ['BTN', '저장 버튼', 'BUTTON', '누르면 클릭 이벤트가 생겨요.', { shape: 'chip', hi: true }],
      ['BAR', '상태 표시줄', 'STATUS', '"저장 중…" · "저장됨"처럼 상태를 보여 줘요.', { shape: 'layers' }]
    ] },
    loop: { label: '한 바퀴', spots: [
      ['WAIT', '기다리기', 'WAIT', '할 일이 없으면 이벤트가 올 때까지 잠들어 있어요.', { shape: 'chip' }],
      ['TAKE', '꺼내기', 'DEQUEUE', '큐에서 이벤트를 하나 꺼내요.', { shape: 'cells', hi: true }],
      ['CALL', '내 함수 부르기', 'DISPATCH', '그 이벤트에 연결된 내 함수를 불러요. 함수가 끝나야 다음 이벤트로 가요.', { shape: 'wire' }]
    ] },
    handler: { spots: [
      ['BIND', '연결', 'CALLBACK', '"이 버튼이 눌리면 이 함수를 불러 줘"라고 미리 등록해요.', { shape: 'wire' }],
      ['RUN', '실행', 'HANDLER', '이벤트가 오면 함수가 UI 스레드에서 실행돼요.', { shape: 'chip', hi: true }],
      ['SPAWN', '작업 넘기기', 'WORKER', '오래 걸리는 일은 작업 스레드에 넘겨야 화면이 멈추지 않아요.', { shape: 'layers' }]
    ] },
    state: { spots: [
      ['TEXT', '메모 내용', 'TEXT', '편집창에 적힌 글자.', { shape: 'cells' }],
      ['STATUS', '진행 상태', 'STATUS', '대기 → 저장 중 → 저장됨.', { shape: 'chip', hi: true }],
      ['SAVED', '저장 여부', 'SAVED', '디스크에 저장됐는지 표시.', { shape: 'block' }]
    ] },
    io: { spots: [
      ['THREAD', '스레드 만들기', 'SPAWN', '언어 · 실행이 스택을 하나 더 만들고, 운영체제가 스케줄러에 등록해요.', { shape: 'layers', hi: true }],
      ['WRITE', '파일 쓰기', 'WRITE', '라이브러리를 거쳐 write() 시스템 콜이 돼요.', { shape: 'disk' }]
    ] }
  });

  const S = Scene.create({ T });
  const { part, linked } = S;
  const ln = (c, j, p) => `<tspan class="l-c">${c}</tspan><tspan class="l-java">${j}</tspan><tspan class="l-python">${p}</tspan>`;
  const tile = (x, y, w, h, en, ko, cls = 'ofl-k') => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>` +
    `<text class="ofl-k-en" x="${x + 14}" y="${y + 22}">${en}</text><text class="ofl-k-ko" x="${x + w - 14}" y="${y + 22}" text-anchor="end">${ko}</text>`;
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---------- 왼쪽 위: 메모 앱 창 (직접 누르는 곳) ---------- */
  const ui = part('ui', 0,
    `<rect class="app-win" x="30" y="30" width="340" height="300" rx="12"/>` +
    `<path class="app-bar" d="M30,58 V42 a12,12 0 0 1 12,-12 H358 a12,12 0 0 1 12,12 V58 Z"/>` +
    [0, 1, 2].map(k => `<circle class="app-dot" cx="${48 + k * 14}" cy="44" r="4"/>`).join('') +
    `<text class="ofl-seg-k" x="200" y="48" text-anchor="middle">메모 — note.txt</text>` +
    `<rect class="app-edit" x="46" y="70" width="308" height="180" rx="6"/>` +
    ['장보기', '- 우유', '- 계란 10개', '- 사과'].map((t, k) => `<text class="app-memo" x="60" y="${98 + k * 26}">${t}</text>`).join('') +
    `<rect class="app-caret" x="104" y="${80 + 3 * 26}" width="1.6" height="22"><animate attributeName="opacity" values="1;0;1" dur="1.1s" calcMode="discrete" repeatCount="indefinite"/></rect>` +
    `<g id="kbSave" class="app-btn" role="button" tabindex="0" aria-label="저장 눌러 보기"><rect class="app-btn__ring" x="244" y="258" width="116" height="42" rx="11"/><rect class="app-btn__bg" x="250" y="262" width="104" height="34" rx="8"/><text class="app-btn__t" x="302" y="284" text-anchor="middle">저장</text></g>` +
    `<text class="app-try" x="236" y="284" text-anchor="end">눌러 보세요 →</text>` +
    `<path class="app-sep" d="M30,306 H370"/><text id="kbBar" class="ofl-seg-k" x="46" y="322">대기 중</text>`);

  /* ---------- 왼쪽 가운데: 이벤트 루프 (UI 스레드) ---------- */
  const loop = part('loop', 1, tile(30, 356, 340, 116, 'EVENT LOOP', 'UI 스레드') +
    `<circle class="stroke-lav" cx="78" cy="420" r="22"/><g><path class="rtf-head" d="M78,398 l7,-5 v10 z"/><animateTransform attributeName="transform" type="rotate" from="0 78 420" to="360 78 420" dur="3s" repeatCount="indefinite"/></g>` +
    `<text class="ofl-seg-t" x="112" y="414">이벤트를 하나씩 꺼내</text><text class="ofl-seg-k" x="112" y="430">연결된 내 함수를 불러요</text>` +
    `<text class="ofl-zone" x="232" y="450">EVENT QUEUE</text>` +
    [0, 1, 2].map(k => `<rect class="app-slot" x="${232 + k * 44}" y="400" width="38" height="34" rx="5"/>`).join('') +
    `<g id="kbEv" class="app-ev"><rect x="232" y="400" width="38" height="34" rx="5"/><text x="251" y="421" text-anchor="middle">click</text></g>`);

  /* ---------- 왼쪽 아래: 앱 상태 ---------- */
  const row = (y, k, v, id) => `<text class="ofl-seg-k" x="46" y="${y}">${k}</text><text${id ? ` id="${id}"` : ''} class="app-val" x="130" y="${y}">${v}</text>`;
  const state = part('state', 2, tile(30, 498, 340, 116, 'STATE', '앱이 기억하는 값') +
    row(546, 'text', '"장보기\\n- 우유\\n…"') + row(570, 'status', '"대기"', 'kbStStatus') + row(594, 'saved', 'false', 'kbStSaved'));

  /* ---------- 오른쪽: 내 코드 (언어마다 다름) ---------- */
  // 단계: 연결 · 함수 시작 · 글자 꺼내기 · 상태 바꾸기 · 작업 스레드 · 파일 쓰기 · 저장됨
  const CODE = {
    java: { file: 'MemoApp.java', lines: [
      'saveBtn.onClick(e -> onSave());', '', 'void onSave() {', '  String text = editor.getText();', '  status.set("저장 중…");', '  new Thread(() -> {',
      '    Files.writeString(path, text);', '    ui.later(() -> status.set("저장됨"));', '  }).start();', '}'], at: [0, 2, 3, 4, 5, 6, 7] },
    c: { file: 'memo.c', lines: [
      'g_signal_connect(btn, "clicked", on_save, NULL);', '', 'void on_save(GtkWidget *b, gpointer d) {', '  char *text = strdup(get_text(editor));', '  set_status("저장 중…");',
      '  pthread_create(&t, NULL, save_job, text);', '}', 'void *save_job(void *text) {', '  FILE *fp = fopen("note.txt", "w");', '  fputs(text, fp); fclose(fp);', '  g_idle_add(show_saved, NULL);', '}'], at: [0, 2, 3, 4, 5, 9, 10] },
    python: { file: 'memo.py', lines: [
      'save_btn.clicked.connect(on_save)', '', 'def on_save():', '    text = editor.text()', '    status.set("저장 중…")', '    threading.Thread(target=save_job, args=(text,)).start()',
      '', 'def save_job(text):', '    with open("note.txt", "w") as f:', '        f.write(text)', '    ui.later(lambda: status.set("저장됨"))'], at: [0, 2, 3, 4, 5, 9, 10] }
  };
  const CX = 400, CY = 30, CW = 540, LY0 = 96, LH = 27;
  const lineY = i => LY0 + i * LH;
  const codeOf = lang => { const c = CODE[lang]; return `<g class="l-${lang}">` +
    `<rect id="kbHl-${lang}" class="app-hl" x="${CX + 10}" y="${lineY(0) - 18}" width="${CW - 20}" height="${LH - 3}" rx="5"/>` +
    c.lines.map((t, i) => `<text class="app-ln" x="${CX + 30}" y="${lineY(i)}" text-anchor="end">${i + 1}</text><text class="app-code" x="${CX + 44}" y="${lineY(i)}">${esc(t)}</text>`).join('') + `</g>`; };
  const handler = part('handler', 3,
    tile(CX, CY, CW, 440, `내 코드 · ${ln(CODE.c.file, CODE.java.file, CODE.python.file)}`, '버튼이 눌리면 실행되는 줄', 'app-codebox') +
    codeOf('c') + codeOf('java') + codeOf('python') +
    `<g id="kbTag" class="app-tag"><rect x="${CX + CW - 112}" y="0" width="96" height="20" rx="10"/><text x="${CX + CW - 64}" y="14" text-anchor="middle">UI 스레드</text></g>`);

  /* ---------- 오른쪽 아래: 아래 층에 부탁하는 일 ---------- */
  const ioRow = (y, id, name, a, b) => `<g id="${id}" class="app-io"><rect class="app-io__bg" x="${CX + 14}" y="${y}" width="${CW - 28}" height="30" rx="7"/>` +
    `<text class="ofl-seg-t" x="${CX + 26}" y="${y + 19}">${name}</text>` +
    `<text class="ofl-seg-k" x="${CX + 226}" y="${y + 19}">→ ${a}</text><text class="ofl-seg-k" x="${CX + 384}" y="${y + 19}">→ ${b}</text>` +
    `<path class="packet packet--fast app-io__pk" d="M${CX + 210},${y + 15} H${CX + CW - 30}" pathLength="100"/></g>`;
  const io = part('io', 4, tile(CX, 498, CW, 116, 'CALLS DOWN', '내 코드가 혼자 못 하는 일') +
    ioRow(530, 'kbIoThread', ln('pthread_create', 'Thread.start()', 'Thread.start()'), '언어·실행: 스택 하나 더', '운영체제: 스케줄러') +
    ioRow(570, 'kbIoWrite', ln('fputs()', 'Files.writeString()', 'f.write()'), ln('libc', 'JVM', 'CPython'), '시스템 콜 write()'));

  S.mount(ui + loop + state + handler + io, {
    defaultHint: '메모 앱의 "저장"을 눌러 보세요 · 내 코드가 실행되는 줄이 차례로 강조돼요',
    viewBox: '0 0 960 640',
    routes: { mode: 'flat', anchors: { ui: [200, 180], loop: [200, 414], state: [200, 556], handler: [670, 250], io: [670, 556] } }
  });

  /* ---------- 실습: '저장'을 누르면 한 단계씩 ---------- */
  const $ = id => document.getElementById(id);
  const svg = $('board');
  const STEPS = [
    { thread: 'UI 스레드', ev: 'in', bar: '클릭!' },
    { thread: 'UI 스레드', ev: 'out' },
    { thread: 'UI 스레드' },
    { thread: 'UI 스레드', status: '"저장 중…"', bar: '저장 중…' },
    { thread: 'UI 스레드', io: 'kbIoThread' },
    { thread: '작업 스레드', worker: true, io: 'kbIoWrite' },
    { thread: '작업 → UI', worker: true, status: '"저장됨"', saved: 'true', bar: '저장됨 ✓' }
  ];
  let k = -1, timer = null;
  const lang = () => (window.KBLang && KBLang.get()) || 'java';
  function place() {
    const on = k >= 0;
    svg.classList.toggle('app-running', on);
    ['c', 'java', 'python'].forEach(l => { const hl = $(`kbHl-${l}`); if (!hl) return; hl.classList.toggle('is-on', on); hl.classList.toggle('is-worker', on && !!STEPS[k].worker); if (on) hl.setAttribute('y', lineY(CODE[l].at[k]) - 18); });
    const tag = $('kbTag');
    tag.classList.toggle('is-on', on); tag.classList.toggle('is-worker', on && !!STEPS[k].worker);
    if (on) { tag.setAttribute('transform', `translate(0 ${lineY(CODE[lang()].at[k]) - 15})`); tag.querySelector('text').textContent = STEPS[k].thread; }
  }
  function show(n) {
    k = n; const st = STEPS[n] || {};
    if (n === 0) { $('kbStStatus').textContent = '"대기"'; $('kbStSaved').textContent = 'false'; ['kbIoThread', 'kbIoWrite'].forEach(i => $(i).classList.remove('is-on', 'is-done')); }
    const ev = $('kbEv'); ev.classList.toggle('is-in', st.ev === 'in'); ev.classList.toggle('is-out', st.ev === 'out');
    if (st.bar) $('kbBar').textContent = st.bar;
    if (st.status) { const s = $('kbStStatus'); s.textContent = st.status; s.classList.remove('is-flash'); void s.getBBox(); s.classList.add('is-flash'); }
    if (st.saved) { const s = $('kbStSaved'); s.textContent = st.saved; s.classList.remove('is-flash'); void s.getBBox(); s.classList.add('is-flash'); }
    ['kbIoThread', 'kbIoWrite'].forEach(i => { const g = $(i); if (g.classList.contains('is-on') && st.io !== i) { g.classList.remove('is-on'); g.classList.add('is-done'); } });
    if (st.io) $(st.io).classList.add('is-on');
    place();
  }
  function run() {
    clearTimeout(timer);
    const gap = window.KB_REDUCED ? 500 : 1300;
    let n = 0;
    const tick = () => {
      if (n < STEPS.length) { show(n++); timer = setTimeout(tick, gap); return; }
      timer = setTimeout(() => { k = -1; place(); ['kbIoThread', 'kbIoWrite'].forEach(i => $(i).classList.remove('is-on')); }, gap * 2);
    };
    tick();
  }
  const btn = $('kbSave');
  ['click', 'pointerdown'].forEach(t => btn.addEventListener(t, e => { e.stopPropagation(); if (t === 'click') { btn.classList.add('is-pressed'); setTimeout(() => btn.classList.remove('is-pressed'), 160); run(); } }));
  btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); run(); } });
  window.KBLang?.on(() => place());
})();
