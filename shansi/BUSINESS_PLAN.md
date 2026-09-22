# SHANSI — Business Plan

**Hourly digital-counter draw · burgundy & gold · built on the Internet Computer**

Version 1.0 · September 2026 · Prepared for the site owner

---

## 1. Executive summary

SHANSI is a single-purpose game-of-chance website. A player logs in with an email address or Internet Identity, tops up a wallet with USDT or a Visa/Mastercard, picks a 4-digit number, and waits for the top of the hour. At :00 a large, cinematic split-flap digital counter spins and locks four digits. Tickets that match win instantly to their wallet. There are 24 draws a day, every day.

The business is designed to be **profitable without ever betting against the player**. The jackpot is pari-mutuel (a fixed share of what was staked that hour, rolling over when nobody hits it), so the house keeps a fixed cut of every ticket and carries no jackpot risk. The three smaller prize tiers are fixed-odds, sized so that about **1 in 10 tickets wins something every hour**, which is what keeps players feeling the game is generous.

| Headline number | Value |
|---|---|
| Ticket price | 1 USDT (multi-ticket allowed, max 50 per draw) |
| Draw frequency | Every 60 minutes, 24 draws/day |
| Return to player (RTP) | 67.1 % |
| House gross margin | 32.9 % of every ticket, guaranteed by design |
| Share of tickets that win something | 10.0 % per draw |
| Break-even volume | ≈ 320 tickets/hour (≈ 230 k USDT staked per month) |
| Base-case month 12 | 3,000 tickets/hour → ≈ 2.16 M USDT staked/month, ≈ 340 k net profit |

The product will be prototyped and hosted on Caffeine (Internet Computer), which gives us Internet Identity login, on-chain USDT (ckUSDT), verifiable randomness for provably fair draws, and near-zero hosting cost.

**The one non-negotiable:** this is a lottery. Real-money play requires a gaming licence and geo-fencing before launch. The plan budgets for a Curaçao licence and sequences the launch so that no real money is taken before it is in place.

---

## 2. The product

### 2.1 One flow, five screens

The whole site is one page with a persistent top bar (balance · next-draw countdown · current jackpot). A player never has more than one decision on screen.

1. **Land** — countdown to the next draw, live jackpot, last winner. One button: *Enter*.
2. **Log in** — Email (magic link) or Internet Identity. Nothing else.
3. **Wallet** — balance, *Top up* (USDT · Visa · Mastercard), *Withdraw*.
4. **Pick** — four digit dials (0–9 each), *Quick pick*, quantity, *Place ticket*.
5. **The Draw** — at :00 the counter spins, digits lock one by one, confetti for winners, then the countdown restarts.

### 2.2 Game mechanics — "Pick-4 Counter"

- The counter draws one number from **0000 to 9999** every hour on the hour (UTC).
- A ticket is one 4-digit number. Matching is **from the right** (the last digits), which is easy to explain and easy to see on the counter as the wheels lock right-to-left.

| Tier | Condition | Odds per ticket | Prize |
|---|---|---|---|
| **Jackpot** | All 4 digits, exact | 1 / 10,000 | 50 % of the hour's pool + rollover, split among exact winners |
| Match 3 | Last 3 digits match, first digit wrong | 9 / 10,000 | 40 × ticket (40 USDT) |
| Match 2 | Last 2 digits match, third wrong | 90 / 10,000 | 5 × ticket (5 USDT) |
| Match 1 | Last digit matches, second wrong | 900 / 10,000 | 1 free ticket for the next draw |

**Rollover.** If no ticket matches all four digits, the jackpot tier (50 % of that hour's pool) carries into the next hour. At 300 tickets/hour the jackpot is hit roughly every 33 hours and climbs by ~150 USDT/hour in between; at 3,000 tickets/hour it is hit every ~3 hours. Both regimes produce a visible, growing number on the home screen.

**Daily Drop.** The 00:00 UTC draw always pays the jackpot: if nobody matches exactly, the ticket(s) numerically closest to the drawn number take it. This costs the house nothing (the money is already in the pool) and guarantees a big winner story every single day.

**Launch floor.** For the first 90 days the jackpot never displays below 500 USDT; the house seeds the difference if it is hit early. Expected cost ≈ 7 k USDT/month at launch volumes, treated as marketing.

### 2.3 Why the winner is happy

- **Frequency**: 24 chances a day, 10 % of tickets win each draw, results in under 10 seconds.
- **Instant credit**: winnings land in the wallet the moment the counter stops; USDT withdrawals under 1,000 are automatic within the hour.
- **Nothing hidden**: the pool size, ticket count, RTP, and every past draw are public. Each draw is provably fair (see §6).
- **A daily guaranteed jackpot** and a rollover that visibly grows.
- **Small stakes**: 1 USDT tickets, default daily deposit limit, no credit.

### 2.4 Why the owner is profitable

- **32.9 % of every ticket is retained by design.** Jackpot is pari-mutuel; fixed tiers cost 17.1 % of turnover on average with tiny variance at scale.
- **Zero jackpot risk** after the 90-day floor period.
- **Near-zero hosting cost** on the Internet Computer (cycles measured in hundreds of dollars a month).
- **Low payment cost** by steering deposits to USDT (≈ 1 %) and routing card users through an on-ramp partner who carries the card risk.

---

## 3. Economics

### 3.1 Return to player, per 1 USDT ticket

| Tier | Probability | Prize | Expected cost |
|---|---|---|---|
| Jackpot (pari-mutuel) | — | 50 % of pool | 0.500 |
| Match 3 | 0.0009 | 40 | 0.036 |
| Match 2 | 0.0090 | 5 | 0.045 |
| Match 1 | 0.0900 | 1 (credit) | 0.090 |
| **Total RTP** | | | **0.671** |
| **House gross margin** | | | **0.329** |

For comparison, state Pick-4 games return about 50 %; SHANSI is materially more generous while still keeping a third of turnover.

### 3.2 Cost structure (monthly)

| Line | Launch (m1–3) | Growth (m6) | Scale (m12) |
|---|---|---|---|
| Tickets / hour (avg) | 200 | 1,000 | 3,000 |
| Turnover (USDT) | 144,000 | 720,000 | 2,160,000 |
| Gross margin (32.9 %) | 47,400 | 236,900 | 710,600 |
| Payment fees (≈ 1.5 % of deposits) | 2,200 | 10,800 | 32,400 |
| Jackpot launch floor | 7,000 | 0 | 0 |
| Marketing & affiliates | 25,000 | 100,000 | 250,000 |
| Team (dev, design, ops, compliance) | 18,000 | 30,000 | 60,000 |
| Support (outsourced, 24/7 chat) | 2,000 | 5,000 | 15,000 |
| Licence, legal, audits (amortised) | 5,000 | 5,000 | 10,000 |
| Infrastructure (IC cycles, CDN, email, monitoring) | 600 | 1,000 | 3,000 |
| **Net profit** | **−12,400** | **≈ 85,100** | **≈ 340,200** |

Assumptions: 1,000 tickets/hour ≈ 24,000 tickets/day ≈ 3,000 daily players staking ~8 USDT each. Break-even sits at roughly 320 tickets/hour with launch-level fixed costs. Every figure is an assumption to be replaced by real data after month 1.

### 3.3 Player economics

| Metric | Target |
|---|---|
| Average deposit | 25 USDT |
| Deposit-to-play conversion | > 85 % |
| Average tickets per session | 4–6 |
| Sessions per player per day | 2–3 |
| D7 retention | > 30 % |
| D30 retention | > 15 % |
| CAC (affiliate / paid) | < 15 USDT |
| 90-day LTV (house margin) | > 45 USDT |

### 3.4 Start-up capital

| Item | USDT |
|---|---|
| Company formation + Curaçao licence (year 1) | 60,000 |
| Product build (design, Caffeine build, audits, provably-fair review) | 40,000 |
| Jackpot launch floor reserve | 25,000 |
| Marketing (first 90 days) | 75,000 |
| Operating runway (6 months of fixed costs) | 150,000 |
| **Total** | **≈ 350,000** |

---

## 4. Payments

| Rail | How | Fee | Phase |
|---|---|---|---|
| **USDT (ICP ckUSDT)** | Native on-chain deposit to the player's SHANSI account; instant, cheapest | ≈ 0.1 % | 1 |
| **USDT (TRC-20 / ERC-20)** | Via a crypto-payments provider that settles to our treasury | ≈ 0.5–1 % | 1 |
| **Visa / Mastercard via on-ramp** | Card → USDT on-ramp partner (MoonPay/Transak-class) embedded in the wallet screen; KYC and chargeback risk sit with the partner | 3–4.5 % (paid by player) | 2 |
| **Visa / Mastercard direct** | Own high-risk merchant account (MCC 7995) — requires the gaming licence, 4–8 % fees, rolling reserve | 4–8 % | 3 |

Withdrawals: USDT only, minimum 10 USDT, automatic under 1,000 USDT, manual review above. First withdrawal triggers identity verification.

---

## 5. Compliance & licensing (do this first)

SHANSI is a lottery product and is regulated everywhere it operates.

1. **Licence** — Curaçao (LOK regime) is the pragmatic first licence: 3–6 months, ≈ 50–60 k EUR/year all-in including the local company. Malta or Isle of Man later if entering regulated European markets.
2. **Geo-fencing** — block jurisdictions that prohibit unlicensed online lotteries (e.g., USA, UK, France, Australia, Netherlands and others per licence conditions). IP + payment-country checks.
3. **KYC / AML** — 18+ check at sign-up; identity verification before first withdrawal or when cumulative deposits exceed 2,000 USDT; sanctions screening; transaction monitoring; source-of-funds above 10,000 USDT.
4. **Responsible gaming** — default daily deposit limit (100 USDT, player-adjustable with 24 h cool-down), max 50 tickets per draw, self-exclusion (1 week to permanent), hourly reality check, no credit or bonuses that require wagering.
5. **Fairness** — published RTP, independent review of the draw algorithm, public draw log.
6. **Documents** — terms of service, privacy policy (GDPR-grade), game rules, complaints procedure.
7. **Tax** — gaming tax per licence jurisdiction; corporate structure advised by counsel.

Until the licence is issued the site runs in **play-money mode** (free daily credits, no deposits, no withdrawals) which is also the best possible pre-launch marketing.

---

## 6. Technology

| Layer | Choice | Why |
|---|---|---|
| Hosting & backend | **Internet Computer canisters (Motoko) via Caffeine** | Tamper-evident code, near-zero hosting cost, built-in timers for hourly draws |
| Login | **Internet Identity** + **email magic link** | II is native to ICP; email covers everyone else |
| Money | **ckUSDT ledger** on ICP; crypto PSP for TRC-20/ERC-20; on-ramp for cards | Instant on-chain settlement, no bank dependency |
| Randomness | **IC `raw_rand`** (threshold BLS, unpredictable) combined with a pre-committed server seed | Provably fair: commit hash before sales close, reveal after the draw |
| Draw scheduler | Canister timer fires at :00 UTC; sales close at :59:30 | Deterministic, auditable |
| Frontend | React + Tailwind (Caffeine standard) with the SHANSI design system | Motion via CSS keyframes; hero loop video generated with Seedance |
| Assets | Nano Banana (images) and Seedance (video) via Higgsfield | Consistent burgundy-and-gold brand visuals |

**Provably fair protocol per draw**
1. At :00 the canister publishes `H = sha256(seed_n)` for the upcoming draw.
2. Sales close at :59:30. The final ticket list hash `T` is published.
3. At :00 the canister calls `raw_rand()` → `R`; result = `sha256(seed_n ‖ R ‖ T) mod 10000`.
4. `seed_n`, `R`, `T`, and the result are published; anyone can recompute.

---

## 7. Brand & design

- **Name**: SHANSI — "chance", said with a smile. Tagline: *Every hour. One winner.*
- **Palette**: burgundy family with gold and cream accents.

| Token | Hex | Use |
|---|---|---|
| Burgundy 900 | `#2A0710` | Page background |
| Burgundy 700 | `#4A0E1E` | Panels |
| Burgundy 500 | `#6E1530` | Primary surfaces, buttons |
| Wine 400 | `#8C2A45` | Hover, borders |
| Rose 300 | `#C9506F` | Live indicators |
| Gold | `#D4AF37` | Digits, CTAs, rules |
| Gold light | `#F1D27A` | Highlights |
| Cream | `#F6ECDD` | Text |
| Ink | `#120508` | Deepest shadow |

- **Type**: Cormorant Garamond (display), Manrope (UI), Bebas Neue (counter digits).
- **Motion**: the counter is the hero. Split-flap wheels with a mechanical ease, digits lock right-to-left, gold particle burst on a win, everything else stays still so the eye is never lost.

---

## 8. Go-to-market

1. **Pre-launch (play-money)**: 60 days of free daily credits; leaderboard; collect emails; Telegram/X channels post every hourly result automatically.
2. **Referral**: both sides get 5 free tickets when the friend's first deposit is ≥ 10 USDT.
3. **Affiliates**: 25 % revenue share on referred players' net house margin, tracked on-chain.
4. **Auto-play**: save a lucky number and auto-buy each hour (capped by deposit limits) — the single biggest lever for predictable turnover.
5. **Daily Drop** at 00:00 UTC as the marketing anchor: "someone wins the jackpot every night".
6. **Content**: winner stories (with consent), draw replays, transparency page.
7. **Markets**: start with crypto-native, LATAM, SEA and CIS audiences where USDT is common and the licence permits; expand with each new licence.

---

## 9. Roadmap

| Phase | Weeks | Deliverable |
|---|---|---|
| 0 · Foundations | 1–4 | Company, licence application, counsel, brand, this design |
| 1 · Prototype | 2–6 | Caffeine build: II/email login, wallet, picker, counter, hourly draw with `raw_rand`, play-money |
| 2 · Soft launch | 6–14 | Public play-money beta, telemetry, provably-fair audit, Telegram bot |
| 3 · Real money | on licence | ckUSDT + crypto PSP live, KYC, limits, withdrawals, Daily Drop, launch floor |
| 4 · Cards | +8 weeks | On-ramp partner embedded; later direct acquiring |
| 5 · Scale | month 6+ | Affiliates, auto-play, second licence, mobile PWA, localisation |

---

## 10. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Operating without a licence | Play-money only until licensed; geo-fencing; counsel engaged from week 1 |
| Card acquiring refused | Launch on USDT; use an on-ramp partner; direct acquiring only after licence |
| Randomness disputes | Commit-reveal + IC `raw_rand`; public draw log; independent review |
| Low early liquidity (small jackpots) | 90-day jackpot floor; Daily Drop; rollover |
| Bonus abuse / multi-accounting | KYC before withdrawal; device and payment fingerprinting; referral paid only after deposit |
| Problem gambling & reputation | Conservative default limits, self-exclusion, no credit, clear RTP |
| Regulatory change | Multi-licence roadmap; treasury kept in stablecoins with segregated player funds |
| Key-person / vendor dependence | Code exported from Caffeine into the repo; canisters controlled by a multi-sig |

---

## 11. KPIs to watch weekly

Tickets per draw · unique players per draw · deposit conversion · average stake · rollover size · payout latency · D1/D7/D30 retention · CAC vs 90-day LTV · complaint rate · self-exclusion rate.

---

*This plan is a business document, not legal advice. Engage licensed gaming counsel in the target jurisdiction before accepting any real-money deposit.*
