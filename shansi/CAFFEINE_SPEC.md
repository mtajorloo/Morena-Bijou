# SHANSI — build spec for Caffeine AI

Project name: **SHANSI**. Please name the project exactly "SHANSI".

## What it is

SHANSI is an hourly game-of-chance web app. A player logs in with Internet Identity or an email address, tops up a wallet, picks a 4-digit number (0000–9999), and at the top of every hour (:00 UTC) a large animated split-flap digital counter spins and locks four digits. Tickets that match win instantly to the wallet. Keep the experience extremely simple: one decision per screen, never more.

This first version is a **play-money prototype**: no real payments and no real withdrawals. The top-up buttons (USDT, Visa, Mastercard) must simulate a deposit of demo credits and show a small "demo" note. Real payment rails and licensing come later.

## Screens (single-page app, one persistent top bar)

Top bar (always visible): SHANSI wordmark on the left (a gold rounded square with a serif "S", then "SHANSI" in wide-tracked serif capitals); centre: "NEXT DRAW IN" label with a large mm:ss countdown to the next :00 UTC; right: "JACKPOT" amount in gold, "BALANCE" (only when logged in), and a Log in / Wallet button.

1. **Landing** — full-viewport hero with the looping ambient video below (poster image as fallback), a burgundy vignette on the left so text is readable. Eyebrow "EVERY HOUR · ONE WINNER"; headline "The counter turns / at the top of the hour." (second line italic gold); lede "Pick four digits. Top up with USDT or your card. When the clock hits :00, the SHANSI counter spins and pays winners instantly."; three stats: Next draw (countdown), Current jackpot (gold), Last result (four digits); a gold pill button "Enter" and a text link "How it works". Below the hero: three steps (Pick / Wait / Win) in cards, a 4-tile prize table (Jackpot: all 4 digits, 50% of pool + rollover · Match 3: last 3 digits, 40× · Match 2: last 2 digits, 5× · Match 1: last digit, free ticket), and a showcase of the counter video (poster: counter image) with caption "The SHANSI counter. Four wheels, one result, every hour."
2. **Login** — a narrow centred card with the round gold fingerprint icon image, title "Welcome to SHANSI", sub "Two ways in. Nothing else to fill.", an email field + gold button "Continue with email" (email/passkey style login is fine for now), an "or" divider, and an outlined button "∞ Continue with Internet Identity" using real Internet Identity. Fine print: "18+ only. By continuing you accept the game rules and confirm you are in a permitted jurisdiction."
3. **Wallet** — two columns. Left: balance card (deep burgundy, the wallet artwork faded in the top-right corner), "YOUR BALANCE", big gold number, "Signed in as …", buttons Withdraw (demo: shows "Withdrawal requested — USDT arrives within the hour") and "Play →". Right: "Top up" card with three method tiles (₮ USDT "TRC-20 · ERC-20 · ICP", VISA "via secure on-ramp", Mastercard with the two overlapping circles "via secure on-ramp"), amount chips 10 / 25 / 50 / 100, a gold button "Top up ₮ 25 with USDT" (text follows the selection), fine print "Default daily deposit limit 100 USDT. Adjust in settings with a 24-hour cool-down."
4. **Pick** — two columns. Left: "Pick your four digits", four vertical digit dials (each a small dark window showing one big gold digit with ▲ / ▼ buttons; support mouse wheel and touch drag), "✦ Quick pick" outlined button, a − 1 + ticket stepper (max 50), "tickets · ₮ 1" cost, a gold "Place ticket" button, fine print "Sales close 30 seconds before the draw." Placing a ticket deducts 1 credit per ticket from the balance and disables when the countdown is under 30 seconds. Right: "Your tickets for this draw" list, "TICKETS IN POOL" and "JACKPOT" stats, outlined button "Go to the counter →".
5. **Draw** — centred stage: eyebrow "THE COUNTER TURNS IN mm:ss"; the counter: a wide rounded burgundy-lacquer housing with a gold border and outer gold ring glow, holding four tall dark wheels, each showing one huge glowing gold digit (Bebas Neue style). During the draw the wheels spin fast (each slightly out of phase) for ~1.5 s, then lock one by one from right to left with a snap and a brief gold flash, ~0.7 s apart. Under it: Jackpot, Your tickets, "Provably fair · sha256 · <commit hash>". A results modal then covers the whole screen (dark blurred backdrop): eyebrow "You won" / "JACKPOT" / "Result", the four digits huge in gold, a sentence ("Match 3 · ₮ 40 credited to your wallet." or "Not this time. The next draw is under an hour away."), gold confetti burst on a win, button "Play the next draw". Below the stage: a row of recent winner pills ("0-3-0-9 · Match 3 · ₮ 40"). Include an admin-only "Run draw now" control so the demo can be shown without waiting an hour.

Footer: "SHANSI · Every hour. One winner." · "18+ · Play responsibly · Deposit limits · Self-exclusion" · "Provably fair · RTP 67.1% · Draws at :00 UTC".

## Backend (Motoko)

- Users: principal (Internet Identity) or email identity; balance in demo credits (2 decimals); created-at.
- Draws: id, scheduled time (:00 UTC), status (open / closed / drawn), commit hash published when the draw opens, result digits, random seed revealed after the draw, pool size, jackpot amount, rollover.
- Tickets: draw id, owner, four digits, price 1, prize tier and amount after the draw.
- Timer: a canister timer closes sales at :59:30 and runs the draw at :00 using the management canister `raw_rand` combined with the committed seed: result = sha256(seed ‖ raw_rand ‖ ticketListHash) mod 10000. Publish seed and randomness so anyone can verify.
- Prizes: pool = tickets × 1. Jackpot tier = 50 % of pool + rollover, split among tickets matching all four digits; if none, roll over. Match 3 (last three digits, first wrong) pays 40; Match 2 (last two) pays 5; Match 1 (last digit) credits one free ticket (1). Credit winners immediately.
- The 00:00 UTC draw always pays the jackpot: if nobody matches exactly, the numerically closest ticket(s) win it ("Daily Drop").
- Limits: max 50 tickets per user per draw; default daily deposit limit 100.
- Admin (the deployer principal): run draw now, seed jackpot, view stats.

## Design system

Colours: background #2A0710, panels #4A0E1E, primary #6E1530, wine #8C2A45, rose #C9506F, gold #D4AF37, gold light #F1D27A, cream text #F6ECDD, deepest shadow #120508. Page background: radial wine glow top-left, faint gold glow top-right, vertical gradient to near-black. Slowly rising tiny gold particles across the whole page (canvas, low opacity).

Fonts (Google Fonts): Cormorant Garamond for headlines, Manrope for UI, Bebas Neue for every digit (countdown, counter, dials, balances).

Components: pill buttons; the primary button is a gold gradient with a soft gold shadow and dark text; outlined buttons have a thin gold border; cards are deep burgundy with a 1px gold-tinted border and a large soft shadow; all corners 18px. Screens fade-and-rise in over 0.6 s. Respect prefers-reduced-motion.

## Media (already generated; use these URLs)

- Hero poster (21:9): https://d8j0ntlcm91z4.cloudfront.net/user_3F1VtchxdxeZzONSsRIyI88MO2d/hf_20260922_105831_9765a37d-e810-448b-9812-d6709835af68.png
- Hero ambient loop video (21:9, mp4): {{HERO_VIDEO}}
- Counter showcase image (16:9): https://d8j0ntlcm91z4.cloudfront.net/user_3F1VtchxdxeZzONSsRIyI88MO2d/hf_20260922_105829_038dcdb5-68a3-406c-a641-4b9227b9c086.png
- Counter turning video (16:9, mp4): {{COUNTER_VIDEO}}
- Login icon (1:1): https://d8j0ntlcm91z4.cloudfront.net/user_3F1VtchxdxeZzONSsRIyI88MO2d/hf_20260922_105829_cebc3355-9066-4dfe-837f-8b8eb6a1936e.png
- Wallet art (1:1): https://d8j0ntlcm91z4.cloudfront.net/user_3F1VtchxdxeZzONSsRIyI88MO2d/hf_20260922_105829_e3965a3c-b588-48f6-85b4-87683cf26849.png
- Winner burst (16:9): https://d8j0ntlcm91z4.cloudfront.net/user_3F1VtchxdxeZzONSsRIyI88MO2d/hf_20260922_105830_f3c2c527-93a8-4f4f-8d9f-3e962284fb95.png
- Numbered spheres (16:9): https://d8j0ntlcm91z4.cloudfront.net/user_3F1VtchxdxeZzONSsRIyI88MO2d/hf_20260922_105831_07e50e46-8cdb-4d5e-9b1a-fc1e3c8534d2.png
- Payment flat-lay (4:3): https://d8j0ntlcm91z4.cloudfront.net/user_3F1VtchxdxeZzONSsRIyI88MO2d/hf_20260922_105829_b35af9a1-56a5-4aa9-8878-f8fac21e7a43.png
- Velvet texture (1:1, tile): https://d8j0ntlcm91z4.cloudfront.net/user_3F1VtchxdxeZzONSsRIyI88MO2d/hf_20260922_105830_cc2444bf-1211-4468-b654-5d0e4d3d594f.png

If any URL cannot be loaded, fall back to the burgundy gradients described above; do not block the build on media.

Please build the complete app and deploy it so a draft URL is available.
