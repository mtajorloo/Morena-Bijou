# SHANSI

Hourly game-of-chance website. Burgundy and gold. One flow: log in → top up → pick four digits → the counter turns at :00.

| Item | Where |
|---|---|
| Business plan | [`BUSINESS_PLAN.md`](BUSINESS_PLAN.md) |
| Site design (static prototype) | [`site/index.html`](site/index.html), [`site/styles.css`](site/styles.css), [`site/app.js`](site/app.js) |
| Spec sent to Caffeine AI | [`CAFFEINE_SPEC.md`](CAFFEINE_SPEC.md) |
| Generated media (Nano Banana · Seedance via Higgsfield) | [`ASSETS.md`](ASSETS.md) |
| Caffeine project | **SHANSI** · project id `01a0c8cc-6459-76dd-9217-57c65db6df53` (Internet Computer, Motoko backend) |
| Caffeine draft preview | https://potential-purple-imk-draft.caffeine.xyz/canister-login.html#t=ZISJE8Wyx9p7 |

## Caffeine deployment

Caffeine AI built the full app from [`CAFFEINE_SPEC.md`](CAFFEINE_SPEC.md) (five screens, Motoko game engine with hourly `raw_rand` draws, Internet Identity + email login, demo-credit wallet, admin "Run draw now") and deployed it as a **draft**. The follow-up message with the two Seedance video URLs was applied and redeployed.

| Detail | Value |
|---|---|
| Draft domain | `potential-purple-imk-draft.caffeine.xyz` |
| Draft gate token (the `#t=` fragment) | `ZISJE8Wyx9p7` |
| Draft frontend canister | `saxlv-eaaaa-aaaah-atbtq-cai` |
| Draft backend canister | `rpbwc-ryaaa-aaaah-atzba-cai` |

**Deployment status (2026-09-22, 16:36 UTC):** the draft is **deployed** (platform `draftState: deployed`, `lastDeployedDraftId: 1`). Open it with the full link above including the `#t=` fragment; if the canister-login page shows a field, enter the token. Publish to live from the Caffeine dashboard for a public URL.

What it took: four earlier builds passed QA but never committed a deploy because Caffeine's automated preview test never finished. The cause was the hotlinked Higgsfield media on `d8j0ntlcm91z4.cloudfront.net`, which the test environment cannot reach, so the page never finished loading. The deployed build therefore uses a burgundy gradient hero, a CSS-drawn four-wheel counter, and gold SVG icons instead of the generated images and videos. **Faithful-port rebuild (started 17:10 UTC):** the owner reported that Caffeine's first build did not match the agreed design, so Caffeine was pointed at the raw files of `site/` on this branch as the exact reference and asked to port them one-to-one (five screens, tokens, fonts, dials, split-flap counter, result overlay, particles; gradient hero, CSS counter showcase and SVG icons in place of external media). Last observed state: all five screens built and marked as matching the reference, backend wiring done, build check passed, review and publish pending. The live site at `shansi-9kc.caffeine.xyz` is a snapshot of the earlier version until the new draft is published from the dashboard.

To restore the Nano Banana and Seedance media, download the files in [`ASSETS.md`](ASSETS.md) and upload them as project assets in the Caffeine dashboard (or into `site/assets/` for the static prototype), rather than hotlinking them.

## Run the prototype

Open `site/index.html` in a browser. Everything runs client-side in demo mode: log in with any email or the Internet Identity button, top up (play credits), pick digits, then press **Demo: turn the counter now** on the draw screen. The countdown tracks the real top of the hour in UTC.

## Palette

`#2A0710` background · `#4A0E1E` panels · `#6E1530` primary · `#8C2A45` wine · `#C9506F` rose · `#D4AF37` gold · `#F1D27A` gold light · `#F6ECDD` cream.

Fonts: Cormorant Garamond (display) · Manrope (UI) · Bebas Neue (counter digits).
