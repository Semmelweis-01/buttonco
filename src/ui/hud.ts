/**
 * 顶部 HUD：超大按下数字、档位文案、两条进度条、四个数值格。
 * 所有查询都容忍元素缺失（最小 DOM 下也不抛）。
 */

export interface HudSnapshot {
  presses: number;
  tierName: string;
  tierHeadline: string;
  tierSubline: string;
  chaos: number;
  trust: number;
  coins: number;
  cats: number;
  combo: number;
  fastestGapMs: number;
}

/** 千分位整数；非有限值显示占位符。 */
function formatInt(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value);
  const digits = Math.abs(rounded).toString();
  let out = "";
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ",";
    out += digits[i];
  }
  return (rounded < 0 ? "-" : "") + out;
}

/** 金币：带货币符号与符号位，例如 -¥12,340。 */
function formatCoins(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value);
  return (rounded < 0 ? "-¥" : "¥") + formatInt(Math.abs(rounded));
}

function formatGap(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${Math.round(value)}ms`;
}

function percent(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.max(0, Math.min(100, value)).toFixed(1)}%`;
}

export class Hud {
  private readonly pressesEl: HTMLElement | null;
  private readonly tierNameEl: HTMLElement | null;
  private readonly headlineEl: HTMLElement | null;
  private readonly sublineEl: HTMLElement | null;
  private readonly chaosFill: HTMLElement | null;
  private readonly chaosValue: HTMLElement | null;
  private readonly trustFill: HTMLElement | null;
  private readonly trustValue: HTMLElement | null;
  private readonly coinsEl: HTMLElement | null;
  private readonly catsEl: HTMLElement | null;
  private readonly comboEl: HTMLElement | null;
  private readonly gapEl: HTMLElement | null;
  private bumpTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(root: HTMLElement) {
    const doc = root.ownerDocument;

    const hud = doc.createElement("div");
    hud.className = "hud";

    const counter = doc.createElement("div");
    counter.className = "hud__counter";
    const presses = doc.createElement("span");
    presses.className = "hud__presses";
    presses.textContent = "0";
    const pressesLabel = doc.createElement("span");
    pressesLabel.className = "hud__presses-label";
    pressesLabel.textContent = "presses";
    counter.append(presses, pressesLabel);

    const tier = doc.createElement("div");
    tier.className = "hud__tier";
    const tierName = doc.createElement("span");
    tierName.className = "hud__tier-name";
    const headline = doc.createElement("p");
    headline.className = "hud__tier-headline";
    const subline = doc.createElement("p");
    subline.className = "hud__tier-subline";
    tier.append(tierName, headline, subline);

    const aside = doc.createElement("div");
    aside.className = "hud__aside";
    const meters = doc.createElement("div");
    meters.className = "hud__meters";

    const chaos = this.buildMeter(doc, "chaos", "chaos", "Chaos");
    const trust = this.buildMeter(doc, "trust", "trust", "Trust");
    meters.append(chaos.root, trust.root);

    const stats = doc.createElement("dl");
    stats.className = "hud__stats";
    const coins = this.buildStat(doc, stats, "coins", "coins");
    const cats = this.buildStat(doc, stats, "cats", "cats");
    const combo = this.buildStat(doc, stats, "combo", "combo");
    const gap = this.buildStat(doc, stats, "fastest", "fastest gap");

    aside.append(meters, stats);
    hud.append(counter, tier, aside);
    root.appendChild(hud);

    this.pressesEl = presses;
    this.tierNameEl = tierName;
    this.headlineEl = headline;
    this.sublineEl = subline;
    this.chaosFill = chaos.fill;
    this.chaosValue = chaos.value;
    this.trustFill = trust.fill;
    this.trustValue = trust.value;
    this.coinsEl = coins;
    this.catsEl = cats;
    this.comboEl = combo;
    this.gapEl = gap;
  }

  render(s: HudSnapshot): void {
    if (this.pressesEl) this.pressesEl.textContent = formatInt(s.presses);
    if (this.tierNameEl) this.tierNameEl.textContent = s.tierName;
    if (this.headlineEl) this.headlineEl.textContent = s.tierHeadline;
    if (this.sublineEl) this.sublineEl.textContent = s.tierSubline;
    if (this.chaosFill) this.chaosFill.style.width = percent(s.chaos);
    if (this.chaosValue) this.chaosValue.textContent = `${Math.round(s.chaos)}`;
    if (this.trustFill) this.trustFill.style.width = percent(s.trust);
    if (this.trustValue) this.trustValue.textContent = `${Math.round(s.trust)}`;
    if (this.coinsEl) {
      this.coinsEl.textContent = formatCoins(s.coins);
      this.coinsEl.classList.toggle("is-negative", s.coins < 0);
    }
    if (this.catsEl) this.catsEl.textContent = formatInt(s.cats);
    if (this.comboEl) this.comboEl.textContent = `×${formatInt(s.combo)}`;
    if (this.gapEl) this.gapEl.textContent = formatGap(s.fastestGapMs);
  }

  /** 数字变化时触发一次弹跳动画。 */
  bump(): void {
    const el = this.pressesEl;
    if (!el) return;
    el.classList.remove("is-bump");
    void el.offsetWidth;
    el.classList.add("is-bump");
    if (this.bumpTimer !== null) clearTimeout(this.bumpTimer);
    this.bumpTimer = setTimeout(() => {
      el.classList.remove("is-bump");
      this.bumpTimer = null;
    }, 300);
  }

  private buildMeter(
    doc: Document,
    key: string,
    valueName: string,
    label: string,
  ): { root: HTMLElement; fill: HTMLElement; value: HTMLElement } {
    const meter = doc.createElement("div");
    meter.className = "meter";
    meter.dataset.meter = key;
    const top = doc.createElement("div");
    top.className = "meter__top";
    const name = doc.createElement("span");
    name.textContent = label;
    const value = doc.createElement("span");
    value.className = "meter__value";
    value.dataset.value = valueName;
    value.textContent = "0";
    top.append(name, value);
    const track = doc.createElement("div");
    track.className = "meter__track";
    const fill = doc.createElement("div");
    fill.className = "meter__fill";
    track.appendChild(fill);
    meter.append(top, track);
    return { root: meter, fill, value };
  }

  private buildStat(doc: Document, list: HTMLElement, key: string, label: string): HTMLElement {
    const item = doc.createElement("div");
    item.className = "hud__stat";
    item.dataset.stat = key;
    const dt = doc.createElement("dt");
    dt.textContent = label;
    const dd = doc.createElement("dd");
    dd.textContent = key === "coins" ? "¥0" : key === "fastest" ? "—" : "0";
    item.append(dt, dd);
    list.appendChild(item);
    return dd;
  }
}
