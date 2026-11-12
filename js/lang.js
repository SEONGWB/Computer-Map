/* =========================================================
   설명 기준 언어: C · Java · Python
   · 소프트웨어 화면 위쪽에 전환 버튼, 고른 언어는 모든 페이지에서 기억
   · 값이 { c, java, python } 모양이면 KBLang.pick(값)이 지금 언어의 값을 돌려줌
   · <html data-lang="..."> 로 CSS에서 언어별 표시(.l-c / .l-java / .l-python)
   ========================================================= */
(() => {
  const KEY = 'kb-lang', LANGS = [['c', 'C'], ['java', 'Java'], ['python', 'Python']];
  let cur = 'java';
  try { const v = localStorage.getItem(KEY); if (LANGS.some(l => l[0] === v)) cur = v; } catch (e) {}
  const subs = [];
  const isLang = v => v && typeof v === 'object' && !Array.isArray(v) && ('c' in v || 'java' in v || 'python' in v);
  const pick = v => (isLang(v) ? (v[cur] ?? v.java) : v);
  const apply = () => {
    document.documentElement.dataset.lang = cur;
    document.querySelectorAll('.langsw [data-lang]').forEach(b => b.classList.toggle('is-on', b.dataset.lang === cur));
  };
  // 언어마다 달라지는 영역만 그 언어의 색으로 다시 칠함 (같은 영역은 그대로)
  function repaint() {
    const h = window.LANG_HUES && LANG_HUES[cur];
    if (h == null) return;
    document.querySelectorAll('.part[data-part="app"], .part[data-part="runtime"], .tag[data-part="app"], .tag[data-part="runtime"]').forEach(n => n.style.setProperty('--h', h));
    if (document.body.hasAttribute('data-lang-hue')) document.body.style.setProperty('--h', h);
  }
  function set(l) {
    if (l === cur || !LANGS.some(x => x[0] === l)) return;
    cur = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    // 바꾸는 순간에만 모든 색 변화를 부드럽게 (평소의 움직임 효과는 건드리지 않음)
    const root = document.documentElement;
    clearTimeout(set.t);
    root.classList.add('lang-anim');
    void root.offsetWidth;
    apply();
    repaint();
    subs.forEach(fn => fn(l));
    set.t = setTimeout(() => root.classList.remove('lang-anim'), 900);
  }
  function mount() {
    if (document.body.classList.contains('sw-page') && !document.querySelector('.langsw')) {
      const el = document.createElement('div');
      el.className = 'langsw';
      el.setAttribute('role', 'group');
      el.setAttribute('aria-label', '설명 기준 언어');
      el.innerHTML = `<span class="langsw__lbl">설명 언어</span>` + LANGS.map(([k, n]) => `<button type="button" data-lang="${k}">${n}</button>`).join('');
      el.addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (b) set(b.dataset.lang); });
      document.body.appendChild(el);
    }
    apply();
  }
  window.KBLang = { get: () => cur, set, pick, on: fn => subs.push(fn), LANGS };
  document.documentElement.dataset.lang = cur;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
