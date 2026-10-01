(function(){
  const stage = document.getElementById('stage');
  const cracks = document.getElementById('glassCracks');
  const tornado = document.getElementById('heroTornado');
  const about = document.getElementById('about');
  if (!stage || !tornado || !about) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shardClips = [
    'polygon(0 0,100% 12%,74% 100%,8% 76%)',
    'polygon(12% 0,92% 4%,100% 78%,0 100%)',
    'polygon(0 18%,76% 0,100% 68%,24% 100%)',
    'polygon(20% 0,100% 26%,82% 100%,0 72%)'
  ];
  let ready = false;
  let running = false;
  let completed = false;
  let scrollIntent = 0;
  let touchY = null;

  function isAtLanding(){
    return window.scrollY <= 4 && stage.getBoundingClientRect().bottom > window.innerHeight * 0.65;
  }

  function beginTransition(){
    if (!ready || running || completed || !isAtLanding()) return;
    running = true;
    ready = false;
    document.body.classList.add('hero-transition-active');
    stage.classList.add('shattering');
    cracks.classList.add('active');
    window.setTimeout(() => tornado.classList.add('active'), reduceMotion ? 0 : 680);

    const stageRect = stage.getBoundingClientRect();
    const centerX = stageRect.width / 2;
    const centerY = stageRect.height / 2;
    stage.querySelectorAll('.piece').forEach((piece, index) => {
      const pieceX = Number.parseFloat(piece.style.left) + Number.parseFloat(piece.style.width) / 2;
      const pieceY = Number.parseFloat(piece.style.top) + Number.parseFloat(piece.style.height) / 2;
      const distance = 1.1 + Math.random() * 0.9;
      piece.style.setProperty('--shard-x', `${(pieceX - centerX) * distance + (Math.random() - 0.5) * 90}px`);
      piece.style.setProperty('--shard-y', `${(pieceY - centerY) * distance + (Math.random() - 0.5) * 100}px`);
      piece.style.setProperty('--shard-angle', `${Math.round(Math.random() * 420 - 210)}deg`);
      piece.style.setProperty('--shard-delay', `${(Math.random() * 0.2).toFixed(2)}s`);
      piece.style.clipPath = shardClips[index % shardClips.length];
      piece.classList.add('shattering');
    });

    window.setTimeout(() => {
      document.body.classList.remove('hero-transition-active');
      stage.classList.add('shattered');
      completed = true;
      running = false;
      about.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }, reduceMotion ? 250 : 2300);
  }

  function onWheel(event){
    if (running){
      event.preventDefault();
      return;
    }
    if (!ready || completed || !isAtLanding() || event.ctrlKey || event.deltaY <= 0) return;
    event.preventDefault();
    scrollIntent += event.deltaY;
    if (scrollIntent >= 190) beginTransition();
  }

  function onTouchStart(event){
    if (ready && !completed && isAtLanding() && event.touches.length === 1){
      touchY = event.touches[0].clientY;
      scrollIntent = 0;
    }
  }

  function onTouchMove(event){
    if (running){
      event.preventDefault();
      return;
    }
    if (!ready || completed || touchY === null || event.touches.length !== 1) return;
    const nextY = event.touches[0].clientY;
    const delta = touchY - nextY;
    touchY = nextY;
    if (delta <= 0) return;
    event.preventDefault();
    scrollIntent += delta;
    if (scrollIntent >= 150) beginTransition();
  }

  document.addEventListener('hero:ready', () => { ready = true; }, { once:true });
  document.addEventListener('wheel', onWheel, { passive:false, capture:true });
  document.addEventListener('touchstart', onTouchStart, { passive:true });
  document.addEventListener('touchmove', onTouchMove, { passive:false });
  document.addEventListener('touchend', () => { touchY = null; }, { passive:true });

})();