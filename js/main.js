/* =========================================================
   Computer Map — Main interactions
   ========================================================= */
(() => {
  const reduced = window.KB_REDUCED;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const glow = document.querySelector('.glow');
  const hint = document.querySelector('.hint');
  if (!fine) hint.textContent = '탐색할 영역을 눌러보세요';
  const defaultHint = hint.textContent;

  // 가운데 빛이 포인터 쪽으로 아주 살짝 따라옴
  if (fine && !reduced) {
    let tx = 50, ty = 52, x = 50, y = 52;
    addEventListener('pointermove', e => {
      tx = 50 + (e.clientX / innerWidth - 0.5) * 12;
      ty = 52 + (e.clientY / innerHeight - 0.5) * 12;
    }, { passive: true });
    (function loop() {
      x += (tx - x) * 0.06; y += (ty - y) * 0.06;
      glow.style.setProperty('--gx', x + '%');
      glow.style.setProperty('--gy', y + '%');
      requestAnimationFrame(loop);
    })();
  }

  // 호버한 영역에 맞춰 하단 안내 문구 변경
  const texts = {
    hw: 'HARDWARE — CPU, 메모리, 저장장치, 네트워크 장비',
    sw: 'SOFTWARE — 운영체제, 언어, 프레임워크, 서비스'
  };
  const scene = document.getElementById('scene');
  if (window.stabilizeHover) stabilizeHover(scene, '.layer');
  let current = null;
  const update = layer => {
    const key = layer ? (layer.classList.contains('hw') ? 'hw' : 'sw') : null;
    if (key === current) return;
    current = key;
    hint.textContent = key ? texts[key] : defaultHint;
    hint.style.color = key ? 'var(--lav)' : '';
  };
  // 이벤트 위임: 포인터가 어느 레이어 위에 있는지 매번 판단
  scene.addEventListener('pointerover', e => update(e.target.closest('.layer')));
  scene.addEventListener('pointerleave', () => update(null));
  scene.addEventListener('focusin', e => update(e.target.closest('.layer')));
  scene.addEventListener('focusout', () => update(null));

  /* ---------- 페이지 전환: 하드웨어 안으로 확대해 들어가기 ---------- */
  const hwLink = document.querySelector('.layer.hw');
  hwLink.addEventListener('click', e => {
    if (reduced) return;
    e.preventDefault();
    document.body.classList.add('zoom-to-hw');
    setTimeout(() => { location.href = hwLink.getAttribute('href'); }, 900);
  });
  // 하드웨어 화면에서 돌아올 때: 밖으로 빠져나오는 연출
  if (location.hash === '#from-hw') {
    document.body.classList.add('from-hw');
    clearHash();
  }
  // 뒤로가기 캐시로 돌아오면 확대 연출 상태만 되돌림 (다시 불러오면 처음 등장 연출 때문에 한동안 빈 화면이 보임)
  addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('zoom-to-hw', 'is-leaving'); });
})();
