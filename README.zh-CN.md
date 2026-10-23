<p align="center">
  <img src="./public/banner.svg" alt="BUTTONCO — 一颗绝对不该被按下的巨大红色按钮" width="100%">
</p>

<h1 align="center">BUTTONCO</h1>

<p align="center">
  <b>一颗绝对不该被按下的按钮。</b><br>
  你按了。世界开始结算。
</p>

<p align="center">
  <a href="./LICENSE"><img alt="许可证：MIT" src="https://img.shields.io/badge/license-MIT-2ea44f"></a>
  <img alt="运行时依赖：0" src="https://img.shields.io/badge/runtime%20dependencies-0-1f6feb">
  <img alt="欢迎 PR" src="https://img.shields.io/badge/PRs-welcome-brightgreen">
</p>

<p align="center">
  <a href="./README.md">English</a> · <b>简体中文</b>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://semmelweis-01.github.io/buttonco/"><b>▶ 在浏览器里试玩</b></a>
</p>

---

## 一句话说明

一个只会劝你别按的按钮。你按了。世界开始结算。

## ▶ 在线试玩

**<https://semmelweis-01.github.io/buttonco/>**

免安装、免注册、没有撤销。静态产物从 `gh-pages` 分支发布到 GitHub Pages。

## 截图

<p align="center">
  <img src="./docs/screenshot.png" alt="BUTTONCO 第 27 次按下：第三档「部门震动」，左侧堆着三张公文卡，中间是一颗巨大的红色按钮" width="860">
</p>

<p align="center">
  <img src="./docs/gameplay.gif" alt="玩法：从第 0 次按到第 50 次，档位逐级升级，界面逐渐崩坏" width="620">
</p>

<p align="center">
  <img src="./docs/screenshot-mobile.png" alt="BUTTONCO 在 390px 手机视口下的样子" width="240">
</p>

> 三张图都是用无头浏览器从真实构建里截的，不是效果图。GIF 从第 0 次按到第 50 次。

## 玩法

- **按一次，结算一层。** 每次点击都会抽一张事件卡并生效：数值变动、文案越来越慌、界面逐渐崩坏。
- **92 张事件卡。** 带权重、含一次性卡与冷却卡、部分卡有前置条件——官僚流程、客服热线、猫、税法、哲学系毕业生、宇宙尽头。
- **5 个档位**，分别在 0 / 10 / 25 / 50 / 100 次按下时切换：礼貌、流程、部门震动、宇宙结算、无话可说。
- **10 个结局、14 个成就。** 其中一个结局是隐藏的，本 README 不会写出来；部分成就在解锁前显示为 `???`。
- **跨轮持久化。** 结局、成就与累计按下次数存在 `localStorage`，带坏档容错，关掉页面也记得你做过什么。

## 本地运行

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # vitest：引擎 + 内容 + 双语三套测试
```

构建静态产物（部署的就是它）：

```bash
npm run build    # tsc --noEmit && vite build  ->  dist/
npm run preview  # 本地预览 dist/
```

需要 Node 20+。**零运行时依赖**——`devDependencies` 里的 `typescript`、`vite`、`vitest`、`jsdom`、`@types/node` 全部是构建与测试工具，不向浏览器发布任何东西。

## 技术栈与架构

TypeScript（strict）· Vite 5 · Vitest 2 · 零运行时依赖 · 确定性随机 · `localStorage` 存档 · 中英双语文案表。

```mermaid
flowchart LR
  UI["src/ui + index.html<br/>只碰 DOM：渲染状态、转发点击"]
  ENG["src/engine<br/>纯逻辑 — Engine、press(now)、mulberry32 随机、存档"]
  CON["src/content<br/>纯数据 — 92 事件 / 5 档位 / 10 结局 / 14 成就"]
  T["src/engine/types.ts<br/>双方共用的契约"]

  UI -->|press(now), setMuted| ENG
  ENG -->|读取定义| CON
  ENG -.->|实现| T
  CON -.->|实现| T
```

```
src/
  engine/     纯逻辑：不碰 DOM、不用 Math.random、不读 Date.now
    types.ts  引擎与内容层共用的类型契约
    engine.ts 按下流水线：数值 -> 档位 -> 事件卡 -> 结局 -> 成就
    rng.ts    mulberry32：同一 seed、同一序列、同一个笑话
    save.ts   带版本号的 JSON，坏档直接丢弃，绝不抛异常
    state.ts  状态构造与数值夹取
  content/    只有数据，没有逻辑
    events.ts / tiers.ts / endings.ts / achievements.ts
    i18n/     每张卡、每个档位/结局/成就的英文本地化文案
  ui/         唯一允许接触浏览器的层：DOM、音效、动画
tests/        engine、content、i18n、balance（40 seed 对局模拟）与 ui 五个测试套件
```

三条硬规矩保证可测试性：引擎从不读时钟（时间以 `now` 参数传入），引擎与内容层从不碰 DOM，所有随机都来自注入的确定性 RNG。

玩法与引擎的完整设计说明见 [docs/DESIGN.md](./docs/DESIGN.md)。

## 彩蛋（三个里的两个）

- **沉默。** 关掉声音，再按 45 次。世界安静了，事情没有。
- **88。** 在公司还信任你的时候，正好按 88 次。前台说这个数字吉利，随后前台被调离。
- **第三个。** 一共十个结局。剩下那个不会写在这里，它不是 bug，也不是随手翻源码就能看到的东西。

## 免责声明

> **免责声明。** 本按钮已通过 **0** 项安全认证。未获任何监管机构、部门、委员会或猫的批准。副作用可能包括：计划外的官僚流程、负数的账户余额、猫（很多只）、一次轻度哲学危机，以及一个（1 个）隐藏结局。无真实金钱、无真实猫、无真实责任——这只是个浏览器游戏。

## 参与贡献

欢迎 PR，尤其是新的 event card 与新的结局。请先读 [CONTRIBUTING.md](./CONTRIBUTING.md)：里面写了调性规则（冷面公文腔、不涉政治、不用真实公司名）以及不可妥协的工程约束。

本项目遵循的概念规格书是 [SPEC.md](./SPEC.md)。

## 许可证

[MIT](./LICENSE) © BUTTONCO Contributors。

<p align="center">
  <a href="./README.md">English README</a> ·
  <a href="https://semmelweis-01.github.io/buttonco/">▶ 试玩</a> ·
  <a href="./docs/DESIGN.md">设计文档</a> ·
  <a href="./CONTRIBUTING.md">贡献指南</a>
</p>
