# Building morenabijou.com with Caffeine AI

[Caffeine](https://caffeine.ai) builds and hosts full apps from a plain-language
description — you chat, it writes and deploys the app on the Internet Computer.
This file is a ready-to-paste build kit for the Morèna website.

## Step 1 · Start the app

Go to **caffeine.ai**, sign in, start a new app, and paste the prompt below.

---

### Ready-to-paste prompt

> Build a bright, modern one-page website (with a few sub-pages) for a
> handmade jewelry brand called **Morèna** (note the accent: Morèna, not
> Morena), based in **Antalya, Türkiye**.
>
> **Brand & tone:** light and airy with a young soul — ivory/cream background,
> warm gold accents, modern serif headlines (Fraunces style) with italic
> accents, clean sans-serif body text. Sun-drenched Mediterranean mood:
> fresh, joyful, stylish — NOT dark or moody. Smooth scroll-triggered
> fade/slide animations, a full-screen hero video or photo of a young
> stylish woman wearing the jewelry, and an animated scrolling text marquee.
>
> **Pages & sections:**
> 1. **Home** — full-screen bright hero with the headline "Jewellery with a
>    young soul.", subtitle about handmade gold pieces from Antalya, buttons
>    to the collection and to Instagram.
> 2. **Collections** — a photo grid of pieces (earrings, necklaces, rings);
>    each piece has a photo, name, materials and price; ordering happens via
>    Instagram DM or email; admin can add/edit/remove pieces.
> 3. **Atelier (About)** — the story of a small studio in Antalya on the
>    Turkish Riviera; everything handmade in small batches.
> 4. **Contact** — a contact form (name, email, message) stored for the
>    admin, plus direct contacts: email **morenabijou@gmail.com**, Instagram
>    **@morena_bijou_com** (https://www.instagram.com/morena_bijou_com),
>    location Antalya, Türkiye.
>
> **Footer** on every page: © Morèna · Antalya, Türkiye · Instagram + email
> links.
>
> **Admin:** a simple password-protected admin area to manage collection
> pieces (upload photos, set names/prices) and read contact messages.
>
> Fully responsive (mobile-first), fast, SEO-friendly with the title
> "Morèna — Handmade Jewellery · Antalya".

---

## Step 2 · Iterate in chat

- "Make the hero brighter and more summery."
- "Add a newsletter signup that stores emails for the admin."
- "Add Turkish as a second language with a TR/EN switcher."
- "Add a WhatsApp contact button."

## Step 3 · Connect the domain

In your app's settings → **Domains**, connect **morenabijou.com** (Caffeine
gives you the DNS records to set at your registrar). Once DNS propagates the
app serves at https://morenabijou.com.

## Media assets

The 1080p hero film and bright product photos in this repo were generated
with Higgsfield AI (URLs are inside `index.html`) — you can upload them in
the Caffeine chat to use as hero/collection media.
