import { describe, expect, it } from "vitest";
import { Engine } from "../src/engine/engine";
import { mulberry32 } from "../src/engine/rng";
import type { EndingContext, Stats } from "../src/engine/types";
import { ACHIEVEMENTS, ENDINGS, EVENTS, TIERS } from "../src/content/index";

const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);

interface Run {
  endingId: string | null;
  presses: number;
  eventsSeen: number;
  tiersSeen: number;
  achievements: number;
}

/** 用真实引擎 + 真实内容跑一局；节奏由 rng 抽出，时间通过 press(t) 注入。 */
function play(seed: number, lo: number, hi: number, cap: number, muted = false): Run {
  const rng = mulberry32(seed);
  const engine = new Engine({
    seed,
    startedAt: 0,
    rng,
    events: EVENTS,
    tiers: TIERS,
    endings: ENDINGS,
    achievements: ACHIEVEMENTS,
  });
  engine.setMuted(muted);
  const seen = new Set<string>();
  const tiers = new Set<number>();
  let now = 0;
  let endingId: string | null = null;
  for (let i = 0; i < cap; i++) {
    now += lo + rng() * (hi - lo);
    const result = engine.press(now);
    tiers.add(engine.tierIndex);
    if (result.event) seen.add(result.event.id);
    if (result.ending) {
      endingId = result.ending.id;
      break;
    }
  }
  return {
    endingId,
    presses: engine.state.stats.presses,
    eventsSeen: seen.size,
    tiersSeen: tiers.size,
    achievements: engine.state.unlockedAchievements.length,
  };
}

function distribution(runs: Run[]): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const run of runs) {
    const key = run.endingId ?? "none";
    dist[key] = (dist[key] ?? 0) + 1;
  }
  return dist;
}

function log(label: string, runs: Run[]): void {
  const presses = runs.map((r) => r.presses);
  const dist = distribution(runs);
  const distinct = Object.keys(dist).length;
  console.log(
    [
      `BALANCE ${label}`,
      `ENDING_DIST ${JSON.stringify(dist)}`,
      `PRESSES_RANGE ${Math.min(...presses)} ${Math.max(...presses)}`,
      `SURVIVED_100 ${runs.filter((r) => r.presses >= 100).length}/${runs.length}`,
      `UNIQ_EVENTS_AVG ${(runs.reduce((a, r) => a + r.eventsSeen, 0) / runs.length).toFixed(1)} of ${EVENTS.length}`,
      `ACH_AVG ${(runs.reduce((a, r) => a + r.achievements, 0) / runs.length).toFixed(1)} of ${ACHIEVEMENTS.length}`,
      `TIERS_MAX ${Math.max(...runs.map((r) => r.tiersSeen))} DISTINCT_ENDINGS ${distinct}`,
    ].join(" | "),
  );
}

const base: Stats = {
  presses: 0,
  chaos: 0,
  trust: 100,
  cats: 0,
  coins: 0,
  combo: 0,
  fastestGapMs: Number.POSITIVE_INFINITY,
  elapsedMs: 0,
};

function ctx(patch: Partial<Stats>, muted = false): EndingContext {
  const stats = { ...base, ...patch };
  return {
    stats,
    tierIndex: 4,
    presses: stats.presses,
    elapsedMs: stats.elapsedMs,
    muted,
  };
}

/** 每个结局一个"专供"上下文，用于验证条件本身可达（不是恒假）。 */
const ENDING_CONTEXTS: EndingContext[] = [
  ctx({ presses: 100, chaos: 100, trust: 0, coins: -6000 }), // 归零
  ctx({ presses: 30, elapsedMs: 3000 }), // 手速事故
  ctx({ presses: 45, elapsedMs: 30000 }, true), // 沉默
  ctx({ presses: 50, elapsedMs: 300000 }), // 加班
  ctx({ presses: 100, combo: 20, elapsedMs: 60000 }), // 连击
  ctx({ presses: 100, cats: 38, elapsedMs: 60000 }), // 猫的胜利
  ctx({ presses: 100, coins: -7000, elapsedMs: 60000 }), // 破产
  ctx({ presses: 100, chaos: 100, trust: 5, elapsedMs: 60000 }), // 深渊
  ctx({ presses: 88, trust: 50, elapsedMs: 50000 }), // 吉利
  ctx({ presses: 100, trust: 60, elapsedMs: 60000 }), // 忠诚
];

/** 一个"什么都不满足"的对照上下文，用来证明条件不是恒真。 */
const NULL_CONTEXT: EndingContext = ctx({ presses: 0, trust: 100, chaos: 0, coins: 0 });

describe("balance · 结局不会提前抢戏", () => {
  it("正常节奏（380–780ms）下多数对局能活过 100 次按压，并跑满 5 档", () => {
    const runs = SEEDS.map((seed) => play(seed, 380, 780, 400));
    log("A-normal-380-780ms", runs);

    const survived = runs.filter((r) => r.presses >= 100).length;
    expect(survived).toBeGreaterThanOrEqual(36);

    const tiersSeen = new Set<number>();
    for (const run of runs) for (let i = 0; i < run.tiersSeen; i++) tiersSeen.add(i);
    expect(tiersSeen.size).toBe(TIERS.length);
  });

  it("正常节奏下结局要有分布，不能 40 局全同一个", () => {
    const runs = SEEDS.map((seed) => play(seed, 380, 780, 400));
    const dist = distribution(runs);
    const counts = Object.values(dist);
    expect(counts.length).toBeGreaterThanOrEqual(3);
    expect(Math.max(...counts)).toBeLessThanOrEqual(28);
    for (const ending of ENDINGS) {
      const hits = dist[ending.id] ?? 0;
      if (hits === 0) continue;
      expect(hits).toBeLessThan(runs.length);
    }
  });

  it("狂点节奏（120–200ms）会触发手速事故，而不是拖到常规结局", () => {
    const runs = SEEDS.map((seed) => play(seed, 120, 200, 60));
    log("B-frantic-120-200ms", runs);

    const speedrun = runs.filter((r) => r.endingId === "ending-speedrun").length;
    expect(speedrun).toBeGreaterThan(runs.length / 2);
    expect(Math.max(...runs.map((r) => r.presses))).toBeLessThanOrEqual(40);
  });

  it("静音慢速（muted, 500ms）能触发沉默", () => {
    const runs = SEEDS.map((seed) => play(seed, 500, 500, 60, true));
    log("C-muted-500ms", runs);

    const silent = runs.filter((r) => r.endingId === "ending-silent").length;
    expect(silent).toBeGreaterThan(runs.length / 2);
  });

  it("节拍器节奏（340–380ms）会把连击顶到上限并触发连击结局", () => {
    const runs = SEEDS.map((seed) => play(seed, 340, 380, 400));
    log("F-metronome-340-380ms", runs);

    const combo = runs.filter((r) => r.endingId === "ending-combo").length;
    expect(combo).toBeGreaterThan(runs.length / 2);
  });

  it("发呆节奏（2000–4000ms）会触发加班", () => {
    const runs = SEEDS.map((seed) => play(seed, 2000, 4000, 400));
    log("E-idle-2000-4000ms", runs);

    const overtime = runs.filter((r) => r.endingId === "ending-overtime").length;
    expect(overtime).toBeGreaterThan(0);
  });
});

describe("balance · 十个结局各自可达", () => {
  it("每个结局都能被某个定向上下文触发，且都不是恒真", () => {
    for (const ending of ENDINGS) {
      expect(ENDING_CONTEXTS.some((c) => ending.condition(c)), ending.id).toBe(true);
      expect(ending.condition(NULL_CONTEXT), ending.id).toBe(false);
    }
  });

  it("没有任何一个上下文能同时满足全部结局", () => {
    for (const context of ENDING_CONTEXTS) {
      expect(ENDINGS.every((e) => e.condition(context))).toBe(false);
    }
  });

  it("五种节奏合起来能覆盖全部 10 个结局，没有一个结局是死代码", () => {
    const observed = new Set<string>();
    for (const run of [
      ...SEEDS.map((s) => play(s, 380, 780, 400)),
      ...SEEDS.map((s) => play(s, 120, 200, 60)),
      ...SEEDS.map((s) => play(s, 500, 500, 60, true)),
      ...SEEDS.map((s) => play(s, 340, 380, 400)),
      ...SEEDS.map((s) => play(s, 2000, 4000, 400)),
    ]) {
      if (run.endingId) observed.add(run.endingId);
    }
    console.log("BALANCE COVERAGE | " + JSON.stringify([...observed].sort()));
    for (const ending of ENDINGS) expect(observed.has(ending.id), ending.id).toBe(true);
  });

  it("结局池覆盖 10 个互不相同的 id，且优先级顺序是 secret 打头", () => {
    expect(ENDINGS.length).toBe(10);
    expect(new Set(ENDINGS.map((e) => e.id)).size).toBe(10);
    expect(ENDINGS[0].rarity).toBe("secret");
  });
});
