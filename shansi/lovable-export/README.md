# SHANSI — Lovable build export

Exact copy of the source that Lovable generated and published at **https://shansi.lovable.app** (project `88ce5bcf-1a22-4066-9ad0-93c6a2921b90`, commit `e6f694d2`). It is the reference implementation for any other platform (Caffeine, Replit) and the owner's backup of the working app.

| File | Role |
|---|---|
| `src/lib/shansi-game.ts` | Typed game state, localStorage persistence, hourly draw time, right-to-left matching, prize tiers, jackpot floor, SHA-256 seed commitment |
| `src/components/ShansiApp.tsx` | The whole UI: top bar, Landing, Sign in, Wallet, Pick numbers, Draw, result overlay, footer dialogs |
| `src/components/ShansiParticles.tsx` | Gold particle background and confetti burst (canvas) |
| `src/components/ui/button.tsx` | shadcn Button with the SHANSI variants (`gold`, `outlineGold`, `ghostGold`, `avatar`, `brand`, `payment`, `chip`, `segment`, `iconGhost`, `linkGold`) |
| `src/styles.css` | Tailwind v4 theme tokens (burgundy and gold in oklch), all component CSS, counter animations, mobile breakpoints, reduced motion |
| `src/routes/__root.tsx`, `src/routes/index.tsx` | TanStack Start shell (Google Fonts link, toaster) and the `/` route |
| `src/assets/ASSETS.json` | Where the five media files live on the published site |

Stack on Lovable: React 19, TanStack Start/Router, Tailwind v4, shadcn/ui (Button, Dialog, Input, Sonner toaster), lucide-react icons. Build is plain `vite build`.

## Porting notes

- The app is one component tree with client-side view switching (no router pages). Any React host can mount `<ShansiApp />` inside a page that loads `styles.css` and the three Google Fonts.
- Media imports are `*.asset.json` files with a `url` field. On another platform, download the five files (see `ASSETS.json` or `../ASSETS.md`) into the bundle and replace each import with `{ url: "/assets/<file>" }`. Do not hotlink them: Caffeine's runtime test hangs on external media that its test environment cannot reach.
- Dialog, Input and the Sonner toaster are stock shadcn components; `cn` is the usual `clsx` + `tailwind-merge` helper.
- Known nit: the agent left a few TypeScript type errors in `ShansiApp.tsx` (for example the `"prize"` transaction literal widening to `string`, and unused icon imports). They do not affect the Vite build or runtime.
