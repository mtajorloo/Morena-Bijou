# Message to send to Caffeine (project SHANSI, id 01a0c8cc-6459-76dd-9217-57c65db6df53)

Send as-is once the connector is reconnected (it is under the 13 KB chat limit), or paste it into the Caffeine chat by hand.

---

Replace the current SHANSI frontend with a one-to-one port of the working React implementation below. Do not redesign, do not reinterpret: copy the components, markup, class names, CSS and logic exactly, adapting only the imports to this project's structure.

Reference files (fetch each one):
- https://raw.githubusercontent.com/mtajorloo/Morena-Bijou/claude/tender-knuth-0qd4z2/shansi/lovable-export/src/components/ShansiApp.tsx
- https://raw.githubusercontent.com/mtajorloo/Morena-Bijou/claude/tender-knuth-0qd4z2/shansi/lovable-export/src/lib/shansi-game.ts
- https://raw.githubusercontent.com/mtajorloo/Morena-Bijou/claude/tender-knuth-0qd4z2/shansi/lovable-export/src/components/ShansiParticles.tsx
- https://raw.githubusercontent.com/mtajorloo/Morena-Bijou/claude/tender-knuth-0qd4z2/shansi/lovable-export/src/components/ui/button.tsx
- https://raw.githubusercontent.com/mtajorloo/Morena-Bijou/claude/tender-knuth-0qd4z2/shansi/lovable-export/src/styles.css
- https://raw.githubusercontent.com/mtajorloo/Morena-Bijou/claude/tender-knuth-0qd4z2/shansi/lovable-export/README.md (porting notes)

Rules for this build:
1. Mount `<ShansiApp />` as the only page. Load `styles.css` globally. Add the Google Fonts link for Bebas Neue, Cormorant Garamond 600/700 and Manrope 400 to 700 in the HTML head, with the fallbacks already in the CSS.
2. `Button`, `Dialog`, `Input`, `sonner` toaster and `cn` are stock shadcn/ui pieces; use this project's equivalents or add them. Keep every Button variant and size listed in `button.tsx`.
3. Media: download these five files into the frontend assets at build time and reference them by relative path. Never hotlink an external URL from the page, because the runtime test cannot reach external hosts. If a download fails, use the CSS fallbacks (gradient hero, no showcase video, no art images) rather than leaving a broken reference.
   - https://shansi.lovable.app/__l5e/assets-v1/0ed2824b-2826-406e-bcb4-6de9d328466f/shansi-hero.mp4
   - https://shansi.lovable.app/__l5e/assets-v1/a518f6b6-2e08-4bba-aabf-047b6feb0069/shansi-hero-poster.png
   - https://shansi.lovable.app/__l5e/assets-v1/3b1a0827-5daa-459f-aaa0-0745770616f8/shansi-counter.mp4
   - https://shansi.lovable.app/__l5e/assets-v1/8941edcb-5e3a-41fe-a2d2-76237fd8f38c/shansi-login.png
   - https://shansi.lovable.app/__l5e/assets-v1/a45946d4-7109-4803-9774-c741056df8b4/shansi-wallet.png
   Replace the `*.asset.json` imports in `ShansiApp.tsx` with objects `{ url: "/assets/<file>" }`.
4. Keep the game logic client-side exactly as in `shansi-game.ts` (localStorage, hourly draw at :00 UTC, sales close at :59:30, right-to-left matching, prize tiers, jackpot floor 500, Daily Drop). Do not move it into the backend in this build. The existing Motoko backend may stay as is; the frontend must not depend on it for this build.
5. Fix the small TypeScript nits while porting: type the `"prize"` transaction literal with `as const`, and remove unused icon imports (`ArrowUp`, `RefreshCw`, `useMemo`).
6. After building, run the full flow in the preview before committing: sign in with email (any 6-digit code) and with Internet Identity, top up with USDT and with a card, pick digits, place a ticket, press "Run demo draw" and confirm the four wheels spin, lock right to left and the result overlay appears. Confirm no console errors and no horizontal scroll at 375 px.
7. Then `commit_and_deploy_draft`, and report the platform's `draftState` and `lastDeployedDraftId`, not just the composer's status.
