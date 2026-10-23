import type { AchievementDef } from "../engine/types";

/** 成就墙。一半明示、一半 secret；hint 要让未解锁的人想做那件蠢事。 */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "ach-first",
    title: "开始了",
    hint: "按钮就在那里。它不会自己按自己。",
    condition: (ctx) => ctx.presses >= 1,
  },
  {
    id: "ach-ten",
    title: "熟练工",
    hint: "十次之后，你的手指会被登记为工具。",
    condition: (ctx) => ctx.presses >= 10,
  },
  {
    id: "ach-combo5",
    title: "连击入门",
    hint: "五下之间不要呼吸，公司会以为你在加班。",
    condition: (ctx) => ctx.stats.combo >= 5,
  },
  {
    id: "ach-cat1",
    title: "第一位同事",
    hint: "按到有猫为止。猫的入职流程比你的短。",
    condition: (ctx) => ctx.stats.cats >= 1,
  },
  {
    id: "ach-broke",
    title: "赤字",
    hint: "把公司账户按成负数。财务部会为你鼓掌，然后记账。",
    condition: (ctx) => ctx.stats.coins < 0,
  },
  {
    id: "ach-chaos80",
    title: "混乱部长",
    hint: "混乱度八十。此时你的岗位说明书会自动作废。",
    condition: (ctx) => ctx.stats.chaos >= 80,
  },
  {
    id: "ach-loyal50",
    title: "长期主义",
    hint: "五十次。公司会认为这是你对岗位的忠诚，而不是别的东西。",
    condition: (ctx) => ctx.presses >= 50,
  },
  {
    id: "ach-combo15",
    title: "不该有的速度",
    hint: "十五连击。人类的手不该这样，但没人会阻止你。",
    secret: true,
    condition: (ctx) => ctx.stats.combo >= 15,
  },
  {
    id: "ach-cat10",
    title: "猫的单位",
    hint: "猫的数量足以被称为一个部门时，税务局会先到。",
    secret: true,
    condition: (ctx) => ctx.stats.cats >= 10,
  },
  {
    id: "ach-debt",
    title: "深度赤字",
    hint: "欠到五千以上。银行会改用一种更温柔的语气。",
    secret: true,
    condition: (ctx) => ctx.stats.coins < -5000,
  },
  {
    id: "ach-muted",
    title: "静音的人",
    hint: "关掉声音再按。世界安静了，事情没有。",
    secret: true,
    condition: (ctx) => ctx.muted,
  },
  {
    id: "ach-fast",
    title: "两百毫秒",
    hint: "两次按下之间的间隔小于两百毫秒。请勿在饮水机旁尝试。",
    secret: true,
    condition: (ctx) => ctx.stats.fastestGapMs < 200,
  },
  {
    id: "ach-slow",
    title: "两分钟",
    hint: "在同一轮里待满两分钟。这比听起来难，也比听起来没意义。",
    secret: true,
    condition: (ctx) => ctx.elapsedMs >= 120000,
  },
  {
    id: "ach-trust0",
    title: "零信任",
    hint: "把信任度按到零。不是架构方案，是字面意思。",
    secret: true,
    condition: (ctx) => ctx.stats.trust <= 0,
  },
];
