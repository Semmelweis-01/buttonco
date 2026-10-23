// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACHIEVEMENTS, ENDINGS, EVENTS, TIERS } from "../src/content";
import type { Lang } from "../src/content/i18n";
import { Engine, mulberry32 } from "../src/engine";
import type { SaveData } from "../src/engine";
import { createApp } from "../src/ui/app";
import type { AppDeps } from "../src/ui/app";
import { AudioBus } from "../src/ui/audio";
import { BigButton } from "../src/ui/button";
import { Effects } from "../src/ui/effects";
import type { NoiseLevel } from "../src/ui/effects";
import { Gallery } from "../src/ui/gallery";
import { Hud } from "../src/ui/hud";

const SAVE_KEY = "buttonco.save.v1";

function makeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => void map.delete(key),
    setItem: (key: string, value: string) => void map.set(key, String(value)),
  } as Storage;
}

function makeEngine(save: SaveData | null = null, seed = 12345): Engine {
  return new Engine({
    seed,
    startedAt: 1_000,
    rng: mulberry32(seed),
    events: EVENTS,
    tiers: TIERS,
    endings: ENDINGS,
    achievements: ACHIEVEMENTS,
    save,
  });
}

function mountRoot(): HTMLElement {
  document.body.replaceChildren();
  const root = document.createElement("div");
  root.id = "app";
  document.body.appendChild(root);
  return root;
}

interface Harness {
  deps: AppDeps;
  app: { press(): void; destroy(): void };
  root: HTMLElement;
  storage: Storage;
}

/** 组装一套真实的 UI 依赖（只有 AudioBus 在 jsdom 下天然无声）。 */
interface HarnessOpts {
  seed?: number;
  save?: SaveData | null;
  onLanguageChange?: (l: Lang) => void;
  lang?: () => Lang;
}

function harness(opts: HarnessOpts = {}): Harness {
  const seed = opts.seed ?? 12345;
  const save = opts.save ?? null;
  const root = mountRoot();
  const storage = makeStorage();
  const engine = makeEngine(save, seed);
  const lang = opts.lang ?? (() => "zh" as Lang);

  const hudSlot = document.createElement("div");
  hudSlot.className = "hud-slot";
  const stage = document.createElement("main");
  stage.className = "stage";
  root.append(hudSlot, stage);

  const audio = new AudioBus();
  const effects = new Effects({ root, reducedMotion: false });
  const hud = new Hud(hudSlot);
  const gallery = new Gallery({
    root,
    achievements: ACHIEVEMENTS,
    endings: ENDINGS,
    unlockedAchievements: [],
    unlockedEndings: [],
    lang,
  });

  let pressFn: () => void = () => undefined;
  const button = new BigButton({
    root: stage,
    label: "PRESS",
    onPress: () => pressFn(),
  });

  const deps: AppDeps = {
    engine,
    audio,
    effects,
    hud,
    gallery,
    button,
    lang,
    onLanguageChange: opts.onLanguageChange ?? (() => undefined),
    storage,
  };
  const app = createApp(deps);
  pressFn = () => app.press();
  return { deps, app, root, storage };
}

function pressesText(root: HTMLElement): string {
  return root.querySelector(".hud__presses")?.textContent ?? "";
}

function buttonEl(root: HTMLElement): HTMLButtonElement | null {
  return root.querySelector<HTMLButtonElement>("button.big-button");
}

beforeEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

/* ── AudioBus ─────────────────────────────────────────────────── */

describe("AudioBus", () => {
  it("在无 AudioContext 的 jsdom 环境下所有方法静默不抛", () => {
    const bus = new AudioBus();
    expect(() => bus.unlock()).not.toThrow();
    expect(() => bus.press(1)).not.toThrow();
    expect(() => bus.press(60)).not.toThrow();
    expect(() => bus.press(400)).not.toThrow();
    expect(() => bus.tierUp(3)).not.toThrow();
    expect(() => bus.ending()).not.toThrow();
    expect(() => bus.achievement()).not.toThrow();
    expect(() => bus.setMuted(true)).not.toThrow();
    expect(bus.muted).toBe(true);
    expect(() => bus.setMuted(false)).not.toThrow();
    expect(bus.muted).toBe(false);
  });

  it("AudioContext 构造函数抛错时也不外泄异常", () => {
    const original = (globalThis as { AudioContext?: unknown }).AudioContext;
    class Exploding {
      constructor() {
        throw new Error("no audio for you");
      }
    }
    (globalThis as { AudioContext?: unknown }).AudioContext = Exploding;
    try {
      const bus = new AudioBus();
      expect(() => bus.unlock()).not.toThrow();
      expect(() => bus.press(10)).not.toThrow();
      expect(() => bus.tierUp(1)).not.toThrow();
      expect(() => bus.ending()).not.toThrow();
      expect(() => bus.achievement()).not.toThrow();
    } finally {
      (globalThis as { AudioContext?: unknown }).AudioContext = original;
    }
  });
});

/* ── Effects ──────────────────────────────────────────────────── */

describe("Effects", () => {
  it("setNoise 写入 data-noise 并夹取范围", () => {
    const root = mountRoot();
    const effects = new Effects({ root, reducedMotion: false });
    effects.setNoise(0);
    expect(root.dataset.noise).toBe("0");
    effects.setNoise(3);
    expect(root.dataset.noise).toBe("3");
    effects.setNoise(9 as NoiseLevel);
    expect(root.dataset.noise).toBe("3");
    effects.destroy();
    expect(root.dataset.noise).toBeUndefined();
  });

  it("punch / shake / setReducedMotion / destroy 在 jsdom 下不抛", () => {
    const root = mountRoot();
    const stage = document.createElement("main");
    const button = document.createElement("button");
    button.className = "big-button";
    stage.appendChild(button);
    root.appendChild(stage);

    const effects = new Effects({ root, reducedMotion: false });
    expect(() => effects.setNoise(1)).not.toThrow();
    expect(() => effects.punch(0)).not.toThrow();
    expect(() => effects.punch(3)).not.toThrow();
    expect(() => effects.shake(2.5)).not.toThrow();
    expect(() => effects.shake(Number.NaN)).not.toThrow();
    expect(() => effects.setReducedMotion(true)).not.toThrow();
    expect(root.classList.contains("fx-reduced")).toBe(true);
    expect(() => effects.shake(3)).not.toThrow();
    expect(root.classList.contains("is-shaking")).toBe(false);
    expect(() => effects.setReducedMotion(false)).not.toThrow();
    expect(root.classList.contains("fx-reduced")).toBe(false);
    expect(() => effects.destroy()).not.toThrow();
    expect(root.querySelector(".fx-layer")).toBeNull();
    expect(() => effects.destroy()).not.toThrow();
  });

  it("documentElement 带 fx-reduced 时 createApp 会把减动效接到 Effects 上", () => {
    // jsdom 不加载 style.css，所以这里验的是 app.ts 的接线：
    // 读到 documentElement.fx-reduced 后必须调用 setReducedMotion(true)，
    // 表现就是 root 带上 fx-reduced 且 punch 不再产生涟漪。
    document.documentElement.classList.add("fx-reduced");
    try {
      const h = harness();
      expect(h.root.classList.contains("fx-reduced")).toBe(true);

      const stage = h.root.querySelector(".stage") as HTMLElement;
      const probe = document.createElement("button");
      probe.className = "big-button";
      stage.appendChild(probe);
      h.deps.effects.punch(3);
      expect(h.root.querySelector(".ripple")).toBeNull();

      h.app.destroy();
    } finally {
      document.documentElement.classList.remove("fx-reduced");
    }
  });

  it("减少动效时 punch 不产生涟漪", () => {
    const root = mountRoot();
    const stage = document.createElement("main");
    const button = document.createElement("button");
    button.className = "big-button";
    stage.appendChild(button);
    root.appendChild(stage);

    const effects = new Effects({ root, reducedMotion: true });
    effects.punch(3);
    expect(root.querySelector(".ripple")).toBeNull();
    effects.destroy();
  });
});

/* ── Hud ──────────────────────────────────────────────────────── */

describe("Hud", () => {
  it("render 把数值写进 DOM 并格式化 cats / coins", () => {
    const root = mountRoot();
    const hud = new Hud(root);
    hud.render({
      presses: 1234,
      tierName: "第一档 · 礼貌劝阻",
      tierHeadline: "请勿按下此按钮。",
      tierSubline: "本提示已通过 0 项安全认证。",
      chaos: 12.5,
      trust: 87.5,
      coins: -12340,
      cats: 7,
      combo: 3,
      fastestGapMs: 180,
    });

    expect(root.querySelector(".hud__presses")?.textContent).toBe("1,234");
    expect(root.querySelector(".hud__tier-name")?.textContent).toBe("第一档 · 礼貌劝阻");
    expect(root.querySelector(".hud__tier-headline")?.textContent).toBe("请勿按下此按钮。");
    expect(root.querySelector('[data-stat="coins"] dd')?.textContent).toBe("-¥12,340");
    expect(root.querySelector('[data-stat="coins"] dd')?.classList.contains("is-negative")).toBe(true);
    expect(root.querySelector('[data-stat="cats"] dd')?.textContent).toBe("7");
    expect(root.querySelector('[data-stat="fastest"] dd')?.textContent).toBe("180ms");
    expect((root.querySelector('[data-meter="chaos"] .meter__fill') as HTMLElement).style.width).toBe(
      "12.5%",
    );
    expect((root.querySelector('[data-meter="trust"] .meter__fill') as HTMLElement).style.width).toBe(
      "87.5%",
    );
  });

  it("正数金币与 Infinity 最快间隔显示为占位", () => {
    const root = mountRoot();
    const hud = new Hud(root);
    hud.render({
      presses: 0,
      tierName: "t",
      tierHeadline: "h",
      tierSubline: "s",
      chaos: 0,
      trust: 100,
      coins: 999,
      cats: 0,
      combo: 0,
      fastestGapMs: Infinity,
    });
    expect(root.querySelector('[data-stat="coins"] dd')?.textContent).toBe("¥999");
    expect(root.querySelector('[data-stat="coins"] dd')?.classList.contains("is-negative")).toBe(false);
    expect(root.querySelector('[data-stat="fastest"] dd')?.textContent).toBe("—");
  });

  it("bump 给数字加一次弹跳类并随后移除", () => {
    vi.useFakeTimers();
    const root = mountRoot();
    const hud = new Hud(root);
    hud.bump();
    const el = root.querySelector(".hud__presses");
    expect(el?.classList.contains("is-bump")).toBe(true);
    vi.advanceTimersByTime(400);
    expect(el?.classList.contains("is-bump")).toBe(false);
  });
});

/* ── Gallery ──────────────────────────────────────────────────── */

describe("Gallery", () => {
  it("未解锁项显示锁定态、secret 显示 ???、open/close 切换 isOpen", () => {
    const root = mountRoot();
    const secret = ACHIEVEMENTS.find((a) => a.secret === true);
    const gallery = new Gallery({
      root,
      achievements: ACHIEVEMENTS,
      endings: ENDINGS,
      unlockedAchievements: [],
      unlockedEndings: [],
      lang: () => "zh",
    });

    const items = root.querySelectorAll(".gallery__item");
    expect(items.length).toBe(ACHIEVEMENTS.length + ENDINGS.length);
    expect(root.querySelectorAll(".gallery__item.is-locked").length).toBe(items.length);
    expect(root.querySelectorAll(".gallery__item.is-unlocked").length).toBe(0);

    if (secret) {
      const index = ACHIEVEMENTS.indexOf(secret);
      const title = items[index].querySelector(".gallery__item-title")?.textContent;
      expect(title).toBe("???");
    } else {
      // 内容层没有 secret 成就时，至少要有一个 ??? 结局位。
      expect(Array.from(items).some((i) => i.textContent?.includes("???"))).toBe(true);
    }

    expect(gallery.isOpen()).toBe(false);
    gallery.open();
    expect(gallery.isOpen()).toBe(true);
    expect(root.querySelector(".gallery")?.classList.contains("is-open")).toBe(true);
    gallery.close();
    expect(gallery.isOpen()).toBe(false);
  });

  it("refresh 后已解锁项去掉锁定态并显示真实标题", () => {
    const root = mountRoot();
    const gallery = new Gallery({
      root,
      achievements: ACHIEVEMENTS,
      endings: ENDINGS,
      unlockedAchievements: [],
      unlockedEndings: [],
      lang: () => "zh",
    });
    const first = ACHIEVEMENTS[0];
    gallery.refresh([first.id], [ENDINGS[0].id]);

    const items = root.querySelectorAll(".gallery__item");
    expect(items[0].classList.contains("is-unlocked")).toBe(true);
    expect(items[0].classList.contains("is-locked")).toBe(false);
    expect(items[0].querySelector(".gallery__item-title")?.textContent).toBe(first.title);

    const endingIndex = ACHIEVEMENTS.length;
    expect(items[endingIndex].classList.contains("is-unlocked")).toBe(true);
    expect(items[endingIndex].querySelector(".gallery__item-title")?.textContent).toBe(
      ENDINGS[0].title,
    );
  });
});

/* ── BigButton ────────────────────────────────────────────────── */

describe("BigButton", () => {
  it("点击回调触发一次，setDisabled 后不再触发", () => {
    const root = mountRoot();
    const onPress = vi.fn();
    const button = new BigButton({ root, onPress, label: "PRESS" });

    const el = buttonEl(root);
    expect(el).not.toBeNull();
    el?.click();
    expect(onPress).toHaveBeenCalledTimes(1);

    button.setDisabled(true);
    el?.click();
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(el?.disabled).toBe(true);

    button.setDisabled(false);
    el?.click();
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it("setLabel 更新文案与 aria-label，flash 不抛", () => {
    const root = mountRoot();
    const button = new BigButton({ root, onPress: () => undefined, label: "PRESS" });
    button.setLabel("请勿按下");
    expect(root.querySelector(".big-button__label")?.textContent).toBe("请勿按下");
    expect(buttonEl(root)?.getAttribute("aria-label")).toBe("请勿按下");
    expect(() => button.flash()).not.toThrow();
  });

  it("细则拆成两行独立 nowrap，中文不会被拦腰折断", () => {
    const root = mountRoot();
    new BigButton({ root, onPress: () => undefined, label: "PRESS" });

    const rows = root.querySelectorAll(".big-button__fine-row");
    // 两行独立成块：中文短语完整落在第二行，不会被拆到两个元素里。
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toBe("0 SAFETY CERTIFICATIONS");
    expect(rows[1].textContent).toBe("0 项安全认证");
    expect(rows[1].textContent?.startsWith("0 项")).toBe(true);
    expect(rows[1].textContent?.endsWith("认证")).toBe(true);

    const fine = root.querySelector(".big-button__fine");
    expect(fine?.children.length).toBe(2);
  });
});

/* ── createApp 端到端 ─────────────────────────────────────────── */

describe("createApp", () => {
  it("连续 press 3 次后按下次数显示为 3 且事件卡文本非空", () => {
    const h = harness();
    expect(pressesText(h.root)).toBe("0");

    h.app.press();
    expect(pressesText(h.root)).toBe("1");
    h.app.press();
    expect(pressesText(h.root)).toBe("2");
    h.app.press();
    expect(pressesText(h.root)).toBe("3");

    const card = h.root.querySelector(".card");
    expect(card).not.toBeNull();
    const text = card?.querySelector(".card__text")?.textContent ?? "";
    expect(text.length).toBeGreaterThan(0);

    h.app.destroy();
  });

  it("按下后写入存档并累计 totalPresses", () => {
    const h = harness();
    h.app.press();
    h.app.press();

    const raw = h.storage.getItem(SAVE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string) as SaveData;
    expect(parsed.version).toBe(1);
    expect(parsed.totalPresses).toBe(2);

    h.app.destroy();
  });

  it("结局触发后按钮 disabled，且再按不再改变计数", () => {
    // 手速结局：combo >= 20。以 88 次按下也不保证，直接用连击路径：连续快按。
    const h = harness();
    let guard = 0;
    while (h.root.querySelector(".app-ending")?.hasAttribute("hidden") !== false && guard < 400) {
      h.app.press();
      guard += 1;
    }

    const overlay = h.root.querySelector<HTMLElement>(".app-ending");
    expect(overlay).not.toBeNull();
    expect(overlay?.hidden).toBe(false);
    expect(buttonEl(h.root)?.disabled).toBe(true);

    const before = pressesText(h.root);
    h.app.press();
    expect(pressesText(h.root)).toBe(before);

    h.app.destroy();
  });

  it("工具栏语言切换调用 onLanguageChange 并重绘文案", () => {
    const onLanguageChange = vi.fn();
    let current: Lang = "zh";
    const h = harness({
      lang: () => current,
      onLanguageChange: (next) => {
        current = next;
        onLanguageChange(next);
      },
    });

    const langBtn = h.root.querySelector<HTMLButtonElement>(".app-toolbar .toolbar__btn");
    expect(langBtn).not.toBeNull();
    langBtn?.click();

    expect(onLanguageChange).toHaveBeenCalledWith("en");
    expect(h.root.querySelector(".big-button__label")?.textContent).toBe("PRESS IT");

    h.app.destroy();
  });

  it("键盘空格与回车都能按下，输入框内的回车不触发", () => {
    const h = harness();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(pressesText(h.root)).toBe("1");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(pressesText(h.root)).toBe("2");

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(pressesText(h.root)).toBe("2");

    h.app.destroy();
  });

  it("destroy 移除自己创建的节点且可重复调用", () => {
    const h = harness();
    h.app.destroy();
    expect(h.root.querySelector(".app-deck")).toBeNull();
    expect(h.root.querySelector(".app-toolbar")).toBeNull();
    expect(() => h.app.destroy()).not.toThrow();
  });
});
