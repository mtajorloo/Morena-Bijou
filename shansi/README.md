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

Caffeine AI built the full app from [`CAFFEINE_SPEC.md`](CAFFEINE_SPEC.md) (five screens, Motoko game engine with hourly `raw_rand` draws, Internet Identity + email login, demo-credit wallet, admin "Run draw now") and deployed it as a **draft**. Draft links are token-gated; the link above carries the token. To get a public URL, open the project in the Caffeine dashboard and publish the draft to live. Caffeine's automated runtime test did not complete during the build, so click through the draft once before sharing it. The follow-up message with the two Seedance video URLs was applied and redeployed.

## Run the prototype

Open `site/index.html` in a browser. Everything runs client-side in demo mode: log in with any email or the Internet Identity button, top up (play credits), pick digits, then press **Demo: turn the counter now** on the draw screen. The countdown tracks the real top of the hour in UTC.

## Palette

`#2A0710` background · `#4A0E1E` panels · `#6E1530` primary · `#8C2A45` wine · `#C9506F` rose · `#D4AF37` gold · `#F1D27A` gold light · `#F6ECDD` cream.

Fonts: Cormorant Garamond (display) · Manrope (UI) · Bebas Neue (counter digits).
