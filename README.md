# Morèna — morenabijou.com

Bright, modern one-page website for **Morèna**, a handmade jewelry atelier in
**Antalya, Türkiye**.

- Domain: [morenabijou.com](https://morenabijou.com)
- Instagram: [@morena_bijou_com](https://www.instagram.com/morena_bijou_com)
- Email: morenabijou@gmail.com

## Design

Light & airy with a young soul: ivory background, warm gold accents, Fraunces
serif + Manrope sans typography, and Mediterranean light throughout.

Sections: full-screen 1080p hero film → marquee strip → collections grid
(orders via Instagram DM) → atelier story → contact/Instagram → footer.

Motion: looping HD hero film with gentle parallax, Lenis smooth scrolling,
scroll reveals, an infinite text marquee, and hover zoom on product cards.
Honors `prefers-reduced-motion`.

## Media

All imagery is generated with **Higgsfield AI**: a sun-lit editorial hero
portrait (Soul v2, animated to a 1080p loop with Seedance 2.0) and three
product still-lifes (hoops, layered necklaces, ring stack). Assets currently
stream from the Higgsfield CDN; for production, download them and replace the
URLs in `index.html` with local paths (e.g. `assets/hero.mp4`).

> The product photos are placeholders — swap in photos of the real pieces
> when ready; the layout doesn't change.

## Files

- `index.html` — the whole site in one self-contained file (HTML + inlined
  CSS and JS, no external libraries), so it stays fully styled even when
  opened as a lone file
- `CNAME` — custom domain for GitHub Pages
- `CAFFEINE.md` — alternative: rebuild on caffeine.ai with admin/CMS features

## Local preview

Download/clone and open `index.html` in a browser — no build step.

## Deploying to morenabijou.com

Any static host works. GitHub Pages: Settings → Pages → deploy from branch;
then point your registrar's DNS at GitHub Pages (A records for the apex,
`www` CNAME → `<user>.github.io`) and set the custom domain to
`morenabijou.com`.
