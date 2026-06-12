# Morena Bijou — morenabijou.com

Cinematic one-page website for **Morena Bijou**, a handmade jewelry atelier in
**Antalya, Türkiye**.

- Domain: [morenabijou.com](https://morenabijou.com)
- Instagram: [@morena_bijou_com](https://www.instagram.com/morena_bijou_com)
- Email: morenabijou@gmail.com

## What's inside

A static, dependency-free site (plain HTML/CSS/JS) with a scroll-cinematic
design in full-HD 1080p:

- **Two scroll-scrub film sections** — a 360° turntable hero and a
  "stone finds its home" craftsmanship sequence. Both are 1080p cinematic
  clips generated with **Higgsfield AI** (Seedance 2.0) from a single
  AI-generated hero still, so the ring is consistent across the whole site.
- **Lenis smooth scrolling**, scroll-linked overlay typography, intersection
  reveals, 3D tilt + cursor-following shine on collection cards, floating gem
  icons, glass navigation bar on scroll, and a cinematic loading screen.

## How the cinematic sections load media

`scroll-cinematic.js` picks the best available source per section:

1. **Local frames** (`frames/spin/`, `frames/reveal/`) — pre-sliced JPG
   sequences, the smoothest option. Used automatically if present.
2. **Remote 1080p video** — the Higgsfield clips streamed from CDN and
   scrubbed by seeking. This is what the repo ships with, so the site works
   with zero build steps.
3. **Poster still** — graceful fallback if video can't load.

### Producing local frames (recommended for production)

Download the two MP4s (URLs are at the top of `scroll-cinematic.js`) and run:

```bash
bash scripts/swap-higgsfield-frames.sh spin.mp4 reveal.mp4
```

This slices each clip into 180 JPG frames and compresses them. Commit the
`frames/` directory (remove it from `.gitignore`) or upload it with the site.
Requires `ffmpeg`.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploying to morenabijou.com

Any static host works (GitHub Pages, Netlify, Vercel, Cloudflare Pages):

1. **GitHub Pages**: repo Settings → Pages → deploy from branch. The `CNAME`
   file already points at `morenabijou.com`; at your domain registrar add the
   GitHub Pages DNS records (A records for apex + `www` CNAME).
2. For production, self-host the video/poster assets (see above) instead of
   hotlinking the Higgsfield CDN.

## Caffeine AI alternative

See [`CAFFEINE.md`](CAFFEINE.md) for a ready-to-paste prompt to rebuild this
site with admin/CMS features on [caffeine.ai](https://caffeine.ai), plus
domain-connection steps.
