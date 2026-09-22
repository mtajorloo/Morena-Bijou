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

Opening the draft: use the full link including the `#t=` fragment. If the canister-login page asks for a code, enter the token above. The Caffeine dashboard's Preview button issues a fresh token if this one expires. To get a public URL, publish the draft to live from the dashboard. Caffeine's automated runtime test never completed during the builds (the QA review and regression fixes did pass), so click through the draft once before sharing it. Caffeine's project API reported `draftState: no_draft` even after the deploy; its platform agent confirmed the draft is serving and that the record is stale.

## Run the prototype

Open `site/index.html` in a browser. Everything runs client-side in demo mode: log in with any email or the Internet Identity button, top up (play credits), pick digits, then press **Demo: turn the counter now** on the draw screen. The countdown tracks the real top of the hour in UTC.

## Palette

`#2A0710` background · `#4A0E1E` panels · `#6E1530` primary · `#8C2A45` wine · `#C9506F` rose · `#D4AF37` gold · `#F1D27A` gold light · `#F6ECDD` cream.

Fonts: Cormorant Garamond (display) · Manrope (UI) · Bebas Neue (counter digits).
