/* =========================================================
   실습 창 — 뒤로 가기 버튼 아래의 작은 모달
   지금은 디자인 단계: 장면(운영체제 · 언어 · 실행 · 응용 프로그램)과는 아직 연결하지 않음.
   아이콘을 더블클릭하면 단계 안내가 차례로 넘어가는 모습만 미리 보여 줌.
   ========================================================= */
(() => {
  if (!document.querySelector('.sub-top .back')) return;
  const KEY = 'kb-practice-min';
  const STEPS = [
    { where: '바탕화면', title: '앱 실행하기', text: '바탕화면의 <kbd>메모</kbd> 아이콘을 더블클릭해 보세요.' },
    { where: '응용 프로그램', title: '실행 요청', text: '더블클릭이 "메모 앱을 실행해 줘"라는 요청(exec)이 되어 운영체제로 가요.' },
    { where: '운영체제', title: '프로세스 만들기', text: 'RAM에 메모 앱(P4)의 자리가 생기고, 스케줄러의 준비 큐에 들어가요.' },
    { where: '언어 · 실행', title: '코드 올리기', text: '코드가 코드 영역에 올라가고, 메인 스레드의 스택에 main()이 쌓여요.' },
    { where: '응용 프로그램', title: '창이 떴어요', text: '메모 앱이 실행됐어요. 이벤트 루프가 다음 입력을 기다리고 있어요.' }
  ];
  const ic = {
    lab: '<svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v6L5 18a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 14h9"/></svg>',
    min: '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>',
    memo: '<svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/></svg>',
    file: '<svg viewBox="0 0 24 24"><path d="M3 7h6l2 2h10v10H3z"/></svg>',
    term: '<svg viewBox="0 0 24 24"><path d="M5 8l4 4-4 4M12 16h7"/></svg>'
  };

  const el = document.createElement('aside');
  el.className = 'practice';
  el.setAttribute('aria-label', '실습');
  el.innerHTML =
    `<div class="pr-head" title="끌어서 옮기기"><span class="pr-grip" aria-hidden="true">${'<i></i>'.repeat(6)}</span><span class="pr-badge">${ic.lab}</span>` +
    `<div class="pr-titles"><p class="pr-eyebrow">PRACTICE · 실습</p><p class="pr-title">메모 앱으로 따라 해 보기</p></div>` +
    `<button class="pr-icon-btn pr-min" aria-label="접기">${ic.min}</button></div>` +
    `<div class="pr-chapters"><span class="pr-chip is-on"><b>1</b>프로세스 만들기</span><span class="pr-chip is-lock"><b>2</b>저장 · 스레드<small>준비 중</small></span></div>` +
    `<div class="pr-screen">` +
      `<div class="pr-icons">` +
        `<button class="pr-app pr-app--memo is-target" data-app="memo"><span class="pr-app__ico">${ic.memo}</span>메모</button>` +
        `<button class="pr-app pr-app--file is-dim" tabindex="-1"><span class="pr-app__ico">${ic.file}</span>파일</button>` +
        `<button class="pr-app pr-app--term is-dim" tabindex="-1"><span class="pr-app__ico">${ic.term}</span>터미널</button>` +
      `</div>` +
      `<div class="pr-win" aria-hidden="true"><div class="pr-win__bar"><i class="pr-win__dot"></i><span>메모 — note.txt</span><button class="pr-win__x" aria-label="닫기">×</button></div>` +
        `<div class="pr-win__body"><p>장보기</p><p>- 우유</p><p>- 계란 10개<span class="pr-win__caret"></span></p></div>` +
        `<div class="pr-win__foot"><span class="pr-win__status">대기 중</span><button class="pr-win__save">저장</button></div></div>` +
      `<div class="pr-taskbar"><i></i><span class="pr-task">메모</span><span class="pr-clock"></span></div>` +
    `</div>` +
    `<div class="pr-step"><div class="pr-step__top"><span class="pr-step__n"></span><span class="pr-step__where"></span></div>` +
      `<p class="pr-step__title"></p><p class="pr-step__text"></p></div>` +
    `<div class="pr-foot"><div class="pr-dots">${STEPS.map(() => '<i></i>').join('')}</div><button class="pr-btn pr-reset">처음부터</button></div>`;
  document.body.appendChild(el);

  const q = s => el.querySelector(s);
  const screen = q('.pr-screen'), memo = q('[data-app="memo"]');
  let k = 0, timer = null;
  const show = n => {
    k = n; const st = STEPS[n];
    q('.pr-step__n').textContent = `STEP ${String(n + 1).padStart(2, '0')} / ${String(STEPS.length).padStart(2, '0')}`;
    q('.pr-step__where').textContent = st.where;
    q('.pr-step__title').textContent = st.title;
    q('.pr-step__text').innerHTML = st.text;
    el.querySelectorAll('.pr-dots i').forEach((d, i) => { d.classList.toggle('is-done', i < n); d.classList.toggle('is-on', i === n); });
    memo.classList.toggle('is-target', n === 0);
    if (el.classList.contains('is-min')) q('.pr-title').textContent = `실습 · ${String(n + 1).padStart(2, '0')}/${String(STEPS.length).padStart(2, '0')}`;
  };
  const reset = () => { clearTimeout(timer); screen.classList.remove('is-open'); memo.classList.remove('is-sel'); show(0); };
  // 미리 보기: 더블클릭하면 단계가 차례로 넘어가고 마지막에 창이 뜸 (장면 연결은 다음 단계에서)
  const launch = () => {
    if (k !== 0) return;
    memo.classList.add('is-sel');
    let n = 1;
    const tick = () => { show(n); if (n === STEPS.length - 1) { screen.classList.add('is-open'); return; } n++; timer = setTimeout(tick, window.KB_REDUCED ? 300 : 1500); };
    timer = setTimeout(tick, 200);
  };
  memo.addEventListener('click', () => memo.classList.add('is-sel'));
  memo.addEventListener('dblclick', launch);
  memo.addEventListener('keydown', e => { if (e.key === 'Enter') launch(); });
  q('.pr-win__x').addEventListener('click', reset);
  q('.pr-reset').addEventListener('click', reset);

  // 접기 / 펴기 (접힌 상태는 기억)
  const setMin = on => {
    el.classList.toggle('is-min', on);
    q('.pr-min').setAttribute('aria-label', on ? '펴기' : '접기');
    q('.pr-title').textContent = on ? `실습 · ${String(k + 1).padStart(2, '0')}/${String(STEPS.length).padStart(2, '0')}` : '메모 앱으로 따라 해 보기';
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    // 옮겨 둔 창을 펴거나 접으면 크기가 바뀌니, 화면 밖으로 나가지 않게 다시 맞춤
    if (el.style.left) setTimeout(() => { const r = el.getBoundingClientRect(); place(r.left, r.top); }, 480);
  };
  q('.pr-min').addEventListener('click', e => { e.stopPropagation(); setMin(!el.classList.contains('is-min')); });
  q('.pr-head').addEventListener('click', () => { if (el.classList.contains('is-min')) setMin(false); });
  let startMin = false; try { startMin = localStorage.getItem(KEY) === '1'; } catch (e) {}

  // 작업 표시줄 시계
  const clock = () => { const d = new Date(); q('.pr-clock').textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  clock(); setInterval(clock, 30000);

  /* ---------- 모달리스: 머리를 잡고 끌어서 옮기기 · 가장자리에 붙기 · 위치 기억 ---------- */
  const POS = 'kb-practice-pos', M = 12, SNAP = 28;
  const phone = () => matchMedia('(max-width: 760px)').matches;
  const clamp = (x, y) => {
    const r = el.getBoundingClientRect();
    return [Math.min(Math.max(M, x), innerWidth - r.width - M), Math.min(Math.max(M, y), innerHeight - r.height - M)];
  };
  const place = (x, y) => { [x, y] = clamp(x, y); el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.right = 'auto'; el.style.bottom = 'auto'; return [x, y]; };
  const save = (x, y) => { try { localStorage.setItem(POS, JSON.stringify([x / innerWidth, y / innerHeight])); } catch (e) {} };
  let drag = null, moved = false;
  const head = q('.pr-head');
  head.addEventListener('pointerdown', e => {
    if (phone() || e.button !== 0 || e.target.closest('.pr-min')) return;
    const r = el.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY };
    moved = false;
    try { head.setPointerCapture(e.pointerId); } catch (err) {}
  });
  head.addEventListener('pointermove', e => {
    if (!drag) return;
    if (!moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return;
    if (!moved) { moved = true; el.classList.add('is-drag'); }
    place(e.clientX - drag.dx, e.clientY - drag.dy);
  });
  const drop = () => {
    if (!drag) return;
    drag = null;
    if (!moved) return;
    el.classList.remove('is-drag');
    // 가장자리 가까이 놓으면 착 붙음
    const r = el.getBoundingClientRect();
    let x = r.left, y = r.top;
    if (x - M < SNAP) x = M; else if (innerWidth - r.right - M < SNAP) x = innerWidth - r.width - M;
    if (y - M < SNAP) y = M; else if (innerHeight - r.bottom - M < SNAP) y = innerHeight - r.height - M;
    el.classList.add('is-snap');
    [x, y] = place(x, y);
    setTimeout(() => el.classList.remove('is-snap'), 300);
    save(x, y);
  };
  head.addEventListener('pointerup', drop);
  head.addEventListener('pointercancel', drop);
  // 끌고 나서 손을 뗀 것은 '펴기' 클릭으로 치지 않음
  head.addEventListener('click', e => { if (moved) { e.stopImmediatePropagation(); moved = false; } }, true);
  const restore = () => {
    if (phone()) { ['left', 'top', 'right', 'bottom'].forEach(k => el.style.removeProperty(k)); return; }
    let p = null; try { p = JSON.parse(localStorage.getItem(POS)); } catch (e) {}
    if (Array.isArray(p)) place(p[0] * innerWidth, p[1] * innerHeight);
  };
  addEventListener('resize', restore);

  show(0);
  if (startMin) setMin(true);
  restore();
})();
