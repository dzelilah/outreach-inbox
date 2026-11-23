# Outreach Inbox: Claude Code guidelines

@AGENTS.md

Take-home prototype for Moonrank. A customer reviews link-building opportunities, filters out weak ones, edits an outreach draft and sets a status. All data is fake. Nothing is sent and nothing leaves the machine, except through the optional, opt-in LLM provider (see "AI draft rewriting").

The developer must be able to explain every decision and every line in a live code review. Prefer simple code that is easy to explain over clever code.

## Commands

| Command | What it does |
|---|---|
| `npm run setup` | Applies migrations and seeds the 50 rows. Safe to re-run: user edits are kept. |
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm test` | Vitest unit tests |
| `npm run typecheck`, `npm run lint`, `npm run build` | Checks |
| `npm run db:reset` | **Destructive:** wipes the local database and re-seeds. Ask the user first. Prisma blocks AI agents unless `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` holds the user's exact consent message; never set it without that message. |

## Stack and version notes

- Next.js 16 (App Router, Turbopack) with `cacheComponents: true`. Its APIs differ from older versions: read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code (see AGENTS.md).
- React 19, TypeScript (strict), Tailwind CSS 4, shadcn/ui (Radix base, Nova preset), Sonner for toasts, lucide-react icons.
- Prisma **7.10.1, pinned**. The npm `latest` tag is a Prisma 8 release candidate without SQLite support, so do not upgrade. The config file is `prisma7.config.ts`. SQLite runs through `@prisma/adapter-better-sqlite3`. The client is generated into `src/generated/prisma` (gitignored, regenerated on `postinstall`); never edit it.
- Zod 4, Vitest 5, tsx for scripts.
- Mutations use Server Actions. Add an API route only when a Server Action cannot do the job.
- Add a dependency only for a clear reason, and give the reason in the commit body.

## Project layout

- `data/opportunities.json`: the 50 seed rows from the assignment. Never edit it; bad rows are handled in code.
- `prisma/`: schema, migrations and `seed.ts` (zod-validated, idempotent upsert).
- `src/lib/quality.ts`: **all** quality, sorting and duplicate-domain rules and their constants.
- `src/lib/schemas.ts`: zod schemas for seed rows and Server Action inputs.
- `src/lib/db.ts`: Prisma client singleton, server only.
- `src/lib/rewrite/`: draft rewriter providers (mock and optional Anthropic).
- `src/app/`: routes, layout and Server Actions (`actions.ts`).
- `src/components/`: UI. `src/components/ui/` is shadcn output.
- Tests sit next to the logic they test, as `*.test.ts`.

## Business rules

Do not change these without the user's approval.

**Data**
- Import and keep all 50 rows. Low-quality rows are flagged with a reason, never deleted.
- Quality flags are derived from the stored fields in `src/lib/quality.ts`, never stored.

**Low quality.** A row is low quality if any of these is true:
- the domain rating is below `MIN_DOMAIN_RATING` (30)
- the contact name or contact profile is missing
- the topic is not in `RELEVANT_TOPICS` (AI search, GEO, SEO, E-commerce SEO, Agencies, B2B marketing; case and surrounding spaces are ignored)

**Sorting.** Relevance score descending, then domain rating descending, then id ascending. Many scores are tied, so the order must be deterministic.

**Statuses.** `TO_REVIEW`, `APPROVED`, `SKIPPED`, `DONE`. Every status change can be undone.

**Approval.** A human approves every message.
- Approve saves the exact text in the editor together with the status.
- A row without a contact cannot be approved.
- Editing the draft of an approved row moves it back to `TO_REVIEW`.
- Already-contacted rows and duplicate domains show a warning.
- There is no bulk approve. Bulk actions are limited to Skip and Move to review.

**Persistence.** Status and draft edits are stored in SQLite and survive a reload. Filters and the selected row live in the URL. Do not use localStorage for data. Re-running the seed must not overwrite user edits.

## Code rules

- Use server components by default. Add `"use client"` only where interactivity needs it.
- Keep business logic out of components, as pure functions in `src/lib/`.
- Validate every Server Action input with zod on the server. Return `{ ok: true }` or `{ ok: false, error }` and show errors in the UI.
- Handle loading, empty, error and disabled states.
- No `any`, no unchecked casts, no array-index keys when an id exists.
- Make the smallest change that does the job. No speculative abstractions, no drive-by refactors.
- Read the existing code before changing it, and follow its patterns.
- Never edit a migration that has been applied; add a new one.

## Security and privacy

- Never send email. Never fetch, crawl or contact any site from the seed data, and use no favicon, OG-image or metadata services.
- External links are plain `<a target="_blank" rel="noopener noreferrer nofollow">`.
- Render user and seed text as text. Never use `dangerouslySetInnerHTML`.
- Keep secrets server-side. Never commit `.env`, keys or `*.db` files.
- The app must run fully offline with the mock rewriter.

## AI draft rewriting

- Providers implement one `DraftRewriter` interface in `src/lib/rewrite/`.
- `LLM_PROVIDER=mock` is the default. The mock is deterministic: a tighter opening, the same names, page title, competitor and links, a clear call to action, about 80 words.
- `LLM_PROVIDER=anthropic` is opt-in, because the assignment allows using your own key. It is the only code that may send data out (the draft and the opportunity's page title, competitor and contact name), and the README must say so. The provider is chosen explicitly, never inferred from a key being present.
- Rewritten text goes into the editor as an unsaved change. The user must review it and then save or approve it. Never auto-save, auto-approve or send generated text.

## UI

- Clean, simple SaaS look with consistent spacing and no decorative animation.
- Status and quality badges always carry a text label, never color alone.
- Give visible feedback after every action (toast or inline message), and show pending and disabled states while saving.
- Works on desktop and mobile: the list and the detail stack on narrow screens.

## Verification

Before calling a change done, run `npm run typecheck`, `npm run lint` and `npm test`. For UI or config changes also run `npm run build`, and check the flow in the running app, including a reload for persistence.

Report only what was actually run, and never say tests pass without running them. Never silence errors or lint rules to make checks pass.

## Git

- Work on branch `main`. Use Conventional Commits: `type(scope): short lowercase imperative`, with the reason in the body when it is not obvious.
- Make one commit per user story or feature: not one per tiny step, and not one giant commit. Tests go in the same commit as the logic.
- Every commit passes typecheck, lint and tests and leaves the app runnable.
- Stage explicit paths (`git add <paths>`), never `git add -A`.
- No Co-Authored-By or other AI attribution trailers.
- Local commits are fine. Pushing, creating the GitHub repository or publishing anything needs the user's explicit OK.

## Scope and working with the user

Work in this order:
1. Core user stories: list sorted by relevance, low-quality filter, detail with editable draft, status changes with persistence, left-to-review counter.
2. Stretch goals: hide already contacted, score explanation, bulk skip, mockable AI rewrite.
3. README.

- Do not drop or add planned features silently; discuss scope changes with the user.
- Explain important decisions and trade-offs in plain words, and flag risks before risky changes.
- When debugging, find the real cause, explain it, apply the smallest fix and verify it.
- Ask when a requirement is ambiguous instead of guessing.
- Track the time spent. The README reports it honestly; the assignment suggests about 2 hours with a 3-hour cap.
