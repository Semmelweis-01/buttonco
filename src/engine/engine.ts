/**
 * BUTTONCO 引擎核心。纯类：不触碰 DOM、不读时钟、不用 Math.random。
 * 所有随机性来自注入的 Rng，所有时间来自参数。
 */
import { clampStats, createState } from "./state";
import { serializeSave } from "./save";
import type {
  AchievementDef,
  Effect,
  EndingContext,
  EndingDef,
  EventContext,
  GameEventDef,
  GameState,
  PressResult,
  Rng,
  SaveData,
  Stats,
  TierDef,
} from "./types";

/** 两次按下间隔 <= 该值即视为连击。 */
const COMBO_WINDOW_MS = 400;

export interface EngineOptions {
  seed: number;
  startedAt: number;
  rng: Rng;
  events: GameEventDef[];
  tiers: TierDef[];
  endings: EndingDef[];
  achievements: AchievementDef[];
  save?: SaveData | null;
}

/** 深拷贝一份状态，保证外部改动不影响引擎内部。 */
function cloneState(s: GameState): GameState {
  return {
    seed: s.seed,
    stats: { ...s.stats },
    tierIndex: s.tierIndex,
    startedAt: s.startedAt,
    seenEvents: [...s.seenEvents],
    lastSeen: { ...s.lastSeen },
    endingId: s.endingId,
    unlockedAchievements: [...s.unlockedAchievements],
    totalPresses: s.totalPresses,
    unlockedEndings: [...s.unlockedEndings],
    muted: s.muted,
  };
}

/** 按 minPresses 升序排列档位（不改动调用方数组）。 */
function sortTiers(tiers: TierDef[]): TierDef[] {
  return [...tiers].sort((a, b) => a.minPresses - b.minPresses);
}

export class Engine {
  private readonly rng: Rng;
  private readonly events: GameEventDef[];
  private readonly tiers: TierDef[];
  private readonly endings: EndingDef[];
  private readonly achievements: AchievementDef[];
  private readonly current: GameState;
  /** 上一次按下的时间戳；null 表示本轮还没按过。 */
  private lastPressAt: number | null = null;

  constructor(opts: EngineOptions) {
    this.rng = opts.rng;
    this.events = [...opts.events];
    this.tiers = sortTiers(opts.tiers);
    this.endings = [...opts.endings];
    this.achievements = [...opts.achievements];
    this.current = createState(opts.seed, opts.startedAt, opts.save ?? null);
    this.current.tierIndex = this.resolveTierIndex(this.current.stats.presses);
  }

  /** 当前状态的深拷贝。 */
  get state(): GameState {
    return cloneState(this.current);
  }

  /** 当前档位定义。 */
  get tier(): TierDef {
    return this.tiers[this.current.tierIndex];
  }

  /** 当前档位下标（0 起）。 */
  get tierIndex(): number {
    return this.current.tierIndex;
  }

  setMuted(muted: boolean): void {
    this.current.muted = muted;
  }

  toSave(): SaveData {
    return serializeSave(this.current);
  }

  press(now: number): PressResult {
    const previousTierIndex = this.current.tierIndex;

    // 结局已结算：按钮已死，不改变任何数值/计数。
    if (this.current.endingId !== null) {
      return {
        event: null,
        tier: this.tier,
        tierChanged: false,
        ending: null,
        newAchievements: [],
        ignored: true,
      };
    }

    const gap = this.lastPressAt === null ? null : now - this.lastPressAt;
    this.lastPressAt = now;

    const stats = this.current.stats;
    stats.presses += 1;
    this.current.totalPresses += 1;
    stats.elapsedMs = Math.max(0, now - this.current.startedAt);

    // 连击：与上次按下间隔 <= 400ms 则累加，否则归 1。
    stats.combo = gap !== null && gap >= 0 && gap <= COMBO_WINDOW_MS ? stats.combo + 1 : 1;
    if (gap !== null && gap >= 0) {
      stats.fastestGapMs = stats.fastestGapMs === Infinity ? gap : Math.min(stats.fastestGapMs, gap);
    }

    this.current.tierIndex = this.resolveTierIndex(stats.presses);

    // 1) 抽卡 + 应用效果
    const event = this.drawEvent(now);
    if (event) {
      this.recordSeen(event);
      this.applyEffects(event.effects);
    }
    this.current.stats = clampStats(stats);

    // 2) 结局：数组顺序，第一个满足且未结算的
    let ending: EndingDef | null = null;
    if (this.current.endingId === null) {
      const ctx = this.endingContext();
      const found = this.endings.find((candidate) => candidate.condition(ctx));
      if (found) {
        ending = found;
        this.current.endingId = found.id;
        if (!this.current.unlockedEndings.includes(found.id)) {
          this.current.unlockedEndings.push(found.id);
        }
      }
    }

    // 3) 成就：遍历全部，去重解锁
    const newAchievements: AchievementDef[] = [];
    const achCtx = this.endingContext();
    for (const achievement of this.achievements) {
      if (this.current.unlockedAchievements.includes(achievement.id)) continue;
      if (!achievement.condition(achCtx)) continue;
      this.current.unlockedAchievements.push(achievement.id);
      newAchievements.push(achievement);
    }

    return {
      event,
      tier: this.tier,
      tierChanged: this.current.tierIndex !== previousTierIndex,
      ending,
      newAchievements,
      ignored: false,
    };
  }

  /** 满足 presses >= minPresses 的最大下标；无匹配时取 0。 */
  private resolveTierIndex(presses: number): number {
    let index = 0;
    for (let i = 0; i < this.tiers.length; i += 1) {
      if (presses >= this.tiers[i].minPresses) index = i;
    }
    return index;
  }

  private eventContext(now: number): EventContext {
    return {
      stats: this.current.stats,
      tierIndex: this.current.tierIndex,
      now,
      startedAt: this.current.startedAt,
    };
  }

  private endingContext(): EndingContext {
    const stats = this.current.stats;
    return {
      stats,
      tierIndex: this.current.tierIndex,
      presses: stats.presses,
      elapsedMs: stats.elapsedMs,
      muted: this.current.muted,
    };
  }

  /** 过滤候选卡，按 weight 加权随机抽一张；无可抽卡 -> null。 */
  private drawEvent(now: number): GameEventDef | null {
    const presses = this.current.stats.presses;
    const ctx = this.eventContext(now);

    const candidates = this.events.filter((def) => {
      if (def.minPresses !== undefined && presses < def.minPresses) return false;
      if (def.maxPresses !== undefined && presses > def.maxPresses) return false;
      if (def.once === true && this.current.seenEvents.includes(def.id)) return false;

      const cooldown = def.cooldown ?? 0;
      if (cooldown > 0) {
        const last = this.current.lastSeen[def.id];
        if (last !== undefined && presses - last < cooldown) return false;
      }

      if (def.requires && !def.requires(ctx)) return false;
      return true;
    });

    if (candidates.length === 0) return null;

    const weights = candidates.map((def) => {
      const w = def.weight ?? 1;
      return Number.isFinite(w) && w > 0 ? w : 0;
    });
    const total = weights.reduce((sum, w) => sum + w, 0);
    if (total <= 0) return null;

    let roll = this.rng() * total;
    for (let i = 0; i < candidates.length; i += 1) {
      roll -= weights[i];
      if (roll < 0) return candidates[i];
    }
    return candidates[candidates.length - 1];
  }

  private recordSeen(def: GameEventDef): void {
    this.current.lastSeen[def.id] = this.current.stats.presses;
    if (def.once === true && !this.current.seenEvents.includes(def.id)) {
      this.current.seenEvents.push(def.id);
    }
  }

  private applyEffects(effects: Effect[] | undefined): void {
    if (!effects || effects.length === 0) return;
    const stats: Stats = this.current.stats;
    for (const effect of effects) {
      if (!Number.isFinite(effect.value)) continue;
      const current = stats[effect.stat];
      stats[effect.stat] =
        effect.op === "add"
          ? current + effect.value
          : effect.op === "mul"
            ? current * effect.value
            : effect.value;
    }
  }
}
