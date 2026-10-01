(function(){
  const stage = document.getElementById('stage');
  if (!stage) return;
  const heroCopy = document.getElementById('heroCopy');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COLS = 4;
  const ROWS = 3;

  // Real dimensions of assets/hero.jpg — keep these in sync if you swap the photo.
  const ART_URL = 'assets/hero.jpg';
  const IMG_W = 1920;
  const IMG_H = 1080;

  // Extra overlap so adjoining pieces overlap by a hair instead of leaving a
  // hairline gap from sub-pixel rounding. Invisible, since it's the same image.
  // (Bumped up from 3 — thin gaps were showing at interior seams once assembled.)
  const SEAM = 8;

  let pieces = [];

  function edgeBump(p0, p1, dir, nx, ny, amp){
    if (dir === 0) return `L ${p1.x} ${p1.y}`;
    const dx = p1.x - p0.x, dy = p1.y - p0.y;
    const t = [0.35, 0.42, 0.5, 0.58, 0.65];
    const pts = t.map(tt => ({ x: p0.x + dx * tt, y: p0.y + dy * tt }));
    const bulge = amp * dir;
    const b0 = { x: pts[0].x + nx * bulge * 0.6,  y: pts[0].y + ny * bulge * 0.6 };
    const b1 = { x: pts[1].x + nx * bulge * 1.15, y: pts[1].y + ny * bulge * 1.15 };
    const b2 = { x: pts[2].x + nx * bulge * 1.3,  y: pts[2].y + ny * bulge * 1.3 };
    const b3 = { x: pts[3].x + nx * bulge * 1.15, y: pts[3].y + ny * bulge * 1.15 };
    const b4 = { x: pts[4].x + nx * bulge * 0.6,  y: pts[4].y + ny * bulge * 0.6 };
    return `L ${pts[0].x} ${pts[0].y} `
         + `C ${b0.x} ${b0.y} ${b1.x} ${b1.y} ${b2.x} ${b2.y} `
         + `C ${b3.x} ${b3.y} ${b4.x} ${b4.y} ${pts[4].x} ${pts[4].y} `
         + `L ${p1.x} ${p1.y}`;
  }

  function piecePath(cellW, cellH, amp, dirTop, dirRight, dirBottom, dirLeft){
    // Corners are pulled outward by SEAM on every edge (not just the tabbed
    // ones) so each piece slightly overlaps its neighbours all the way
    // around, closing the hairline gaps that plain edge-to-edge tiling
    // leaves after the browser rounds to device pixels.
    const TL = { x: amp - SEAM, y: amp - SEAM };
    const TR = { x: amp + cellW + SEAM, y: amp - SEAM };
    const BR = { x: amp + cellW + SEAM, y: amp + cellH + SEAM };
    const BL = { x: amp - SEAM, y: amp + cellH + SEAM };
    let d = `M ${TL.x} ${TL.y} `;
    d += edgeBump(TL, TR, dirTop,    0, -1, amp) + ' ';
    d += edgeBump(TR, BR, dirRight,  1,  0, amp) + ' ';
    d += edgeBump(BR, BL, dirBottom, 0,  1, amp) + ' ';
    d += edgeBump(BL, TL, dirLeft,  -1,  0, amp) + ' Z';
    return d;
  }

  function init(){
    stage.classList.remove('assembled');
    if (heroCopy) heroCopy.classList.remove('show');
    stage.querySelectorAll('.piece').forEach(p => p.remove());
    pieces = [];

    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const cellW = w / COLS;
    const cellH = h / ROWS;
    const amp = Math.min(cellW, cellH) * 0.16;

    // cover-fit math so the photo fills the stage without distortion
    const scale = Math.max(w / IMG_W, h / IMG_H);
    const coverW = IMG_W * scale;
    const coverH = IMG_H * scale;
    const offsetX = (w - coverW) / 2;
    const offsetY = (h - coverH) / 2;

    const hEdge = [];
    for (let i = 0; i < ROWS - 1; i++){
      hEdge.push(Array.from({length: COLS}, () => Math.random() < 0.5 ? 1 : -1));
    }
    const vEdge = [];
    for (let r = 0; r < ROWS; r++){
      vEdge.push(Array.from({length: COLS - 1}, () => Math.random() < 0.5 ? 1 : -1));
    }

    const frag = document.createDocumentFragment();

    for (let r = 0; r < ROWS; r++){
      for (let c = 0; c < COLS; c++){
        const dirTop    = r === 0 ? 0 : -hEdge[r - 1][c];
        const dirBottom = r === ROWS - 1 ? 0 : hEdge[r][c];
        const dirLeft   = c === 0 ? 0 : -vEdge[r][c - 1];
        const dirRight  = c === COLS - 1 ? 0 : vEdge[r][c];

        const path = piecePath(cellW, cellH, amp, dirTop, dirRight, dirBottom, dirLeft);

        const cellX = c * cellW;
        const cellY = r * cellH;
        const boxW = cellW + amp * 2;
        const boxH = cellH + amp * 2;
        // Round to whole pixels so every piece snaps to the same pixel grid —
        // otherwise adjacent pieces round independently and leave a hairline
        // gap at the seam between them.
        const boxLeft = Math.round(cellX - amp);
        const boxTop = Math.round(cellY - amp);

        const el = document.createElement('div');
        el.className = 'piece';
        el.style.left = boxLeft + 'px';
        el.style.top = boxTop + 'px';
        el.style.width = Math.round(boxW) + 'px';
        el.style.height = Math.round(boxH) + 'px';
        el.style.backgroundImage = `url("${ART_URL}")`;
        el.style.backgroundSize = `${coverW}px ${coverH}px`;
        el.style.backgroundPosition = `${offsetX - boxLeft}px ${offsetY - boxTop}px`;
        el.style.clipPath = `path('${path}')`;
        // z-index staggered so overlapping seams always favour the piece
        // whose neighbour is "underneath" consistently, avoiding flicker.
        el.style.zIndex = String(r * COLS + c);

        if (reduceMotion){
          el.style.transform = 'translate(0,0) rotate(0deg)';
        } else {
          const angle = (Math.random() * 60 - 30).toFixed(1);
          const distance = Math.min(w, h) * (0.35 + Math.random() * 0.35);
          const theta = Math.random() * Math.PI * 2;
          const dx = Math.cos(theta) * distance;
          const dy = Math.sin(theta) * distance;
          el.style.transform = `translate(${dx}px, ${dy}px) rotate(${angle}deg)`;
          const delay = (Math.random() * 0.35).toFixed(2);
          el.style.transitionDelay = `${delay}s, 0.9s`;
        }

        frag.appendChild(el);
        pieces.push(el);
      }
    }

    stage.appendChild(frag);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const assemble = () => {
          stage.classList.add('assembled');
          const revealDelay = reduceMotion ? 100 : 1500;
          setTimeout(() => {
            if (heroCopy) heroCopy.classList.add('show');
            document.dispatchEvent(new Event('hero:ready'));
          }, revealDelay);
        };
        // Brief pause while pieces are still scattered so it actually reads
        // as a puzzle coming together, not a cut straight to the photo.
        if (reduceMotion) assemble();
        else setTimeout(assemble, 500);
      });
    });
  }

  init();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 250);
  });
})();
