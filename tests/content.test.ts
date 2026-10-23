import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS, ENDINGS, EVENTS, TIERS } from "../src/content/index";
import type { EndingContext, EventContext, Stats } from "../src/engine/types";

const STAT_KEYS: readonly string[] = [
  "presses",
  "chaos",
  "trust",
  "cats",
  "coins",
  "combo",
  "fastestGapMs",
  "elapsedMs",
];

const OPS: readonly string[] = ["add", "set", "mul"];

const ZERO: Stats = {
  presses: 0,
  chaos: 0,
  trust: 0,
  cats: 0,
  coins: 0,
  combo: 0,
  fastestGapMs: 0,
  elapsedMs: 0,
};

const NEGATIVE: Stats = {
  presses: -7,
  chaos: -50,
  trust: -50,
  cats: -3,
  coins: -1_000_000_000,
  combo: -10,
  fastestGapMs: -1,
  elapsedMs: -1,
};

const HUGE: Stats = {
  presses: 1_000_000_000,
  chaos: 1_000_000,
  trust: 1_000_000,
  cats: 1_000_000,
  coins: 1_000_000_000_000,
  combo: 1_000_000,
  fastestGapMs: 1_000_000_000_000,
  elapsedMs: 1_000_000_000_000,
};

const MIXED: Stats = {
  presses: 88,
  chaos: 90,
  trust: 0,
  cats: 50,
  coins: -10_001,
  combo: 20,
  fastestGapMs: 199,
  elapsedMs: 14_999,
};

/** 专供"吉利"：第 88 次按压，信任还没崩。 */
const LUCKY: Stats = {
  presses: 88,
  chaos: 70,
  trust: 50,
  cats: 20,
  coins: -3_000,
  combo: 2,
  fastestGapMs: 600,
  elapsedMs: 50_000,
};

const SATURATED: Stats = {
  presses: 100,
  chaos: 100,
  trust: 0,
  cats: 12,
  coins: -9_000,
  combo: 3,
  fastestGapMs: 120,
  elapsedMs: 400_000,
};

function contexts(stats: Stats): EndingContext[] {
  const list: EndingContext[] = [];
  for (const tierIndex of [0, 2, 4]) {
    for (const muted of [false, true]) {
      list.push({
        stats: { ...stats },
        tierIndex,
        presses: stats.presses,
        elapsedMs: stats.elapsedMs,
        muted,
      });
    }
  }
  return list;
}

const EXTREME_CONTEXTS: EndingContext[] = [
  ...contexts(ZERO),
  ...contexts(NEGATIVE),
  ...contexts(HUGE),
  ...contexts(MIXED),
  ...contexts(SATURATED),
  ...contexts(LUCKY),
];

const EXTREME_EVENT_CONTEXTS: EventContext[] = [
  ZERO,
  NEGATIVE,
  HUGE,
  MIXED,
  SATURATED,
].flatMap((stats) =>
  [0, 2, 4].flatMap((tierIndex) =>
    [0, 60_000, 3_600_000].map((elapsed) => ({
      stats: { ...stats },
      tierIndex,
      now: elapsed + 1,
      startedAt: 1,
    })),
  ),
);

describe("events", () => {
  it("至少有 60 张卡，且 id 唯一", () => {
    expect(EVENTS.length).toBeGreaterThanOrEqual(60);
    const ids = EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("每张卡的 id / text 合法，weight > 0", () => {
    for (const e of EVENTS) {
      expect(e.id.length, e.id).toBeGreaterThan(0);
      expect(e.text.length, e.id).toBeGreaterThanOrEqual(8);
      expect(e.text.length, e.id).toBeLessThanOrEqual(40);
      const weight = e.weight ?? 1;
      expect(Number.isFinite(weight), e.id).toBe(true);
      expect(weight, e.id).toBeGreaterThan(0);
      if (e.sub !== undefined) {
        expect(e.sub.length, e.id).toBeGreaterThanOrEqual(6);
        expect(e.sub.length, e.id).toBeLessThanOrEqual(30);
      }
    }
  });

  it("effects 的 stat / op / value 合法", () => {
    for (const e of EVENTS) {
      for (const effect of e.effects ?? []) {
        expect(STAT_KEYS.includes(effect.stat), `${e.id}:${effect.stat}`).toBe(true);
        expect(OPS.includes(effect.op), `${e.id}:${effect.op}`).toBe(true);
        expect(typeof effect.value, e.id).toBe("number");
        expect(Number.isFinite(effect.value), e.id).toBe(true);
      }
    }
  });

  it("cats 只增不减", () => {
    for (const e of EVENTS) {
      for (const effect of e.effects ?? []) {
        if (effect.stat !== "cats") continue;
        expect(effect.op, e.id).toBe("add");
        expect(effect.value, e.id).toBeGreaterThan(0);
      }
    }
  });

  it("minPresses <= maxPresses", () => {
    for (const e of EVENTS) {
      if (e.minPresses !== undefined && e.maxPresses !== undefined) {
        expect(e.minPresses, e.id).toBeLessThanOrEqual(e.maxPresses);
      }
      if (e.minPresses !== undefined) expect(e.minPresses, e.id).toBeGreaterThanOrEqual(0);
      if (e.cooldown !== undefined) expect(e.cooldown, e.id).toBeGreaterThanOrEqual(0);
    }
  });

  it("稀有卡与开场高频卡权重符合设计", () => {
    for (const e of EVENTS) {
      const weight = e.weight ?? 1;
      if (e.minPresses === 0) expect(weight, e.id).toBeGreaterThanOrEqual(1);
      expect(weight, e.id).toBeLessThanOrEqual(5);
    }
  });

  it("requires 是纯函数，对任意上下文不抛异常且结果稳定", () => {
    for (const e of EVENTS) {
      if (!e.requires) continue;
      for (const ctx of EXTREME_EVENT_CONTEXTS) {
        const first = e.requires(ctx);
        const second = e.requires(ctx);
        expect(typeof first, e.id).toBe("boolean");
        expect(second, e.id).toBe(first);
      }
    }
  });

  it("满足配额：once >= 8、cooldown >= 10、requires >= 8", () => {
    expect(EVENTS.filter((e) => e.once === true).length).toBeGreaterThanOrEqual(8);
    expect(EVENTS.filter((e) => (e.cooldown ?? 0) > 0).length).toBeGreaterThanOrEqual(10);
    expect(EVENTS.filter((e) => typeof e.requires === "function").length).toBeGreaterThanOrEqual(8);
  });

  it("母题足够分散：tone 三种以上、文本互不重复", () => {
    const tones = new Set(EVENTS.map((e) => e.tone ?? "calm"));
    expect(tones.size).toBeGreaterThanOrEqual(3);
    const texts = EVENTS.map((e) => e.text);
    expect(new Set(texts).size).toBe(texts.length);
  });
});

describe("tiers", () => {
  it("恰好 5 档，minPresses 为 0 / 10 / 25 / 50 / 100", () => {
    expect(TIERS.length).toBe(5);
    expect(TIERS.map((t) => t.minPresses)).toEqual([0, 10, 25, 50, 100]);
    const ids = TIERS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("每档文案与噪声合法", () => {
    for (const t of TIERS) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.headline.length).toBeGreaterThan(0);
      expect(t.subline.length).toBeGreaterThan(0);
      expect(t.noise).toBeGreaterThanOrEqual(0);
      expect(t.noise).toBeLessThanOrEqual(3);
    }
  });
});

describe("endings", () => {
  it("至少 8 个，id 唯一，rarity 合法，含 secret", () => {
    expect(ENDINGS.length).toBeGreaterThanOrEqual(8);
    const ids = ENDINGS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of ENDINGS) {
      expect(["common", "rare", "secret"]).toContain(e.rarity);
      expect(e.title.length).toBeGreaterThanOrEqual(2);
      expect(e.title.length).toBeLessThanOrEqual(8);
      expect(e.blurb.length).toBeGreaterThanOrEqual(10);
      expect(e.blurb.length).toBeLessThanOrEqual(30);
    }
    expect(ENDINGS.filter((e) => e.rarity === "secret").length).toBeGreaterThanOrEqual(1);
  });

  it("condition 对极端 stats 安全求值", () => {
    for (const e of ENDINGS) {
      for (const ctx of EXTREME_CONTEXTS) {
        const result = e.condition(ctx);
        expect(typeof result, e.id).toBe("boolean");
        expect(e.condition(ctx), e.id).toBe(result);
      }
    }
  });

  it("每个结局都能被某个极端上下文触发，且不是恒真", () => {
    for (const e of ENDINGS) {
      expect(EXTREME_CONTEXTS.some((ctx) => e.condition(ctx)), e.id).toBe(true);
      expect(EXTREME_CONTEXTS.every((ctx) => e.condition(ctx)), e.id).toBe(false);
    }
  });
});

describe("achievements", () => {
  it("至少 12 个，id 唯一，一半以上为 secret", () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(12);
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    const secretCount = ACHIEVEMENTS.filter((a) => a.secret === true).length;
    expect(secretCount).toBeGreaterThanOrEqual(Math.floor(ACHIEVEMENTS.length / 2));
    expect(ACHIEVEMENTS.length - secretCount).toBeGreaterThanOrEqual(4);
  });

  it("title / hint 都非空", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.title.length, a.id).toBeGreaterThanOrEqual(2);
      expect(a.hint.length, a.id).toBeGreaterThanOrEqual(8);
    }
  });

  it("condition 对极端 stats 安全求值", () => {
    for (const a of ACHIEVEMENTS) {
      for (const ctx of EXTREME_CONTEXTS) {
        const result = a.condition(ctx);
        expect(typeof result, a.id).toBe("boolean");
        expect(a.condition(ctx), a.id).toBe(result);
      }
    }
  });
});
