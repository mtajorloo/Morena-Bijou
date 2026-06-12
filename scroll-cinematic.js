/* ─── Morena Bijou · Scroll-Cinematic Engine ─────────────────────────────── */
'use strict';

/* Higgsfield-generated 1080p cinematic assets (Seedance 2.0, 16:9).
   If local frames exist under frames/ (see scripts/swap-higgsfield-frames.sh)
   they take priority over the remote videos. */
const HIGGSFIELD = {
  poster:      'https://d8j0ntlcm91z4.cloudfront.net/user_3F1VtchxdxeZzONSsRIyI88MO2d/hf_20260612_094739_f901916b-6d7c-443f-b6c2-81df20924b11.png',
  spinVideo:   'HF_SPIN_URL',
  revealVideo: 'HF_REVEAL_URL',
};

const SCRUB_SECTIONS = [
  {
    section:    '#hero',
    frameCount: 180,
    bg:         '#080608',
    framePath:  i => `frames/spin/frame_${String(i).padStart(4,'0')}.jpg`,
    videoSrc:   HIGGSFIELD.spinVideo,
    poster:     HIGGSFIELD.poster,
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
    videoSrc:   HIGGSFIELD.revealVideo,
    poster:     HIGGSFIELD.poster,
    overlayLines: [
      { selector: '.reveal-eyebrow',   inAt: 0.30, outAt: 0.95 },
      { selector: '.reveal-headline',  inAt: 0.38, outAt: 0.95 },
      { selector: '.reveal-sub',       inAt: 0.50, outAt: 0.90 },
    ],
  },
];

const probeImage = url => new Promise(res => {
  const img = new Image();
  img.onload  = () => res(img.naturalWidth > 0);
  img.onerror = () => res(false);
  img.src = url;
});

class ScrubEngine {
  constructor(cfg) {
    this.cfg      = cfg;
    this.el       = document.querySelector(cfg.section);
    this.inner    = this.el?.querySelector('.scrub-inner');
    this.canvas   = this.el?.querySelector('canvas.scrub-canvas');
    this.ctx      = this.canvas?.getContext('2d');
    this.mode     = 'none';
    this.frames   = [];
    this.curFrame = -1;
    this.video       = null;
    this.lastSeek    = -1;
    this.pendingSeek = null;
    this.posterImg   = null;
    this.dpr      = Math.min(window.devicePixelRatio || 1, 2);
  }

  /* onProgress receives fractional deltas; each engine totals 1.0 */
  async init(onProgress) {
    if (this.cfg.framePath && await probeImage(this.cfg.framePath(0))) {
      this.mode = 'frames';
      await this.preloadFrames(onProgress);
    } else if (this.cfg.videoSrc && !this.cfg.videoSrc.startsWith('HF_')) {
      this.mode = 'video';
      await this.prepareVideo(onProgress);
    } else {
      await this.loadPoster();
      onProgress(1);
    }
  }

  /* ── Mode A · local pre-sliced frames ── */
  async preloadFrames(onProgress) {
    const { frameCount, framePath } = this.cfg;
    this.frames = new Array(frameCount).fill(null);
    const batch = 12;
    const load = i => new Promise(res => {
      const img = new Image();
      img.onload = img.onerror = () => {
        this.frames[i] = img.naturalWidth ? img : null;
        onProgress(1 / frameCount);
        res();
      };
      img.src = framePath(i);
    });
    for (let s = 0; s < frameCount; s += batch) {
      await Promise.all(
        Array.from({ length: Math.min(batch, frameCount - s) }, (_, k) => load(s + k))
      );
    }
    this.drawSource(this.frames[0]);
  }

  /* ── Mode B · remote 1080p video, scrubbed by seeking ── */
  prepareVideo(onProgress) {
    return new Promise(resolve => {
      const v = document.createElement('video');
      v.muted = true;
      v.playsInline = true;
      v.preload = 'auto';

      let reported = 0;
      const report = frac => {
        const d = Math.min(1, frac) - reported;
        if (d > 0) { reported += d; onProgress(d); }
      };
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        report(1);
        resolve();
      };

      v.addEventListener('progress', () => {
        if (!v.duration) return;
        let end = 0;
        for (let i = 0; i < v.buffered.length; i++) end = Math.max(end, v.buffered.end(i));
        report(Math.min(0.99, end / v.duration));
      });
      v.addEventListener('canplaythrough', finish, { once: true });
      v.addEventListener('error', async () => {
        this.mode = 'poster';
        await this.loadPoster();
        finish();
      }, { once: true });
      // Never trap the loading screen on a slow connection
      setTimeout(finish, 15000);

      v.addEventListener('loadeddata', () => this.drawSource(v), { once: true });
      v.addEventListener('seeked', () => {
        this.drawSource(v);
        if (this.pendingSeek !== null) {
          const t = this.pendingSeek;
          this.pendingSeek = null;
          v.currentTime = t;
        }
      });

      v.src = this.cfg.videoSrc;
      v.load();
      this.video = v;
    });
  }

  async loadPoster() {
    if (!this.cfg.poster || this.cfg.poster.startsWith('HF_')) return;
    if (await probeImage(this.cfg.poster)) {
      this.posterImg = new Image();
      this.posterImg.src = this.cfg.poster;
      this.posterImg.decode?.().catch(() => {}).then(() => this.drawSource(this.posterImg));
    }
  }

  /* Cover-fit draw of an image, canvas or video frame (physical pixels). */
  drawSource(src) {
    if (!this.ctx || !this.canvas || !src) return;
    const iw = src.naturalWidth ?? src.videoWidth ?? src.width;
    const ih = src.naturalHeight ?? src.videoHeight ?? src.height;
    if (!iw || !ih) return;

    const { width: cw, height: ch } = this.canvas;
    this.ctx.fillStyle = this.cfg.bg;
    this.ctx.fillRect(0, 0, cw, ch);

    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    this.ctx.drawImage(src, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  resize() {
    if (!this.canvas || !this.inner) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width  = this.inner.clientWidth  * this.dpr;
    this.canvas.height = this.inner.clientHeight * this.dpr;
    this.canvas.style.width  = this.inner.clientWidth + 'px';
    this.canvas.style.height = this.inner.clientHeight + 'px';
    this.curFrame = -1;
    if (this.mode === 'frames')      this.drawSource(this.frames[Math.max(0, this.curFrame)]);
    else if (this.mode === 'video')  this.drawSource(this.video);
    else if (this.posterImg)         this.drawSource(this.posterImg);
  }

  update(scrollY, winH) {
    if (!this.el) return;
    const rect    = this.el.getBoundingClientRect();
    const totalH  = this.el.offsetHeight - winH;
    const progress = Math.max(0, Math.min(1, -rect.top / totalH));

    if (this.mode === 'frames') {
      const idx = Math.round(progress * (this.cfg.frameCount - 1));
      if (idx !== this.curFrame) {
        this.curFrame = idx;
        this.drawSource(this.frames[idx]);
      }
    } else if (this.mode === 'video' && this.video?.duration) {
      const t = progress * Math.max(0, this.video.duration - 0.05);
      if (Math.abs(t - this.lastSeek) > 1 / 50) {
        this.lastSeek = t;
        if (this.video.seeking) this.pendingSeek = t;
        else this.video.currentTime = t;
      }
    }

    this.cfg.overlayLines?.forEach(({ selector, inAt, outAt }) => {
      const line = document.querySelector(selector);
      if (!line) return;
      line.classList.toggle('visible', progress >= inAt && progress <= outAt);
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

/* ─── Collection card 3D tilt + shine ─── */
function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.collection-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg)`;
      card.style.setProperty('--shine-x', `${(px + 0.5) * 100}%`);
      card.style.setProperty('--shine-y', `${(py + 0.5) * 100}%`);
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ─── Nav: glass background once scrolled ─── */
function initNavScroll() {
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ─── Lenis smooth scroll ─── */
function initLenis(engines) {
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
  const raf = time => {
    lenis.raf(time);
    engines.forEach(e => e.update(lenis.scroll, window.innerHeight));
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  return lenis;
}

/* ─── Loading screen (fractional progress, one unit per engine) ─── */
function initLoading(totalUnits, onDone) {
  const overlay  = document.getElementById('loading-overlay');
  const bar      = document.querySelector('.loading-bar');
  const pctLabel = document.querySelector('.loading-pct');
  let loaded = 0, done = false;

  return delta => {
    loaded = Math.min(totalUnits, loaded + delta);
    const pct = Math.round((loaded / totalUnits) * 100);
    if (bar)      bar.style.width = pct + '%';
    if (pctLabel) pctLabel.textContent = pct + '%';
    if (pct >= 100 && !done) {
      done = true;
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

  const onProgress = initLoading(engines.length, () => {
    initLenis(engines);
    initRevealObserver();
    initScrollHint();
    initCardTilt();
    initNavScroll();
  });

  await Promise.all(engines.map(e => e.init(onProgress)));
});
