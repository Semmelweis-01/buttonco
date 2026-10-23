/**
 * 入口：读档 → 建引擎 → 装配 UI 层 → 交给 app.ts 编排。
 * 这里是整个前端唯一允许读取 wall clock / 随机熵的地方。
 */
// 样式由 Vite 打包注入；TypeScript 侧不需要对应模块声明。
import "./ui/style.css";
import { ACHIEVEMENTS, ENDINGS, EVENTS, TIERS } from "./content";
import type { Lang } from "./content/i18n";
import { Engine, loadSave, mulberry32, randomSeed } from "./engine";
import type { SaveData } from "./engine";
import { createApp } from "./ui/app";
import { AudioBus } from "./ui/audio";
import { BigButton } from "./ui/button";
import { Effects, prefersReducedMotion } from "./ui/effects";
import { Gallery } from "./ui/gallery";
import { Hud } from "./ui/hud";

const LANG_KEY = "buttonco.lang.v1";
const REDUCED_KEY = "buttonco.reduced-motion.v1";

/** localStorage 在隐私模式 / 沙箱 iframe 里可能直接抛，全部吞掉。 */
function safeStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readLang(storage: Storage | null): Lang {
  try {
    return storage?.getItem(LANG_KEY) === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

function writeFlag(storage: Storage | null, key: string, value: string): void {
  try {
    storage?.setItem(key, value);
  } catch {
    // 写不进去不影响游戏。
  }
}

function readReducedPreference(storage: Storage | null): boolean {
  let stored = false;
  try {
    stored = storage?.getItem(REDUCED_KEY) === "1";
  } catch {
    stored = false;
  }
  return stored || prefersReducedMotion();
}

function node<K extends keyof HTMLElementTagNameMap>(
  doc: Document,
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const element = doc.createElement(tag);
  if (className) element.className = className;
  return element;
}

function boot(): void {
  const doc = document;
  const appRoot = doc.getElementById("app");
  if (!appRoot) return;
  const root: HTMLElement = appRoot;

  const storage = safeStorage();
  let lang = readLang(storage);
  let reducedMotion = readReducedPreference(storage);
  let app: { press(): void; destroy(): void } | null = null;

  function start(): void {
    app?.destroy();
    app = null;
    root.replaceChildren();
    doc.documentElement.classList.toggle("fx-reduced", reducedMotion);

    const save: SaveData | null = loadSave(storage);
    const seed = randomSeed();
    const engine = new Engine({
      seed,
      startedAt: Date.now(),
      rng: mulberry32(seed),
      events: EVENTS,
      tiers: TIERS,
      endings: ENDINGS,
      achievements: ACHIEVEMENTS,
      save,
    });

    const hudSlot = node(doc, "div", "hud-slot");
    const stage = node(doc, "main", "stage");
    root.append(hudSlot, stage);

    const audio = new AudioBus();
    audio.setMuted(save?.muted === true);

    const effects = new Effects({ root, reducedMotion });
    const hud = new Hud(hudSlot);
    const gallery = new Gallery({
      root,
      achievements: ACHIEVEMENTS,
      endings: ENDINGS,
      unlockedAchievements: engine.state.unlockedAchievements,
      unlockedEndings: engine.state.unlockedEndings,
      lang: () => lang,
    });

    let pressFn: () => void = () => undefined;
    const button = new BigButton({
      root: stage,
      label: "PRESS",
      onPress: () => pressFn(),
    });
    stage.appendChild(node(doc, "p", "button-stage__hint"));

    const instance = createApp({
      engine,
      audio,
      effects,
      hud,
      gallery,
      button,
      lang: () => lang,
      onLanguageChange: (next) => {
        lang = next;
        writeFlag(storage, LANG_KEY, next);
      },
      storage,
    });
    pressFn = () => instance.press();
    app = instance;

    if (reducedMotion) effects.setReducedMotion(true);
  }

  // 重开 / 重置存档由 app.ts 通过自定义事件上报，装配逻辑留在 main.ts。
  doc.addEventListener("buttonco:restart", () => {
    start();
  });
  doc.addEventListener("buttonco:motion", (event) => {
    const detail = (event as CustomEvent<{ reduced: boolean }>).detail;
    reducedMotion = detail?.reduced === true;
    writeFlag(storage, REDUCED_KEY, reducedMotion ? "1" : "0");
    doc.documentElement.classList.toggle("fx-reduced", reducedMotion);
  });

  start();
}

boot();
