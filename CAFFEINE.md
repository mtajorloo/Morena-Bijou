# Building morenabijou.com with Caffeine AI

[Caffeine](https://caffeine.ai) builds and hosts full apps from a plain-language
description — you chat, it writes and deploys the app on the Internet Computer.
This file is a ready-to-paste build kit that recreates the current Morèna design
**as a real app with an admin page** (the static site in this repo has no admin —
see "About the admin page" below).

## About the admin page

The `index.html` in this repo is a **static site**: just text and images. It has
no admin login, no database — to change a product or price you edit the file.

Caffeine is what gives you an **admin page**. When you include the admin section
in the prompt below, Caffeine builds a password-protected area where you log in
and manage products, prices, photos and messages yourself — no code. After it's
built you reach it at your app URL + `/admin` (e.g. `morenabijou.com/admin`);
Caffeine sets the password during the build and shows you the link in the chat.

## How to give Caffeine *this* design

Caffeine builds from a description plus any images you upload. To match what we
already have:

1. Go to **caffeine.ai**, sign in, and start a new app.
2. **Paste the prompt** in Step 1 below — it describes our exact layout.
3. **Upload reference screenshots** so it copies the look, not just the words.
   Take screenshots of our current site (open `index.html`, capture the hero,
   the collection tiles, the product carousel, the maison section, the footer)
   and attach them in the Caffeine chat with: *"Match this layout and style."*
4. **Upload the media** — the hero film and product photos (see "Media assets").
5. Then refine in chat (Step 2).

---

## Step 1 · Ready-to-paste prompt

> Build a modern, elegant e-commerce-style website for a handmade jewelry
> **maison** called **Morèna** (note the accent: Morèna, not Morena), based in
> **Antalya, Türkiye**. Take a luxury jewelry house like charriol.com as the
> structural reference.
>
> **Brand & tone:** bright and airy with a young soul — ivory/cream/white
> backgrounds, warm gold accents, elegant serif headlines (Fraunces style) with
> italic gold accents, clean uppercase letter-spaced sans-serif for menus and
> labels. Sun-drenched Mediterranean mood: fresh, refined, joyful. Smooth
> scroll-reveal animations and tasteful hover effects.
>
> **Home page, top to bottom:**
> 1. A thin **announcement bar**: "Handmade in Antalya · Orders & custom pieces
>    via Instagram DM".
> 2. A **header with the centered Morèna wordmark**, an uppercase menu row below
>    it (Collections, New Arrivals, The Maison, Contact), and an Instagram icon.
>    On mobile it collapses to a hamburger that opens a full-screen menu.
> 3. A **full-screen hero slider** (auto-rotating, with arrows and dots): first
>    slide a video of a young woman wearing the jewelry with the headline
>    "Jewellery with a young soul."; second slide "The Mediterranean edit".
> 4. **Collection category tiles** — large image tiles for Earrings, Necklaces
>    and Rings, each with a "Discover" hover label, linking to that category.
> 5. **New Arrivals product carousel** — a horizontally scrollable row of
>    product cards (photo, category, name, price), with left/right arrows.
> 6. **The Maison** — a split image + story section about a small studio in
>    Antalya where every piece is handmade in small batches.
> 7. An **editorial banner** (full-width image with a headline and button).
> 8. An **Instagram grid** strip linking to @morena_bijou_com.
> 9. A **newsletter signup** band that stores subscriber emails for the admin.
> 10. A **four-column footer**: brand blurb, Collections links, The Maison links,
>     and Contact (Instagram @morena_bijou_com, morenabijou@gmail.com, Antalya
>     Türkiye), with a copyright line.
>
> **Shop:** a Collections/Shop page with category filtering (earrings,
> necklaces, rings, bracelets). Each product has photo(s), name, category,
> materials, price and an availability flag. Ordering is via Instagram DM or
> email (no checkout needed for now, but structure it so a cart can be added
> later).
>
> **Admin:** a password-protected admin area where the owner can add / edit /
> remove products (upload photos, set name, category, materials, price,
> availability), reorder New Arrivals, edit the hero slides and the Maison text,
> and read newsletter signups and contact messages.
>
> Fully responsive (mobile-first), fast, SEO-friendly, page title
> "Morèna — Handmade Jewellery Maison · Antalya".

---

## Step 2 · Iterate in chat

- "Make the hero slider transitions slower and add a third slide."
- "Add Turkish as a second language with a TR/EN switcher."
- "Add a WhatsApp order button on each product."
- "Add a real shopping cart and checkout."
- "Let the admin set a sale price and show a 'Sale' badge."

## Step 3 · Connect the domain

In your app's settings → **Domains**, connect **morenabijou.com** (Caffeine
gives you the DNS records to set at your registrar). Once DNS propagates the
app serves at https://morenabijou.com.

## Media assets

The 1080p hero film and the bright product photos used on the current site were
generated with Higgsfield AI; their URLs are inside `index.html`. Download them
and upload them in the Caffeine chat to use as hero and product media. Replace
the placeholder product photos with photos of your real pieces whenever ready.
