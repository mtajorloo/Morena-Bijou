/* ─── SHANSI · front-end demo logic ───────────────────────────────────────
   Static design prototype. All state is in memory. The production build on
   the Internet Computer replaces `Backend` with canister calls.
   ------------------------------------------------------------------------ */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = n => '₮ ' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const rnd = n => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; };

  /* ─ Media URLs generated with Higgsfield (Nano Banana · Seedance) ─ */
  const MEDIA = {
    heroVideo: 'https://d8j0ntlcm91z4.cloudfront.net/user_3F1VtchxdxeZzONSsRIyI88MO2d/hf_20260922_111245_33af8cd0-31e1-4b56-b373-b689ae2d7241.mp4', // Seedance 2.0 ambient loop (21:9, 8 s)
    counterVideo: 'https://d8j0ntlcm91z4.cloudfront.net/user_3F1VtchxdxeZzONSsRIyI88MO2d/hf_20260922_111245_b9d8e13e-0097-4a30-9c34-a3f9ac81bf5b.mp4', // Seedance 2.0 counter turn (16:9, 6 s), start frame = Nano Banana counter render
  };

  /* ─ State ─ */
  const S = {
    user: null,
    balance: 0,
    picked: [7, 3, 0, 9],
    qty: 1,
    method: 'USDT',
    amount: 25,
    tickets: [],
    jackpot: 12480,
    poolTickets: 2418,
    lastResult: [7, 3, 0, 9],
    spinning: false,
  };

  /* ─ Navigation ─ */
  const go = v => {
    if (['wallet', 'pick', 'draw'].includes(v) && !S.user) v = 'login';
    document.body.dataset.view = v;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(layout);
  };
  /* Re-measure wheel/dial heights after a view becomes visible or the window resizes. */
  const layout = () => {
    $$('.dial').forEach(d => d._set && d._set(S.picked[+d.dataset.i]));
    if (!S.spinning) showDigits(S.lastResult);
  };
  addEventListener('resize', () => requestAnimationFrame(layout));
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-go]');
    if (t) { e.preventDefault(); go(t.dataset.go); }
  });

  /* ─ Toast ─ */
  let toastT;
  const toast = msg => { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); };

  /* ─ Countdown to the top of the hour ─ */
  const tick = () => {
    const now = new Date();
    const next = new Date(now); next.setUTCMinutes(60, 0, 0);
    const s = Math.max(0, Math.floor((next - now) / 1000));
    const mm = String(Math.floor(s / 60)).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
    ['#countdown', '#countdown-hero', '#countdown-draw'].forEach(id => { const el = $(id); if (el) el.textContent = `${mm}:${ss}`; });
    const closed = s <= 30;
    $('#place-btn').disabled = closed;
    $('#pick-msg').textContent = closed ? 'Sales are closed for this draw. Tickets go to the next one.' : 'Sales close 30 seconds before the draw.';
  };
  setInterval(tick, 1000); tick();

  /* ─ Render helpers ─ */
  const render = () => {
    ['#jackpot-top', '#jackpot-hero', '#jackpot-pick', '#jackpot-draw'].forEach(id => $(id).textContent = fmt(S.jackpot));
    ['#balance-top', '#balance-wallet'].forEach(id => $(id).textContent = fmt(S.balance));
    $('#balance-stat').hidden = !S.user;
    $('#auth-btn').textContent = S.user ? 'Wallet' : 'Log in';
    $('#auth-btn').dataset.go = S.user ? 'wallet' : 'login';
    $('#wallet-user').textContent = S.user ? `Signed in as ${S.user}` : '';
    $('#last-result').textContent = S.lastResult.join(' ');
    $('#pool-tickets').textContent = S.poolTickets.toLocaleString();
    $('#my-count').textContent = S.tickets.length;
    $('#cost').textContent = fmt(S.qty);
    $('#qty').textContent = S.qty;
    $('#topup-btn').textContent = `Top up ${fmt(S.amount)} with ${S.method}`;
    const ul = $('#tickets'); ul.innerHTML = '';
    if (!S.tickets.length) ul.innerHTML = '<li class="muted">No tickets yet.</li>';
    S.tickets.forEach(t => { const li = document.createElement('li'); li.innerHTML = `<span class="mono">${t.join('-')}</span><span class="muted small">1 USDT</span>`; ul.appendChild(li); });
  };

  /* ─ Login ─ */
  $('#email-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#email').value.trim();
    S.user = email; S.balance = S.balance || 0;
    toast('Magic link sent — signed in for this demo');
    render(); go('wallet');
  });
  $('#ii-btn').addEventListener('click', () => {
    S.user = 'Internet Identity #' + (10000 + rnd(89999));
    toast('Internet Identity connected');
    render(); go('wallet');
  });

  /* ─ Wallet ─ */
  $$('.method').forEach(b => b.addEventListener('click', () => {
    $$('.method').forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-checked', 'false'); });
    b.classList.add('is-active'); b.setAttribute('aria-checked', 'true'); S.method = b.dataset.method; render();
  }));
  $$('.chip').forEach(b => b.addEventListener('click', () => {
    $$('.chip').forEach(x => x.classList.remove('is-active')); b.classList.add('is-active'); S.amount = +b.dataset.amt; render();
  }));
  $('#topup-btn').addEventListener('click', () => {
    S.balance += S.amount; toast(`${fmt(S.amount)} added via ${S.method}`); render();
  });
  $('#withdraw-btn').addEventListener('click', () => {
    if (S.balance < 10) return toast('Minimum withdrawal is 10 USDT');
    toast('Withdrawal requested — USDT arrives within the hour');
  });

  /* ─ Dials ─ */
  const H = () => $('.dial-strip span').getBoundingClientRect().height || 96;
  $$('.dial').forEach(d => {
    const strip = $('.dial-strip', d);
    for (let i = 0; i < 10; i++) { const s = document.createElement('span'); s.textContent = i; strip.appendChild(s); }
    const i = +d.dataset.i;
    const set = v => { S.picked[i] = (v + 10) % 10; strip.style.transform = `translateY(${-S.picked[i] * H()}px)`; };
    $('.up', d).addEventListener('click', () => set(S.picked[i] - 1));
    $('.down', d).addEventListener('click', () => set(S.picked[i] + 1));
    let y0 = null;
    const win = $('.dial-win', d);
    win.addEventListener('pointerdown', e => { y0 = e.clientY; win.setPointerCapture(e.pointerId); });
    win.addEventListener('pointermove', e => { if (y0 === null) return; const dy = e.clientY - y0; if (Math.abs(dy) > 24) { set(S.picked[i] - Math.sign(dy)); y0 = e.clientY; } });
    win.addEventListener('pointerup', () => y0 = null);
    win.addEventListener('wheel', e => { e.preventDefault(); set(S.picked[i] + Math.sign(e.deltaY)); }, { passive: false });
    set(S.picked[i]);
    d._set = set;
  });
  $('#quick-btn').addEventListener('click', () => {
    $$('.dial').forEach((d, i) => setTimeout(() => d._set(rnd(10)), i * 90));
  });
  $('#qty-minus').addEventListener('click', () => { S.qty = Math.max(1, S.qty - 1); render(); });
  $('#qty-plus').addEventListener('click', () => { S.qty = Math.min(50, S.qty + 1); render(); });
  $('#place-btn').addEventListener('click', () => {
    if (S.balance < S.qty) { toast('Top up your wallet first'); return go('wallet'); }
    S.balance -= S.qty;
    for (let k = 0; k < S.qty; k++) S.tickets.push(k === 0 ? [...S.picked] : [rnd(10), rnd(10), rnd(10), rnd(10)]);
    S.poolTickets += S.qty; S.jackpot += S.qty * 0.5;
    toast(`${S.qty} ticket${S.qty > 1 ? 's' : ''} placed`);
    render(); go('draw');
  });

  /* ─ Counter ─ */
  const wheels = $$('.wheel');
  wheels.forEach(w => { const reel = $('.reel', w); for (let r = 0; r < 2; r++) for (let i = 0; i < 10; i++) { const s = document.createElement('span'); s.textContent = i; reel.appendChild(s); } });
  const WH = () => wheels[0].getBoundingClientRect().height || 210;
  const showDigits = arr => wheels.forEach((w, i) => { $('.reel', w).style.transform = `translateY(${-arr[i] * WH()}px)`; });
  showDigits(S.lastResult);
  $('#counter').classList.add('glow');

  const prize = (t, res) => {
    const m = [3, 2, 1, 0].findIndex(k => t[k] !== res[k]);     // count matches from the right
    const matches = m === -1 ? 4 : m;
    if (matches === 4) return { tier: 'Jackpot', amount: Math.round(S.jackpot) };
    if (matches === 3) return { tier: 'Match 3', amount: 40 };
    if (matches === 2) return { tier: 'Match 2', amount: 5 };
    if (matches === 1) return { tier: 'Match 1', amount: 1 };
    return null;
  };

  const spin = async () => {
    if (S.spinning) return;
    S.spinning = true; $('#spin-btn').disabled = true; $('#counter').classList.remove('glow');
    $('#draw-status').textContent = 'The counter is turning…';
    const res = [rnd(10), rnd(10), rnd(10), rnd(10)];
    wheels.forEach(w => { w.classList.remove('locked'); w.classList.add('spinning'); $('.reel', w).style.transition = 'none'; });
    await wait(1600);
    for (let i = 3; i >= 0; i--) {                                  // lock right → left
      const w = wheels[i], reel = $('.reel', w);
      w.classList.remove('spinning');
      reel.style.transition = 'none'; reel.style.transform = `translateY(${-(res[i] + 10) * WH()}px)`;
      void reel.offsetHeight;
      reel.style.transition = 'transform .9s cubic-bezier(.2,.9,.25,1.12)'; reel.style.transform = `translateY(${-res[i] * WH()}px)`;
      w.classList.add('locked');
      await wait(700);
    }
    await wait(500);
    S.lastResult = res;
    let won = 0, best = null;
    S.tickets.forEach(t => { const p = prize(t, res); if (p) { won += p.amount; if (!best || p.amount > best.amount) best = p; } });
    S.balance += won;
    if (best && best.tier === 'Jackpot') S.jackpot = 500; else S.jackpot += 0;
    S.tickets = [];
    $('#result-title').textContent = res.join(' ');
    if (won) {
      $('#result-eyebrow').textContent = best.tier === 'Jackpot' ? 'JACKPOT' : 'You won';
      $('#result-text').textContent = `${best.tier} · ${fmt(won)} credited to your wallet.`;
      confetti();
    } else {
      $('#result-eyebrow').textContent = 'Result';
      $('#result-text').textContent = S.user ? 'Not this time. The next draw is under an hour away.' : 'Log in and pick your digits for the next draw.';
    }
    $('#result').hidden = false;
    $('#draw-status').innerHTML = 'The counter turns in <span id="countdown-draw">59:59</span>';
    S.spinning = false; $('#spin-btn').disabled = false; $('#counter').classList.add('glow');
    render();
  };
  $('#spin-btn').addEventListener('click', spin);
  $('#result-btn').addEventListener('click', () => { $('#result').hidden = true; go('pick'); });
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* Auto-turn at :00 UTC (real draw moment) when the draw view is open. */
  setInterval(() => { const d = new Date(); if (d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && document.body.dataset.view === 'draw') spin(); }, 1000);

  /* ─ Confetti ─ */
  function confetti() {
    const c = $('#confetti'), ctx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    const P = Array.from({ length: 220 }, () => ({ x: c.width / 2, y: c.height / 2, vx: (Math.random() - .5) * 18, vy: -Math.random() * 16 - 4, r: Math.random() * 5 + 2, a: Math.random() * Math.PI, c: ['#D4AF37', '#F1D27A', '#C9506F', '#F6ECDD'][rnd(4)] }));
    let f = 0;
    (function loop() {
      ctx.clearRect(0, 0, c.width, c.height);
      P.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; p.a += .1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore(); });
      if (++f < 160) requestAnimationFrame(loop); else ctx.clearRect(0, 0, c.width, c.height);
    })();
  }

  /* ─ Ambient particles ─ */
  (function particles() {
    const c = $('#particles'), ctx = c.getContext('2d');
    const size = () => { c.width = innerWidth; c.height = innerHeight; };
    size(); addEventListener('resize', size);
    const P = Array.from({ length: 70 }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.8 + .4, s: Math.random() * .25 + .08, o: Math.random() * .5 + .2 }));
    (function loop() {
      ctx.clearRect(0, 0, c.width, c.height);
      P.forEach(p => { p.y -= p.s; if (p.y < -5) { p.y = c.height + 5; p.x = Math.random() * c.width; } ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(241,210,122,${p.o})`; ctx.shadowBlur = 8; ctx.shadowColor = '#D4AF37'; ctx.fill(); });
      requestAnimationFrame(loop);
    })();
  })();

  /* ─ Media wiring ─ */
  if (MEDIA.heroVideo) { const v = $('#hero-video'); $('source', v).src = MEDIA.heroVideo; v.load(); }
  else $('#hero-video').style.background = `url(${$('#hero-video').poster}) center/cover`;

  render();
})();
