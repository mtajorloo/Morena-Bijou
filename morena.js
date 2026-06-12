/* ─── Morèna · interactions ──────────────────────────────────────────────── */
'use strict';

/* Smooth scrolling */
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70 });
    });
  });
}

/* Scroll reveals */
function initReveals() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    }),
    { threshold: 0.15 }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* Nav state + gentle hero parallax */
function initScrollEffects() {
  const nav  = document.querySelector('nav');
  const copy = document.querySelector('.hero-copy');
  const vid  = document.querySelector('.hero-video');
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav?.classList.toggle('scrolled', y > 50);
      if (copy && y < window.innerHeight) {
        copy.style.transform = `translateY(${y * 0.18}px)`;
        copy.style.opacity   = String(Math.max(0, 1 - y / (window.innerHeight * 0.7)));
      }
      if (vid && y < window.innerHeight) {
        vid.style.transform = `translateY(${y * 0.08}px) scale(1.02)`;
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

window.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initReveals();
  initScrollEffects();
});
