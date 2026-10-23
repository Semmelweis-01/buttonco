import type {
  AchievementDef,
  EndingDef,
  GameEventDef,
  TierDef,
} from "../../engine/types";
import {
  EN_ACHIEVEMENTS,
  EN_ENDINGS,
  EN_EVENTS,
  EN_TIERS,
} from "./en";
import type {
  LocalizedAchievementText,
  LocalizedEndingText,
  LocalizedEventText,
  LocalizedTierText,
} from "./en";

export type {
  LocalizedAchievementText,
  LocalizedEndingText,
  LocalizedEventText,
  LocalizedTierText,
};

/** Supported display languages. */
export type Lang = "zh" | "en";

/**
 * Shared lookup. A missing English entry falls back to the Chinese original
 * and, if that is empty too, to the supplied fallback so callers never receive
 * an empty `text`.
 */
function pick(
  lang: Lang,
  english: string | undefined,
  chinese: string | undefined,
  fallback: string,
): string {
  if (lang === "en") {
    const en = english?.trim();
    if (en) return en;
  }
  const zh = chinese?.trim();
  if (zh) return zh;
  const en = english?.trim();
  if (en) return en;
  return fallback;
}

function pickOptional(
  lang: Lang,
  english: string | undefined,
  chinese: string | undefined,
): string | undefined {
  if (lang === "en") {
    const en = english?.trim();
    if (en) return en;
  }
  const zh = chinese?.trim();
  return zh ? zh : undefined;
}

/** Localize a single event card. */
export function localizeEvent(lang: Lang, def: GameEventDef): LocalizedEventText {
  const en = EN_EVENTS[def.id];
  const out: LocalizedEventText = {
    text: pick(lang, en?.text, def.text, def.id),
  };
  const sub = pickOptional(lang, en?.sub, def.sub);
  if (sub !== undefined) out.sub = sub;
  return out;
}

/** Localize a tier row. */
export function localizeTier(lang: Lang, def: TierDef): LocalizedTierText {
  const en = EN_TIERS[def.id];
  return {
    name: pick(lang, en?.name, def.name, def.id),
    headline: pick(lang, en?.headline, def.headline, def.id),
    subline: pick(lang, en?.subline, def.subline, def.id),
  };
}

/** Localize an ending. */
export function localizeEnding(lang: Lang, def: EndingDef): LocalizedEndingText {
  const en = EN_ENDINGS[def.id];
  return {
    title: pick(lang, en?.title, def.title, def.id),
    blurb: pick(lang, en?.blurb, def.blurb, def.id),
  };
}

/** Localize an achievement. */
export function localizeAchievement(
  lang: Lang,
  def: AchievementDef,
): LocalizedAchievementText {
  const en = EN_ACHIEVEMENTS[def.id];
  return {
    title: pick(lang, en?.title, def.title, def.id),
    hint: pick(lang, en?.hint, def.hint, def.id),
  };
}
