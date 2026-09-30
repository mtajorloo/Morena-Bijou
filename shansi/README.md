# SHANSI

Hourly game-of-chance website. Burgundy and gold. One flow: log in → top up → pick four digits → the counter turns at :00.

| Item | Where |
|---|---|
| Business plan | [`BUSINESS_PLAN.md`](BUSINESS_PLAN.md) |
| Owner control model, admin back office, real-money architecture | [`OPERATIONS_AND_ADMIN.md`](OPERATIONS_AND_ADMIN.md) |
| Phase A brief sent to Caffeine (real backend, accounts, admin) | [`CAFFEINE_PHASE_A_MESSAGE.md`](CAFFEINE_PHASE_A_MESSAGE.md) |
| Site design (static prototype) | [`site/index.html`](site/index.html), [`site/styles.css`](site/styles.css), [`site/app.js`](site/app.js) |
| Spec sent to Caffeine AI | [`CAFFEINE_SPEC.md`](CAFFEINE_SPEC.md) |
| Generated media (Nano Banana · Seedance via Higgsfield) | [`ASSETS.md`](ASSETS.md) |
| Lovable source export (reference implementation) | [`lovable-export/`](lovable-export/README.md) |
| Why Caffeine failed, step by step | [`CAFFEINE_ANALYSIS.md`](CAFFEINE_ANALYSIS.md) |
| Ready-to-send Caffeine port brief | [`CAFFEINE_PORT_MESSAGE.md`](CAFFEINE_PORT_MESSAGE.md) |
| Caffeine project | **SHANSI** · project id `01a0c8cc-6459-76dd-9217-57c65db6df53` (Internet Computer, Motoko backend) |
| Caffeine live site (v6, Phase A: real backend, accounts, admin) | https://shansi-9kc.caffeine.xyz · admin at `/admin` |
| Caffeine draft preview | https://potential-purple-imk-draft.caffeine.xyz/canister-login.html#t=ZISJE8Wyx9p7 |
| Lovable project (current build) | https://lovable.dev/projects/88ce5bcf-1a22-4066-9ad0-93c6a2921b90 · preview https://id-preview--88ce5bcf-1a22-4066-9ad0-93c6a2921b90.lovable.app |
| Replit app (cancelled, never built) | https://replit.com/@mtajorloo/PracticalCylindricalComputationallinguistics |

## Lovable and Replit builds (2026-09-30)

The Caffeine output never matched the agreed design and the Caffeine connector's authorisation expired, so the owner asked for the game to be rebuilt with the Lovable and Replit connectors from the original idea. Both agents were given the same brief: port the static prototype in `site/` one-to-one (the raw GitHub files of this branch are the reference), the palette tokens and fonts, the five-screen flow, email or Internet Identity sign-in, USDT / Visa / Mastercard demo top-ups, the four dials, the hourly split-flap counter with a "Run demo draw" button, the prize tiers, localStorage persistence and the optional Higgsfield media with CSS fallbacks.

| Platform | Project | Status |
|---|---|---|
| Lovable | project `88ce5bcf-1a22-4066-9ad0-93c6a2921b90`, workspace "Morteza's Lovable" | **Published** at https://shansi.lovable.app (08:34 UTC). Editor: https://lovable.dev/projects/88ce5bcf-1a22-4066-9ad0-93c6a2921b90 |
| Replit | app `3f07774a-312f-472c-9f10-a5dd4b2d335a` | **Cancelled by the owner (30 Sep, 10:15 UTC).** The Replit agent never produced any code (workspace unchanged since creation at 08:25 UTC). The connector has no cancel or delete operation, so no further prompts were sent; delete the app from the Replit dashboard (https://replit.com/@mtajorloo/PracticalCylindricalComputationallinguistics) to make sure nothing resumes. Not needed: the game is live on Caffeine and published on Lovable. |

**Lovable result.** One build pass produced the whole app: `src/lib/shansi-game.ts` (typed state, localStorage persistence, right-to-left matching, prize tiers, jackpot floor and rollover, Daily Drop, SHA-256 seed commit and reveal) and `src/components/ShansiApp.tsx` (top bar, five views, dials with arrows/drag/wheel, quick pick, 1 to 50 ticket stepper, four-wheel counter with staggered spin and right-to-left lock, result overlay with matched-digit highlighting and confetti, footer dialogs). The Higgsfield hero video, poster, counter clip, login icon and wallet art were fetched into Lovable assets, so the published site uses the generated media. The agent left some TypeScript type errors in `ShansiApp.tsx`; they do not affect the build or runtime because the build is plain `vite build`, but the workspace (free plan) ran out of credits before the clean-up and verification pass, so that pass needs credits added at https://lovable.dev/settings/billing.

## Caffeine deployment

**Phase A LIVE (2026-09-30, 11:56 UTC): version 6 at https://shansi-9kc.caffeine.xyz.** Phase A of [`OPERATIONS_AND_ADMIN.md`](OPERATIONS_AND_ADMIN.md), built from [`CAFFEINE_PHASE_A_MESSAGE.md`](CAFFEINE_PHASE_A_MESSAGE.md): Motoko backend with accounts, an append-only credit ledger, hourly draws on a canister timer with `raw_rand` and commit-reveal, tickets, prize tiers, jackpot floor and rollover, Daily Drop, roles (owner, finance, support), audit log, daily free credits, a withdrawal-request state machine (hidden from players until enabled); real Internet Identity login; the player screens rewired to the backend with the "Run demo draw" button removed; a public `/draws` fairness log; and the `/admin` back office (dashboard, draws with Run draw now, players, withdrawals queue, configuration, roles, audit log, system with kill switches and the Claim owner button). The first run stopped silently at 10:48 UTC after the backend engine; a resume prompt at 10:50 UTC finished the remaining steps, QA and tests, and deployed draft 4. Draft 4 (11:33 UTC) was followed by an automatic fix pass for two items its final test could not confirm (the draw page animating to the real backend result with fairness fields, and the maintenance page), which deployed draft 5 at 11:43 UTC; a further pass fixed a player-site loading hang and deployed draft 6 at 11:51 UTC, which was launched to production at 11:56 UTC. Platform record: `draftState: deployed`, `lastDeployedDraftId: 6`, `liveDraftId: 6`. **Verified by Caffeine's end-to-end check on the deployed build (12:00 UTC), all pass:** Internet Identity login; Claim owner at `/admin/system`; claim free credits; place ticket; Run draw now at `/admin/draws`; wheel animation and result overlay on the player Draw page; prize credited to the ledger; `/draws` shows commit hash, seed, raw randomness and ticket-list hash; all eight admin screens render; no horizontal scroll at 375 px; "Run demo draw" removed and the hourly :00 UTC timer draw armed. Email sign-in is disabled with the note "Email sign-in is being set up. Use Internet Identity." until a Resend API key is entered on the admin System screen. No gaps found against the Phase A brief. **Owner action now:** log in with Internet Identity on the live site and press Claim owner at `/admin/system` immediately, before anyone else can; then enter the Resend API key there if email sign-in is wanted.

**Live (2026-09-30, 10:07 UTC): version 3 at https://shansi-9kc.caffeine.xyz.** Version 3 is a one-to-one port of the Lovable build in [`lovable-export/`](lovable-export/README.md) (same components, styles, game logic, and the five Higgsfield media files downloaded into the frontend canister instead of hotlinked). The pipeline passed all five stages (baseline tests, port, media, verify with runtime test, draft deploy) in 19 minutes, and the platform record reads `draftState: deployed`, `lastDeployedDraftId: 3`, `liveDraftId: 3`. Draft canisters for v3: frontend `wom4l-xiaaa-aaaap-qqvpq-cai`, backend `tzc4k-fyaaa-aaaap-qqgya-cai`. The brief that produced it is [`CAFFEINE_PORT_MESSAGE.md`](CAFFEINE_PORT_MESSAGE.md); the post-mortem of the earlier failures is [`CAFFEINE_ANALYSIS.md`](CAFFEINE_ANALYSIS.md).

### Earlier history (22 Sep)


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
