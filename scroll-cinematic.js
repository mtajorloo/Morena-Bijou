/* ─── Morena Bijou · Scroll-Cinematic Engine ─────────────────────────────── */
'use strict';

const SCRUB_SECTIONS = [
  {
    section:    '#hero',
    frameCount: 180,
    bg:         '#080608',
    framePath:  i => `frames/spin/frame_${String(i).padStart(4,'0')}.jpg`,
    overlayLines: [
      { selector: '.hero-eyebrow', inAt: 0.05, outAt: 0.85 },
      { selector: '.hero-headline', inAt: 0.10, outAt: 0.85 },
      { selector: '.hero-sub',      inAt: 0.18, outAt: 0.80 },
    ],
  },
  {
    section:    '#reveal-section',
    frameCount: 180,
    bg:         '#080608',
    framePath:  i => `frames/reveal/frame_${String(i).padStart(4,'0')}.jpg`,
    overlayLines: [
      { selector: '.reveal-eyebrow',   inAt: 0.30, outAt: 0.95 },
      { selector: '.reveal-headline',  inAt: 0.38, outAt: 0.95 },
      { selector: '.reveal-sub',       inAt: 0.50, outAt: 0.90 },
    ],
  },
];

class ScrubEngine {
  constructor(cfg) {
    this.cfg      = cfg;
    this.el       = document.querySelector(cfg.section);
    this.inner    = this.el?.querySelector('.scrub-inner');
    this.canvas   = this.el?.querySelector('canvas.scrub-canvas');
    this.ctx      = this.canvas?.getContext('2d');
    this.frames   = [];
    this.loaded   = 0;
    this.curFrame = -1;
    this.dpr      = Math.min(window.devicePixelRatio || 1, 2);
  }

  async preload(onProgress) {
    const { frameCount, framePath, bg } = this.cfg;
    this.frames = new Array(frameCount).fill(null);
    let done = 0;
    const batch = 12;
    const load = i => new Promise(res => {
      const img = new Image();
      img.onload = img.onerror = () => {
        this.frames[i] = img.naturalWidth ? img : null;
        done++;
        onProgress?.(done);
        res();
      };
      img.src = framePath(i);
    });
    for (let s = 0; s < frameCount; s += batch) {
      await Promise.all(
        Array.from({ length: Math.min(batch, frameCount - s) }, (_, k) => load(s + k))
      );
    }
    this.drawFrame(0);
  }

  drawFrame(idx) {
    if (!this.ctx || !this.canvas) return;
    const img = this.frames[idx];
    if (!img) return;
    if (this.curFrame === idx) return;
    this.curFrame = idx;

    const { width: cw, height: ch } = this.canvas;
    this.ctx.fillStyle = this.cfg.bg;
    this.ctx.fillRect(0, 0, cw, ch);

    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    this.ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  resize() {
    if (!this.canvas || !this.inner) return;
    const w = this.inner.clientWidth;
    const h = this.inner.clientHeight;
    this.canvas.width  = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width  = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx?.scale(this.dpr, this.dpr);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.curFrame = -1;
  }

  update(scrollY, winH) {
    if (!this.el) return;
    const rect    = this.el.getBoundingClientRect();
    const totalH  = this.el.offsetHeight - winH;
    const progress = Math.max(0, Math.min(1, -rect.top / totalH));

    // Draw frame
    const frameIdx = Math.round(progress * (this.cfg.frameCount - 1));
    this.drawFrame(frameIdx);

    // Drive overlay lines
    this.cfg.overlayLines?.forEach(({ selector, inAt, outAt }) => {
      const line = document.querySelector(selector);
      if (!line) return;
      const visible = progress >= inAt && progress <= outAt;
      line.classList.toggle('visible', visible);
    });
  }
}

/* ─── Intersection reveal for non-scrub sections ─── */
function initRevealObserver() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    }),
    { threshold: 0.15 }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ─── Lenis smooth scroll ─── */
function initLenis(engines) {
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
  const winH  = window.innerHeight;

  const raf = time => {
    lenis.raf(time);
    engines.forEach(e => e.update(lenis.scroll, winH));
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  return lenis;
}

/* ─── Loading screen ─── */
function initLoading(totalFrames, onDone) {
  const overlay  = document.getElementById('loading-overlay');
  const bar      = document.querySelector('.loading-bar');
  const pctLabel = document.querySelector('.loading-pct');
  let loaded = 0;

  return (n) => {
    loaded += n || 1;
    const pct = Math.min(100, Math.round((loaded / totalFrames) * 100));
    if (bar)      bar.style.width = pct + '%';
    if (pctLabel) pctLabel.textContent = pct + '%';
    if (loaded >= totalFrames) {
      setTimeout(() => {
        overlay?.classList.add('done');
        setTimeout(onDone, 800);
      }, 300);
    }
  };
}

/* ─── Scroll hint ─── */
function initScrollHint() {
  const hint = document.querySelector('.scroll-hint');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) hint?.classList.add('hidden');
  }, { passive: true });
}

/* ─── Main init ─── */
window.addEventListener('DOMContentLoaded', async () => {
  const engines = SCRUB_SECTIONS
    .map(cfg => new ScrubEngine(cfg))
    .filter(e => e.el);

  engines.forEach(e => e.resize());
  window.addEventListener('resize', () => engines.forEach(e => e.resize()));

  const totalFrames = engines.reduce((s, e) => s + e.cfg.frameCount, 0);
  const onProgress  = initLoading(totalFrames, () => {
    initLenis(engines);
    initRevealObserver();
    initScrollHint();
  });

  await Promise.all(engines.map(e => e.preload(() => onProgress(1))));
});
