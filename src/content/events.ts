import type { GameEventDef } from "../engine/types";

/**
 * 事件卡池。冷面公文腔 + 精确到荒谬的细节。
 * 只导出数据：无 Math.random、无 Date.now、无引擎依赖。
 */
export const EVENTS: GameEventDef[] = [
  // ── 开场高频卡（minPresses 0，weight 2）─────────────────────────────
  {
    id: "open-consent",
    text: "系统已收到你的第一次确认，并同步给了三个不该知道的人。",
    sub: "本按钮已通过 0 项安全认证。",
    minPresses: 0,
    maxPresses: 6,
    weight: 2,
    tone: "calm",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },
  {
    id: "open-hand",
    text: "按住不放不能撤销已发生的事，只能撤销你的手。",
    sub: "免责声明：手是您的，后果是本司的资产。",
    minPresses: 0,
    maxPresses: 6,
    weight: 2,
    tone: "calm",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },
  {
    id: "open-red",
    text: "本按钮的红色取自一种非常昂贵的犹豫，不退不换。",
    sub: "颜色已计入固定资产折旧。",
    minPresses: 0,
    maxPresses: 6,
    weight: 2,
    tone: "calm",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "coins", op: "add", value: -30 },
    ],
  },
  {
    id: "open-warranty",
    text: "温馨提示：按钮不存在“按坏”的可能。",
    sub: "只存在“按了之后你要负责”的可能。",
    minPresses: 0,
    maxPresses: 6,
    weight: 2,
    tone: "calm",
    effects: [{ stat: "chaos", op: "add", value: 1 }],
  },
  {
    id: "open-archive",
    text: "本次按下已记录、已上报、已归档，并且已无处可退。",
    sub: "归档编号以你的工号开头。",
    minPresses: 0,
    maxPresses: 6,
    weight: 2,
    tone: "calm",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -2 },
    ],
  },
  {
    id: "open-payroll",
    text: "财务部已将你的名字从工资表移到备注栏。",
    sub: "备注栏不参与年度调薪。",
    minPresses: 0,
    maxPresses: 6,
    weight: 2,
    tone: "calm",
    effects: [
      { stat: "coins", op: "add", value: -110 },
      { stat: "trust", op: "add", value: -3 },
    ],
  },

  // ── 官僚与流程 ────────────────────────────────────────────────
  {
    id: "memo-form",
    text: "本次按下需要一张纸质表格，但打印机只吃复印件。",
    sub: "复印件请到三楼复印，三楼已撤销。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "coins", op: "add", value: -40 },
    ],
  },
  {
    id: "memo-stamp",
    text: "审批通过：你的申请被盖了七个章，其中六个是同一个。",
    sub: "第七个章是圆形的，含义不明。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },
  {
    id: "memo-meeting",
    text: "会议室里有人在讨论这个按钮，会议已进行到第四小时。",
    sub: "议题一：按钮是什么颜色。",
    cooldown: 10,
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "coins", op: "add", value: -60 },
    ],
  },
  {
    id: "memo-kpi",
    text: "你的 KPI 已更新：本月目标是不按按钮。",
    sub: "当前进度：负数。",
    tone: "weird",
    effects: [
      { stat: "trust", op: "add", value: -3 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "memo-annual",
    text: "年会抽奖结果公布：一等奖是继续留在这里工作。",
    sub: "二等奖是二等奖。",
    tone: "weird",
    effects: [
      { stat: "trust", op: "add", value: -4 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "memo-hr",
    text: "人事系统已将你的岗位调整为“按钮相关”。",
    sub: "该岗位不设编制，也不设椅子。",
    tone: "weird",
    effects: [
      { stat: "trust", op: "add", value: -3 },
      { stat: "coins", op: "add", value: -80 },
    ],
  },

  // ── 客服机器人与热线 ──────────────────────────────────────────
  {
    id: "svc-ticket",
    text: "客服已受理你的工单，编号是你刚才的按键时长。",
    sub: "预计回复时间：在你放弃之后。",
    tone: "weird",
    effects: [{ stat: "chaos", op: "add", value: 1 }],
  },
  {
    id: "svc-bot",
    text: "客服机器人表示理解你的心情，并表示它没有心情。",
    sub: "如需转人工，请先证明你是人工。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },
  {
    id: "svc-hold",
    text: "请稍候，你的来电对我们很重要。已等候时间：三小时。",
    sub: "音乐将循环，直到你放弃或睡着。",
    cooldown: 15,
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "coins", op: "add", value: -20 },
    ],
  },
  {
    id: "svc-phone",
    text: "客服热线在你挂断之后依然在说话，声音很耐心。",
    sub: "它正在向一个空号解释你的问题。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -2 },
    ],
  },

  // ── 猫 ────────────────────────────────────────────────────────
  {
    id: "cat-desk",
    text: "一只猫出现在工位上。它不归任何部门管。",
    sub: "人事部正在查它是怎么入职的。",
    cooldown: 8,
    tone: "weird",
    effects: [
      { stat: "cats", op: "add", value: 2 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "cat-review",
    text: "猫已通过本季度的绩效考核，理由是不参与。",
    sub: "评语：稳定地不参与。",
    cooldown: 8,
    tone: "weird",
    effects: [
      { stat: "cats", op: "add", value: 2 },
      { stat: "trust", op: "add", value: -2 },
    ],
  },
  {
    id: "cat-meeting",
    text: "保洁部报告：会议室已被猫征用，改为晒太阳场所。",
    sub: "会议改到走廊，走廊也有猫。",
    cooldown: 8,
    tone: "weird",
    effects: [
      { stat: "cats", op: "add", value: 4 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "cat-badge",
    text: "猫把你的工牌叼走了。人事部认为这算离职。",
    sub: "离职手续由猫代办，猫已下班。",
    cooldown: 10,
    tone: "weird",
    effects: [
      { stat: "cats", op: "add", value: 2 },
      { stat: "trust", op: "add", value: -4 },
      { stat: "coins", op: "add", value: -160 },
    ],
  },

  // ── 税务与财务 ────────────────────────────────────────────────
  {
    id: "tax-cat",
    text: "税务局来函：猫属于固定资产，请补缴三个月的猫税。",
    sub: "猫税以猫为单位计价。",
    cooldown: 20,
    tone: "weird",
    effects: [
      { stat: "cats", op: "add", value: 2 },
      { stat: "coins", op: "add", value: -440 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "tax-fun",
    text: "本按钮已被认定为娱乐支出，不可税前扣除。",
    sub: "娱乐的定义由本司单独解释。",
    tone: "weird",
    effects: [
      { stat: "coins", op: "add", value: -270 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "tax-invoice",
    text: "发票已开具，抬头是“宇宙”，税号一栏写着“暂缺”。",
    sub: "财务说这合规，只是不太合规。",
    tone: "weird",
    effects: [
      { stat: "coins", op: "add", value: -140 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },

  // ── 法务与免责声明 ────────────────────────────────────────────
  {
    id: "legal-read",
    text: "法务部已审阅本条文案，并删除了其中所有能看懂的部分。",
    sub: "剩下的是“的”“了”和三个逗号。",
    tone: "weird",
    effects: [{ stat: "chaos", op: "add", value: 1 }],
  },
  {
    id: "legal-void",
    text: "WARRANTY VOID. 本按钮的保修在你读到这句话时已失效。",
    sub: "失效时间戳：现在。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },
  {
    id: "legal-terms",
    text: "继续按下即视为你已阅读并同意一份尚未起草的协议。",
    sub: "协议起草人已离职，且不打算回来。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -2 },
    ],
  },
  {
    id: "legal-liability",
    text: "本司对你按下按钮产生的任何后果不承担任何后果。",
    sub: "这句话本身也没有后果。",
    tone: "weird",
    effects: [{ stat: "chaos", op: "add", value: 1 }],
  },

  // ── 哲学系毕业生 ──────────────────────────────────────────────
  {
    id: "phi-exist",
    text: "哲学系毕业生问你：这个按钮存在吗，还是你只是在按自己。",
    sub: "他目前在客服部实习。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },
  {
    id: "phi-script",
    text: "哲学系毕业生入职客服部，他的第一句是“什么是问题”。",
    sub: "工单系统已为他单独建了一个分类。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "coins", op: "add", value: -70 },
    ],
  },
  {
    id: "phi-hallway",
    text: "有人在走廊上论证按钮的自由意志，随后被保安请了出去。",
    sub: "保安的论证更短，也更有效。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },

  // ── 被滥用的量子力学 ──────────────────────────────────────────
  {
    id: "qm-other",
    text: "在另一个宇宙里你没有按。那个宇宙正在礼貌地嘲笑你。",
    sub: "笑声经量子隧穿抵达本宇宙，略有延迟。",
    tone: "cosmic",
    effects: [{ stat: "chaos", op: "add", value: 2 }],
  },
  {
    id: "qm-observe",
    text: "本按钮同时处于已按和没按之间，直到财务部来观测。",
    sub: "观测结果是：成本。",
    tone: "cosmic",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "coins", op: "add", value: -110 },
    ],
  },
  {
    id: "qm-collapse",
    text: "量子态已坍缩，坍缩方向由本季度预算决定。",
    sub: "预算不足，坍缩得比较敷衍。",
    tone: "cosmic",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "coins", op: "add", value: -60 },
    ],
  },

  // ── 宇宙尽头 ──────────────────────────────────────────────────
  {
    id: "cos-store",
    text: "宇宙尽头是一家便利店，店员问你有没有会员卡。",
    sub: "会员卡在本宇宙不通用。",
    tone: "cosmic",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "coins", op: "add", value: -10 },
    ],
  },
  {
    id: "cos-id",
    text: "本按钮的编号在宇宙尺度上属于“很小”，但已经算大了。",
    sub: "编号已登记进星图，星图正在扩容。",
    tone: "cosmic",
    effects: [{ stat: "chaos", op: "add", value: 1 }],
  },
  {
    id: "cos-map",
    text: "星图显示：你所在的位置已被标记为“有人按过”。",
    sub: "该标记不可删除，也不可撤销。",
    tone: "cosmic",
    effects: [{ stat: "chaos", op: "add", value: 2 }],
  },

  // ── 火腿三明治与食堂 ──────────────────────────────────────────
  {
    id: "food-sandwich",
    text: "食堂今日供应火腿三明治，火腿是概念上的火腿。",
    sub: "概念由食堂负责解释，解释已售完。",
    tone: "weird",
    effects: [
      { stat: "coins", op: "add", value: -20 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "food-vendor",
    text: "自动售货机吐出一份火腿三明治和一张收据，收据写着对不起。",
    sub: "三明治是本事件的唯一受益方。",
    tone: "weird",
    effects: [
      { stat: "coins", op: "add", value: -30 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "food-soup",
    text: "食堂的汤今天的味道是“行政”。",
    sub: "行政味来自一份未通过审批的配方。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },

  // ── 打印机 ────────────────────────────────────────────────────
  {
    id: "print-jam",
    text: "打印机卡纸了，卡住的是你的按下记录。",
    sub: "维修人员说纸里有字，但字在反对。",
    cooldown: 12,
    tone: "weird",
    effects: [{ stat: "chaos", op: "add", value: 1 }],
  },
  {
    id: "print-night",
    text: "打印机在凌晨三点自行打印了一页，内容是“别按”。",
    sub: "它没有署名，但语气很像法务。",
    cooldown: 20,
    tone: "panic",
    effects: [{ stat: "chaos", op: "add", value: 1 }],
  },

  // ── 招聘 JD ──────────────────────────────────────────────────
  {
    id: "hr-jd",
    text: "招聘：按钮操作员，要求三年以上按钮操作经验。",
    sub: "应届生亦可，须自带按钮。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "coins", op: "add", value: -40 },
    ],
  },
  {
    id: "hr-jd2",
    text: "岗位描述新增一条：需能承受同事的注视。",
    sub: "注视不算加班，也不可报销。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },

  // ── 办公室日常 ────────────────────────────────────────────────
  {
    id: "ops-clock",
    text: "打卡机记录你已连续工作四十七小时，其中四十六小时在按。",
    sub: "剩下的一小时用于打卡。",
    tone: "weird",
    effects: [
      { stat: "coins", op: "add", value: -220 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "ops-audit",
    text: "审计发现：本部门唯一的产出是按下次数的增长。",
    sub: "审计建议把增长也算作产出。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -2 },
    ],
  },
  {
    id: "ops-insure",
    text: "公司为你购买了保险，受益人是按钮。",
    sub: "保单第七页写着“我们也是没办法”。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },
  {
    id: "ops-pension",
    text: "你的养老金已被转换为按下次数的期货。",
    sub: "目前价格为负，且流动性良好。",
    tone: "weird",
    effects: [
      { stat: "coins", op: "add", value: -330 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "ops-promo",
    text: "恭喜晋升：你现在负责按钮的对外沟通。",
    sub: "对外沟通的方式是按下它。",
    tone: "weird",
    effects: [
      { stat: "trust", op: "add", value: -2 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "ops-chat",
    text: "群聊里有人 @ 你，内容是“刚才那下是你按的吗”。",
    sub: "你还没回，他已把截图发给法务。",
    tone: "weird",
    effects: [
      { stat: "trust", op: "add", value: -3 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "ops-exit",
    text: "离职流程已启动，离职原因是“与按钮存在分歧”。",
    sub: "分歧的具体内容写在了附件里，附件丢了。",
    tone: "panic",
    effects: [
      { stat: "trust", op: "add", value: -5 },
      { stat: "coins", op: "add", value: -110 },
    ],
  },
  {
    id: "ops-fire",
    text: "消防演习开始。请有序地继续按按钮。",
    sub: "疏散路线经过按钮，请勿停留。",
    tone: "panic",
    effects: [{ stat: "chaos", op: "add", value: 1 }],
  },
  {
    id: "ops-lift",
    text: "电梯里贴了新通知：本楼层的按钮已被列为危险品。",
    sub: "危险品需两名员工同时在场才能按。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },
  {
    id: "ops-hall",
    text: "走廊尽头传来一声叹气，来源不明，已计入本月成本。",
    sub: "叹气按次计费，本月已超额。",
    cooldown: 18,
    tone: "weird",
    effects: [
      { stat: "coins", op: "add", value: -160 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "ops-intern",
    text: "实习生问按钮能不能按，他被安排去问法务。",
    sub: "法务正在问实习生同样的问题。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },
  {
    id: "ops-census",
    text: "统计局来电核实：你家里现在有几只猫？请如实回答。",
    sub: "如实回答会改变统计结果。",
    tone: "weird",
    effects: [
      { stat: "cats", op: "add", value: 2 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "ops-mirror",
    text: "洗手间的镜子被贴了纸条，上面只有三个字：你确定？",
    sub: "纸条下方有人补了一句：我确定。",
    tone: "weird",
    effects: [{ stat: "chaos", op: "add", value: 1 }],
  },
  {
    id: "ops-coffee",
    text: "咖啡机只剩最后一口，且已被按钮预定。",
    sub: "按钮不喝咖啡，但它有优先权。",
    tone: "weird",
    effects: [
      { stat: "coins", op: "add", value: -20 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "ops-receipt",
    text: "收据打印完毕，长度两米三，主要内容是空格。",
    sub: "空格共一千四百个，均已盖章。",
    tone: "weird",
    effects: [
      { stat: "coins", op: "add", value: -10 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "ops-notice",
    text: "通知：本按钮将于下周一进行“不存在的维护”。",
    sub: "维护期间按钮照常工作，这不矛盾。",
    tone: "weird",
    effects: [{ stat: "chaos", op: "add", value: 1 }],
  },
  {
    id: "ops-badge",
    text: "你的工牌照片已更新为按钮的照片。",
    sub: "保安已开始对你敬礼。",
    tone: "weird",
    effects: [
      { stat: "trust", op: "add", value: -5 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "ops-oath",
    text: "你被要求对按钮宣誓效忠，誓词只有一句“我按了”。",
    sub: "宣誓现场没有证人，只有一台打印机。",
    tone: "weird",
    effects: [
      { stat: "trust", op: "add", value: -3 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "ops-prize",
    text: "本司因“持续研究按钮”获得内部奖项，奖品是按钮。",
    sub: "领奖人需要在台上按一下。",
    tone: "weird",
    effects: [
      { stat: "coins", op: "add", value: 110 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "ops-deadline",
    text: "截止日期已过，截止日期也不知道自己已经过期。",
    sub: "它现在只是一段被引用的文字。",
    tone: "weird",
    effects: [{ stat: "chaos", op: "add", value: 1 }],
  },
  {
    id: "ops-ghost",
    text: "系统日志里出现了一条你没按过的记录，它比你的更早。",
    sub: "记录的工号是你的，入职日期是明年。",
    cooldown: 25,
    tone: "panic",
    effects: [
      { stat: "chaos", op: "add", value: 2 },
      { stat: "trust", op: "add", value: -3 },
    ],
  },
  {
    id: "ops-error",
    text: "系统错误：按钮未找到。请按按钮以继续。",
    sub: "错误代码的含义是“别问”。",
    tone: "panic",
    effects: [{ stat: "chaos", op: "add", value: 1 }],
  },
  {
    id: "ops-clock2",
    text: "时钟停了。但你还在按，所以时间仍在流逝。",
    sub: "流逝的部分不计入工时。",
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },
  {
    id: "ops-stairs",
    text: "楼梯间的声控灯需要按按钮才亮，灯已经放弃了。",
    sub: "灯在黑暗中完成了自我评估。",
    tone: "weird",
    effects: [{ stat: "chaos", op: "add", value: 1 }],
  },
  {
    id: "ops-park",
    text: "停车场的闸机识别到你的脸，并把它归类为“按钮”。",
    sub: "闸机随后开始向你收费。",
    tone: "weird",
    effects: [
      { stat: "coins", op: "add", value: -80 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "ops-reset",
    text: "系统决定给你一次喘息的机会：连击已归零。",
    sub: "喘息也计入工时。",
    tone: "weird",
    effects: [
      { stat: "combo", op: "set", value: 0 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },

  // ── 稀有怪卡（weight 0.3–0.6）──────────────────────────────────
  {
    id: "rare-award",
    text: "本按钮获得过一次国际大奖，评委是按钮自己。",
    sub: "颁奖典礼在按钮内部举行，席位有限。",
    weight: 0.4,
    tone: "cosmic",
    effects: [
      { stat: "chaos", op: "add", value: 2 },
      { stat: "coins", op: "add", value: 170 },
    ],
  },
  {
    id: "rare-call",
    text: "一个国际组织来电问候，随后表示打错了。",
    sub: "它在挂断前又说了一句“保重”。",
    weight: 0.3,
    tone: "cosmic",
    effects: [{ stat: "chaos", op: "add", value: 2 }],
  },
  {
    id: "rare-quake",
    text: "按钮轻轻震了一下，震级 3.1，震源在财务部。",
    sub: "财务部否认发生过震动，也否认存在财务部。",
    weight: 0.5,
    cooldown: 15,
    tone: "cosmic",
    effects: [
      { stat: "chaos", op: "add", value: 2 },
      { stat: "coins", op: "add", value: -390 },
    ],
  },
  {
    id: "rare-fire",
    text: "档案室起火，烧掉的都是关于你的档案。",
    sub: "火被扑灭后，灰烬被归档。",
    weight: 0.35,
    tone: "panic",
    effects: [
      { stat: "chaos", op: "add", value: 2 },
      { stat: "trust", op: "add", value: -6 },
    ],
  },
  {
    id: "rare-time",
    text: "时间在你的手指下慢了半拍，随后补上了利息。",
    sub: "利息以毫秒计，已入账。",
    weight: 0.6,
    cooldown: 10,
    tone: "cosmic",
    effects: [
      { stat: "chaos", op: "add", value: 2 },
      { stat: "coins", op: "add", value: -250 },
    ],
  },
  {
    id: "rare-cat-stage",
    text: "一只猫走上讲台，宣布本次会议结束。",
    sub: "全场鼓掌，会议纪要由猫口述。",
    weight: 0.3,
    tone: "cosmic",
    effects: [
      { stat: "cats", op: "add", value: 6 },
      { stat: "chaos", op: "add", value: 2 },
    ],
  },

  // ── 条件卡（requires）──────────────────────────────────────────
  {
    id: "req-cats",
    text: "猫的数量已超过本部门的心理承受能力。",
    sub: "心理承受能力此前为一只。",
    cooldown: 8,
    tone: "weird",
    requires: (ctx) => ctx.stats.cats > 0,
    effects: [
      { stat: "cats", op: "add", value: 2 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "req-chaos",
    text: "混乱度已进入财报，科目名称是“其他”。",
    sub: "“其他”占总资产的百分之九十七。",
    tone: "panic",
    requires: (ctx) => ctx.stats.chaos > 50,
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "coins", op: "add", value: -220 },
    ],
  },
  {
    id: "req-combo",
    text: "连击已被认定为一种劳动，且不付加班费。",
    sub: "劳动法在这里是一份 PDF，且无法打开。",
    tone: "panic",
    requires: (ctx) => ctx.stats.combo >= 5,
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -3 },
    ],
  },
  {
    id: "req-trust",
    text: "信任度不足，系统已切换为礼貌但疏远模式。",
    sub: "该模式下所有回复都以“随你”结尾。",
    tone: "panic",
    requires: (ctx) => ctx.stats.trust < 20,
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -2 },
    ],
  },
  {
    id: "req-coins",
    text: "账户余额为负。银行打来电话，只是想聊聊。",
    sub: "聊的内容是余额，语气是关心。",
    cooldown: 12,
    tone: "panic",
    requires: (ctx) => ctx.stats.coins < 0,
    effects: [
      { stat: "coins", op: "add", value: -160 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "req-cats5",
    text: "五只猫同时看向你，这是本司最高规格的审批。",
    sub: "审批结果为：通过，附带一声哈欠。",
    tone: "cosmic",
    requires: (ctx) => ctx.stats.cats >= 5,
    effects: [
      { stat: "cats", op: "add", value: 2 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "req-tier3",
    text: "本档位已不再提供解释，只提供结果。",
    sub: "解释部门已于上月并入结果部门。",
    tone: "panic",
    requires: (ctx) => ctx.tierIndex >= 3,
    effects: [
      { stat: "chaos", op: "add", value: 2 },
      { stat: "trust", op: "add", value: -3 },
    ],
  },
  {
    id: "req-slow",
    text: "你已在这里待了一分钟，公司已为你申请纪念品。",
    sub: "纪念品是这只按钮，需自取。",
    tone: "weird",
    requires: (ctx) => ctx.now - ctx.startedAt > 60000,
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "coins", op: "add", value: -60 },
    ],
  },

  // ── 一次性剧情节点（once）──────────────────────────────────────
  {
    id: "once-first",
    text: "这是你第一次按下按钮。人事部准备了一份小礼物：这条记录。",
    sub: "礼物不可退换，也不可炫耀。",
    minPresses: 0,
    maxPresses: 5,
    once: true,
    tone: "calm",
    effects: [
      { stat: "chaos", op: "add", value: 1 },
      { stat: "trust", op: "add", value: -1 },
    ],
  },
  {
    id: "once-seven",
    text: "第七次。系统开始怀疑这不是意外，而是一种习惯。",
    sub: "习惯在员工手册里属于“自愿行为”。",
    minPresses: 7,
    maxPresses: 7,
    once: true,
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 2 },
      { stat: "trust", op: "add", value: -4 },
    ],
  },
  {
    id: "once-ten",
    text: "第十次。系统决定不再提醒你，因为提醒没有用。",
    sub: "提醒部门已解散，理由同前。",
    minPresses: 10,
    once: true,
    tone: "weird",
    effects: [
      { stat: "chaos", op: "add", value: 2 },
      { stat: "trust", op: "add", value: -3 },
    ],
  },
  {
    id: "once-twelve",
    text: "猫第一次出现在监控里。监控没有保存，猫也不承认。",
    sub: "唯一证物是一根毛，已被法务封存。",
    minPresses: 12,
    once: true,
    tone: "weird",
    effects: [
      { stat: "cats", op: "add", value: 4 },
      { stat: "chaos", op: "add", value: 1 },
    ],
  },
  {
    id: "once-25",
    text: "第二十五次。公司成立专项小组，小组只负责叹气。",
    sub: "小组共五人，均已叹气达标。",
    minPresses: 25,
    once: true,
    tone: "panic",
    effects: [
      { stat: "chaos", op: "add", value: 2 },
      { stat: "trust", op: "add", value: -5 },
      { stat: "coins", op: "add", value: -500 },
    ],
  },
  {
    id: "once-30",
    text: "公司在你工位旁放了一个纸箱，纸箱里是另一个纸箱。",
    sub: "第二个纸箱上写着“备用”。",
    minPresses: 30,
    once: true,
    tone: "panic",
    effects: [
      { stat: "trust", op: "add", value: -6 },
      { stat: "chaos", op: "add", value: 2 },
    ],
  },
  {
    id: "once-50",
    text: "第五十次。财务部为你准备了一枚徽章，徽章是负的。",
    sub: "佩戴方式：不佩戴。",
    minPresses: 50,
    once: true,
    tone: "panic",
    effects: [
      { stat: "coins", op: "add", value: -830 },
      { stat: "chaos", op: "add", value: 2 },
      { stat: "trust", op: "add", value: -4 },
    ],
  },
  {
    id: "once-88",
    text: "第八十八次。前台说这个数字吉利，请继续，别停。",
    sub: "前台已被调离，理由是说了不该说的。",
    minPresses: 88,
    once: true,
    tone: "cosmic",
    effects: [
      { stat: "coins", op: "add", value: 490 },
      { stat: "chaos", op: "add", value: 2 },
      { stat: "trust", op: "add", value: -3 },
    ],
  },
  {
    id: "once-100",
    text: "第一百次。公司已把你的工位改成按钮的形状。",
    sub: "椅子也是按钮，坐上去等于再按一次。",
    minPresses: 100,
    once: true,
    tone: "cosmic",
    effects: [
      { stat: "chaos", op: "add", value: 3 },
      { stat: "trust", op: "add", value: -6 },
    ],
  },
];