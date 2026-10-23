# BUTTONCO — Design & Engine Notes

This document explains how the game actually works: the loop, the press pipeline, the data
contracts, and the invariants the test suite defends. It is written for someone who wants to
change the game without breaking it.

## 1. The premise

A button whose only job is to advise you against pressing it. The player presses it anyway.
Each press settles one more layer of consequence: the copy gets more nervous, the numbers
move, the interface decays. The joke is not that pressing is punished — it is that pressing is
*processed*: filed, taxed, audited, and eventually absorbed into the universe's fixed-asset
register.

A run is short (60–120 seconds) and infinitely repeatable. What persists between runs is not
the score but the **record**: which endings you have seen, which achievements you have earned,
and how many times you have pressed the button across all sessions.

## 2. The loop

```
  idle:  giant red button + a polite warning
    |
    v
  press(now)
    |  1. counters:      presses += 1, totalPresses += 1, elapsedMs = now - startedAt
    |  2. combo:         gap <= 400ms -> combo += 1, else combo = 1; track fastestGapMs
    |  3. tier:          highest tier whose minPresses <= presses
    |  4. event card:    filter candidates -> weighted draw -> apply effects -> clamp
    |  5. ending:        first ending in array order whose condition is true
    |  6. achievements:  every achievement not yet unlocked whose condition is true
    v
  render: event card text, tier headline, stat panel, decay effects, sounds
    |
    +--> ending settled? then the button is dead for this run (further presses are ignored)
```

One press produces exactly one `PressResult`. The UI never computes game rules; it only
renders the result. This is the single most important boundary in the codebase — it is what
makes the game testable in Node with no browser at all.

## 3. Layers

| Layer | Path | May do | Must not do |
| --- | --- | --- | --- |
| Contract | `src/engine/types.ts` | declare types | contain behavior |
| Engine | `src/engine/*` | compute state, draw cards, resolve endings | touch DOM, read the clock, call `Math.random` |
| Content | `src/content/*` | export data and pure predicates | contain logic, import from the engine implementation, cause side effects |
| Localization | `src/content/i18n/*` | map content ids to localized copy | own game rules, drift from the id set |
| UI | `src/ui/*`, `index.html` | render state, play audio, forward clicks | own game rules or persist state directly |

The dependency direction is strictly one-way: `ui -> engine -> types`, and `content -> types`.
The engine knows nothing about the content module; definitions are injected through
`EngineOptions`.

## 4. State and statistics

`Stats` is the whole numeric world:

| Field | Range | Meaning |
| --- | --- | --- |
| `presses` | `>= 0` | presses in this run; strictly increasing, never undone |
| `chaos` | `0..100` | how far the world has drifted from procedure |
| `trust` | `0..100`, starts at 100 | the company's opinion of you; only falls |
| `cats` | `>= 0` | cats. Only ever increases |
| `coins` | any number | company balance in yuan; happiest when negative |
| `combo` | `>= 0` | consecutive presses within 400 ms |
| `fastestGapMs` | `> 0` or `Infinity` | fastest gap ever recorded; `Infinity` is the "not yet" sentinel |
| `elapsedMs` | `>= 0` | run duration |

`clampStats()` runs after every effect application and is the last line of defense:
`NaN` and `±Infinity` collapse to safe values, `chaos`/`trust` are clamped to `0..100`,
counters are rounded and floored at zero. Content authors may therefore write sloppy
arithmetic without being able to corrupt a save.

Note the deliberate asymmetry: `chaos` and `trust` are *bounded*, `coins` is not. A player can
always go deeper into debt, which is what makes the bankruptcy ending reachable and the
economy feel like a real organization.

## 5. Escalation tiers

Five tiers, chosen by the highest `minPresses` that is `<= presses`:

| Index | Presses | Name | Noise |
| --- | --- | --- | --- |
| 0 | 0 | 礼貌劝阻 — polite discouragement | 0 |
| 1 | 10 | 流程介入 — the process intervenes | 1 |
| 2 | 25 | 部门震动 — department-wide tremor | 2 |
| 3 | 50 | 宇宙结算 — cosmic settlement | 3 |
| 4 | 100 | 无话可说 — nothing left to say | 3 |

`noise` is `0..3` and is purely advisory: the UI maps it to visual decay. The engine never
uses it for rules. Tiers are sorted defensively at construction time, so the array order in
`tiers.ts` cannot break lookup.

## 6. The event deck

`GameEventDef` supports four independent gates and one weight:

- **`minPresses` / `maxPresses`** — an inclusive press-count window. Used for the opening
  cards (0–6) and for "this only happens on press 7" beats.
- **`once`** — after it appears, the id is recorded in `seenEvents` and it can never be drawn
  again in that run. Used for story beats: 1st, 7th, 10th, 25th, 50th, 88th, 100th press.
- **`cooldown`** — after it appears, at least `cooldown` presses must pass before it can be
  drawn again. Stored as `lastSeen[id] = presses`.
- **`requires`** — an arbitrary pure predicate over `EventContext` (`stats`, `tierIndex`,
  `now`, `startedAt`). Used for state-reactive cards: "cats > 0", "chaos > 50",
  "you have been here for over a minute".
- **`weight`** — default `1`. Rare cards sit at `0.3–0.6`; opening cards at `2`.

Drawing is a single weighted roll over the filtered candidate list. If the candidate list is
empty the press yields `event: null` and only the counters move — the game never throws
because the deck ran dry.

Because `requires` and `cooldown` are evaluated against the *current* press count, the deck
is self-balancing: a card that unlocks late can never appear early, and a card that just
appeared cannot appear twice in a row.

## 7. Endings

Endings are checked **after** the event card is applied, in array order, and the first true
condition wins. That ordering is meaningful, not incidental: a broad condition placed above a
narrow one makes the narrow one unreachable. Narrow conditions belong at the top of
`endings.ts`.

Once an ending is settled, `endingId` is set and the run is over: subsequent `press(now)`
calls return `ignored: true` and change nothing. The ending id is appended to
`unlockedEndings`, which is persisted.

Endings are graded `common` / `rare` / `secret`. Nine are documented in the README; the
tenth is a secret ending whose condition is intentionally not written down here either — if
you need it, read `src/content/endings.ts` and then keep it to yourself.

## 8. Achievements

Achievements are evaluated on every press, against the same `EndingContext`, and are unlocked
at most once per profile (not per run) because `unlockedAchievements` survives the reset.
`secret: true` means the wall shows `???` and the `hint` is withheld until it is earned.

Half the wall is secret on purpose: the visible half teaches the rules, the hidden half is
the reason to keep pressing at 3 a.m.

## 9. Deterministic randomness

All randomness comes from a single injected `Rng` (`() => number` in `[0, 1)`).
`mulberry32(seed)` is the production and test implementation: 32-bit state, no dependencies,
identical output for identical seeds across platforms and Node versions.

The engine never calls `Math.random()` or `Date.now()`. Time is a parameter (`press(now)`),
seed is a constructor option. Consequence: a test can replay an exact sequence of presses and
assert the exact sequence of cards — the game is a deterministic function of
`(seed, press timestamps)`.

`randomSeed()` in `rng.ts` is the only place allowed to touch ambient entropy, and it does so
at run start, outside the engine's pure core.

## 9.5. Localization

The Chinese copy lives inline in `events.ts` / `tiers.ts` / `endings.ts` /
`achievements.ts` and is the primary voice. English copy lives beside it in
`src/content/i18n/en.ts`, keyed by the same ids, and is reached through the pure lookups
`localizeEvent`, `localizeTier`, `localizeEnding` and `localizeAchievement` (`Lang` is
`"zh" | "en"`).

The lookup layer is data-in / data-out: no DOM, no storage, no engine state. `tests/i18n.test.ts`
pins the two tables together — it asserts an entry for **every** content id, no entries for ids
that do not exist, identical table sizes, and that every English string is non-empty,
CJK-free and within the same length budget as the Chinese line. Adding a card without its
English string fails the suite, which is the intended behavior.

## 10. Persistence

`SaveData` (version `1`) stores exactly the cross-run fields:

```json
{ "version": 1, "totalPresses": 0, "unlockedEndings": [], "unlockedAchievements": [], "muted": false, "seed": 0 }
```

Storage key: `buttonco.save.v1`. Rules:

- `parseSave()` validates every field and returns `null` on *any* doubt — bad JSON, unknown
  version, wrong types, negative counts. A corrupt save is discarded silently; it can never
  crash a boot.
- `loadSave()` / `writeSave()` accept a `Storage | null`. `null` (private mode, SSR, tests)
  degrades to "no persistence" rather than throwing. Quota errors return `false`.
- `createState(seed, startedAt, save)` restores only persistent fields. **In-run stats always
  restart at zero** — a new run is a new run, even for a veteran.

Version bumps must add a migration path; the current policy is "discard unknown versions",
which is acceptable while the only thing at stake is a joke counter.

## 11. Invariants (do not break these)

1. `press()` is total: it never throws, for any `now` value, including non-monotonic clocks
   (a negative gap is treated as a fresh combo).
2. Effects are applied then clamped; `clampStats()` is always the last writer of `Stats`.
3. `cats` never decreases; no card may subtract cats.
4. An ended run ignores further presses instead of restarting silently.
5. Every content predicate is pure and total — safe on negative, huge and degenerate stats.
6. The engine imports nothing from `src/content/*` and nothing from `src/ui/*`.
7. Nothing in `src/engine/*` or `src/content/*` references `window`, `document` or
   `localStorage` at module scope.

These are enforced by `tests/engine.test.ts` and `tests/content.test.ts`. If a change requires
relaxing one of them, it is not a small change — open an issue first.

## 12. Test strategy

- **Content suite** — schema validation (id uniqueness, text lengths, weight bounds, effect
  shape), quota checks (card counts, once/cooldown/requires minimums), and *extreme-context
  evaluation*: every `requires` and `condition` is run against zero, negative, huge, mixed and
  saturated stats, twice, asserting a stable boolean each time. It also asserts every ending is
  reachable by some context and not true for all of them.
- **Engine suite** — deterministic replay with a fixed seed, tier transitions at the exact
  boundaries, combo window behavior, ending settlement (and post-ending no-ops), achievement
  unlocking and deduplication, save round-trip, and corrupt-save rejection.

## 13. Extending the game

| I want to… | Edit | Read first |
| --- | --- | --- |
| add a joke | `src/content/events.ts` | section 6 above, then [CONTRIBUTING.md](../CONTRIBUTING.md) |
| add an ending | `src/content/endings.ts` | section 7 (ordering!) |
| add an achievement | `src/content/achievements.ts` | section 8 |
| retune the difficulty curve | `src/content/tiers.ts` + card windows | section 5 |
| change visuals or audio | `src/ui/*` | section 3 (the UI owns no rules) |
| change a rule | `src/engine/*` | section 11 — coordinate first |

After any content change: `npm test && npm run typecheck`. CI runs both, plus a build and the
GitHub Pages deploy on `main`.
