/**
 * 视觉崩坏层。强度完全由 tier.noise（0..3）驱动。
 * 减少动效时所有抖动/涟漪/浮层一律关闭。
 */

export type NoiseLevel = 0 | 1 | 2 | 3;

export interface EffectsOptions {
  root: HTMLElement;
  reducedMotion: boolean;
}

const NOTICES = [
  "NOTICE 07-B / 需补表格",
  "PLEASE REMAIN / 请保持原位",
  "AUDIT IN PROGRESS / 审计中",
  "DEPT. OF NOTHING / 无事部",
  "SECTION 0 / 第零条",
  "DO NOT EXPLAIN / 请勿解释",
];

/** 系统是否要求减少动效（无 matchMedia 的宿主返回 false）。 */
export function prefersReducedMotion(): boolean {
  const host = globalThis as unknown as {
    matchMedia?: (query: string) => { matches: boolean };
  };
  if (typeof host.matchMedia !== "function") return false;
  try {
    return host.matchMedia("(prefers-reduced-motion: reduce)").matches === true;
  } catch {
    return false;
  }
}

function clampNoise(level: number): NoiseLevel {
  if (!Number.isFinite(level) || level <= 0) return 0;
  if (level >= 3) return 3;
  if (level >= 2) return 2;
  return 1;
}

export class Effects {
  private readonly root: HTMLElement;
  private readonly layer: HTMLElement;
  private readonly notices: HTMLElement[] = [];
  private reduced: boolean;
  private level: NoiseLevel = 0;
  private destroyed = false;
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  constructor(opts: EffectsOptions) {
    this.root = opts.root;
    this.reduced = opts.reducedMotion;

    const doc = this.root.ownerDocument;
    this.layer = doc.createElement("div");
    this.layer.className = "fx-layer";
    this.layer.setAttribute("aria-hidden", "true");

    const scan = doc.createElement("div");
    scan.className = "fx-scan";
    const vignette = doc.createElement("div");
    vignette.className = "fx-vignette";
    const noticeLayer = doc.createElement("div");
    noticeLayer.className = "fx-notices";

    for (let i = 0; i < NOTICES.length; i += 1) {
      const notice = doc.createElement("div");
      notice.className = "fx-notice";
      notice.textContent = NOTICES[i];
      // 位置按下标确定，避免每次刷新跳位。
      const left = [6, 62, 18, 71, 38, 84][i % 6];
      const top = [18, 26, 62, 58, 78, 42][i % 6];
      notice.style.left = `${left}%`;
      notice.style.top = `${top}%`;
      notice.style.animationDelay = `${(i * 1.7).toFixed(1)}s`;
      notice.hidden = true;
      this.notices.push(notice);
      noticeLayer.appendChild(notice);
    }

    this.layer.append(scan, vignette, noticeLayer);
    this.root.appendChild(this.layer);
    this.applyReduced();
    this.setNoise(0);
  }

  setNoise(level: NoiseLevel): void {
    if (this.destroyed) return;
    this.level = clampNoise(level);
    this.root.dataset.noise = String(this.level);
    const visible = this.level === 0 ? 0 : this.level === 1 ? 2 : this.level === 2 ? 4 : NOTICES.length;
    for (let i = 0; i < this.notices.length; i += 1) {
      this.notices[i].hidden = i >= visible;
    }
  }

  /** 一次按下的视觉反馈：按钮挤压 + 涟漪 + 抖动（强度随 noise）。 */
  punch(level: NoiseLevel): void {
    if (this.destroyed) return;
    const button = this.root.querySelector<HTMLElement>(".big-button");
    if (button && !this.reduced) {
      button.classList.remove("is-punch");
      void button.offsetWidth;
      button.classList.add("is-punch");
      this.later(() => button.classList.remove("is-punch"), 240);

      const doc = this.root.ownerDocument;
      const ripple = doc.createElement("span");
      ripple.className = "ripple";
      button.appendChild(ripple);
      this.later(() => ripple.remove(), 700);
    }
    this.shake(clampNoise(level) + 0.5);
  }

  shake(intensity: number): void {
    if (this.destroyed || this.reduced) return;
    const safe = Number.isFinite(intensity) ? Math.max(0, intensity) : 0;
    const amplitude = Math.min(16, 2 + safe * 4.2);
    if (amplitude <= 2) return;
    this.root.style.setProperty("--shake-amp", `${amplitude.toFixed(1)}px`);
    this.root.classList.remove("is-shaking");
    void this.root.offsetWidth;
    this.root.classList.add("is-shaking");
    this.later(() => this.root.classList.remove("is-shaking"), 460);
  }

  setReducedMotion(on: boolean): void {
    if (this.destroyed) return;
    this.reduced = on;
    this.applyReduced();
    if (on) this.root.classList.remove("is-shaking");
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    this.root.classList.remove("is-shaking", "fx-reduced");
    this.root.style.removeProperty("--shake-amp");
    delete this.root.dataset.noise;
    this.layer.remove();
  }

  private applyReduced(): void {
    this.root.classList.toggle("fx-reduced", this.reduced);
  }

  private later(fn: () => void, ms: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (!this.destroyed) fn();
    }, ms);
    this.timers.add(timer);
  }
}
