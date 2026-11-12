/* =========================================================
   메인보드 그림 (공용)
   하드웨어 보드 화면과, 소프트웨어 보드의 바닥(무채색 실루엣)이 함께 씀.
   Mainboard(CX, CY, PARTS) → { 그리기 도우미, BUS, neighbors, svg }
   ========================================================= */
window.Mainboard = (CX = 500, CY = 350, PARTS = {}) => {
    /* ---------- 아이소메트릭 도우미 ---------- */
    const P = (x, y, z = 0) => [x - y + CX, (x + y) / 2 + CY - z];
    const pts = a => a.map(p => p.map(n => +n.toFixed(1)).join(',')).join(' ');
    // 평면(x, y) 좌표를 높이 z의 윗면으로 투영하는 그룹
    const top = (z, inner) => `<g transform="matrix(1 .5 -1 .5 ${CX} ${CY - z})">${inner}</g>`;
    // 상자: 바닥 z0, 높이 h
    const box = (x, y, w, d, z0, h, cls = '') => {
      const z1 = z0 + h;
      return `<polygon class="fa" points="${pts([P(x, y + d, z1), P(x + w, y + d, z1), P(x + w, y + d, z0), P(x, y + d, z0)])}"/>` +
        `<polygon class="fb" points="${pts([P(x + w, y, z1), P(x + w, y + d, z1), P(x + w, y + d, z0), P(x + w, y, z0)])}"/>` +
        `<polygon class="ft ${cls}" points="${pts([P(x, y, z1), P(x + w, y, z1), P(x + w, y + d, z1), P(x, y + d, z1)])}"/>`;
    };
    // y = Y 평면(왼쪽 앞면)에 그리는 사각형
    const onFaceA = (Y, x1, x2, z1, z2, cls) =>
      `<polygon class="${cls}" points="${pts([P(x1, Y, z2), P(x2, Y, z2), P(x2, Y, z1), P(x1, Y, z1)])}"/>`;
    // x = X 평면(오른쪽 앞면)에 그리는 사각형
    const onFaceB = (X, y1, y2, z1, z2, cls) =>
      `<polygon class="${cls}" points="${pts([P(X, y1, z2), P(X, y2, z2), P(X, y2, z1), P(X, y1, z1)])}"/>`;
    const line = (a, b, cls) => `<path class="${cls}" d="M${a.join(',')} L${b.join(',')}"/>`;

    /* ---------- 메인보드 ---------- */
    const board = () => {
      let traces = '';
      // 장식용 회로선
      const deco = [
        'M-230 -120 H-170 V-90', 'M-230 -60 H-215 V40 H-180', 'M-120 -150 V-120 H-60', 'M-215 70 H-160',
        'M140 70 H225', 'M210 100 V160', 'M180 140 H230', 'M-120 150 H-40 V140', 'M20 150 H100',
        'M-100 -60 H-130 V-100', 'M60 -130 H120 V-100', 'M-230 100 V160'
      ];
      deco.forEach(d => traces += `<path class="trace" d="${d}"/>`);
      const holes = [[-225, -155], [225, -155], [225, 155], [-225, 155]]
        .map(([x, y]) => `<circle class="hole" cx="${x}" cy="${y}" r="6"/>`).join('');
      const silk = `<text class="silk" x="-228" y="-135">KB · MAINBOARD 01</text>`;
      return `<g class="mb">${box(-240, -170, 480, 340, -18, 18, 'mb-top')}${top(0,
        `<rect class="mb-edge" x="-232" y="-162" width="464" height="324" rx="6"/>${traces}${holes}${silk}`)}</g>`;
    };

    /* ---------- 회로선: 어느 두 부품을 잇는지 따로 묶음 (호버하면 그 부품의 선만 켜짐) ---------- */
    const BUS = [
      { link: 'cpu memory', d: ['M40 -40 H70', 'M40 -30 H70', 'M40 -20 H70', 'M40 -10 H70'] }, // 메모리 버스
      { link: 'cpu gpu', d: ['M-20 16 V85', 'M-8 16 V85', 'M4 16 V85'] },                     // PCIe x16
      { link: 'cpu chipset', d: ['M36 10 H52 V70 H140 V30 H148'] },                          // DMI
      { link: 'chipset network', d: ['M172 5 V-89'] },                                       // 칩셋 ↔ 랜카드
      { link: 'cpu storage', d: ['M-36 -10 H-90 V-8 H-110'] },                               // CPU ↔ NVMe
      { link: 'chipset storage', d: ['M148 44 H136 V76 H-190 V115'] }                        // 칩셋 ↔ SATA SSD
    ];
    let pulseI = 0;
    const bus = () => BUS.map(b => `<g class="bus" data-link="${b.link}">${top(0,
      b.d.map(d => `<path class="bus__line" d="${d}"/>`).join('') +
      b.d.map(d => `<path class="bus__pulse" d="${d}" pathLength="100" style="animation-delay:${-(pulseI++) * 0.37}s"/>`).join(''))}</g>`).join('');
    // 서로 데이터를 주고받는 부품 (회로선으로 직접 이어진 짝)
    const neighbors = id => id ? [...new Set(BUS.filter(b => b.link.split(' ').includes(id)).flatMap(b => b.link.split(' ')))].filter(x => x !== id) : [];

    /* ---------- 장식 부품 (전원부, I/O 등) ---------- */
    const decor = () => {
      let s = '';
      s += box(-120, -170, 250, 20, 0, 30, 'io-top');                      // 후면 I/O 쉴드
      for (let i = 0; i < 6; i++) s += onFaceA(-150, -108 + i * 40, -82 + i * 40, 8, 22, 'port');
      s += box(-78, -64, 14, 92, 0, 12);                                     // 전원부 방열판
      s += box(-44, -98, 94, 14, 0, 12);
      [[-95, 30], [-95, 46], [60, -112], [76, -112], [-30, 40], [-14, 40]]  // 콘덴서
        .forEach(([x, y]) => s += box(x, y, 8, 8, 0, 10, 'cap'));
      s += box(205, 80, 22, 60, 0, 14);                                      // 전원 커넥터
      return `<g class="decor">${s}</g>`;
    };

    /* ---------- 주요 부품 ---------- */
    const part = (id, i, inner) =>
      `<g class="part" data-part="${id}" style="--h:${HUES[id]};--sat:1" tabindex="0" role="button" aria-label="${(PARTS[id] || {}).ko || id} 자세히 보기">` +
      `<g class="part__in" style="--i:${i}">${inner}</g></g>`;

    const storage = () => part('storage', 0,
      // M.2 NVMe SSD
      box(-205, -20, 95, 22, 0, 3) +
      top(3, `<rect class="chip" x="-196" y="-15" width="22" height="12" rx="1"/><rect class="chip" x="-168" y="-15" width="22" height="12" rx="1"/>` +
        `<rect class="chip" x="-140" y="-15" width="16" height="12" rx="1"/><text class="mini" x="-200" y="-18">NVMe</text>`) +
      // 2.5" SATA SSD
      box(-232, 115, 80, 52, 0, 12) +
      top(12, `<rect class="sticker" x="-222" y="124" width="60" height="34" rx="3"/><text class="mini mini--lg" x="-214" y="146">SSD</text>`)
    );

    const cpu = () => part('cpu', 1,
      box(-48, -68, 96, 96, 0, 5, 'socket') +
      box(-36, -56, 72, 72, 5, 10, 'ihs') +
      top(15, `<rect class="core" x="-22" y="-42" width="44" height="44" rx="3"/>` +
        `<path class="core-grid" d="M-22 -31 H22 M-22 -20 H22 M-22 -9 H22 M-11 -42 V2 M0 -42 V2 M11 -42 V2"/>` +
        `<path class="notch" d="M-33 -53 L-26 -53 L-33 -46 Z"/>`)
    );

    const network = () => {
      const a1 = P(190, -165, 28), a2 = P(160, -165, 28);
      const tip1 = [a1[0], a1[1] - 70], tip2 = [a2[0], a2[1] - 58];
      const waves = [12, 22, 32].map((r, k) =>
        `<path class="wave" style="animation-delay:${k * 0.35}s" d="M${tip1[0] - r} ${tip1[1] - 4} A${r} ${r} 0 0 1 ${tip1[0] + r} ${tip1[1] - 4}"/>`).join('');
      return part('network', 2,
        box(150, -170, 50, 30, 0, 28, 'rj-top') +
        onFaceA(-140, 156, 172, 6, 20, 'rj-hole') + onFaceA(-140, 178, 194, 6, 20, 'rj-hole') +
        box(150, -115, 32, 26, 0, 4) +
        top(4, `<text class="mini" x="154" y="-98">NIC</text>`) +
        line(a1, tip1, 'antenna') + line(a2, tip2, 'antenna') +
        `<circle class="antenna-tip" cx="${tip1[0]}" cy="${tip1[1]}" r="3"/><circle class="antenna-tip" cx="${tip2[0]}" cy="${tip2[1]}" r="3"/>` +
        waves
      );
    };

    const memory = () => {
      let s = '';
      [68, 84, 100, 116].forEach(x => {
        s += box(x - 2, -96, 10, 162, 0, 5, 'slot');
        s += box(x, -90, 6, 150, 5, 34, 'stick');
        for (let k = 0; k < 5; k++) s += onFaceB(x + 6, -82 + k * 28, -62 + k * 28, 14, 32, 'ram-chip');
      });
      return part('memory', 3, s);
    };

    const gpu = () => {
      const fan = (fx, fy) => `<g><circle class="fan-ring" cx="${fx}" cy="${fy}" r="18"/>` +
        `<g class="blades"><path d="M${fx} ${fy} l0 -14 M${fx} ${fy} l12 7 M${fx} ${fy} l-12 7"/>` +
        `<animateTransform attributeName="transform" type="rotate" from="0 ${fx} ${fy}" to="360 ${fx} ${fy}" dur="2.4s" repeatCount="indefinite"/></g>` +
        `<circle class="fan-hub" cx="${fx}" cy="${fy}" r="4"/></g>`;
      return part('gpu', 4,
        box(-150, 85, 280, 45, 0, 22, 'gpu-top') +
        onFaceA(130, -140, 120, 6, 9, 'gpu-stripe') +
        top(22, fan(-80, 107) + fan(-20, 107) + `<rect class="gpu-plate" x="20" y="93" width="96" height="28" rx="3"/><text class="mini" x="28" y="111">GPU</text>`)
      );
    };

    const chipset = () => part('chipset', 5,
      box(148, 5, 48, 44, 0, 8, 'pch') +
      top(8, `<path class="fins" d="M154 12 H190 M154 20 H190 M154 28 H190 M154 36 H190 M154 44 H190"/>`)
    );

  return {
    P, pts, top, box, onFaceA, onFaceB, line, BUS, neighbors,
    svg: board() + bus() + decor() + storage() + cpu() + network() + memory() + gpu() + chipset()
  };
};
