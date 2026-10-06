// Offscript: launching-soon site.
//  1. a maroon envelope opens and a torn-paper letter slides out (same as the app)
//  2. the letter is the sign-up form; signing up stamps it with a wax seal
//  3. sign-ups go to Supabase (supabase/migrations/0005_waitlist.sql)
(() => {
  const cfg = window.OFFSCRIPT || {};
  const LIVE = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_KEY);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s) => document.querySelector(s);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const params = new URLSearchParams(location.search);

  // ── remember sign-ups on this device (so a return visit shows "you're in") ──
  const store = {
    get() { try { return JSON.parse(localStorage.getItem('offscript-joined') || 'null'); } catch { return null; } },
    set(v) { try { localStorage.setItem('offscript-joined', JSON.stringify(v)); } catch {} },
  };

  // ── talk to Supabase ──
  async function rpc(name, body) {
    if (!LIVE) {
      await wait(600); // preview mode: pretend it worked
      if (name === 'join_waitlist') return { already: false, position: 1, token: 'demo', ref: 'demo' };
      if (name === 'waitlist_count') return 0;
      return null;
    }
    const res = await fetch(`${cfg.SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: cfg.SUPABASE_KEY, Authorization: `Bearer ${cfg.SUPABASE_KEY}` },
      body: JSON.stringify(body || {}),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || 'Something went wrong, please try again.');
    return data;
  }

  // ── torn paper (the same tear as the app's TornPaper) ──
  function tornPath(w, h, seed) {
    let s = seed * 9973;
    const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const D = 5, pts = [];
    const edge = (x1, y1, x2, y2, nx, ny) => {
      const steps = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 5));
      let drift = rand() * D;
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        drift = Math.max(0, Math.min(D, drift + (rand() - 0.5) * 2.2));
        const off = drift + rand() * 1.6 + (rand() < 0.04 ? 2.5 : 0);
        pts.push([x1 + (x2 - x1) * t + nx * off, y1 + (y2 - y1) * t + ny * off]);
      }
    };
    edge(0, 0, w, 0, 0, 1); edge(w, 0, w, h, -1, 0); edge(w, h, 0, h, 0, -1); edge(0, h, 0, 0, 1, 0);
    return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L') + ' Z';
  }
  function paperSvg(w, h, seed) {
    let s = seed * 31;
    const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    let specks = '';
    for (let i = 0, n = Math.round((w * h) / 900); i < n; i++) {
      specks += `<circle cx="${(6 + rand() * (w - 12)).toFixed(1)}" cy="${(6 + rand() * (h - 12)).toFixed(1)}" r="${(0.4 + rand() * 1.1).toFixed(2)}" fill="#8A7A5C" opacity="${(0.05 + rand() * 0.08).toFixed(2)}"/>`;
    }
    const d = tornPath(w, h, seed);
    return `<defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBF7EE"/><stop offset="1" stop-color="#F4EEE2"/></linearGradient></defs>
      <path d="${d}" fill="url(#pg)" stroke="#E2D6BF" stroke-width="0.6"/>${specks}`;
  }

  // ── gold stars on the gingham ──
  const starPath = (x, y, r) => {
    const k = r * 0.15;
    return `M${x} ${y - r} C${x + k} ${y - k} ${x + k} ${y - k} ${x + r} ${y} C${x + k} ${y + k} ${x + k} ${y + k} ${x} ${y + r} ` +
      `C${x - k} ${y + k} ${x - k} ${y + k} ${x - r} ${y} C${x - k} ${y - k} ${x - k} ${y - k} ${x} ${y - r} Z`;
  };
  function drawStars() {
    const hero = $('.hero'), svg = $('.stars');
    const w = hero.clientWidth, h = hero.clientHeight;
    let seed = 7, out = '';
    const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let y = 40; y < h; y += 120) for (let x = 30; x < w; x += 110) {
      const sx = x + rand() * 60, sy = y + rand() * 60, r = 7 + rand() * 7;
      out += `<path d="${starPath(sx, sy, r)}" style="animation-delay:${(rand() * 3).toFixed(2)}s"/>`;
    }
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.innerHTML = out;
  }

  // ── the envelope ──
  const el = {
    stage: $('#stage'), back: $('.env-back'), flap: $('.flap'), letter: $('#letter'), pocket: $('.pocket'),
  };
  let G; // geometry
  function layout() {
    const W = Math.min(window.innerWidth - 32, 400);
    const EH = W * 0.64, FH = EH * 0.56, LW = W * 0.88, LH = LW * 1.18;
    const SH = LH + EH * 0.45, envTop0 = (SH - EH) / 2;
    G = {
      W, EH, FH, LW, LH, SH, envTop0,
      envFinal: LH - EH * 0.45 - envTop0,
      S0: 0.6,
      yInside: envTop0 + EH / 2 - LH / 2,
      yPeek: envTop0 + EH / 2 - LH / 2 - W * 0.3,
    };
    Object.assign(el.stage.style, { width: `${W}px`, height: `${SH}px` });
    el.stage.style.setProperty('--lw', `${LW}px`);
    for (const n of [el.back, el.flap, el.pocket]) n.style.top = `${envTop0}px`;
    Object.assign(el.back.style, { width: `${W}px`, height: `${EH}px` });
    Object.assign(el.letter.style, { left: `${(W - LW) / 2}px`, width: `${LW}px`, height: `${LH}px` });

    const paper = $('.paper');
    paper.setAttribute('width', LW + 4); paper.setAttribute('height', LH + 4);
    paper.innerHTML = paperSvg(LW, LH, 3);

    const flapSvg = $('.flap-svg');
    flapSvg.setAttribute('width', W); flapSvg.setAttribute('height', FH);
    flapSvg.innerHTML = `<defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A1013"/><stop offset="1" stop-color="#9A2A2E"/></linearGradient></defs>
      <path d="M0 0 H${W} L${W / 2 + 10} ${FH - 4} Q${W / 2} ${FH + 2} ${W / 2 - 10} ${FH - 4} Z" fill="url(#fg)" stroke="#5C0A0C"/>`;

    const pocketSvg = $('.pocket-svg');
    pocketSvg.setAttribute('width', W); pocketSvg.setAttribute('height', EH);
    pocketSvg.innerHTML = `<defs><linearGradient id="kg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E1F23"/><stop offset="1" stop-color="#6B0B0C"/></linearGradient></defs>
      <path d="M0 2 L${W / 2} ${EH * 0.56} L${W} 2 V${EH - 6} Q${W} ${EH} ${W - 6} ${EH} H6 Q0 ${EH} 0 ${EH - 6} Z" fill="url(#kg)"/>
      <path d="M0 ${EH} L${W * 0.42} ${EH * 0.5} M${W} ${EH} L${W * 0.58} ${EH * 0.5}" stroke="#4E0709" opacity="0.5"/>`;
    const bow = $('.bow');
    Object.assign(bow.style, { width: `${W * 0.22}px`, top: `${EH * 0.58}px` });
  }

  const T = {
    env: (y) => `translateY(${y}px)`,
    flap: (y, s) => `translateY(${y}px) scaleY(${s})`,
    letter: (y, s) => `translateY(${y}px) scale(${s})`,
  };
  function tween(node, to, ms, easing) {
    const from = node.style.transform || 'none';
    node.style.transform = to;
    return node.animate([{ transform: from }, { transform: to }], { duration: ms, easing }).finished.catch(() => {});
  }
  const ease = { inOut: 'cubic-bezier(.65,0,.35,1)', out: 'cubic-bezier(.33,1,.68,1)' };

  function placeFinal() {
    el.back.style.transform = el.pocket.style.transform = T.env(G.envFinal);
    el.flap.style.transform = T.flap(G.envFinal, -1);
    el.flap.style.zIndex = 2;
    el.letter.style.transform = T.letter(0, 1);
    el.letter.style.zIndex = 6;
    el.letter.classList.add('out');
  }

  async function openEnvelope() {
    el.back.style.transform = el.pocket.style.transform = T.env(0);
    el.flap.style.transform = T.flap(0, 1);
    el.letter.style.transform = T.letter(G.yInside, G.S0);
    el.stage.style.visibility = 'visible';
    if (reduced) return placeFinal();
    await wait(450);
    // 1. the flap opens (and slips behind the letter halfway through)
    setTimeout(() => (el.flap.style.zIndex = 2), 330);
    await tween(el.flap, T.flap(0, -1), 700, ease.inOut);
    // 2. the letter peeks out…
    await tween(el.letter, T.letter(G.yPeek, G.S0), 650, ease.out);
    // 3. …then comes all the way out while the envelope drops behind it
    el.letter.style.zIndex = 6;
    await Promise.all([
      tween(el.letter, T.letter(0, 1), 750, ease.inOut),
      tween(el.back, T.env(G.envFinal), 750, ease.inOut),
      tween(el.pocket, T.env(G.envFinal), 750, ease.inOut),
      tween(el.flap, T.flap(G.envFinal, -1), 750, ease.inOut),
    ]);
    el.letter.classList.add('out');
  }

  // ── star confetti ──
  function confetti(from) {
    if (reduced) return;
    const r = from.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 26; i++) {
      const s = document.createElement('img');
      s.src = 'stickers/star.png'; s.className = 'confetti'; s.alt = '';
      s.style.left = `${cx - 9}px`; s.style.top = `${cy - 9}px`;
      document.body.appendChild(s);
      const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 160, size = 0.6 + Math.random() * 1.2;
      const dx = Math.cos(a) * d, dy = Math.sin(a) * d - 60;
      s.animate([
        { transform: 'translate(0,0) scale(0) rotate(0)', opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) scale(${size}) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${dx * 1.1}px,${dy + 140}px) scale(${size * 0.8}) rotate(${Math.random() * 540}deg)`, opacity: 0 },
      ], { duration: 1300 + Math.random() * 500, easing: 'cubic-bezier(.2,.8,.4,1)' }).finished.then(() => s.remove());
    }
  }

  function toast(text) {
    const t = $('#toast');
    t.textContent = text; t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  // ── signed up: show the stamped letter ──
  function showDone(info, celebrate) {
    $('#face-join').hidden = true;
    $('#face-done').hidden = false;
    $('#done-title').textContent = info.already ? 'already in ✿' : "you're in ✿";
    $('#done-pos').textContent = `#${info.position} on the list`;
    $('#more').hidden = !info.token || info.detailsDone;
    if (celebrate) {
      el.letter.classList.remove('thud'); void el.letter.offsetWidth; el.letter.classList.add('thud');
      confetti(el.letter);
    }
  }

  // ── the form ──
  const form = $('#join'), msg = $('#join-msg'), email = $('#email');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const value = email.value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      msg.textContent = 'that email looks a little off';
      email.focus();
      return;
    }
    const btn = form.querySelector('button');
    btn.disabled = true; btn.firstElementChild.textContent = 'sealing…';
    try {
      if (form.company.value) throw new Error('bot'); // honeypot
      const res = await rpc('join_waitlist', {
        p_email: value,
        p_ref: params.get('ref'),
        p_source: params.get('src') || params.get('utm_source'),
      });
      const info = { already: res.already, position: res.position, token: res.token || null, ref: res.ref };
      store.set(info);
      showDone(info, true);
    } catch (err) {
      msg.textContent = err.message === 'bot' ? '' : err.message;
    } finally {
      btn.disabled = false; btn.firstElementChild.textContent = 'Save my spot';
    }
  });

  // ── "bring your people" ──
  $('#share').addEventListener('click', async () => {
    const info = store.get() || {};
    const url = `${location.origin}${location.pathname}${info.ref ? `?ref=${info.ref}` : ''}`;
    const text = 'Offscript: coffee runs, study sessions & kindred minds for academics. Launching soon, save your spot:';
    if (navigator.share) {
      try { await navigator.share({ title: 'Offscript', text, url }); } catch {}
      return;
    }
    try { await navigator.clipboard.writeText(`${text} ${url}`); toast('link copied ✓'); }
    catch { prompt('Copy your link:', url); }
  });

  // ── "tell us a little more" ──
  const dialog = $('#more-dialog');
  $('#more').addEventListener('click', () => dialog.showModal());
  document.querySelectorAll('.pick').forEach((group) => {
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (group.hasAttribute('data-single')) group.querySelectorAll('button').forEach((x) => x !== b && x.classList.remove('on'));
      b.classList.toggle('on');
    });
  });
  $('#more-save').addEventListener('click', async () => {
    const info = store.get();
    const picked = (name) => [...document.querySelectorAll(`.pick[data-name="${name}"] .on`)].map((b) => b.dataset.v || b.textContent.trim());
    const btn = $('#more-save');
    btn.disabled = true;
    try {
      await rpc('waitlist_details', { p_token: info.token, p_university: $('#uni').value, p_stage: picked('stage')[0] || null, p_wants: picked('wants') });
      store.set({ ...info, detailsDone: true });
      dialog.close();
      $('#more').hidden = true;
      toast('thank you ✿');
    } catch (err) {
      toast(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  // ── last-call button: back to the letter ──
  $('#cta-btn').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    if (store.get()) setTimeout(() => toast("you're already in ✿"), 500);
    else setTimeout(() => email.focus({ preventScroll: true }), 600);
  });

  // ── match deck: swipes right with a bulb every few seconds ──
  function runDeck() {
    const deck = $('#deck'), bulb = $('.deck-bulb');
    let visible = false;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(deck);
    setInterval(async () => {
      if (!visible || document.hidden || reduced) return;
      const top = deck.querySelector('.mcard');
      bulb.classList.add('on');
      await wait(450);
      top.classList.add('gone');
      await wait(650);
      bulb.classList.remove('on');
      top.classList.remove('gone');
      deck.insertBefore(top, bulb); // to the back of the pile
    }, 2800);
  }

  // ── flip cards ──
  document.querySelectorAll('.q').forEach((q) => q.addEventListener('click', () => q.classList.toggle('flipped')));

  // ── things slide in as you scroll ──
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((n) => io.observe(n));

  // ── footer bits ──
  $('#year').textContent = new Date().getFullYear();
  if (cfg.INSTAGRAM) { $('#insta').href = cfg.INSTAGRAM; $('#insta').hidden = false; }
  if (cfg.CONTACT_EMAIL) { $('#contact').href = `mailto:${cfg.CONTACT_EMAIL}`; $('#contact').hidden = false; }
  if (!LIVE) {
    const b = document.createElement('div');
    b.className = 'demo-banner';
    b.textContent = 'Preview mode: sign-ups are not saved yet. Add your Supabase key in config.js.';
    document.body.appendChild(b);
  }

  // ── go ──
  el.stage.style.visibility = 'hidden';
  layout();
  drawStars();
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastW) return; // phones fire resize when the address bar hides
    lastW = window.innerWidth;
    layout(); drawStars(); placeFinal();
  });

  const saved = store.get();
  if (saved) showDone(saved, false);

  rpc('waitlist_count').then((n) => {
    if (typeof n === 'number' && n >= (cfg.SHOW_COUNT_FROM ?? 25)) {
      $('#count').textContent = `✦ ${n} academics already waiting`;
      $('#count').hidden = false;
    }
  }).catch(() => {});

  // wait for the calligraphy font so the logo never flashes in the wrong font
  Promise.race([document.fonts.ready, wait(2500)]).then(async () => {
    await openEnvelope();
    $('.peek').classList.add('show');
    if (!saved && matchMedia('(pointer: fine)').matches) email.focus({ preventScroll: true });
  });
  runDeck();
})();
