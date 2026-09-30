# Why Caffeine could not publish what Lovable published

Technical post-mortem of the SHANSI build on Caffeine AI (project `01a0c8cc-6459-76dd-9217-57c65db6df53`), compared step by step with the Lovable build that went live at https://shansi.lovable.app in one pass on 2026-09-30.

## 1. What each platform actually does when it "builds"

| Step | Lovable | Caffeine |
|---|---|---|
| Where the agent works | A live dev sandbox with a shell and outbound network. It ran `curl` on the four reference files and the five media files, saved the media as project assets on its own CDN, and edited the code directly. | A "composer" that plans from a written spec, then generates a Motoko backend and a React frontend through Caffeine's own pipeline. It has no general shell; it never downloaded or mirrored the media, so hotlinks stayed hotlinks. |
| How code is transferred | Message limit 100 KB, plus the agent can fetch any URL. The whole prototype was read verbatim. | Chat limit about 13 KB (`chat_message_too_long` at 52 KB and again at 13 KB). The prototype could only be pointed at by URL, and the composer reinterpreted it rather than porting it. |
| When a preview exists | Immediately: the preview is the Vite dev server, live as soon as the code compiles. | Only after the full pipeline: Motoko compile, frontend build, deploy to two canisters, then an automated runtime test of the page in a headless browser, then commit. A hang anywhere blocks the draft entirely. |
| How publishing works | `deploy_project` runs `vite build` and uploads static files. Type errors do not block it. | Draft must pass the runtime test and be committed (`draftState: deployed`) before the dashboard can publish it to the live domain. |
| Viewing the draft | Public preview URL, no gate. | Draft domain behind a `canister-login` page that needs the `#t=` token from the URL fragment. |
| Session auth | OAuth stayed valid for the whole session. | OAuth token expired mid-build (HTTP 401, then "needs you to sign in again"). A non-interactive session cannot re-authorize the connector. |

## 2. Timeline of the Caffeine attempts

1. **Builds 1 to 4 (22 Sep): spec sent, QA passed, no draft.** Each build ended in "Testing preview" and stopped on the build budget. The composer reported "the preview is deployed", but the platform record said `draftState: no_draft`, and `redeploy_draft` failed with "no deployed draft version" because that tool only restores an existing draft. The user saw either nothing or the canister-login gate.
2. **Root cause found.** The frontend hotlinked the Higgsfield media on `d8j0ntlcm91z4.cloudfront.net`. Caffeine's runtime-test environment cannot reach that host, so the page never reached a loaded state and the test never finished. Confirmed by rebuilding with no external media (gradient hero, CSS counter, SVG icons): the test passed and the draft deployed (`lastDeployedDraftId: 1`).
3. **Published, but wrong design.** The user published the draft to https://shansi-9kc.caffeine.xyz. The result was the composer's own interpretation of the spec, not the agreed prototype: different layout and interactions. This is a pipeline property, not a bug: Caffeine generates from a description and does not copy existing UI code, and it could not receive the code in chat.
4. **"Faithful port" rebuild (17:10 UTC).** Caffeine was pointed at the raw GitHub files of `site/` and asked to port them one-to-one. It reported all five screens built and matching, build check passed, review and publish pending. Before that draft could be verified and published, the connector token expired and the user reported "same error, no improvement" (the live domain was still serving the earlier version).
5. **What the platform record shows now (30 Sep, connector reauthorized).** `draftState: deployed`, `lastDeployedDraftId: 2`, `liveDraftId: 1`. So the "faithful port" did reach a deployed draft (draft 2), but the live domain was never switched to it. The owner's "same error, no improvement" was the live site still serving draft 1. Publishing a draft to live is a dashboard action Caffeine's chat did not perform.
6. **Port from the Lovable source (30 Sep, 09:44 to 10:07 UTC): success.** A new chat session was given the brief in `CAFFEINE_PORT_MESSAGE.md`. Caffeine fetched the six reference files, ported them, downloaded all five media files into the app, compiled, ran its runtime test ("Testing preview" passed this time because nothing was hotlinked), and deployed draft version 3 at 10:03 UTC. Version 3 was then launched to production at 10:07 UTC (`liveDraftId: 3`). Live URL: https://shansi-9kc.caffeine.xyz.

7. **Phase A build (30 Sep, 10:29 to 11:33 UTC): draft 4 deployed.** Real backend, accounts, admin back office on play credits (brief in `CAFFEINE_PHASE_A_MESSAGE.md`). The composer planned 20 work items, finished the backend engine, then stopped silently at 10:48 UTC with no message (the same budget-stop behaviour as in September). A resume prompt that named the exact unfinished items restarted it from the checkpoint at 10:50 UTC; its own QA caught that the player screens still used demo data, reopened those items, then passed QA and the test suite and deployed draft version 4 at 11:33 UTC, then ran an automatic fix pass for two unconfirmed test items and deployed draft version 5 at 11:43 UTC. Lesson: watch the feed for `run_completed` with unfinished tasks and resume by naming the remaining items; the checkpoint survives.

## 5. What made the difference

The same platform that failed four times succeeded in one pass once three inputs changed: a verbatim React reference it could fetch (instead of a spec to interpret), media bundled into the canister (instead of hotlinks that stalled the runtime test), and a brief that forbade clarification and asked for the platform record, not the composer's summary. The pipeline itself was never the obstacle; its inputs were.

## 3. The three real blockers, in order of impact

1. **The runtime-test gate plus hotlinked media.** Anything the test browser cannot load hangs the draft. Lovable has no such gate, and it mirrored the media anyway.
2. **Generation instead of porting.** Caffeine rebuilds from a spec each time, so every iteration drifted. Lovable read the code and ported it, then did one implementation pass.
3. **Chat size limit and session auth.** The code could not be pasted, and the OAuth token did not survive the build.

## 4. Fix plan (repeatable, one step at a time)

1. **Reauthorize the Caffeine connector** at https://claude.ai/customize/connectors, then start a new session so the tools load.
2. **Read the project state** (`draftState`, `lastDeployedDraftId`, current live version) before changing anything.
3. **Give Caffeine a verbatim reference it can fetch:** the Lovable source now lives in this repo at `shansi/lovable-export/` (public raw URLs). It is plain React, which is Caffeine's own frontend stack, so it can be copied file for file. The ready-to-send brief is in `CAFFEINE_PORT_MESSAGE.md`.
4. **Media without hotlinks.** Caffeine must copy the five files into the frontend canister's assets at build time (from the cloudfront or shansi.lovable.app URLs listed in `lovable-export/src/assets/ASSETS.json`) or fall back to the CSS-only versions. This is the single rule that keeps the runtime test from hanging.
5. **Verify each stage on the platform record, not the composer's chat:** `begin_draft` → `commit_and_deploy_draft` → confirm `draftState: deployed` and a new `lastDeployedDraftId` → open the draft with its `#t=` token → publish from the dashboard → confirm the live domain serves the new build (the counter with four gold wheels on the Draw screen is the visual check).
6. **Keep the Motoko backend minimal for the demo** (tickets, draws, `raw_rand` seed commit) or leave the game logic client-side as in the Lovable build; wire real Internet Identity only once the frontend matches.
