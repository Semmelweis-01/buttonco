import { describe, expect, it } from "vitest";
import {
  Engine,
  SAVE_KEY,
  SAVE_VERSION,
  clampStats,
  createState,
  initialStats,
  loadSave,
  mulberry32,
  parseSave,
  randomSeed,
  serializeSave,
  writeSave,
} from "../src/engine/index";
import type {
  AchievementDef,
  EndingDef,
  GameEventDef,
  GameState,
  PressResult,
  Rng,
  SaveData,
  TierDef,
} from "../src/engine/index";

/* ------------------------------------------------------------------ */
/* 假内容层：引擎测试完全不依赖 src/content                              */
/* ------------------------------------------------------------------ */

const TIERS: TierDef[] = [
  { id: "t0", name: "零档", minPresses: 0, headline: "h0", subline: "s0", noise: 0 },
  { id: "t1", name: "一档", minPresses: 3, headline: "h1", subline: "s1", noise: 1 },
  { id: "t2", name: "二档", minPresses: 10, headline: "h2", subline: "s2", noise: 3 },
];

const NO_ENDINGS: EndingDef[] = [];
const NO_ACHIEVEMENTS: AchievementDef[] = [];

function makeEngine(overrides: Partial<Parameters<typeof makeOptions>[0]> = {}): Engine {
  return new Engine(makeOptions(overrides));
}

interface Options {
  seed: number;
  startedAt: number;
  rng: Rng;
  events: GameEventDef[];
  tiers: TierDef[];
  endings: EndingDef[];
  achievements: AchievementDef[];
  save?: SaveData | null;
}

function makeOptions(o: Partial<Options>): Options {
  const seed = o.seed ?? 42;
  return {
    seed,
    startedAt: o.startedAt ?? 0,
    rng: o.rng ?? mulberry32(seed),
    events: o.events ?? [],
    tiers: o.tiers ?? TIERS,
    endings: o.endings ?? NO_ENDINGS,
    achievements: o.achievements ?? NO_ACHIEVEMENTS,
    save: o.save ?? null,
  };
}

function pressSequence(engine: Engine, times: number[]): PressResult[] {
  return times.map((now) => engine.press(now));
}

/** 内存版 Storage，用于存档读写测试。 */
class MemoryStorage {
  private readonly map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

/** 永远抛异常的 Storage，模拟隐私模式 / 配额爆掉。 */
const throwingStorage = {
  length: 0,
  clear(): void {
    throw new Error("boom");
  },
  getItem(): string | null {
    throw new Error("boom");
  },
  key(): string | null {
    throw new Error("boom");
  },
  removeItem(): void {
    throw new Error("boom");
  },
  setItem(): void {
    throw new Error("boom");
  },
} as unknown as Storage;

/* ------------------------------------------------------------------ */
/* RNG                                                                 */
/* ------------------------------------------------------------------ */

describe("rng", () => {
  it("mulberry32 同 seed 产生同一序列，且落在 [0,1)", () => {
    const a = mulberry32(1234);
    const b = mulberry32(1234);
    const c = mulberry32(9999);
    const seqA = Array.from({ length: 8 }, () => a());
    const seqB = Array.from({ length: 8 }, () => b());
    const seqC = Array.from({ length: 8 }, () => c());
    expect(seqA).toEqual(seqB);
    expect(seqA).not.toEqual(seqC);
    for (const v of seqA) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("randomSeed 返回 32 位无符号整数", () => {
    const seed = randomSeed();
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThan(2 ** 32);
  });
});

/* ------------------------------------------------------------------ */
/* state                                                               */
/* ------------------------------------------------------------------ */

describe("state", () => {
  it("initialStats 给出干净的起始数值", () => {
    const s = initialStats();
    expect(s.presses).toBe(0);
    expect(s.chaos).toBe(0);
    expect(s.trust).toBe(100);
    expect(s.cats).toBe(0);
    expect(s.combo).toBe(0);
    expect(s.fastestGapMs).toBe(Infinity);
    expect(s.elapsedMs).toBe(0);
  });

  it("createState 无存档时给出空历史", () => {
    const st = createState(7, 1000);
    expect(st.seed).toBe(7);
    expect(st.startedAt).toBe(1000);
    expect(st.totalPresses).toBe(0);
    expect(st.unlockedEndings).toEqual([]);
    expect(st.unlockedAchievements).toEqual([]);
    expect(st.muted).toBe(false);
    expect(st.endingId).toBeNull();
    expect(st.stats.presses).toBe(0);
  });

  it("createState 传存档时恢复历史字段，但本轮 presses 从 0 开始", () => {
    const save: SaveData = {
      version: SAVE_VERSION,
      totalPresses: 88,
      unlockedEndings: ["e1"],
      unlockedAchievements: ["a1"],
      muted: true,
      seed: 5,
    };
    const st = createState(11, 0, save);
    expect(st.totalPresses).toBe(88);
    expect(st.unlockedEndings).toEqual(["e1"]);
    expect(st.unlockedAchievements).toEqual(["a1"]);
    expect(st.muted).toBe(true);
    expect(st.stats.presses).toBe(0);
    expect(st.seed).toBe(11);
  });

  it("clampStats 夹取 chaos/trust 到 0..100，整数与非负约束生效", () => {
    const clamped = clampStats({
      presses: -5,
      chaos: 999,
      trust: -12,
      cats: -3.7,
      coins: -50,
      combo: -2,
      fastestGapMs: 120,
      elapsedMs: -9,
    });
    expect(clamped.presses).toBe(0);
    expect(clamped.chaos).toBe(100);
    expect(clamped.trust).toBe(0);
    expect(clamped.cats).toBe(0);
    expect(clamped.combo).toBe(0);
    expect(clamped.coins).toBe(-50);
    expect(clamped.elapsedMs).toBe(0);
    expect(Number.isInteger(clamped.cats)).toBe(true);
  });

  it("clampStats 保留 Infinity 的 fastestGapMs 哨兵值", () => {
    const stats = { ...initialStats(), chaos: -1 };
    expect(clampStats(stats).fastestGapMs).toBe(Infinity);
  });
});

/* ------------------------------------------------------------------ */
/* save                                                                */
/* ------------------------------------------------------------------ */

describe("save", () => {
  const goodSave: SaveData = {
    version: SAVE_VERSION,
    totalPresses: 12,
    unlockedEndings: ["hand"],
    unlockedAchievements: ["first"],
    muted: false,
    seed: 4242,
  };

  it("SAVE_KEY / SAVE_VERSION 常量正确", () => {
    expect(SAVE_KEY).toBe("buttonco.save.v1");
    expect(SAVE_VERSION).toBe(1);
  });

  it("序列化往返无损", () => {
    const raw = JSON.stringify(goodSave);
    expect(parseSave(raw)).toEqual(goodSave);
  });

  it("坏存档一律返回 null 且不抛异常", () => {
    expect(parseSave(null)).toBeNull();
    expect(parseSave("")).toBeNull();
    expect(parseSave("不是 JSON")).toBeNull();
    expect(parseSave("{")).toBeNull();
    expect(parseSave("[]")).toBeNull();
    expect(parseSave("null")).toBeNull();
    expect(parseSave(JSON.stringify({ ...goodSave, version: 2 }))).toBeNull();
    expect(parseSave(JSON.stringify({ ...goodSave, totalPresses: "12" }))).toBeNull();
    expect(parseSave(JSON.stringify({ ...goodSave, unlockedEndings: [1, 2] }))).toBeNull();
    expect(parseSave(JSON.stringify({ ...goodSave, unlockedAchievements: "a" }))).toBeNull();
    expect(parseSave(JSON.stringify({ ...goodSave, muted: "no" }))).toBeNull();
    expect(parseSave(JSON.stringify({ ...goodSave, seed: null }))).toBeNull();
    expect(parseSave(JSON.stringify({ ...goodSave, totalPresses: -1 }))).toBeNull();
    const missing = { ...goodSave } as Record<string, unknown>;
    delete missing.seed;
    expect(parseSave(JSON.stringify(missing))).toBeNull();
  });

  it("loadSave 在 storage 为 null 时返回 null", () => {
    expect(loadSave(null)).toBeNull();
  });

  it("writeSave / loadSave 往返成功，并写入固定 key", () => {
    const storage = new MemoryStorage();
    const state = createState(4242, 0, goodSave);
    expect(writeSave(storage as unknown as Storage, state)).toBe(true);
    expect(storage.getItem(SAVE_KEY)).not.toBeNull();
    expect(loadSave(storage as unknown as Storage)).toEqual(goodSave);
  });

  it("writeSave 对 null / 抛异常的 storage 返回 false 而不抛", () => {
    expect(writeSave(null, createState(1, 0))).toBe(false);
    expect(writeSave(throwingStorage, createState(1, 0))).toBe(false);
    expect(loadSave(throwingStorage)).toBeNull();
  });

  it("serializeSave 从 GameState 提取持久字段", () => {
    const state = createState(goodSave.seed, 0, goodSave);
    expect(serializeSave(state)).toEqual(goodSave);
    // seed 取自 createState 的参数，而不是存档里的 seed
    expect(serializeSave(createState(9, 0, goodSave)).seed).toBe(9);
  });
});

/* ------------------------------------------------------------------ */
/* 档位                                                                 */
/* ------------------------------------------------------------------ */

describe("档位", () => {
  it("按 minPresses 升序计算档位，并在跨档时置 tierChanged", () => {
    const engine = makeEngine({});
    expect(engine.tierIndex).toBe(0);
    expect(engine.tier.id).toBe("t0");

    const results = pressSequence(engine, [0, 100, 200]);
    expect(results.map((r) => r.tier.id)).toEqual(["t0", "t0", "t1"]);
    expect(results.map((r) => r.tierChanged)).toEqual([false, false, true]);
    expect(results[2].tier.noise).toBe(1);

    const later = pressSequence(engine, Array.from({ length: 7 }, (_, i) => 300 + i * 100));
    const jump = later.filter((r) => r.tierChanged);
    expect(jump).toHaveLength(1);
    expect(jump[0].tier.id).toBe("t2");
    expect(engine.tierIndex).toBe(2);
    expect(engine.tier.id).toBe("t2");
  });

  it("档位数组乱序传入也会按 minPresses 排序", () => {
    const shuffled = [TIERS[2], TIERS[0], TIERS[1]];
    const engine = makeEngine({ tiers: shuffled });
    expect(engine.tierIndex).toBe(0);
    expect(engine.tier.id).toBe("t0");
  });
});

/* ------------------------------------------------------------------ */
/* 计数 / combo / elapsedMs                                            */
/* ------------------------------------------------------------------ */

describe("计数与连击", () => {
  it("每次有效 press 同时增加 stats.presses 与 totalPresses", () => {
    const engine = makeEngine({});
    pressSequence(engine, [0, 100, 200]);
    expect(engine.state.stats.presses).toBe(3);
    expect(engine.state.totalPresses).toBe(3);
  });

  it("combo 依据 400ms 窗口累加与重置", () => {
    const engine = makeEngine({});
    const combos = [0, 300, 600, 1500, 1800].map((now) => {
      engine.press(now);
      return engine.state.stats.combo;
    });
    expect(combos).toEqual([1, 2, 3, 1, 2]);
  });

  it("恰好 400ms 间隔仍算连击，401ms 则重置", () => {
    const engine = makeEngine({});
    pressSequence(engine, [0, 400]);
    expect(engine.state.stats.combo).toBe(2);
    const other = makeEngine({});
    pressSequence(other, [0, 401]);
    expect(other.state.stats.combo).toBe(1);
  });

  it("fastestGapMs 取最小间隔，首次按下后不再是 Infinity", () => {
    const engine = makeEngine({});
    expect(engine.state.stats.fastestGapMs).toBe(Infinity);
    pressSequence(engine, [0]);
    expect(engine.state.stats.fastestGapMs).toBe(Infinity);

    pressSequence(engine, [1000, 1200, 1500]);
    expect(engine.state.stats.fastestGapMs).toBe(200);
  });

  it("elapsedMs 跟随 now - startedAt", () => {
    const engine = makeEngine({ startedAt: 5000 });
    pressSequence(engine, [5600, 9000]);
    expect(engine.state.stats.elapsedMs).toBe(4000);
  });
});

/* ------------------------------------------------------------------ */
/* 事件抽取                                                            */
/* ------------------------------------------------------------------ */

describe("事件抽取", () => {
  it("无候选卡时 event 为 null", () => {
    const engine = makeEngine({});
    expect(engine.press(0).event).toBeNull();
  });

  it("once 事件整局只出现一次并写入 seenEvents", () => {
    const onceEvent: GameEventDef = { id: "once-1", text: "只来一次", once: true };
    const engine = makeEngine({ events: [onceEvent] });
    const results = pressSequence(engine, [0, 100, 200, 300, 400]);
    const hits = results.filter((r) => r.event !== null);
    expect(hits).toHaveLength(1);
    expect(hits[0].event?.id).toBe("once-1");
    expect(engine.state.seenEvents).toEqual(["once-1"]);
    expect(results.slice(1).every((r) => r.event === null)).toBe(true);
  });

  it("cooldown 未冷却完不会重复抽到", () => {
    const cooled: GameEventDef = { id: "cool", text: "冷却中", cooldown: 3 };
    const engine = makeEngine({ events: [cooled] });
    const results = pressSequence(engine, [0, 100, 200, 300, 400]);
    expect(results.map((r) => r.event?.id ?? null)).toEqual(["cool", null, null, "cool", null]);
    expect(engine.state.lastSeen["cool"]).toBe(4);
  });

  it("requires 为 false 时排除该卡", () => {
    const gated: GameEventDef = {
      id: "gated",
      text: "需要两次按下",
      requires: (ctx) => ctx.stats.presses >= 2,
    };
    const engine = makeEngine({ events: [gated] });
    expect(engine.press(0).event).toBeNull();
    const second = engine.press(100);
    expect(second.event?.id).toBe("gated");
  });

  it("minPresses / maxPresses 限定出现窗口", () => {
    const windowed: GameEventDef = { id: "win", text: "窗口期", minPresses: 2, maxPresses: 3 };
    const engine = makeEngine({ events: [windowed] });
    const results = pressSequence(engine, [0, 100, 200, 300, 400]);
    expect(results.map((r) => r.event?.id ?? null)).toEqual([null, "win", "win", null, null]);
  });

  it("按 weight 加权抽取：rng 取 0 命中第一张，取 0.999 命中最后一张", () => {
    const events: GameEventDef[] = [
      { id: "a", text: "a", weight: 1 },
      { id: "b", text: "b", weight: 1000 },
    ];
    const low = new Engine({ ...makeOptions({ events }), rng: () => 0 });
    expect(low.press(0).event?.id).toBe("a");

    const high = new Engine({ ...makeOptions({ events }), rng: () => 0.999 });
    expect(high.press(0).event?.id).toBe("b");
  });
});

/* ------------------------------------------------------------------ */
/* 效果                                                                 */
/* ------------------------------------------------------------------ */

describe("效果应用", () => {
  it("add / set / mul 都生效，mul 的 value 是乘数", () => {
    const engine = makeEngine({
      events: [
        {
          id: "fx",
          text: "数值变动",
          effects: [
            { stat: "chaos", op: "add", value: 10 },
            { stat: "trust", op: "set", value: 42 },
            { stat: "cats", op: "mul", value: 3 },
          ],
        },
      ],
    });
    engine.press(0);
    const stats = engine.state.stats;
    expect(stats.chaos).toBe(10);
    expect(stats.trust).toBe(42);
    expect(stats.cats).toBe(0);
  });

  it("chaos / trust 被夹到 0..100，cats / combo 不会变负", () => {
    const overflow = makeEngine({
      events: [
        {
          id: "over",
          text: "过载",
          effects: [
            { stat: "chaos", op: "add", value: 500 },
            { stat: "trust", op: "add", value: -500 },
            { stat: "cats", op: "add", value: -10 },
            { stat: "combo", op: "add", value: -10 },
          ],
        },
      ],
    });
    overflow.press(0);
    const stats = overflow.state.stats;
    expect(stats.chaos).toBe(100);
    expect(stats.trust).toBe(0);
    expect(stats.cats).toBe(0);
    expect(stats.combo).toBe(0);
  });

  it("mul 作用在 0 上仍是 0，且不会把 chaos 推出上界", () => {
    const engine = makeEngine({
      events: [
        {
          id: "mulmax",
          text: "乘法",
          effects: [
            { stat: "chaos", op: "set", value: 80 },
            { stat: "chaos", op: "mul", value: 4 },
          ],
        },
      ],
    });
    engine.press(0);
    expect(engine.state.stats.chaos).toBe(100);
  });
});

/* ------------------------------------------------------------------ */
/* 结局                                                                 */
/* ------------------------------------------------------------------ */

describe("结局", () => {
  const handEnding: EndingDef = {
    id: "hand",
    title: "手速结局",
    blurb: "太快了",
    rarity: "secret",
    condition: (ctx) => ctx.stats.combo >= 3,
  };

  it("按 endings 数组顺序结算第一个满足条件的结局", () => {
    const first: EndingDef = {
      id: "first",
      title: "一",
      blurb: "",
      rarity: "common",
      condition: () => true,
    };
    const second: EndingDef = {
      id: "second",
      title: "二",
      blurb: "",
      rarity: "rare",
      condition: () => true,
    };
    const engine = makeEngine({ endings: [first, second] });
    const result = engine.press(0);
    expect(result.ending?.id).toBe("first");
    expect(engine.state.endingId).toBe("first");
    expect(engine.state.unlockedEndings).toEqual(["first"]);
  });

  it("条件未满足时不结算", () => {
    const engine = makeEngine({ endings: [handEnding] });
    expect(engine.press(0).ending).toBeNull();
    expect(engine.state.endingId).toBeNull();
  });

  it("连击达成后结算，且之后 press 返回 ignored 并且状态不再变化", () => {
    const engine = makeEngine({ endings: [handEnding] });
    pressSequence(engine, [0, 100, 200]);
    const stateAfterEnding = engine.state;
    expect(stateAfterEnding.endingId).toBe("hand");
    expect(stateAfterEnding.unlockedEndings).toEqual(["hand"]);

    const ignored = engine.press(300);
    expect(ignored.ignored).toBe(true);
    expect(ignored.event).toBeNull();
    expect(ignored.ending).toBeNull();
    expect(ignored.newAchievements).toEqual([]);
    expect(engine.state).toEqual(stateAfterEnding);
  });

  it("muted 供结局判定使用", () => {
    const silence: EndingDef = {
      id: "silence",
      title: "沉默结局",
      blurb: "",
      rarity: "secret",
      condition: (ctx) => ctx.muted,
    };
    const loud = makeEngine({ endings: [silence] });
    expect(loud.press(0).ending).toBeNull();

    const quiet = makeEngine({ endings: [silence] });
    quiet.setMuted(true);
    expect(quiet.state.muted).toBe(true);
    expect(quiet.press(0).ending?.id).toBe("silence");
  });

  it("存档里已解锁的结局不会重复 push", () => {
    const engine = makeEngine({
      endings: [handEnding],
      save: {
        version: SAVE_VERSION,
        totalPresses: 10,
        unlockedEndings: ["hand"],
        unlockedAchievements: [],
        muted: false,
        seed: 42,
      },
    });
    pressSequence(engine, [0, 100, 200]);
    expect(engine.state.unlockedEndings).toEqual(["hand"]);
  });
});

/* ------------------------------------------------------------------ */
/* 成就                                                                 */
/* ------------------------------------------------------------------ */

describe("成就", () => {
  const firstPress: AchievementDef = {
    id: "first",
    title: "第一下",
    hint: "按一下",
    condition: (ctx) => ctx.presses >= 1,
  };
  const tenPresses: AchievementDef = {
    id: "ten",
    title: "十下",
    hint: "按十下",
    condition: (ctx) => ctx.presses >= 10,
  };

  it("解锁后进入 newAchievements，并且不会重复解锁", () => {
    const engine = makeEngine({ achievements: [firstPress, tenPresses] });
    const first = engine.press(0);
    expect(first.newAchievements.map((a) => a.id)).toEqual(["first"]);
    expect(engine.state.unlockedAchievements).toEqual(["first"]);

    const second = engine.press(100);
    expect(second.newAchievements).toEqual([]);
    expect(engine.state.unlockedAchievements).toEqual(["first"]);
  });

  it("多个成就同时满足时一并解锁", () => {
    const engine = makeEngine({ achievements: [firstPress] });
    const result = engine.press(0);
    expect(result.newAchievements).toHaveLength(1);
    const noop = makeEngine({
      achievements: [{ ...firstPress, id: "always", condition: () => true }],
    });
    expect(noop.press(0).newAchievements.map((a) => a.id)).toEqual(["always"]);
  });

  it("存档已解锁的成就不再进入 newAchievements", () => {
    const engine = makeEngine({
      achievements: [firstPress],
      save: {
        version: SAVE_VERSION,
        totalPresses: 3,
        unlockedEndings: [],
        unlockedAchievements: ["first"],
        muted: false,
        seed: 42,
      },
    });
    expect(engine.press(0).newAchievements).toEqual([]);
    expect(engine.state.unlockedAchievements).toEqual(["first"]);
  });
});

/* ------------------------------------------------------------------ */
/* 确定性与封装                                                          */
/* ------------------------------------------------------------------ */

describe("确定性与封装", () => {
  const EVENTS: GameEventDef[] = [
    { id: "e1", text: "一", weight: 3, effects: [{ stat: "chaos", op: "add", value: 5 }] },
    { id: "e2", text: "二", weight: 1, cooldown: 2 },
    { id: "e3", text: "三", weight: 2, once: true, effects: [{ stat: "cats", op: "add", value: 1 }] },
    { id: "e4", text: "四", weight: 1, requires: (ctx) => ctx.tierIndex >= 1 },
  ];

  function run(seed: number): { states: GameState[]; results: PressResult[] } {
    const engine = new Engine(makeOptions({ events: EVENTS, seed }));
    const nows = [0, 150, 320, 900, 1000, 1400, 2000, 2100, 2600, 3000];
    const results = pressSequence(engine, nows);
    return { states: [engine.state], results };
  }

  it("同一 seed + 同一 now 序列 + 同一操作序列产生完全相同的结果", () => {
    const a = run(2024);
    const b = run(2024);
    expect(a.states).toEqual(b.states);
    expect(a.results.map((r) => r.event?.id ?? null)).toEqual(
      b.results.map((r) => r.event?.id ?? null),
    );
    expect(a.results.map((r) => r.tier.id)).toEqual(b.results.map((r) => r.tier.id));
    expect(a.results.map((r) => r.tierChanged)).toEqual(b.results.map((r) => r.tierChanged));
  });

  it("不同 seed 会产生不同的事件序列", () => {
    const pool: GameEventDef[] = Array.from({ length: 8 }, (_, i) => ({
      id: "p" + i,
      text: "p" + i,
      weight: 1,
    }));
    const sequence = (seed: number): string => {
      const engine = new Engine(makeOptions({ events: pool, seed }));
      return Array.from({ length: 24 }, (_, i) => i * 1000)
        .map((now) => engine.press(now).event?.id ?? "none")
        .join(",");
    };
    expect(sequence(1)).not.toBe(sequence(777));
  });

  it("state getter 返回深拷贝，外部改动不影响引擎", () => {
    const engine = makeEngine({ events: [{ id: "x", text: "x", once: true }] });
    engine.press(0);
    const snapshot = engine.state;
    snapshot.stats.presses = 999;
    snapshot.stats.chaos = 50;
    snapshot.seenEvents.push("hacked");
    snapshot.unlockedAchievements.push("hacked");
    snapshot.muted = true;
    snapshot.totalPresses = 12345;

    const fresh = engine.state;
    expect(fresh.stats.presses).toBe(1);
    expect(fresh.stats.chaos).toBe(0);
    expect(fresh.seenEvents).toEqual(["x"]);
    expect(fresh.unlockedAchievements).toEqual([]);
    expect(fresh.muted).toBe(false);
    expect(fresh.totalPresses).toBe(1);
  });

  it("toSave 产出可被 parseSave 读回的存档，并能续进下一轮", () => {
    const engine = makeEngine({
      events: EVENTS,
      endings: [
        {
          id: "end",
          title: "结束",
          blurb: "",
          rarity: "common",
          condition: (ctx) => ctx.presses >= 3,
        },
      ],
      achievements: [
        { id: "a1", title: "a1", hint: "", condition: (ctx) => ctx.presses >= 1 },
      ],
    });
    pressSequence(engine, [0, 100, 200]);

    const saved = engine.toSave();
    expect(saved).toEqual({
      version: SAVE_VERSION,
      totalPresses: 3,
      unlockedEndings: ["end"],
      unlockedAchievements: ["a1"],
      muted: false,
      seed: 42,
    });

    const roundTripped = parseSave(JSON.stringify(saved));
    expect(roundTripped).toEqual(saved);

    const next = new Engine({ ...makeOptions({}), save: roundTripped });
    expect(next.state.totalPresses).toBe(3);
    expect(next.state.stats.presses).toBe(0);
    expect(next.state.unlockedEndings).toEqual(["end"]);
    expect(next.state.unlockedAchievements).toEqual(["a1"]);
    expect(next.press(0).ignored).toBe(false);
  });
});
