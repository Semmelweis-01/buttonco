import type { EndingDef } from "../engine/types";

/**
 * 结局池。condition 必须是纯函数、无副作用、对任意 stats 安全求值。
 *
 * 顺序即优先级：引擎按数组顺序取第一个满足的结局，所以这里刻意按
 * 「secret -> 玩家行为极端 -> 数值极端 -> 常规」排列。三条硬规则：
 *
 * 1. 除「沉默 / 手速 / 加班」这类由玩家行为主动触发的以外，任何结局都必须
 *    要求 presses >= 100。否则正常节奏（约 580ms 一次）的玩家会在第 20 下
 *    就被强制结算，看不到后面的档位、卡池与成就。
 * 2. 排在前面的条件必须比后面的更苛刻，否则高优先级结局会抢走低优先级戏份。
 * 3. 每个条件都要区分不同的玩家画像（狂点 / 静音 / 发呆 / 稳定连击 / 猫满 /
 *    破产 / 信任崩），否则 40 个 seed 会全部收敛到同一个结局。
 */
export const ENDINGS: EndingDef[] = [
  {
    id: "ending-zero",
    title: "归零",
    blurb: "信任归零，混乱封顶，账户见底。系统向你点头。",
    rarity: "secret",
    condition: (ctx) =>
      ctx.presses >= 100 &&
      ctx.stats.trust === 0 &&
      ctx.stats.chaos >= 100 &&
      ctx.stats.coins < -5000,
  },
  {
    id: "ending-speedrun",
    title: "手速事故",
    blurb: "平均两百毫秒一次，连按三十下。你被判定为灾害。",
    rarity: "rare",
    condition: (ctx) => ctx.presses >= 30 && ctx.elapsedMs / Math.max(1, ctx.presses) <= 220,
  },
  {
    id: "ending-silent",
    title: "沉默",
    blurb: "你关掉了声音。世界只剩你和你按的东西。",
    rarity: "rare",
    condition: (ctx) => ctx.muted && ctx.presses >= 45,
  },
  {
    id: "ending-overtime",
    title: "加班",
    blurb: "五分钟过去了。公司认为这说明你很有热情。",
    rarity: "rare",
    condition: (ctx) => ctx.elapsedMs >= 300000 && ctx.presses >= 50,
  },
  {
    id: "ending-combo",
    title: "连击",
    blurb: "你按得又稳又密。系统认定你在做绩效冲刺。",
    rarity: "rare",
    condition: (ctx) => ctx.presses >= 100 && ctx.stats.combo >= 20,
  },
  {
    id: "ending-cats",
    title: "猫的胜利",
    blurb: "猫接管了公司，第一项决策是取消按钮。",
    rarity: "rare",
    condition: (ctx) => ctx.presses >= 100 && ctx.stats.cats >= 38,
  },
  {
    id: "ending-broke",
    title: "破产",
    blurb: "公司账户余额成功进入另一个维度。",
    rarity: "rare",
    condition: (ctx) => ctx.presses >= 100 && ctx.stats.coins < -6000,
  },
  {
    id: "ending-abyss",
    title: "深渊",
    blurb: "混乱封顶，信任见底。你和公司都很平静。",
    rarity: "rare",
    condition: (ctx) => ctx.presses >= 100 && ctx.stats.chaos >= 100 && ctx.stats.trust <= 5,
  },
  {
    id: "ending-lucky",
    title: "吉利",
    blurb: "八十八次，信任还在。前台说这数字吉利。",
    rarity: "common",
    condition: (ctx) => (ctx.presses === 88 || ctx.stats.presses === 88) && ctx.stats.trust >= 44,
  },
  {
    id: "ending-loyal",
    title: "忠诚",
    blurb: "一百次。公司决定把这条写进你的鉴定。",
    rarity: "common",
    condition: (ctx) => ctx.presses >= 100,
  },
];
