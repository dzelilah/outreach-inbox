# Outreach Inbox

A small inbox for reviewing link-building opportunities: see the best matches first, filter out weak ones, open one, edit the outreach draft and set a status. Everything is saved in a local SQLite database and survives a reload.

All data is fake. Nothing is ever sent: the app has no email sending, and it does not fetch or contact any site from the data. The only network call the app can make is the optional AI rewrite with your own Anthropic key (see [AI rewrite](#ai-rewrite)). It is off by default.

## Run it

Requires Node.js 20.9 or newer (built with Node 24).

```bash
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run setup             # creates dev.db and imports the 50 rows
npm run dev               # http://localhost:3000
```

`npm run setup` is safe to re-run: it applies migrations and imports rows that are missing, but never overwrites your edits. To start over, `npm run db:reset` wipes the database and imports the seed again.

Other commands: `npm test` (unit tests), `npm run typecheck`, `npm run lint`, `npm run build`.

The first `npm run dev` or `npm run build` downloads the two Google fonts once; Next.js then serves them from the app itself.

## What it does

The five user stories:

1. **List sorted by relevance.** Highest score first; equal scores go to the higher domain rating, then the id, so the order never changes between loads.
2. **Filter out low-quality opportunities.** The default "Relevant" view hides them. "Low-quality" shows only the hidden ones, so you can check what the filter removed; "All" shows everything. Each low-quality row says why (Low DR, No contact, Off-topic).
3. **Open an opportunity and edit the draft.** The detail shows the page, scores, contact and warnings. The draft is saved only when you click Save; Discard and "Reset to original" are there too.
4. **Change the status.** To review, Approved, Skipped or Done, from a dropdown at the top of the detail. Every change is saved and can be changed back.
5. **Left-to-review counter.** Shows how many rows in the current view still need a decision.

All four stretch goals:

- **Hide already contacted** (`op_10`, `op_12`), with a "Contacted" badge in the list.
- **Why this score:** the signals behind the score, plus a warning when a high score sits on a weak site.
- **Bulk Skip and Move to review** with checkboxes. There is deliberately no bulk approve.
- **AI rewrite** of the draft, mock by default.

Filters and the open opportunity live in the URL (`/?quality=all&hideContacted=1&id=op_35`), so reload, the back button and shared links keep them.

## Problems in the seed data

All 50 rows are valid as data. The weak ones are weak in quality, so they are imported, flagged and filtered, never deleted:

| Problem | Rows | How it is handled |
|---|---|---|
| Domain rating under 30 | op_01, op_04, op_05, op_25 | Low DR flag. op_01 is a trap: score 93 (second best) but DR 14 |
| Topic not relevant to Moonrank | op_03 (Fitness), op_16 (Travel), op_30 (Cooking) | Off-topic flag |
| No contact | op_07, op_08 | No contact flag, and Approve is blocked |
| Already contacted | op_10, op_12 | Warning and badge; can be hidden |
| Same domain twice | op_11, op_31 (blog.hubspot.com) | Warning in both, so the site is not contacted twice |
| Tied scores | e.g. five rows at 29 | Deterministic tie-break (domain rating, then id) |

That gives 41 relevant rows, or 39 with contacted rows hidden.

## Key decisions

- **Low quality** means a domain rating under 30, a missing contact name or profile, or a topic outside AI search, GEO, SEO, E-commerce SEO, Agencies and B2B marketing. The flags are computed from the data in [`src/lib/quality.ts`](src/lib/quality.ts), never stored, so there is one source of truth. The threshold and the topics are constants there.
- **A human approves every message.**
  - Approving saves the text in the editor and the status in one update, so what was approved is exactly what was on screen.
  - A row without a contact cannot be approved; the server checks this too.
  - Saving different text on an approved row moves it back to review, because the approval was for the old text.
  - There is no bulk approve; bulk actions only skip or move back to review.
- **Explicit save.** No autosave. Unsaved text is marked, and the browser asks before a reload or closing the tab.
- **The score is not recalculated.** It comes from the data. "Why this score" lists what supports it (relevant topic, strong site, links to a competitor) and what argues against it.
- **Privacy.** Nothing fetches the sites in the data: no favicons or previews; the detail shows the domain's initials instead. External links open with `rel="noopener noreferrer nofollow"`. User and seed text is rendered as text.
- **Simple, explainable code.** Filters are plain links instead of client state; bulk actions are a plain form posting to one Server Action; business rules are pure, tested functions in `src/lib/`.

## AI rewrite

"Rewrite with AI" puts a rewritten draft into the editor as an unsaved change. You review it and then save, approve or discard it; nothing is saved, approved or sent on its own.

Two providers implement one `DraftRewriter` interface in [`src/lib/rewrite/`](src/lib/rewrite/):

- **`mock` (default):** a fixed template with no network call. Same input, same output. It keeps the contact, page title, competitor and any links.
- **`anthropic` (opt-in):** calls Claude (`claude-opus-5-5` by default) with your own key. To use it, set this in `.env` and restart `npm run dev`:

  ```bash
  LLM_PROVIDER="anthropic"
  ANTHROPIC_API_KEY="your-key"
  ```

  **This sends data out of your machine:** the draft, the page title, the competitor and the contact name go to the Anthropic API.

The provider is chosen only by `LLM_PROVIDER`. A key that happens to be set does not switch the real provider on.

## What I skipped, and why

- **Status and topic filters, sort options, search and pagination.** They were in the design reference but are new features, not part of the stories. 50 rows do not need pages.
- **"Select all" for bulk actions.** It needs extra client code and matters little for 41 rows.
- **Asking before switching rows with unsaved text.** The browser asks on reload or closing the tab, but clicking another row drops unsaved text. Catching that would need the list to know the editor's state.
- **Server-side fallback models for the Anthropic call.** One plain call is enough for an optional feature.
- **End-to-end tests.** The rules have unit tests; the flows were checked by hand in the browser.

Not tested: a real call to Claude, because I did not use a key. The error path was tested with the API pointed at a local address, so nothing left the machine.

## Next with more time

- End-to-end tests (Playwright) for approve, save, bulk skip and reload.
- Marking a row "Done" could also set "already contacted", once the app really sends messages.
- An audit log of status changes, and a saved copy of the exact approved text.
- Filtering and sorting in SQL instead of in memory, for larger datasets.
- Search by domain, and filters by status and topic.
- Keyboard shortcuts (next / previous row, approve, skip).

## How I Used AI Tools

I used Claude Code as a development assistant throughout the project, following an iterative, phase-by-phase workflow.

- **Planning:** I started with Plan Mode to analyse the requirements, break the assignment into implementation phases, define priorities, and establish the project structure and development rules. I also created a `CLAUDE.md` file to keep the implementation aligned with the agreed architecture, business logic, and project constraints.

- **Implementation:** Once the plan was established, I worked through it phase by phase, using Claude Code to help implement the functionality. I reviewed the results of each phase before moving on to the next one.

- **Testing and refinement:** I manually tested each implemented phase in the browser, checking that the functionality behaved as expected and followed the defined business rules. When something did not fully match my expectations or the intended product experience, I provided additional instructions, discussed alternative approaches, and asked for refinements.

- **My involvement and decisions:** I remained responsible for defining the requirements, setting priorities, evaluating implementation choices, and deciding what needed to be changed. I also guided several iterations of the UI and functionality to make the application more consistent with the original product idea and the visual identity of Moonrank.

- **Verification:** I used Claude Code to help run and resolve issues found during type checking, linting, unit tests, and production builds. I also manually verified the main application workflows, including persistence after reload.

AI was used as a pair-programming tool, while the project direction, requirements, testing expectations, and final implementation decisions remained guided by me.

## Project layout

```
data/opportunities.json   the 50 seed rows from the assignment (unchanged)
prisma/                   schema, migration and the validated, idempotent seed
src/app/                  the page, Server Actions (actions.ts) and error state
src/components/           UI; src/components/ui/ is shadcn/ui
src/lib/                  rules and helpers, with tests next to them:
  quality.ts              low-quality flags, sorting, filters, duplicate domains
  status.ts               status rules and the left-to-review count
  explain.ts              "Why this score" signals
  schemas.ts              zod schemas for the seed and every action input
  rewrite/                draft rewriters (mock and Anthropic)
```

Stack: Next.js 16 (App Router, Server Actions), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma 7 with SQLite, zod, Vitest.
