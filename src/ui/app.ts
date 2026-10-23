/**
 * 页面外壳与交互装配：HUD 渲染、事件卡、结局页、提示、底部工具条、键盘。
 * 只依赖引擎/内容的公开入口，不碰实现细节。
 */
import {
  localizeAchievement,
  localizeEnding,
  localizeEvent,
  localizeTier,
} from "../content/i18n";
import type { Lang } from "../content/i18n";
import { SAVE_KEY, writeSave } from "../engine";
import type {
  AchievementDef,
  EndingDef,
  Engine,
  GameEventDef,
  GameState,
  TierDef,
} from "../engine";
import type { AudioBus } from "./audio";
import type { BigButton } from "./button";
import type { Effects, NoiseLevel } from "./effects";
import type { Gallery } from "./gallery";
import type { Hud, HudSnapshot } from "./hud";

export interface AppDeps {
  engine: Engine;
  audio: AudioBus;
  effects: Effects;
  hud: Hud;
  gallery: Gallery;
  button: BigButton;
  lang: () => Lang;
  onLanguageChange: (l: Lang) => void;
  storage: Storage | null;
}

/** 事件卡停留时长；卡片滑入后约 2.6 秒淡出。 */
const CARD_LIFE_MS = 2600;
const CARD_OUT_MS = 420;
/** 同时最多保留的卡片数量，连按时不刷屏。 */
const CARD_MAX = 3;
const TOAST_LIFE_MS = 3000;
const RESET_CONFIRM_MS = 3200;

const TEXT = {
  zh: {
    press: "按下按钮",
    pressSub: "0 项安全认证 · 请勿按下",
    hint: "空格 / 回车 也可以按",
    total: (n: string) => `累计按下 ${n}`,
    lang: "中 / EN",
    mute: "静音",
    sound: "有声",
    motion: "减少动效",
    motionOn: "动效正常",
    gallery: "画廊",
    reset: "重置存档",
    confirm: "确认重置？",
    cancel: "已取消",
    restart: "再来一次",
    ending: "本轮结算",
    statPresses: "按下次数",
    statDuration: "本轮时长",
    statCombo: "最快连击",
    tierUp: "档位跃迁",
    ach: "成就解锁",
    locked: "锁定",
  },
  en: {
    press: "PRESS IT",
    pressSub: "0 safety certifications · do not press",
    hint: "space / enter also works",
    total: (n: string) => `${n} presses all time`,
    lang: "EN / 中",
    mute: "muted",
    sound: "sound on",
    motion: "reduced motion",
    motionOn: "full motion",
    gallery: "gallery",
    reset: "reset save",
    confirm: "confirm reset?",
    cancel: "cancelled",
    restart: "press again",
    ending: "run settled",
    statPresses: "presses",
    statDuration: "duration",
    statCombo: "best combo",
    tierUp: "tier change",
    ach: "achievement",
    locked: "locked",
  },
} as const;

function strings(lang: Lang) {
  return TEXT[lang];
}

/** 引擎需要 epoch 毫秒；AppDeps 不携带时钟，故在此集中读取一次。 */
function clockNow(): number {
  return Date.now();
}

function clampNoise(value: number): NoiseLevel {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 3) return 3;
  if (value >= 2) return 2;
  return 1;
}

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

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0s";
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function el<K extends keyof HTMLElementTagNameMap>(
  doc: Document,
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function createApp(deps: AppDeps): { press(): void; destroy(): void } {
  const maybeDoc = (globalThis as { document?: Document }).document;
  if (!maybeDoc) {
    return { press: () => undefined, destroy: () => undefined };
  }
  const doc: Document = maybeDoc;

  const root = doc.getElementById("app") ?? doc.body;
  const lang = deps.lang;

  let destroyed = false;
  let ended = false;
  let maxCombo = 0;
  let resetArmed = false;
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  const timers = new Set<ReturnType<typeof setTimeout>>();

  const deck = el(doc, "div", "app-deck");
  deck.setAttribute("aria-live", "polite");
  const toasts = el(doc, "div", "app-toasts");
  const endingLayer = el(doc, "div", "app-ending");
  endingLayer.hidden = true;
  const toolbar = el(doc, "div", "app-toolbar");

  root.append(deck, toasts, endingLayer, toolbar);

  const later = (fn: () => void, ms: number): void => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (!destroyed) fn();
    }, ms);
    timers.add(timer);
  };

  /* ── HUD ─────────────────────────────────────────────────────── */

  function tierCopy(tier: TierDef) {
    return localizeTier(lang(), tier);
  }

  function snapshot(state: GameState, tier: TierDef): HudSnapshot {
    const copy = tierCopy(tier);
    return {
      presses: state.stats.presses,
      tierName: copy.name,
      tierHeadline: copy.headline,
      tierSubline: copy.subline,
      chaos: state.stats.chaos,
      trust: state.stats.trust,
      coins: state.stats.coins,
      cats: state.stats.cats,
      combo: state.stats.combo,
      fastestGapMs: state.stats.fastestGapMs,
    };
  }

  function renderAll(): void {
    const state = deps.engine.state;
    const tier = deps.engine.tier;
    deps.hud.render(snapshot(state, tier));
    deps.effects.setNoise(clampNoise(tier.noise));
    deps.button.setLabel(strings(lang()).press);
    toolbarTotal.textContent = strings(lang()).total(formatInt(state.totalPresses));
  }

  /* ── 事件卡 ──────────────────────────────────────────────────── */

  function showCard(def: GameEventDef, presses: number): void {
    const text = localizeEvent(lang(), def);
    const card = el(doc, "article", "card");
    card.tabIndex = 0;
    card.setAttribute("role", "status");

    const top = el(doc, "div", "card__top");
    const serial = el(doc, "span", "card__serial", `FORM ${presses.toString().padStart(3, "0")}`);
    const stamp = el(doc, "span", "card__stamp", def.tone ? def.tone.toUpperCase() : "SETTLED");
    top.append(serial, stamp);

    const body = el(doc, "p", "card__text");
    const chars = Array.from(text.text);
    // 全文一次性进入 DOM（测试可见），逐字显影交给 CSS 动画，点击可跳过。
    // 步长按总时长收敛，长句不会拖到尾字半天不出现。
    const step = chars.length > 0 ? Math.min(16, Math.floor(900 / chars.length)) : 0;
    for (let i = 0; i < chars.length; i += 1) {
      const span = el(doc, "span", "card__char", chars[i]);
      span.style.animationDelay = `${Math.min(i * step, 900)}ms`;
      body.appendChild(span);
    }

    card.append(top, body);
    if (text.sub) {
      card.appendChild(el(doc, "p", "card__sub", text.sub));
    }

    deck.appendChild(card);
    while (deck.childElementCount > CARD_MAX) {
      deck.firstElementChild?.remove();
    }

    let retired = false;
    const retire = (delay: number): void => {
      if (retired) return;
      retired = true;
      later(() => {
        card.classList.add("is-out");
        later(() => card.remove(), CARD_OUT_MS);
      }, delay);
    };

    const skip = (): void => {
      card.classList.add("is-typed");
      retire(120);
    };

    card.addEventListener("click", skip);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        skip();
      }
    });

    retire(CARD_LIFE_MS);
  }

  /* ── 提示 ────────────────────────────────────────────────────── */

  function toast(kind: "ach" | "tier", title: string, note: string): void {
    const node = el(doc, "div", `toast toast--${kind}`);
    node.append(el(doc, "div", "toast__title", title), el(doc, "div", "toast__note", note));
    toasts.appendChild(node);
    while (toasts.childElementCount > 4) toasts.firstElementChild?.remove();
    later(() => {
      node.classList.add("is-out");
      later(() => node.remove(), 400);
    }, TOAST_LIFE_MS);
  }

  function announceAchievement(def: AchievementDef): void {
    const text = localizeAchievement(lang(), def);
    toast("ach", text.title, strings(lang()).ach);
  }

  /* ── 结局 ────────────────────────────────────────────────────── */

  function showEnding(def: EndingDef, state: GameState): void {
    ended = true;
    deps.button.setDisabled(true);

    const text = localizeEnding(lang(), def);
    const panel = el(doc, "div", "ending__panel");
    panel.append(
      el(doc, "div", "ending__eyebrow", strings(lang()).ending),
      el(doc, "h2", "ending__title", text.title),
      el(doc, "p", "ending__blurb", text.blurb),
    );

    const stats = el(doc, "dl", "ending__stats");
    const rows: Array<[string, string]> = [
      [strings(lang()).statPresses, formatInt(state.stats.presses)],
      [strings(lang()).statDuration, formatDuration(state.stats.elapsedMs)],
      [strings(lang()).statCombo, `×${formatInt(maxCombo)}`],
    ];
    for (const [label, value] of rows) {
      const item = el(doc, "div", "ending__stat");
      item.append(el(doc, "dt", undefined, label), el(doc, "dd", undefined, value));
      stats.appendChild(item);
    }
    panel.appendChild(stats);

    const restart = el(doc, "button", "ending__restart", strings(lang()).restart);
    restart.type = "button";
    restart.addEventListener("click", () => {
      root.dispatchEvent(new CustomEvent("buttonco:restart", { bubbles: true }));
    });
    panel.appendChild(restart);

    endingLayer.replaceChildren(panel);
    endingLayer.hidden = false;
  }

  /* ── 按下主流程 ──────────────────────────────────────────────── */

  function press(): void {
    if (destroyed || ended) return;
    deps.audio.unlock();

    const result = deps.engine.press(clockNow());
    if (result.ignored) return;

    const state = deps.engine.state;
    maxCombo = Math.max(maxCombo, state.stats.combo);

    deps.hud.render(snapshot(state, result.tier));
    deps.hud.bump();
    deps.button.flash();
    deps.audio.press(state.stats.presses);
    deps.effects.punch(clampNoise(result.tier.noise));

    if (result.event) showCard(result.event, state.stats.presses);

    if (result.tierChanged) {
      const copy = localizeTier(lang(), result.tier);
      deps.effects.setNoise(clampNoise(result.tier.noise));
      deps.audio.tierUp(state.tierIndex);
      toast("tier", copy.name, strings(lang()).tierUp);
    }

    for (const achievement of result.newAchievements) {
      announceAchievement(achievement);
      deps.audio.achievement();
    }

    if (result.ending) {
      deps.audio.ending();
      showEnding(result.ending, state);
    }

    deps.gallery.refresh(state.unlockedAchievements, state.unlockedEndings);
    toolbarTotal.textContent = strings(lang()).total(formatInt(state.totalPresses));
    writeSave(deps.storage, state);
  }

  /* ── 工具条 ──────────────────────────────────────────────────── */

  const brand = el(doc, "div", "toolbar__brand");
  const toolbarTotal = el(doc, "span", "toolbar__total", "");
  brand.append(el(doc, "span", "toolbar__mark", "BUTTONCO"), toolbarTotal);

  const group = el(doc, "div", "toolbar__group");

  const langBtn = el(doc, "button", "toolbar__btn", strings(lang()).lang);
  langBtn.type = "button";
  langBtn.addEventListener("click", () => {
    const next: Lang = lang() === "zh" ? "en" : "zh";
    deps.onLanguageChange(next);
    langBtn.textContent = strings(next).lang;
    renderAll();
    rebuildToolbarLabels();
  });

  const muteBtn = el(doc, "button", "toolbar__btn", "");
  muteBtn.type = "button";
  muteBtn.addEventListener("click", () => {
    const next = !deps.audio.muted;
    deps.audio.unlock();
    deps.audio.setMuted(next);
    deps.engine.setMuted(next);
    syncMute();
    writeSave(deps.storage, deps.engine.state);
  });

  const motionBtn = el(doc, "button", "toolbar__btn", "");
  motionBtn.type = "button";
  let reducedMotion = false;
  motionBtn.addEventListener("click", () => {
    reducedMotion = !reducedMotion;
    deps.effects.setReducedMotion(reducedMotion);
    syncMotion();
    root.dispatchEvent(
      new CustomEvent("buttonco:motion", { bubbles: true, detail: { reduced: reducedMotion } }),
    );
  });

  const galleryBtn = el(doc, "button", "toolbar__btn", strings(lang()).gallery);
  galleryBtn.type = "button";
  galleryBtn.addEventListener("click", () => {
    if (deps.gallery.isOpen()) deps.gallery.close();
    else deps.gallery.open();
  });

  const resetBtn = el(doc, "button", "toolbar__btn", strings(lang()).reset);
  resetBtn.type = "button";
  resetBtn.addEventListener("click", () => {
    if (!resetArmed) {
      resetArmed = true;
      resetBtn.classList.add("is-danger");
      resetBtn.textContent = strings(lang()).confirm;
      if (resetTimer !== null) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        resetArmed = false;
        resetTimer = null;
        resetBtn.classList.remove("is-danger");
        resetBtn.textContent = strings(lang()).reset;
      }, RESET_CONFIRM_MS);
      return;
    }
    resetArmed = false;
    if (resetTimer !== null) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
    try {
      deps.storage?.removeItem(SAVE_KEY);
    } catch {
      // 隐私模式下的写入失败同样不影响重开。
    }
    root.dispatchEvent(new CustomEvent("buttonco:restart", { bubbles: true }));
  });

  group.append(langBtn, muteBtn, motionBtn, galleryBtn, resetBtn);
  toolbar.append(brand, group);

  function syncMute(): void {
    const muted = deps.audio.muted;
    muteBtn.textContent = muted ? strings(lang()).mute : strings(lang()).sound;
    muteBtn.classList.toggle("is-on", muted);
  }

  function syncMotion(): void {
    motionBtn.textContent = reducedMotion ? strings(lang()).motion : strings(lang()).motionOn;
    motionBtn.classList.toggle("is-on", reducedMotion);
  }

  function rebuildToolbarLabels(): void {
    galleryBtn.textContent = strings(lang()).gallery;
    if (!resetArmed) resetBtn.textContent = strings(lang()).reset;
    syncMute();
    syncMotion();
  }

  /* ── 键盘 ────────────────────────────────────────────────────── */

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== " " && event.key !== "Enter") return;
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName?.toLowerCase();
    if (tag === "button" || tag === "input" || tag === "textarea" || tag === "select") return;
    event.preventDefault();
    press();
  };
  doc.addEventListener("keydown", onKeyDown);

  /* ── 初始化 ──────────────────────────────────────────────────── */

  deps.audio.setMuted(deps.engine.state.muted);
  reducedMotion = doc.documentElement?.classList.contains("fx-reduced") === true;
  if (reducedMotion) deps.effects.setReducedMotion(true);
  syncMute();
  syncMotion();
  renderAll();
  deps.gallery.refresh(
    deps.engine.state.unlockedAchievements,
    deps.engine.state.unlockedEndings,
  );

  return {
    press,
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      doc.removeEventListener("keydown", onKeyDown);
      if (resetTimer !== null) clearTimeout(resetTimer);
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      deck.remove();
      toasts.remove();
      endingLayer.remove();
      toolbar.remove();
    },
  };
}
