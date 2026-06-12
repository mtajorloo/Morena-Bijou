# Building morenabijou.com with Caffeine AI

[Caffeine](https://caffeine.ai) builds and hosts full apps from a plain-language
description — you chat, it writes and deploys the app on the Internet Computer.
This file is a ready-to-paste build kit for the Morena Bijou website.

## Step 1 · Start the app

Go to **caffeine.ai**, sign in, start a new app, and paste the prompt below.

---

### Ready-to-paste prompt

> Build an elegant, cinematic one-page website (with a few sub-pages) for a
> handmade jewelry brand called **Morena Bijou**, based in **Antalya, Türkiye**.
>
> **Brand & tone:** dark luxury aesthetic — near-black background (#080608),
> gold accents (#C9A84C), serif display font (Cormorant Garamond style) for
> headlines, light sans-serif for body. Tagline: "Worn by the Rare."
> Sophisticated, minimal, lots of negative space. Smooth scroll-triggered
> fade/slide animations on every section.
>
> **Pages & sections:**
> 1. **Home** — full-screen hero with a slow cinematic background video or
>    image of jewelry, headline "Worn by the Rare.", call-to-action button.
> 2. **Collections** — a gallery grid of jewelry pieces; each piece has a
>    photo, name, materials, and price; admin can add/edit/remove pieces.
> 3. **Atelier (About)** — the story of the artisan studio in Antalya, on the
>    Turkish Riviera; handcrafted 18k gold, ethically sourced stones.
> 4. **Bespoke / Contact** — a contact form (name, email, message) whose
>    submissions are stored and viewable by the admin, plus direct contact
>    details: email **morenabijou@gmail.com**, Instagram
>    **@morena_bijou_com** (link to https://www.instagram.com/morena_bijou_com),
>    location Antalya, Türkiye.
>
> **Footer** on every page: © Morena Bijou · Antalya, Türkiye · links to
> Instagram and email.
>
> **Admin:** a simple password-protected admin area where I can manage
> collection pieces (upload photos, set names/prices) and read contact-form
> messages.
>
> The site must be fully responsive (mobile-first), fast, and SEO-friendly
> with the title "Morena Bijou — Handcrafted Jewellery · Antalya".

---

## Step 2 · Iterate in chat

Caffeine refines the live app from follow-up messages. Useful follow-ups:

- "Make the hero animation slower and more cinematic."
- "Add a newsletter signup that stores emails for the admin."
- "Add Turkish as a second language with a TR/EN switcher."
- "Add WhatsApp contact button."

## Step 3 · Connect the domain

In Caffeine, open your app's settings → **Domains** and connect
**morenabijou.com** (Caffeine supports connecting/buying custom domains; it
gives you the DNS records to set at your registrar). Once DNS propagates, the
app serves at https://morenabijou.com.

## Media assets

High-definition 1080p brand media for the hero/section backgrounds was
generated with Higgsfield AI (see `README.md`). You can upload those clips and
stills directly in the Caffeine chat to use as hero media.

## Note

This repository also contains a hand-coded scroll-cinematic version of the
site (`index.html`) that can be hosted anywhere static hosting works (GitHub
Pages, Netlify, etc.) and pointed at morenabijou.com — you can use either
path, or use this site as the visual reference when iterating in Caffeine.
