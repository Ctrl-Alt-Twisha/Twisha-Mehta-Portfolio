(function(){
  /* ---------- Page overlay (About / Work cards / Email) ---------- */
  const overlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const modalEmailLink = document.getElementById('modalEmailLink');

  function openModal(title, bodyHTML, showEmail, useBeachBackdrop, useAboutBackdrop){
    modalTitle.textContent = title || '';
    modalBody.innerHTML = bodyHTML || '';
    if (modalEmailLink) modalEmailLink.style.display = showEmail ? 'inline-block' : 'none';
    overlay.classList.toggle('photo-backdrop', Boolean(useBeachBackdrop));
    overlay.classList.toggle('about-backdrop', Boolean(useAboutBackdrop));
    overlay.classList.add('show');
    overlay.scrollTop = 0;
  }
  function closeModal(){
    overlay.classList.remove('show');
    overlay.classList.remove('photo-backdrop');
    overlay.classList.remove('about-backdrop');
  }

  // Plain-text triggers (currently just Email) — short text from a data attribute
  document.querySelectorAll('.openable').forEach(card => {
    card.addEventListener('click', (e) => {
      // The Email link has a real mailto: href for accessibility/right-click,
      // but we don't want the browser racing off to open a mail app the
      // instant it's clicked — we want it to land on this page first, with
      // the email shown as its own clickable link below.
      const href = card.getAttribute('href');
      if (href && href.startsWith('mailto:')) e.preventDefault();
      const text = card.dataset.modalBody ? `<p>${card.dataset.modalBody}</p>` : '';
      openModal(card.dataset.modalTitle, text, card.dataset.modalEmail === 'true');
    });
  });

  // Rich pages (About, each project) — pull real content from a hidden <template>
  document.querySelectorAll('.open-page').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const tmpl = document.getElementById(trigger.dataset.template);
      const templateName = trigger.dataset.template || '';
      const useAboutBackdrop = templateName === 'tmpl-about';
      const useBeachBackdrop = templateName === 'tmpl-journey'
        || templateName === 'tmpl-prize'
        || templateName.startsWith('tmpl-project');
      openModal(trigger.dataset.title, tmpl ? tmpl.innerHTML : '', false, useBeachBackdrop, useAboutBackdrop);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Every nav link (Home, About, Work, Contact) closes an open page first.
  // Without this, clicking e.g. Contact while About is open just scrolls
  // the page underneath a still-visible overlay — nothing looks like it
  // happened, even though the anchor scroll technically fired.
  document.querySelectorAll('header.nav .name, header.nav nav a').forEach(link => {
    link.addEventListener('click', closeModal);
  });

  /* ---------- Shell fun-facts popup ---------- */
  const shellBtn = document.getElementById('shellBtn');

  // Always shown on the very first click of a page load.
  const SHELL_PINNED_FACT = {
    title: "Ocean and Beach Aesthetic",
    body: "Why the ocean theme on my site? Because like the ocean, code looks simple on the surface, but there\u2019s a whole ecosystem underneath."
  };

  // Everything else — shuffled, and drawn without repeats until the whole
  // set has been shown once, then reshuffled. Resets on page refresh.
  const SHELL_FACTS = [
    { title: "30 LeetCode Problems in 24 Hours", body: "Once spent an entire day solving 30 LeetCode problems back to back. When I get into a problem solving flow state, I don't stop until every edge case is conquered." },
    { title: "The Light Mode Stance", body: "Light mode shouldn't exist. My eyes are strictly calibrated for dark mode only." },
    { title: "First Line of Code", body: "Built my first website in 7th grade featuring a button labeled Hello. Clicking it triggered a pop up reading Hello Coders alongside a custom pop up sound, the start of a long obsession with UI interactivity." },
    { title: "Favorite LeetCode Problem Type", body: "The brain busters that require 45 minutes of intense logic architecture, only to yield an elegant, one line solution." },
    { title: "The Secret Engineer Superpower", body: "Avid reading. Reading hundreds of books trained my brain to navigate dense documentation, complex logic flows, and edge cases effortlessly." },
    { title: "Debugging Ritual", body: "When a bug gets stubborn, I step away for 10 minutes, watch a dumb comedy snippet, and return with a fresh solution." },
    { title: "The Escape Room Record", body: "Absolute escape room fanatic. If you put me in a room with cryptic clues and a 60 minute timer, we are getting out." },
    { title: "The Rubik\u2019s Cube Attempt", body: "Tried learning to solve a Rubik's Cube once and ended up learning how to skateboard instead, still don't know how to solve a Rubik's Cube!" },
    { title: "Favorite Author", body: "Jennifer Lynn Barnes. Her books are so packed with riddles, anagrams, and unexpected twists that reading them feels like code breaking." },
    { title: "The Impromptu 20 Minute Presentation", body: "I could give an unscripted, 20 minute masterclass on either Brooklyn Nine Nine, Friends, must read mystery books, or how to play guitar chords." },
    { title: "The Guitar Break", body: "When I need to unplug from digital screens, picking up the guitar is my favorite way to switch from logical thinking to creative rhythm." },
    { title: "Book Format Preference", body: "Physical books with real paper pages over e-readers. Nothing beats the tactile feeling of flipping pages." },
    { title: "Ideal Problem Solving Mindset", body: "Every complex system is just a collection of smaller puzzles waiting to be unraveled." },
    { title: "Workplace Pet Peeve", body: "Meetings that could easily have been a single Slack message or a quick email bullet list." },
    { title: "Coding Fuel", body: "Silence, focus mode, and the satisfaction of watching test cases pass." },
    { title: "Unwinding Ritual", body: "Closing the laptop and diving straight into a fiction book with deep lore or complex riddles." },
    { title: "Desk Setup Essential", body: "High contrast dark themes on every editor and terminal window because at this point my eyes literally refuse to process white pixels." },
    { title: "Night Owl vs Early Bird", body: "Late night coder, the world is quiet, and the logic flows best after dark." },
    { title: "Personal Motto", body: "If it looks like a dead end, you just haven't found the hidden mechanism yet." },
    { title: "Unwinding with Comedy", body: "Big fan of comfort comedy shows with witty banter, there's nothing better to clear your head after a long coding session." }
  ];

  let shellQueue = [];
  let shellFirstClick = true;

  function shuffle(arr){
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function nextShellFact(){
    if (shellFirstClick){
      shellFirstClick = false;
      return SHELL_PINNED_FACT;
    }
    if (shellQueue.length === 0) shellQueue = shuffle(SHELL_FACTS);
    return shellQueue.pop();
  }

  if (shellBtn){
    let shellOpened = false;
    let nudgeInterval = null;

    shellBtn.addEventListener('animationend', () => {
      shellBtn.classList.remove('nudge');
    });

    shellBtn.addEventListener('click', () => {
      shellOpened = true;
      shellBtn.classList.remove('nudge');
      if (nudgeInterval) { clearInterval(nudgeInterval); nudgeInterval = null; }
      const fact = nextShellFact();
      openModal(
        `\ud83d\udc1a ${fact.title}`,
        `<p>${fact.body}</p><p class="shell-hint">Click the shell again for more \u2192</p>`,
        false
      );
    });

    // Every 20s, a longer bounce (10 hops) to flag it's interactive — stops
    // for good the first time it's actually clicked/opened.
    nudgeInterval = setInterval(() => {
      if (shellOpened) return;
      shellBtn.classList.add('nudge');
    }, 20000);
  }

  /* ---------- Likes counter ----------
     Always use a single shared counter so every device shows the same value.
     A device-local fallback would create exactly the bug you reported: the
     count starts at 0 on each browser and drifts independently. */
  const likesBtn = document.getElementById('likesBtn');
  const likesCount = document.getElementById('likesCount');
  const LEGACY_LIKES_KEY = 'twisha-portfolio-likes';
  localStorage.removeItem(LEGACY_LIKES_KEY);

  const LOCAL_LIKES_KEY = 'twisha-portfolio-likes-local';
  const COUNTER_HIT = 'https://api.visitorbadge.io/api/visitors?path=twisha-mehta-portfolio-likes-v2&label=likes&countColor=%23d97a63&style=flat';

  function getLocalLikes(){
    const n = Number.parseInt(localStorage.getItem(LOCAL_LIKES_KEY) || '0', 10);
    return Number.isFinite(n) ? n : 0;
  }
  // Display-only formatting (e.g. 1000 -> "1,000"). This never touches the
  // actual stored/shared count, key, or namespace — just how it's shown.
  function formatLikes(n){
    return Number(n).toLocaleString('en-US');
  }

  function setLocalLikes(n){
    const safe = Number.isFinite(n) ? n : 0;
    localStorage.setItem(LOCAL_LIKES_KEY, String(safe));
    if (likesCount) likesCount.textContent = formatLikes(safe);
  }

  function bump(){
    likesBtn.classList.add('bump');
    setTimeout(() => likesBtn.classList.remove('bump'), 250);
  }

  function extractCount(data){
    if (typeof data === 'string') {
      const match = data.match(/(?:aria-label|<title>)="?(?:likes|visitors):\s*(\d+)/i);
      return match ? Number.parseInt(match[1], 10) : null;
    }
    if (!data) return null;
    if (typeof data.value === 'number') return data.value;
    if (typeof data.count === 'number') return data.count;
    return null;
  }

  function updateSharedCount(){
    fetch(`${COUNTER_HIT}&cache=${Date.now()}`)
      .then(response => {
        if (!response.ok) throw new Error('Counter request failed');
        return response.text();
      })
      .then(data => {
        const count = extractCount(data);
        if (typeof count !== 'number') throw new Error('Counter response was unreadable');
        if (likesCount) likesCount.textContent = formatLikes(count);
      })
      .catch(() => setLocalLikes(getLocalLikes() + 1));
  }

  function useSharedLikes(){
    likesBtn.addEventListener('click', () => {
      bump();
      updateSharedCount();
    });
    updateSharedCount();
  }

  if (likesBtn) useSharedLikes();

  /* ---------- Copy email on click ---------- */
  const copyFlag = document.getElementById('copyFlag');
  const EMAIL = 'twishawork234@gmail.com';

  function flashCopied(){
    if (!copyFlag) return;
    copyFlag.classList.add('show');
    clearTimeout(flashCopied._t);
    flashCopied._t = setTimeout(() => copyFlag.classList.remove('show'), 1600);
  }

  document.querySelectorAll('.copy-email').forEach(el => {
    el.addEventListener('click', () => {
      // Let the mailto: link still do its normal thing (open a mail app);
      // this just also puts the address on the clipboard as a fallback for
      // anyone without a mail app configured.
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(EMAIL).then(flashCopied).catch(() => {});
      }
    });
  });
})();
