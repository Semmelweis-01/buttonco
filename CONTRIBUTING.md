# Contributing to BUTTONCO

Thanks for considering a PR. This project is small on purpose: a pure-logic engine, a
data-only content layer, and a DOM layer on top. The fastest way to get a change merged is
to respect those three boundaries.

## Ground rules

1. **TypeScript strict, ESM, zero runtime dependencies.** `typescript`, `vite` and `vitest`
   are dev-only. A PR that adds a runtime dependency will be declined, no matter how good
   the dependency is.
2. **The engine never touches the DOM, the clock, or `Math.random`.** Time arrives as a
   `now` argument; randomness comes from the injected seeded RNG.
3. **The content layer contains data only.** No logic, no imports outside
   `src/engine/types.ts`, no side effects.
4. **Don't edit `SPEC.md`.** It is the conceptual contract this project is built against.
5. **`npm test` and `npm run typecheck` must pass.** Run both before opening a PR; a reviewer will run them again.

## Tone rules (the part that gets PRs rejected)

The voice is *cold corporate officialese interrupted by precise absurdity*. Write like a
compliance memo that has quietly lost its mind.

- **Do:** exact, over-specific details. "The receipt is 2.3 meters long, mostly spaces."
- **Do:** bureaucracy, customer service, printers, cats, tax law, philosophy graduates, the
  end of the universe.
- **Don't:** profanity, slurs, politics, religion, real company or brand names, real people.
- **Don't:** punch down. The joke is always on the institution, never on the reader.
- Chinese is the primary voice; English one-liners as accents are welcome.

## Adding an event card

Append to `EVENTS` in `src/content/events.ts`. The type is `GameEventDef` in
`src/engine/types.ts`; the important fields:

| Field | Rule |
| --- | --- |
| `id` | unique, kebab-case |
| `text` | the main line; keep it 8–40 chars so the test suite stays green |
| `sub` | optional footnote; 6–30 chars |
| `minPresses` / `maxPresses` | optional window, inclusive; `min <= max` |
| `once` | appears at most once per run |
| `cooldown` | minimum number of presses before it can reappear |
| `requires` | optional pure predicate over `EventContext` |
| `weight` | default 1, must be `> 0` and `<= 5` |
| `effects` | array of `{ stat, op, value }`; `op` is `add` / `set` / `mul` |
| `tone` | `calm` / `weird` / `panic` / `cosmic` — drives UI intensity |

Hard constraints enforced by `tests/content.test.ts`:

- `cats` only ever increases (`op: "add"` with a positive value).
- `text` is 8–40 characters; `sub` is 6–30 characters.
- Every new card also needs an entry in `src/content/i18n/en.ts` — the i18n suite fails otherwise.
- No two cards share the same `text`.
- At least 60 cards must remain; at least 8 `once`, 10 `cooldown`, 8 `requires`.

`requires` must be a pure function that is safe for *any* `Stats`, including negative,
`NaN`-adjacent and astronomically large values. It is evaluated in tests against exactly
those extremes.

## Adding an ending

Append to `ENDINGS` in `src/content/endings.ts` (plus the matching English entry in
`src/content/i18n/en.ts`). Two things to know:

- **Order is the rule.** The engine picks the *first* ending whose `condition` returns true,
  so a broad condition placed early will shadow everything below it. Put narrow conditions
  above broad ones.
- `condition` receives an `EndingContext` (`stats`, `tierIndex`, `presses`, `elapsedMs`,
  `muted`) and must be pure and total.
- `rarity` is `common` / `rare` / `secret`. `secret` endings are not spoiled in the README.
- `title` is 2–8 characters; `blurb` is 10–30 characters.

Every ending must be reachable by at least one extreme test context and must not be true for
all of them — the test suite checks both.

## Adding an achievement

Append to `ACHIEVEMENTS` in `src/content/achievements.ts` (plus the English entry). `hint` is shown while the
achievement is locked and must make the reader want to do the stupid thing. Mark it
`secret: true` if it should render as `???` before unlocking. At least half of the wall must
stay secret, and at least four must stay public.

## Changing the engine or UI

`src/engine/**`, `src/ui/**`, `index.html` and the stylesheet belong to other maintainers'
modules. Open an issue before sending a structural change there. Content-only PRs (events,
endings, achievements, docs, translations) are welcome without prior discussion.

If you touch the engine, keep the invariants in `docs/DESIGN.md` intact — they are the reason
the test suite can exist at all.

## Workflow

```bash
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest run
npm run dev         # manual check in the browser
npm run build       # what gets deployed
```

Keep commits focused, describe *why* in the message, and include a screenshot or GIF in the PR
description if you changed anything visual.

## Docs and translations

`README.md` is English and `README.zh-CN.md` is Simplified Chinese; keep the two structurally
in sync when you add a section. Do not invent badges, star counts, download numbers or user
counts — this repository has no such metrics and fake ones get PRs closed.

## License

By contributing you agree that your work is released under the [MIT License](./LICENSE).
