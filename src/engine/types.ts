/**
 * BUTTONCO — 共享类型契约（协调者定稿）。
 * 引擎层与内容层都只依赖本文件；双方不得修改本文件。
 */

/** 返回 [0,1) 的确定性随机数生成器。 */
export type Rng = () => number;

/** 全局可被事件卡影响的数值。全部为整数或浮点，由引擎负责夹取范围。 */
export interface Stats {
  /** 按钮被按下的总次数。永真递增，不可撤销。 */
  presses: number;
  /** 混乱度 0..100。 */
  chaos: number;
  /** 公司对你的信任度 0..100，只会往下掉。 */
  trust: number;
  /** 猫的数量 0..∞。 */
  cats: number;
  /** 公司账户余额，单位：元。可以是负数，并且很喜欢变成负数。 */
  coins: number;
  /** 连击数：连续快速点击的次数。 */
  combo: number;
  /** 历史最快两次点击间隔，毫秒。未记录时为 Infinity。 */
  fastestGapMs: number;
  /** 本轮已存活时长，毫秒。 */
  elapsedMs: number;
}

export type StatKey = keyof Stats;

export interface Effect {
  stat: StatKey;
  op: "add" | "set" | "mul";
  value: number;
}

/** 事件卡求值时可见的上下文。 */
export interface EventContext {
  stats: Readonly<Stats>;
  /** 当前档位下标（0 起）。 */
  tierIndex: number;
  /** 本次按下的时间戳（毫秒）。 */
  now: number;
  /** 自本轮开始到本次按下的时间戳。 */
  startedAt: number;
}

export interface GameEventDef {
  /** 全局唯一 id。 */
  id: string;
  /** 主文案（冷面官方腔）。 */
  text: string;
  /** 小字注脚 / 免责声明。 */
  sub?: string;
  /** 出现的最小按下次数（含）。默认 0。 */
  minPresses?: number;
  /** 出现的最大按下次数（含）。默认无限。 */
  maxPresses?: number;
  /** 整局只出现一次。 */
  once?: boolean;
  /** 抽取权重，默认 1，必须 > 0。 */
  weight?: number;
  /** 冷却：出现后至少间隔多少次按下才可能再次出现。默认 0。 */
  cooldown?: number;
  /** 额外的可出现条件。必须为纯函数。 */
  requires?: (ctx: EventContext) => boolean;
  /** 对数值的影响。 */
  effects?: Effect[];
  /** 调性，供 UI 选择视觉/音效强度。 */
  tone?: "calm" | "weird" | "panic" | "cosmic";
}

export interface TierDef {
  id: string;
  name: string;
  /** 该档起始的按下次数（含）。 */
  minPresses: number;
  /** 顶部状态栏文案。 */
  headline: string;
  /** 顶部状态栏副文案。 */
  subline: string;
  /** 视觉噪声强度 0..3。 */
  noise: number;
}

/** 结局判定上下文。 */
export interface EndingContext {
  stats: Readonly<Stats>;
  tierIndex: number;
  /** 已按下次数。 */
  presses: number;
  /** 本轮总时长，毫秒。 */
  elapsedMs: number;
  /** 玩家是否把声音关了。 */
  muted: boolean;
}

export interface EndingDef {
  id: string;
  title: string;
  blurb: string;
  /** 结局分级，供成就墙展示。 */
  rarity: "common" | "rare" | "secret";
  /** 是否允许在任意一次按下后立刻结算。必须为纯函数。 */
  condition: (ctx: EndingContext) => boolean;
}

export interface AchievementDef {
  id: string;
  title: string;
  /** 解锁提示（未解锁时展示）。 */
  hint: string;
  /** 隐藏成就：未解锁时只显示 ???。 */
  secret?: boolean;
  condition: (ctx: EndingContext) => boolean;
}

/** 引擎状态（只读快照）。 */
export interface GameState {
  seed: number;
  stats: Stats;
  tierIndex: number;
  /** 本轮开始时间戳。 */
  startedAt: number;
  /** 已出现过的 once 事件 id。 */
  seenEvents: string[];
  /** 事件 id -> 上次出现的按下次数。 */
  lastSeen: Record<string, number>;
  /** 本轮结算的结局 id，未结算为 null。 */
  endingId: string | null;
  /** 已解锁成就 id（本轮 + 历史合并）。 */
  unlockedAchievements: string[];
  /** 历史累计按下次数（跨轮）。 */
  totalPresses: number;
  /** 历史已解锁结局。 */
  unlockedEndings: string[];
  muted: boolean;
}

export interface PressResult {
  /** 本次触发的事件卡；没有可抽的卡时为 null。 */
  event: GameEventDef | null;
  /** 按下之后所处的档位。 */
  tier: TierDef;
  /** 是否在本档发生了档位跃迁。 */
  tierChanged: boolean;
  /** 本次结算出的结局；未结算为 null。 */
  ending: EndingDef | null;
  /** 本次新解锁的成就。 */
  newAchievements: AchievementDef[];
  /** 是否因为结局已结算而忽略本次按下（真结局之后按钮已死）。 */
  ignored: boolean;
}

/** 持久化存档。坏档必须被安全丢弃。 */
export interface SaveData {
  version: 1;
  totalPresses: number;
  unlockedEndings: string[];
  unlockedAchievements: string[];
  muted: boolean;
  /** 上一次使用的 seed，用于"继续上一次的荒诞"。 */
  seed: number;
}
