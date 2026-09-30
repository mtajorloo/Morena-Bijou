import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ChevronDown, ChevronUp, CreditCard, Fingerprint, Minus, Play, Plus, RefreshCw, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DAILY_LIMIT,
  JACKPOT_FLOOR,
  TICKET_PRICE,
  countdownParts,
  dayKey,
  formatUSDT,
  initialState,
  loadState,
  makeCommitment,
  nextDrawTime,
  randomDigits,
  randomId,
  randomInt,
  rightMatches,
  saveState,
  shortHash,
  tierFor,
  type CompletedDraw,
  type GameState,
  type PaymentMethod,
  type TicketResult,
  type View,
} from "@/lib/shansi-game";
import heroVideo from "@/assets/shansi-hero.mp4.asset.json";
import heroPoster from "@/assets/shansi-hero-poster.png.asset.json";
import counterVideo from "@/assets/shansi-counter.mp4.asset.json";
import loginArt from "@/assets/shansi-login.png.asset.json";
import walletArt from "@/assets/shansi-wallet.png.asset.json";
import { ParticleCanvas } from "@/components/ShansiParticles";

const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
const DIGITS = Array.from({ length: 10 }, (_, index) => index);

export function ShansiApp() {
  const [state, setState] = useState<GameState>(() => initialState(1_799_000_000_000));
  const [view, setView] = useState<View>("landing");
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(1_799_000_000_000);
  const [emailStep, setEmailStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [network, setNetwork] = useState<"TRC-20" | "ERC-20">("TRC-20");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [isSpinning, setIsSpinning] = useState(false);
  const [lockedWheels, setLockedWheels] = useState<number[]>([]);
  const [displayDigits, setDisplayDigits] = useState([7, 3, 0, 9]);
  const [result, setResult] = useState<CompletedDraw | null>(null);
  const [quickPicking, setQuickPicking] = useState<number[]>([]);
  const autoDrawRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = loadState();
    const current = Date.now();
    let next = stored;
    if (stored.currentDrawAt <= current) {
      const hoursPassed = Math.max(1, Math.ceil((current - stored.currentDrawAt) / 3_600_000));
      const simulatedTickets = hoursPassed * (300 + randomInt(601));
      next = {
        ...stored,
        currentDrawAt: nextDrawTime(current),
        poolTickets: 300 + randomInt(601),
        jackpot: Math.max(JACKPOT_FLOOR, stored.jackpot + simulatedTickets * 0.5),
        tickets: [],
      };
    }
    setState(next);
    setDisplayDigits(next.history[0]?.result.split("").map(Number) ?? [7, 3, 0, 9]);
    setNow(current);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [hydrated, state]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hydrated || (state.seed && state.seedHash !== "Preparing commitment…")) return;
    void makeCommitment().then(({ seed, hash }) => setState((current) => ({ ...current, seed, seedHash: hash })));
  }, [hydrated, state.seed, state.seedHash]);

  const countdown = countdownParts(state.currentDrawAt, now);
  const salesClosed = countdown.total <= 30;
  const remainingToday = Math.max(0, DAILY_LIMIT - (state.depositDay === dayKey(now) ? state.depositedToday : 0));
  const lastResult = state.history[0]?.result ?? "7309";
  const selectedAmount = customAmount ? Number(customAmount) : state.amount;
  const currentTickets = state.tickets.filter((ticket) => ticket.drawAt === state.currentDrawAt);

  const go = (target: View) => {
    const protectedView = target === "wallet" || target === "pick" || target === "draw";
    setView(protectedView && !state.user ? "signin" : target);
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const completeEmailSignIn = (event: FormEvent) => {
    event.preventDefault();
    if (emailStep === "email") {
      setEmailStep("code");
      toast("Your demo code is ready — enter any 6 digits");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      toast.error("Enter any 6-digit code");
      return;
    }
    setState((current) => ({ ...current, user: { id: email, label: email, kind: "email" } }));
    toast.success("Signed in to the play-money demo");
    setView("wallet");
  };

  const signInWithIdentity = () => {
    const principal = `${randomInt(36).toString(36)}${randomInt(36).toString(36)}${randomInt(36).toString(36)}${randomInt(36).toString(36)}f-${randomInt(99).toString().padStart(2, "0")}…`;
    setState((current) => ({ ...current, user: { id: principal, label: principal, kind: "identity" } }));
    toast.success("Internet Identity connected");
    setView("wallet");
  };

  const selectMethod = (method: PaymentMethod) => setState((current) => ({ ...current, method }));

  const topUp = () => {
    const amount = Number(selectedAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Choose a valid top-up amount");
      return;
    }
    if (amount > remainingToday) {
      toast.error(`Daily limit reached — ${formatUSDT(remainingToday)} remaining today`);
      return;
    }
    if (state.method !== "USDT" && (!card.number || !card.expiry || !card.cvc)) {
      toast.error("Complete the demo card details");
      return;
    }
    const transaction = {
      id: randomId("credit"),
      type: "credit" as const,
      label: `${state.method} demo top-up`,
      amount,
      at: Date.now(),
    };
    setState((current) => ({
      ...current,
      balance: current.balance + amount,
      depositedToday: (current.depositDay === dayKey() ? current.depositedToday : 0) + amount,
      depositDay: dayKey(),
      transactions: [transaction, ...current.transactions].slice(0, 12),
    }));
    setCustomAmount("");
    toast.success("Demo credits added");
  };

  const changeDigit = (index: number, delta: number) => {
    setState((current) => ({
      ...current,
      picked: current.picked.map((digit, digitIndex) => (digitIndex === index ? (digit + delta + 10) % 10 : digit)),
    }));
  };

  const quickPick = () => {
    const digits = randomDigits();
    DIGITS.slice(0, 4).forEach((_, index) => {
      window.setTimeout(() => {
        setQuickPicking((current) => [...current, index]);
        setState((current) => ({ ...current, picked: current.picked.map((digit, digitIndex) => (digitIndex === index ? digits[index] : digit)) }));
        window.setTimeout(() => setQuickPicking((current) => current.filter((item) => item !== index)), 420);
      }, index * 90);
    });
  };

  const placeTickets = () => {
    if (salesClosed) {
      toast.error("Sales closed for this draw");
      return;
    }
    const cost = state.quantity * TICKET_PRICE;
    if (state.balance < cost) {
      toast.error("Top up your wallet first");
      go("wallet");
      return;
    }
    if (currentTickets.length + state.quantity > 50) {
      toast.error(`You can add up to ${50 - currentTickets.length} more tickets`);
      return;
    }
    const newTickets = Array.from({ length: state.quantity }, (_, index) => ({
      id: randomId(`ticket-${index}`),
      number: (index === 0 ? state.picked : randomDigits()).join(""),
      drawAt: state.currentDrawAt,
    }));
    const transaction = { id: randomId("ticket"), type: "ticket" as const, label: `${state.quantity} draw ticket${state.quantity > 1 ? "s" : ""}`, amount: -cost, at: Date.now() };
    setState((current) => ({
      ...current,
      balance: current.balance - cost,
      tickets: [...current.tickets, ...newTickets],
      poolTickets: current.poolTickets + state.quantity,
      jackpot: current.jackpot + state.quantity * 0.5,
      transactions: [transaction, ...current.transactions].slice(0, 12),
    }));
    toast.success(`${state.quantity} ticket${state.quantity > 1 ? "s" : ""} placed`);
    setView("draw");
  };

  const runDraw = async () => {
    if (isSpinning) return;
    setResult(null);
    setIsSpinning(true);
    setLockedWheels([]);
    const winningDigits = randomDigits();
    const winningNumber = winningDigits.join("");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    await wait(reduced ? 150 : 1450);
    for (let index = 3; index >= 0; index -= 1) {
      setDisplayDigits((current) => current.map((digit, digitIndex) => (digitIndex === index ? winningDigits[index] : digit)));
      setLockedWheels((current) => [...current, index]);
      await wait(reduced ? 80 : 520);
    }
    await wait(reduced ? 80 : 350);

    const exactTickets = currentTickets.filter((ticket) => rightMatches(ticket.number, winningNumber) === 4);
    const isDailyDrop = new Date(state.currentDrawAt).getUTCHours() === 0;
    let dailyDropIds: string[] = [];
    if (isDailyDrop && exactTickets.length === 0 && currentTickets.length > 0) {
      const target = Number(winningNumber);
      const closest = Math.min(...currentTickets.map((ticket) => Math.abs(Number(ticket.number) - target)));
      dailyDropIds = currentTickets.filter((ticket) => Math.abs(Number(ticket.number) - target) === closest).map((ticket) => ticket.id);
    }
    const jackpotWinners = exactTickets.length || dailyDropIds.length;
    const ticketResults: TicketResult[] = currentTickets.map((ticket) => {
      const matches = rightMatches(ticket.number, winningNumber);
      const dailyWinner = dailyDropIds.includes(ticket.id);
      let amount = matches === 3 ? 40 : matches === 2 ? 5 : matches === 1 ? 1 : 0;
      if (matches === 4 || dailyWinner) amount = jackpotWinners ? state.jackpot / jackpotWinners : 0;
      return { ticket, matches, tier: dailyWinner ? "Daily Drop" : tierFor(matches), amount };
    });
    const totalWon = ticketResults.reduce((total, item) => total + item.amount, 0);
    const simulatedPlayers = 300 + randomInt(601);
    const record = {
      id: randomId("draw"),
      drawnAt: Date.now(),
      result: winningNumber,
      poolTickets: state.poolTickets,
      jackpot: state.jackpot,
      seedHash: state.seedHash,
      seed: state.seed,
    };
    const jackpotPaid = jackpotWinners > 0;
    const nextCommitment = await makeCommitment();
    setState((current) => ({
      ...current,
      balance: current.balance + totalWon,
      currentDrawAt: nextDrawTime(),
      tickets: current.tickets.filter((ticket) => ticket.drawAt !== current.currentDrawAt),
      history: [record, ...current.history].slice(0, 24),
      jackpot: jackpotPaid ? Math.max(JACKPOT_FLOOR, simulatedPlayers * 0.5) : current.jackpot + simulatedPlayers * 0.5,
      poolTickets: simulatedPlayers,
      seed: nextCommitment.seed,
      seedHash: nextCommitment.hash,
      transactions: totalWon > 0 ? [{ id: randomId("prize"), type: "prize", label: "Draw prize", amount: totalWon, at: Date.now() }, ...current.transactions].slice(0, 12) : current.transactions,
    }));
    setResult({ number: winningNumber, ticketResults, totalWon, jackpotPaid, dailyDrop: dailyDropIds.length > 0, seed: state.seed, seedHash: state.seedHash });
    setIsSpinning(false);
  };

  useEffect(() => {
    if (!hydrated || view !== "draw" || countdown.total > 0 || autoDrawRef.current === state.currentDrawAt) return;
    autoDrawRef.current = state.currentDrawAt;
    void runDraw();
  }, [countdown.total, hydrated, state.currentDrawAt, view]);

  return (
    <div className="shansi-app">
      <ParticleCanvas active={view === "landing"} />
      <TopBar state={state} countdown={countdown.display} go={go} />
      <main className="shansi-main">
        <div key={view} className="view-transition">
          {view === "landing" && <Landing state={state} countdown={countdown.display} lastResult={lastResult} go={go} />}
          {view === "signin" && <SignIn emailStep={emailStep} email={email} code={code} setEmail={setEmail} setCode={setCode} submit={completeEmailSignIn} identity={signInWithIdentity} />}
          {view === "wallet" && <Wallet state={state} remaining={remainingToday} selectedAmount={selectedAmount} customAmount={customAmount} network={network} card={card} go={go} selectMethod={selectMethod} setAmount={(amount) => { setCustomAmount(""); setState((current) => ({ ...current, amount })); }} setCustomAmount={setCustomAmount} setNetwork={setNetwork} setCard={setCard} topUp={topUp} />}
          {view === "pick" && <Pick state={state} tickets={currentTickets} closed={salesClosed} quickPicking={quickPicking} go={go} changeDigit={changeDigit} quickPick={quickPick} setQuantity={(quantity) => setState((current) => ({ ...current, quantity }))} placeTickets={placeTickets} />}
          {view === "draw" && <Draw state={state} countdown={countdown.display} tickets={currentTickets} displayDigits={displayDigits} lockedWheels={lockedWheels} isSpinning={isSpinning} result={result} go={go} runDraw={runDraw} closeResult={() => { setResult(null); go("pick"); }} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TopBar({ state, countdown, go }: { state: GameState; countdown: string; go: (view: View) => void }) {
  return (
    <header className="shansi-topbar">
      <Button variant="brand" size="brand" onClick={() => go("landing")} aria-label="SHANSI home"><span className="brand-mark">S</span><span className="brand-word">SHANSI</span></Button>
      <div className="top-countdown"><span className="micro-label">Next draw in</span><span className="countdown-digits">{countdown}</span></div>
      <div className="top-actions">
        <div className="top-pill jackpot-pill"><span>Jackpot</span><strong>{formatUSDT(state.jackpot)}</strong></div>
        {state.user && <div className="top-pill balance-pill"><span>Balance</span><strong>{formatUSDT(state.balance)}</strong></div>}
        <Button variant={state.user ? "avatar" : "ghostGold"} size={state.user ? "iconLg" : "sm"} onClick={() => go(state.user ? "wallet" : "signin")} aria-label={state.user ? "Open wallet" : "Sign in"}>
          {state.user ? state.user.label.slice(0, 1).toUpperCase() : "Sign in"}
        </Button>
      </div>
    </header>
  );
}

function Landing({ state, countdown, lastResult, go }: { state: GameState; countdown: string; lastResult: string; go: (view: View) => void }) {
  return (
    <section className="landing-view">
      <div className="hero-section">
        <video className="hero-video" autoPlay muted loop playsInline poster={heroPoster.url}><source src={heroVideo.url} type="video/mp4" /></video>
        <div className="hero-vignette" />
        <div className="hero-content">
          <p className="eyebrow">Every hour · One winner</p>
          <h1>Every hour.<br /><em>One winner.</em></h1>
          <p className="hero-copy">Pick four digits. Every 60 minutes our counter turns and the closest match wins the pot.</p>
          <div className="hero-stats">
            <Stat label="Next draw" value={countdown} />
            <Stat label="Current jackpot" value={formatUSDT(state.jackpot)} gold />
            <Stat label="Last result" value={lastResult.split("").join(" ")} />
          </div>
          <div className="hero-actions"><Button variant="gold" size="xl" onClick={() => go(state.user ? "pick" : "signin")}>Play now (1 USDT a ticket)<ArrowRight /></Button><a href="#how-it-works" className="gold-link">How it works<ArrowDown /></a></div>
        </div>
      </div>
      <section id="how-it-works" className="content-section">
        <div className="section-heading"><p className="eyebrow">Simple by design</p><h2>How it works</h2></div>
        <div className="steps-grid">
          <InfoCard number="01" title="Top up">Add play-money credits with USDT, Visa or Mastercard.</InfoCard>
          <InfoCard number="02" title="Pick 4 digits">Choose your number or let Quick pick decide.</InfoCard>
          <InfoCard number="03" title="Watch the counter">At :00 UTC the four wheels turn and lock.</InfoCard>
        </div>
      </section>
      <section className="result-preview-section">
        <div><p className="eyebrow">Previous hour</p><h2>Last result</h2><p className="muted-copy">The latest counter result, verified and recorded.</p></div>
        <MiniCounter value={lastResult} />
      </section>
      <section className="tier-section"><div className="section-heading"><p className="eyebrow">Match from the right</p><h2>Every digit counts</h2></div><PrizeTiers /></section>
      <figure className="showcase"><video autoPlay muted loop playsInline><source src={counterVideo.url} type="video/mp4" /></video><figcaption>The SHANSI counter. Four wheels, one result, every hour.</figcaption></figure>
    </section>
  );
}

function SignIn({ emailStep, email, code, setEmail, setCode, submit, identity }: { emailStep: "email" | "code"; email: string; code: string; setEmail: (value: string) => void; setCode: (value: string) => void; submit: (event: FormEvent) => void; identity: () => void }) {
  return <section className="centered-view"><div className="luxury-card auth-card"><img src={loginArt.url} alt="" className="round-art" /><div><p className="eyebrow">Welcome</p><h1>Sign in to SHANSI</h1><p className="muted-copy">No passwords. No downloads.</p></div><form onSubmit={submit} className="form-stack">{emailStep === "email" ? <label className="field-label">Email address<Input type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label> : <><p className="code-sent">A one-time code was sent to <strong>{email}</strong></p><label className="field-label">6-digit code<Input inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required /></label></>}<Button variant="gold" size="lg" type="submit">{emailStep === "email" ? "Continue with email" : "Verify and continue"}<ArrowRight /></Button></form><div className="or-divider"><span>or</span></div><Button variant="outlineGold" size="lg" onClick={identity}><Fingerprint />Continue with Internet Identity</Button><p className="fine-print">18+ only · Play-money demo · No real deposits or withdrawals</p></div></section>;
}

function Wallet({ state, remaining, selectedAmount, customAmount, network, card, go, selectMethod, setAmount, setCustomAmount, setNetwork, setCard, topUp }: { state: GameState; remaining: number; selectedAmount: number; customAmount: string; network: "TRC-20" | "ERC-20"; card: { number: string; expiry: string; cvc: string }; go: (view: View) => void; selectMethod: (method: PaymentMethod) => void; setAmount: (amount: number) => void; setCustomAmount: (value: string) => void; setNetwork: (network: "TRC-20" | "ERC-20") => void; setCard: (card: { number: string; expiry: string; cvc: string }) => void; topUp: () => void }) {
  return <section className="page-view"><div className="page-heading"><div><p className="eyebrow">Play-money wallet</p><h1>Your balance</h1></div><Button variant="ghostGold" onClick={() => go("pick")}>Pick numbers<ArrowRight /></Button></div><div className="wallet-grid"><div className="balance-panel"><img src={walletArt.url} alt="" /><p className="micro-label">Available to play</p><strong>{formatUSDT(state.balance)}</strong><span>{state.user?.label}</span><div className="limit-meter"><div><span>Daily demo limit</span><strong>{formatUSDT(remaining)} remaining today</strong></div><div className="meter-track"><div style={{ width: `${Math.min(100, (state.depositedToday / DAILY_LIMIT) * 100)}%` }} /></div></div></div><div className="luxury-card topup-card"><div><p className="eyebrow">Add demo credits</p><h2>Top up</h2><p className="muted-copy">Choose a method and amount. Credits land instantly.</p></div><div className="method-grid" role="radiogroup" aria-label="Top-up method">{(["USDT", "Visa", "Mastercard"] as PaymentMethod[]).map((method) => <Button key={method} variant="payment" data-active={state.method === method} role="radio" aria-checked={state.method === method} onClick={() => selectMethod(method)}><span className="method-icon">{method === "USDT" ? "₮" : <CreditCard />}</span><strong>{method}</strong><small>{method === "USDT" ? "TRC-20 · ERC-20" : "Demo card"}</small></Button>)}</div>{state.method === "USDT" ? <div className="payment-details"><div className="segment-control"><Button variant="segment" data-active={network === "TRC-20"} onClick={() => setNetwork("TRC-20")}>TRC-20</Button><Button variant="segment" data-active={network === "ERC-20"} onClick={() => setNetwork("ERC-20")}>ERC-20</Button></div><div className="deposit-address"><div className="qr-placeholder" aria-label="QR code placeholder">{Array.from({ length: 49 }, (_, index) => <i key={index} className={index % 3 === 0 || index % 8 === 0 ? "filled" : ""} />)}</div><div><span className="micro-label">Demo deposit address</span><code>{network === "TRC-20" ? "TGq7…L9p2" : "0x71a4…9F2c"}</code><small>Visual only — do not send funds</small></div></div></div> : <div className="card-fields"><label className="field-label full">Card number<Input inputMode="numeric" placeholder="4242 4242 4242 4242" value={card.number} onChange={(event) => setCard({ ...card, number: event.target.value })} /></label><label className="field-label">Expiry<Input placeholder="MM / YY" value={card.expiry} onChange={(event) => setCard({ ...card, expiry: event.target.value })} /></label><label className="field-label">CVC<Input inputMode="numeric" placeholder="123" value={card.cvc} onChange={(event) => setCard({ ...card, cvc: event.target.value })} /></label></div>}<div className="amount-grid">{[10, 25, 50, 100].map((amount) => <Button key={amount} variant="chip" data-active={!customAmount && state.amount === amount} onClick={() => setAmount(amount)}>{amount}</Button>)}<Input aria-label="Custom amount" inputMode="decimal" placeholder="Custom" value={customAmount} onChange={(event) => setCustomAmount(event.target.value)} /></div><Button variant="gold" size="xl" onClick={topUp} disabled={selectedAmount > remaining || selectedAmount <= 0}>Top up {formatUSDT(Number.isFinite(selectedAmount) ? selectedAmount : 0)}<WalletCards /></Button><p className="fine-print">Daily deposit limit: 100 USDT · Play-money credits only</p></div></div><div className="history-section"><h2>Recent activity</h2>{state.transactions.length ? <ul className="transaction-list">{state.transactions.slice(0, 6).map((item) => <li key={item.id}><span><strong>{item.label}</strong><small>{new Date(item.at).toLocaleString()}</small></span><b className={item.amount > 0 ? "positive" : ""}>{item.amount > 0 ? "+" : ""}{formatUSDT(item.amount)}</b></li>)}</ul> : <p className="muted-copy">Your demo transactions will appear here.</p>}</div></section>;
}

function Pick({ state, tickets, closed, quickPicking, go, changeDigit, quickPick, setQuantity, placeTickets }: { state: GameState; tickets: GameState["tickets"]; closed: boolean; quickPicking: number[]; go: (view: View) => void; changeDigit: (index: number, delta: number) => void; quickPick: () => void; setQuantity: (quantity: number) => void; placeTickets: () => void }) {
  return <section className="page-view"><div className="page-heading"><div><p className="eyebrow">Choose carefully</p><h1>Pick four digits</h1><p className="muted-copy">Match from the right. Every digit brings you closer.</p></div><Button variant="ghostGold" onClick={() => go("wallet")}><WalletCards />{formatUSDT(state.balance)}</Button></div><div className="pick-grid"><div className="luxury-card picker-card"><div className="dials">{state.picked.map((digit, index) => <NumberDial key={index} index={index} digit={digit} flipping={quickPicking.includes(index)} change={changeDigit} />)}</div><div className="picker-tools"><Button variant="outlineGold" onClick={quickPick}><Sparkles />Quick pick</Button><div className="ticket-stepper"><Button variant="iconGhost" size="icon" onClick={() => setQuantity(Math.max(1, state.quantity - 1))} aria-label="Fewer tickets"><Minus /></Button><span><strong>{state.quantity}</strong><small>tickets</small></span><Button variant="iconGhost" size="icon" onClick={() => setQuantity(Math.min(50 - tickets.length, state.quantity + 1))} aria-label="More tickets"><Plus /></Button></div></div><div className="cost-row"><span>Total cost</span><strong>{formatUSDT(state.quantity * TICKET_PRICE)}</strong></div><Button variant="gold" size="xl" onClick={placeTickets} disabled={closed || tickets.length >= 50}>{closed ? "Sales closed" : tickets.length >= 50 ? "50 ticket limit reached" : "Place ticket"}<ArrowRight /></Button><p className="fine-print">{closed ? "Sales are closed for this draw. The next draw opens at :00 UTC." : "Sales close 30 seconds before the hour."}</p></div><div className="luxury-card ticket-card"><div><p className="eyebrow">Current draw</p><h2>My tickets</h2></div>{tickets.length ? <ul className="ticket-list">{tickets.map((ticket, index) => <li key={ticket.id}><span className="ticket-index">{String(index + 1).padStart(2, "0")}</span><strong>{ticket.number.split("").join(" · ")}</strong><small>1 USDT</small></li>)}</ul> : <div className="empty-state"><span>0 0 0 0</span><p>No tickets yet.</p></div>}<div className="pool-row"><Stat label="Tickets in pool" value={state.poolTickets.toLocaleString()} /><Stat label="Jackpot" value={formatUSDT(state.jackpot)} gold /></div><Button variant="outlineGold" onClick={() => go("draw")}>Go to the counter<ArrowRight /></Button></div></div></section>;
}

function NumberDial({ index, digit, flipping, change }: { index: number; digit: number; flipping: boolean; change: (index: number, delta: number) => void }) {
  const startY = useRef<number | null>(null);
  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (startY.current === null) return;
    const delta = event.clientY - startY.current;
    if (Math.abs(delta) >= 22) { change(index, delta > 0 ? -1 : 1); startY.current = event.clientY; }
  };
  const wheel = (event: WheelEvent<HTMLDivElement>) => { event.preventDefault(); change(index, event.deltaY > 0 ? 1 : -1); };
  return <div className="dial"><Button variant="iconGhost" size="icon" onClick={() => change(index, -1)} aria-label={`Increase digit ${index + 1}`}><ChevronUp /></Button><div className="dial-window" onPointerDown={(event) => { startY.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={pointerMove} onPointerUp={() => { startY.current = null; }} onWheel={wheel}><span className={flipping ? "digit-flip" : ""}>{digit}</span></div><Button variant="iconGhost" size="icon" onClick={() => change(index, 1)} aria-label={`Decrease digit ${index + 1}`}><ChevronDown /></Button></div>;
}

function Draw({ state, countdown, tickets, displayDigits, lockedWheels, isSpinning, result, go, runDraw, closeResult }: { state: GameState; countdown: string; tickets: GameState["tickets"]; displayDigits: number[]; lockedWheels: number[]; isSpinning: boolean; result: CompletedDraw | null; go: (view: View) => void; runDraw: () => Promise<void>; closeResult: () => void }) {
  const revealed = result?.seed;
  return <section className="draw-view"><div className="draw-heading"><p className="eyebrow">{isSpinning ? "The counter is turning…" : "Next draw in"}</p>{!isSpinning && <div className="draw-countdown">{countdown}</div>}</div><div className={cn("main-counter", result && "counter-glow")}>{displayDigits.map((digit, index) => <div key={index} className={cn("counter-wheel", isSpinning && !lockedWheels.includes(index) && "spinning", lockedWheels.includes(index) && "locked")}><div className="reel-track">{DIGITS.map((value) => <span key={value}>{isSpinning && !lockedWheels.includes(index) ? value : digit}</span>)}</div><div className="wheel-gloss" /></div>)}</div><div className="draw-stats"><Stat label="Jackpot" value={formatUSDT(state.jackpot)} gold /><Stat label="Your tickets" value={String(tickets.length)} /><Stat label="Provably fair" value={shortHash(state.seedHash)} mono /></div><div className="draw-actions"><Button variant="gold" size="xl" onClick={() => void runDraw()} disabled={isSpinning}><Play />{isSpinning ? "Counter turning…" : "Run demo draw"}</Button><Button variant="ghostGold" onClick={() => go("pick")} disabled={isSpinning}><ArrowLeft />Change numbers</Button></div><div className="fairness-panel"><div><ShieldCheck /><span><strong>Seed committed before the draw</strong><code>{shortHash(result?.seedHash ?? state.seedHash)}</code></span></div>{revealed && <div><Check /><span><strong>Seed revealed after the draw</strong><code>{shortHash(revealed)}</code></span></div>}<p>SHA-256 combines the committed seed and final ticket list to create the four-digit result.</p></div><div className="recent-draws"><h2>Recent draws</h2><div className="history-strip">{state.history.slice(0, 6).map((item) => <div key={item.id}><strong>{item.result}</strong><small>{new Date(item.drawnAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC</small></div>)}</div></div>{result && <ResultOverlay result={result} close={closeResult} />}</section>;
}

function ResultOverlay({ result, close }: { result: CompletedDraw; close: () => void }) {
  const won = result.totalWon > 0;
  return <div className="result-overlay" role="dialog" aria-modal="true" aria-labelledby="draw-result-title">{won && <ParticleCanvas burst />}<div className="result-card"><p className="eyebrow">{result.dailyDrop ? "Daily Drop" : won ? "You won" : "Draw complete"}</p><h2 id="draw-result-title">The counter landed on</h2><div className="result-number">{result.number.split("").join(" ")}</div>{result.ticketResults.length ? <div className="result-tickets"><p>Your tickets</p>{result.ticketResults.map((item) => <div key={item.ticket.id} className="result-ticket"><span>{item.ticket.number.split("").map((digit, index) => <i key={index} className={index >= 4 - item.matches && item.matches > 0 ? "matched" : ""}>{digit}</i>)}</span><strong>{item.amount > 0 ? `${item.tier} · ${formatUSDT(item.amount)}` : "No match"}</strong></div>)}</div> : <p className="muted-copy">You had no tickets in this draw.</p>}<div className={cn("prize-summary", won && "won")}><span>{won ? "Prize credited" : "Prize won"}</span><strong>{formatUSDT(result.totalWon)}</strong></div><div className="reveal-box"><span>Revealed seed</span><code>{shortHash(result.seed || "No seed available")}</code></div><Button variant="gold" size="lg" onClick={close}>Play the next draw<ArrowRight /></Button></div></div>;
}

function Footer() {
  return <footer className="shansi-footer"><span>Play-money demo · 18+ · Provably fair</span><nav><LegalDialog title="Game rules" trigger="Rules"><p>Tickets cost 1 demo USDT. Pick 0000–9999, with up to 50 tickets each hourly draw. Match digits from the right: four wins the shared jackpot, three pays 40, two pays 5, and one returns a free-ticket credit.</p><p>Sales close 30 seconds before :00 UTC. At 00:00 UTC, the closest ticket receives the jackpot when there is no exact match.</p></LegalDialog><LegalDialog title="Provably fair" trigger="Fairness"><p>A SHA-256 seed hash is committed before ticket sales close. The seed is revealed after the draw so the result can be independently recomputed.</p><p>This client-side demo illustrates the protocol; it does not use real funds or production randomness infrastructure.</p></LegalDialog><LegalDialog title="Responsible play" trigger="Responsible play"><p>SHANSI is a play-money demonstration for adults aged 18 and over. No real deposits, withdrawals, or prizes are available.</p><p>A 100 USDT daily demo-credit limit and a 50-ticket draw limit are enforced locally.</p></LegalDialog></nav></footer>;
}

function LegalDialog({ title, trigger, children }: { title: string; trigger: string; children: React.ReactNode }) {
  return <Dialog><DialogTrigger asChild><Button variant="linkGold" size="inline">{trigger}</Button></DialogTrigger><DialogContent className="legal-dialog"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>SHANSI play-money demo</DialogDescription></DialogHeader><div className="legal-copy">{children}</div></DialogContent></Dialog>;
}

function InfoCard({ number, title, children }: { number: string; title: string; children: React.ReactNode }) { return <article className="info-card"><span>{number}</span><h3>{title}</h3><p>{children}</p></article>; }
function Stat({ label, value, gold = false, mono = false }: { label: string; value: string; gold?: boolean; mono?: boolean }) { return <div className="stat-block"><span>{label}</span><strong className={cn(gold && "gold-text", mono && "mono-small")}>{value}</strong></div>; }
function MiniCounter({ value }: { value: string }) { return <div className="mini-counter">{value.split("").map((digit, index) => <span key={index}>{digit}</span>)}</div>; }
function PrizeTiers() { const tiers = [["Jackpot", "All 4 digits", "50% of pool + rollover"], ["Match 3", "Last 3 digits", "40 USDT"], ["Match 2", "Last 2 digits", "5 USDT"], ["Match 1", "Last digit", "Free ticket"]]; return <div className="tiers-grid">{tiers.map(([name, condition, prize], index) => <article key={name} className={index === 0 ? "featured" : ""}><span>{name}</span><small>{condition}</small><strong>{prize}</strong></article>)}</div>; }
