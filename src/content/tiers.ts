import type { TierDef } from "../engine/types";

/** 五档升级：文案从礼貌，到官僚，到崩溃，到宇宙，到无话可说。 */
export const TIERS: TierDef[] = [
  {
    id: "tier-calm",
    name: "第一档 · 礼貌劝阻",
    minPresses: 0,
    headline: "请勿按下此按钮。",
    subline: "本提示已通过 0 项安全认证，请放心阅读。",
    noise: 0,
  },
  {
    id: "tier-paper",
    name: "第二档 · 流程介入",
    minPresses: 10,
    headline: "你已进入流程。流程不保证有出口。",
    subline: "相关表格正在打印，打印机正在卡纸。",
    noise: 1,
  },
  {
    id: "tier-panic",
    name: "第三档 · 部门震动",
    minPresses: 25,
    headline: "公司正在开会讨论你。会议没有议题。",
    subline: "请保持原位，不要离开，也不要解释。",
    noise: 2,
  },
  {
    id: "tier-cosmic",
    name: "第四档 · 宇宙结算",
    minPresses: 50,
    headline: "本按钮已进入宇宙的固定资产清单。",
    subline: "折旧方式：按你。",
    noise: 3,
  },
  {
    id: "tier-void",
    name: "第五档 · 无话可说",
    minPresses: 100,
    headline: "已无可用文案。以上为系统自动生成的沉默。",
    subline: "沉默同样计入工时，且不予结算。",
    noise: 3,
  },
];
