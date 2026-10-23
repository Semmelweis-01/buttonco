/**
 * 巨大按钮。视觉全部交给 CSS，这里只负责结构与状态。
 */

export interface BigButtonOptions {
  root: HTMLElement;
  onPress: () => void;
  label: string;
}

export class BigButton {
  private readonly button: HTMLButtonElement;
  private readonly labelEl: HTMLElement;
  private readonly onPress: () => void;
  private disabled = false;
  private flashTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(opts: BigButtonOptions) {
    const doc = opts.root.ownerDocument;
    this.onPress = opts.onPress;

    const wrap = doc.createElement("div");
    wrap.className = "big-button-wrap";

    const halo = doc.createElement("div");
    halo.className = "big-button__halo";
    halo.setAttribute("aria-hidden", "true");

    const button = doc.createElement("button");
    button.type = "button";
    button.className = "big-button";
    button.setAttribute("aria-label", opts.label);

    const ring = doc.createElement("span");
    ring.className = "big-button__ring";
    ring.setAttribute("aria-hidden", "true");

    const label = doc.createElement("span");
    label.className = "big-button__label";
    label.textContent = opts.label;

    // 细则拆成两行独立 span：单行 nowrap 保证中英文都不会被拦腰折断。
    const fine = doc.createElement("span");
    fine.className = "big-button__fine";
    const fineEn = doc.createElement("span");
    fineEn.className = "big-button__fine-row";
    fineEn.textContent = "0 SAFETY CERTIFICATIONS";
    const fineZh = doc.createElement("span");
    fineZh.className = "big-button__fine-row";
    fineZh.textContent = "0 项安全认证";
    fine.append(fineEn, fineZh);

    button.append(ring, label, fine);
    wrap.append(halo, button);
    opts.root.appendChild(wrap);

    this.button = button;
    this.labelEl = label;
    button.addEventListener("click", this.handleClick);
  }

  setLabel(text: string): void {
    this.labelEl.textContent = text;
    this.button.setAttribute("aria-label", text);
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
    this.button.disabled = disabled;
    this.button.classList.toggle("is-disabled", disabled);
    this.button.setAttribute("aria-disabled", disabled ? "true" : "false");
  }

  flash(): void {
    this.button.classList.remove("is-flash");
    void this.button.offsetWidth;
    this.button.classList.add("is-flash");
    if (this.flashTimer !== null) clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => {
      this.button.classList.remove("is-flash");
      this.flashTimer = null;
    }, 300);
  }

  private readonly handleClick = (): void => {
    if (this.disabled) return;
    this.onPress();
  };
}
