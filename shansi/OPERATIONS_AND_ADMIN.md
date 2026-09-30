# SHANSI — from demo to a real business: control model, admin back office, real-money architecture

Companion to [`BUSINESS_PLAN.md`](BUSINESS_PLAN.md). The site live at https://shansi-9kc.caffeine.xyz (Caffeine v3) is the **front end** of the product in play-money mode, exactly as the plan's Phase 1 prescribes. This document covers what the plan left out: how the owner controls the business day to day, and what has to change under the hood before a player can log in for real, deposit real money and withdraw it.

## 1. What the live site is, and is not

| Area | Today (v3) | Real product |
|---|---|---|
| Login | Simulated: any email plus any 6-digit code; Internet Identity button creates a fake principal | Real Internet Identity (native on the Internet Computer) and email one-time code sent by an email provider; one account per principal |
| Wallet | Play credits stored in the browser (localStorage); refresh-proof but not shared between devices and editable by the player | Server-side ledger inside the backend canister; every credit and debit is an immutable record; balances survive devices and cannot be edited by the player |
| Deposits | Visual only | ckUSDT on the Internet Computer (instant, on-chain), TRC-20/ERC-20 USDT through a crypto payments provider, cards through an on-ramp partner and later a licensed merchant account |
| Withdrawals | None | Request → automated risk checks → automatic payout under a threshold, manual approval above it → on-chain transfer |
| Draw | Runs in the browser when the player presses "Run demo draw" or at :00 UTC while the page is open | Runs in the backend canister on a timer at :00 UTC using `raw_rand`, with the commit-reveal protocol from the business plan; players only watch |
| Tickets and jackpot | Simulated pool of other players | Real ticket ledger, real pool, real rollover and jackpot reserve |
| Admin | None | A back office at `/admin`, visible only to owner-approved principals |
| Compliance | "18+ · play-money" footer text | Licence, KYC provider, geo-blocking, limits and self-exclusion enforced server-side |

None of this is a defect in the build: it is the boundary the plan drew until a licence exists. The rest of this document is the path across that boundary.

## 2. How the owner controls the business

Think of four layers of control. The admin page is only the visible one.

### 2.1 Roles

| Role | Who | Can |
|---|---|---|
| **Owner** | You (your Internet Identity principal, plus a backup principal kept offline) | Everything below, plus grant and revoke roles, change game configuration, move treasury funds, pause the site |
| **Finance** | You at first, later a bookkeeper | Approve or reject withdrawals, reconcile ledgers, export statements, manual balance adjustments (with owner co-approval) |
| **Support** | Customer support staff | Look up players, view their history, add notes, apply temporary limits, reset an email login |
| **Compliance** | You or an outsourced officer | KYC decisions, AML flags, self-exclusion, geo rules, audit exports |

Every role is a list of principals stored in the backend canister. Every admin action is written to an append-only audit log with the acting principal, timestamp, before and after values.

### 2.2 The admin back office (`/admin`)

Nine screens, in the order you will use them daily.

1. **Dashboard.** Next draw countdown and sales status. Today and this week: tickets sold, gross gaming revenue (sales minus prizes), actual RTP against the 67 % target, active players, new sign-ups, deposits, withdrawals paid, withdrawals pending, jackpot liability, hot-wallet balance, cycles balance of the canisters. Red badges when anything is outside its band.
2. **Draws.** Every draw: number, seed hash, revealed seed, `raw_rand` value, ticket-list hash, winners per tier, amount paid, rollover. Controls: close sales early, postpone the next draw by up to N minutes (emergency only), and nothing else. A result can never be edited, and the UI should not offer it.
3. **Players.** Search by email, principal, or ticket. Profile: KYC status, balance, deposit and withdrawal history, tickets, limits, self-exclusion status, flags, support notes. Actions: freeze account, lift or lower limits, force KYC, close account.
4. **Withdrawals queue.** Each request with the automated checks already evaluated (KYC verified, wagering met, no open flags, under velocity limit, address not blacklisted). Approve, reject with reason, or hold. Above the auto-payout threshold a second approver is required (four-eyes).
5. **Deposits and reconciliation.** Incoming ckUSDT transfers, provider webhooks for TRC-20/ERC-20 and on-ramp purchases, matched against ledger credits. Unmatched items are the first thing Finance looks at each morning.
6. **Treasury.** Balances of the player-funds wallet, jackpot reserve, operating wallet and cold storage. The daily sweep: house margin from player funds to operating; top-up of the jackpot reserve to its floor. Transfers above a threshold require the owner's second key.
7. **Game configuration.** Ticket price, prize tiers, jackpot share and floor, sales-close offset, max tickets per player, default and maximum deposit limits, launch-jackpot floor, Daily Drop rule. Changes are versioned and take effect from the next draw, never mid-draw.
8. **Compliance.** KYC provider queue and decisions, AML thresholds and alerts (structuring, rapid deposit-withdraw cycles, multi-accounting by device or address), blocked countries, self-exclusion register, regulator reports export.
9. **Audit log and system.** Every admin action; canister upgrade history; kill switches: pause sales, pause deposits, pause withdrawals, maintenance mode. Each switch is one button and one confirmation.

### 2.3 Treasury policy (what protects the business and the players)

- **Segregate player funds** from operating funds from day one. Licences require it, and it is the only way to know you can always pay out.
- **Jackpot reserve** funded to at least the current jackpot plus the launch floor at all times.
- **Hot wallet** holds only what a day of withdrawals needs (plan: automatic payouts under 1,000 USDT); the rest in cold storage under keys you hold personally.
- **Daily close**: ledger total of player balances = player-funds wallet balance. If not, withdrawals pause automatically until Finance resolves it.
- **Four-eyes** on anything that moves money out of player funds other than a player's own approved withdrawal.

### 2.4 Numbers to watch (from the plan's KPI list, made operational)

| Signal | Band | If outside |
|---|---|---|
| Actual RTP (rolling 24 h) | 60 to 74 % | Investigate the draw log immediately; pause sales if above 90 % |
| Withdrawal queue age | under 4 h | Finance is behind; alert |
| Hot wallet | above 1.5 × yesterday's payouts | Top up from cold storage |
| Deposits per player per day | under the limit, no clustering | AML review |
| Draw execution | every hour at :00 within 5 s | Timer or cycles problem; alert |
| Canister cycles | above 30 days of runway | Top up |

## 3. Real-money architecture on Caffeine and the Internet Computer

The current stack (Motoko backend, React frontend, Caffeine hosting) is the right one for the crypto rails; only the responsibilities move.

### 3.1 Backend canister (the game and the bank)

- **Accounts**: principal → profile (email, KYC status, limits, flags, role).
- **Ledger**: append-only entries {id, account, type, amount, reference, timestamp}; balances derived, never edited. Types: deposit, ticket, prize, withdrawal_request, withdrawal_paid, adjustment, fee.
- **Draw engine**: timer at :00 UTC; commit hash published for draw n+1; sales close at :59:30; `raw_rand` → result; payouts credited in the same call; commit-reveal data published. Exactly the protocol in the business plan, section 6.
- **Tickets**: per draw, per account, immutable once sales close; ticket-list hash published at close.
- **Withdrawals**: state machine requested → checked → approved → paid / rejected, with the checks listed in 2.2 step 4.
- **Admin API**: role-gated update calls, each writing to the audit log.
- **Stable memory** for everything; upgrade-safe.

### 3.2 Money rails, in the order to switch them on

1. **ckUSDT (ICRC-1/ICRC-2 ledger on the Internet Computer).** The backend calls the ckUSDT ledger directly: deposits arrive at a per-player sub-account, the backend credits the ledger; withdrawals are `icrc1_transfer` calls from the player-funds account. No third party, fees near zero, settlement in seconds. This is the rail to build first.
2. **TRC-20 and ERC-20 USDT via a crypto payments provider** (the plan's 0.5 to 1 % option). Provider generates a deposit address per player, posts a webhook when funds confirm; the backend receives it through an HTTPS outcall relay or a small off-chain gateway and credits the ledger. Payouts through the provider's API with the same four-eyes rule.
3. **Cards through an on-ramp partner** embedded in the wallet screen (MoonPay or Transak class): the player buys USDT with a card, KYC and chargebacks sit with the partner, funds land on the ckUSDT rail. No gaming merchant account needed.
4. **Direct card acquiring** (MCC 7995) only once the licence exists; fees 4 to 8 % and a rolling reserve, as the plan says.

### 3.3 Login

- **Internet Identity**: real, built into Caffeine; the principal becomes the account key.
- **Email**: one-time code sent through an email API (Resend or Postmark class) via an HTTPS outcall from the canister or a gateway; the code is verified server-side and bound to a derived principal.

### 3.4 Who holds the keys

Before real money moves, the canister **controllers** must include a key you own, not only Caffeine's platform key, and you need a tested procedure to upgrade or freeze the canisters without the platform. Check Caffeine's terms of service for real-money gaming and its controller model before Phase 3; if either is a blocker, the same Motoko code deploys with `dfx` to canisters you control entirely.

## 4. What must exist before the first real deposit

1. Company and licence (plan section 5; Curaçao first).
2. KYC provider contract (Sumsub or Veriff class), integrated at first withdrawal or 2,000 USDT cumulative deposits.
3. Geo-blocking list and IP checks.
4. Terms, privacy policy, game rules, complaints procedure, responsible-gaming page.
5. Independent review of the draw algorithm and a public draw log (the commit-reveal data).
6. Treasury wallets set up with the segregation in 2.3 and your keys in cold storage.
7. The back office in 2.2 with at least Owner and Finance roles live.
8. A dry run: one full week of play-money operation on the real backend with real Internet Identity accounts, withdrawals queue exercised with test amounts.

## 5. Proposed build phases on Caffeine

| Phase | Scope | Money | Needs licence |
|---|---|---|---|
| **A. Real backend, real accounts, admin** | Move the draw engine, tickets and ledger into the backend canister; real Internet Identity login; email code login; `/admin` with Owner, Finance and Support roles, dashboard, draws, players, game configuration, audit log, kill switches; remove "Run demo draw" from the player site | Play credits (free daily credits as the plan's pre-launch marketing) | No |
| **B. ckUSDT rail and withdrawals** | Deposits and withdrawals on ckUSDT, withdrawal queue with checks and four-eyes, treasury screen, reconciliation, KYC provider hook, limits and self-exclusion enforced server-side | Real, crypto only | Yes |
| **C. Fiat and third-party rails** | Crypto payments provider for TRC-20/ERC-20; card on-ramp partner; compliance screen and AML alerts; regulator exports | Real | Yes |
| **D. Direct cards and scale** | Merchant account, affiliates, second licence, PWA | Real | Yes |

Phase A is buildable on Caffeine now and carries no regulatory risk. It also makes Phase B a configuration change rather than a rebuild, because the ledger, roles, queue and audit log already exist.
