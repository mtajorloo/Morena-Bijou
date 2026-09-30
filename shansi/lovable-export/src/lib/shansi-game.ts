export type View = "landing" | "signin" | "wallet" | "pick" | "draw";
export type PaymentMethod = "USDT" | "Visa" | "Mastercard";

export interface Player {
  id: string;
  label: string;
  kind: "email" | "identity";
}

export interface Ticket {
  id: string;
  number: string;
  drawAt: number;
}

export interface Transaction {
  id: string;
  type: "credit" | "ticket" | "prize";
  label: string;
  amount: number;
  at: number;
}

export interface DrawRecord {
  id: string;
  drawnAt: number;
  result: string;
  poolTickets: number;
  jackpot: number;
  seedHash: string;
  seed: string;
}

export interface GameState {
  version: 1;
  user: Player | null;
  balance: number;
  picked: number[];
  quantity: number;
  method: PaymentMethod;
  amount: number;
  tickets: Ticket[];
  transactions: Transaction[];
  history: DrawRecord[];
  jackpot: number;
  poolTickets: number;
  depositDay: string;
  depositedToday: number;
  currentDrawAt: number;
  seed: string;
  seedHash: string;
}

export interface TicketResult {
  ticket: Ticket;
  matches: number;
  tier: string;
  amount: number;
}

export interface CompletedDraw {
  number: string;
  ticketResults: TicketResult[];
  totalWon: number;
  jackpotPaid: boolean;
  dailyDrop: boolean;
  seed: string;
  seedHash: string;
}

export const STORAGE_KEY = "shansi-demo-state-v1";
export const TICKET_PRICE = 1;
export const DAILY_LIMIT = 100;
export const JACKPOT_FLOOR = 500;

export function nextDrawTime(now = Date.now()) {
  const date = new Date(now);
  date.setUTCMinutes(60, 0, 0);
  return date.getTime();
}

export function dayKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

const seedResults = ["7309", "1642", "9081", "4729", "3350", "8017", "2294", "6158", "0436", "9820", "5173", "3941"];

export function initialState(now = Date.now()): GameState {
  const drawAt = nextDrawTime(now);
  const history = seedResults.map((result, index) => ({
    id: `seed-${index}`,
    drawnAt: drawAt - (index + 1) * 3_600_000,
    result,
    poolTickets: 418 + ((index * 137) % 482),
    jackpot: 1240 - index * 45,
    seedHash: `sha256:${(index + 37).toString(16).padStart(4, "0")}9f…${(index + 91).toString(16)}c3`,
    seed: `revealed-seed-${index + 1}`,
  }));
  return {
    version: 1,
    user: null,
    balance: 0,
    picked: [4, 7, 2, 9],
    quantity: 1,
    method: "USDT",
    amount: 25,
    tickets: [],
    transactions: [],
    history,
    jackpot: 1240,
    poolTickets: 624,
    depositDay: dayKey(now),
    depositedToday: 0,
    currentDrawAt: drawAt,
    seed: "",
    seedHash: "Preparing commitment…",
  };
}

export function loadState(): GameState {
  const fallback = initialState();
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved) as Partial<GameState>;
    if (parsed.version !== 1 || !Array.isArray(parsed.history)) return fallback;
    const today = dayKey();
    return {
      ...fallback,
      ...parsed,
      depositedToday: parsed.depositDay === today ? (parsed.depositedToday ?? 0) : 0,
      depositDay: today,
      picked: Array.isArray(parsed.picked) && parsed.picked.length === 4 ? parsed.picked : fallback.picked,
    };
  } catch {
    return fallback;
  }
}

export function saveState(state: GameState) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function formatUSDT(amount: number) {
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: amount % 1 ? 2 : 0, maximumFractionDigits: 2 })} USDT`;
}

export function countdownParts(drawAt: number, now: number) {
  const total = Math.max(0, Math.floor((drawAt - now) / 1000));
  return {
    total,
    display: [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
      .map((value) => String(value).padStart(2, "0"))
      .join(":"),
  };
}

export function rightMatches(ticket: string, result: string) {
  let matches = 0;
  for (let index = 3; index >= 0; index -= 1) {
    if (ticket[index] !== result[index]) break;
    matches += 1;
  }
  return matches;
}

export function tierFor(matches: number) {
  if (matches === 4) return "Jackpot";
  if (matches === 3) return "Match 3";
  if (matches === 2) return "Match 2";
  if (matches === 1) return "Match 1";
  return "No prize";
}

export function randomInt(max: number) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % max;
}

export function randomDigits() {
  return Array.from({ length: 4 }, () => randomInt(10));
}

export function randomId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${randomInt(1_000_000).toString(36)}`;
}

export async function makeCommitment() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const seed = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return { seed, hash: `sha256:${hash}` };
}

export function shortHash(value: string) {
  if (value.length < 22) return value;
  return `${value.slice(0, 15)}…${value.slice(-8)}`;
}
