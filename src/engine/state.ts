/**
 * 状态构造与数值夹取。纯函数，无副作用，不触碰 DOM。
 */
import type { GameState, SaveData, Stats } from "./types";

/** 本轮初始数值：信任满值、其余归零，最快间隔未记录为 Infinity。 */
export function initialStats(): Stats {
  return {
    presses: 0,
    chaos: 0,
    trust: 100,
    cats: 0,
    coins: 0,
    combo: 0,
    fastestGapMs: Infinity,
    elapsedMs: 0,
  };
}

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function clampRange(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * 夹取数值到合法范围：
 * chaos / trust -> 0..100；presses / cats / combo -> 非负整数；其余非负。
 * NaN / ±Infinity 一律收敛为安全值（fastestGapMs 的 Infinity 是合法哨兵值）。
 */
export function clampStats(s: Stats): Stats {
  const fastestGapMs = s.fastestGapMs === Infinity ? Infinity : Math.max(0, finiteOr(s.fastestGapMs, Infinity));
  return {
    presses: Math.max(0, Math.round(finiteOr(s.presses, 0))),
    chaos: clampRange(finiteOr(s.chaos, 0), 0, 100),
    trust: clampRange(finiteOr(s.trust, 0), 0, 100),
    cats: Math.max(0, Math.round(finiteOr(s.cats, 0))),
    coins: finiteOr(s.coins, 0),
    combo: Math.max(0, Math.round(finiteOr(s.combo, 0))),
    fastestGapMs,
    elapsedMs: Math.max(0, finiteOr(s.elapsedMs, 0)),
  };
}

/**
 * 构造一局的初始状态。
 * 传入存档时只恢复跨轮持久字段（totalPresses / unlockedEndings /
 * unlockedAchievements / muted），stats.presses 从 0 重新计数。
 */
export function createState(seed: number, startedAt: number, save?: SaveData | null): GameState {
  const fresh: GameState = {
    seed,
    stats: initialStats(),
    tierIndex: 0,
    startedAt,
    seenEvents: [],
    lastSeen: {},
    endingId: null,
    unlockedAchievements: [],
    totalPresses: 0,
    unlockedEndings: [],
    muted: false,
  };

  if (!save) return fresh;

  return {
    ...fresh,
    totalPresses: save.totalPresses,
    unlockedEndings: [...save.unlockedEndings],
    unlockedAchievements: [...save.unlockedAchievements],
    muted: save.muted,
  };
}
