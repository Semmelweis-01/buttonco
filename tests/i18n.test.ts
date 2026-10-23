import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS, ENDINGS, EVENTS, TIERS } from "../src/content/index";
import {
  EN_ACHIEVEMENTS,
  EN_ENDINGS,
  EN_EVENTS,
  EN_TIERS,
} from "../src/content/i18n/en";
import {
  localizeAchievement,
  localizeEnding,
  localizeEvent,
  localizeTier,
} from "../src/content/i18n/index";
import type {
  AchievementDef,
  EndingDef,
  GameEventDef,
  TierDef,
} from "../src/engine/types";

const CJK = /[\u4e00-\u9fff]/;
const EVENT_TEXT_MAX = 120;
const EVENT_SUB_MAX = 90;
const TIER_FIELD_MAX = 120;
const ENDING_TITLE_MAX = 40;
const ENDING_BLURB_MAX = 120;
const ACH_TITLE_MAX = 40;
const ACH_HINT_MAX = 120;

const ids = (list: readonly { id: string }[]): string[] => list.map((d) => d.id);

const expectNoCjk = (label: string, value: string): void => {
  expect(CJK.test(value), label + " contains CJK: " + value).toBe(false);
};

describe("EN_EVENTS coverage", () => {
  it("has an entry for every event id, one by one", () => {
    for (const def of EVENTS) {
      const entry = EN_EVENTS[def.id];
      expect(entry, "missing EN_EVENTS entry for " + def.id).toBeDefined();
    }
  });

  it("has no entries for ids outside the deck", () => {
    const known = new Set(ids(EVENTS));
    for (const key of Object.keys(EN_EVENTS)) {
      expect(known.has(key), "stray EN_EVENTS id " + key).toBe(true);
    }
  });

  it("is exactly the same size as the deck", () => {
    expect(Object.keys(EN_EVENTS)).toHaveLength(EVENTS.length);
    expect(EVENTS.length).toBe(92);
  });

  it("has non-empty, CJK-free, length-capped text for every card", () => {
    for (const def of EVENTS) {
      const entry = EN_EVENTS[def.id];
      expect(entry).toBeDefined();
      if (!entry) continue;
      expect(entry.text.trim().length, def.id + " empty text").toBeGreaterThan(0);
      expectNoCjk(def.id + ".text", entry.text);
      expect(entry.text.length, def.id + " text too long").toBeLessThanOrEqual(
        EVENT_TEXT_MAX,
      );
      if (entry.sub !== undefined) {
        expect(entry.sub.trim().length, def.id + " empty sub").toBeGreaterThan(0);
        expectNoCjk(def.id + ".sub", entry.sub);
        expect(entry.sub.length, def.id + " sub too long").toBeLessThanOrEqual(
          EVENT_SUB_MAX,
        );
      }
    }
  });
});

describe("EN_TIERS coverage", () => {
  it("has an entry for every tier id, one by one", () => {
    for (const def of TIERS) {
      expect(EN_TIERS[def.id], "missing EN_TIERS entry for " + def.id).toBeDefined();
    }
  });

  it("is exactly the same size as the tier list", () => {
    expect(Object.keys(EN_TIERS)).toHaveLength(TIERS.length);
    expect(TIERS.length).toBe(5);
  });

  it("has non-empty, CJK-free, length-capped fields", () => {
    for (const def of TIERS) {
      const entry = EN_TIERS[def.id];
      expect(entry).toBeDefined();
      if (!entry) continue;
      for (const [field, value] of Object.entries(entry)) {
        expect(value.trim().length, def.id + "." + field).toBeGreaterThan(0);
        expectNoCjk(def.id + "." + field, value);
        expect(value.length, def.id + "." + field + " too long").toBeLessThanOrEqual(
          TIER_FIELD_MAX,
        );
      }
    }
  });

  it("keeps the escalation wording", () => {
    expect(EN_TIERS["tier-calm"]?.name).toContain("Polite");
    expect(EN_TIERS["tier-paper"]?.name).toContain("Procedural");
    expect(EN_TIERS["tier-panic"]?.name).toContain("Departmental Unrest");
    expect(EN_TIERS["tier-cosmic"]?.name).toContain("Cosmic Settlement");
    expect(EN_TIERS["tier-void"]?.name).toContain("Nothing Left To Say");
  });
});

describe("EN_ENDINGS coverage", () => {
  it("has an entry for every ending id, one by one", () => {
    for (const def of ENDINGS) {
      expect(EN_ENDINGS[def.id], "missing EN_ENDINGS entry for " + def.id).toBeDefined();
    }
  });

  it("is exactly the same size as the ending pool", () => {
    expect(Object.keys(EN_ENDINGS)).toHaveLength(ENDINGS.length);
    expect(ENDINGS.length).toBe(10);
  });

  it("has non-empty, CJK-free, length-capped fields", () => {
    for (const def of ENDINGS) {
      const entry = EN_ENDINGS[def.id];
      expect(entry).toBeDefined();
      if (!entry) continue;
      expect(entry.title.trim().length, def.id + " empty title").toBeGreaterThan(0);
      expectNoCjk(def.id + ".title", entry.title);
      expect(entry.title.length).toBeLessThanOrEqual(ENDING_TITLE_MAX);
      expect(entry.title.split(/\s+/).length, def.id + " title word count")
        .toBeLessThanOrEqual(4);
      expect(entry.blurb.trim().length, def.id + " empty blurb").toBeGreaterThan(0);
      expectNoCjk(def.id + ".blurb", entry.blurb);
      expect(entry.blurb.length).toBeLessThanOrEqual(ENDING_BLURB_MAX);
    }
  });
});

describe("EN_ACHIEVEMENTS coverage", () => {
  it("has an entry for every achievement id, one by one", () => {
    for (const def of ACHIEVEMENTS) {
      expect(
        EN_ACHIEVEMENTS[def.id],
        "missing EN_ACHIEVEMENTS entry for " + def.id,
      ).toBeDefined();
    }
  });

  it("is exactly the same size as the achievement wall", () => {
    expect(Object.keys(EN_ACHIEVEMENTS)).toHaveLength(ACHIEVEMENTS.length);
    expect(ACHIEVEMENTS.length).toBe(14);
  });

  it("has non-empty, CJK-free, length-capped fields", () => {
    for (const def of ACHIEVEMENTS) {
      const entry = EN_ACHIEVEMENTS[def.id];
      expect(entry).toBeDefined();
      if (!entry) continue;
      expect(entry.title.trim().length, def.id + " empty title").toBeGreaterThan(0);
      expectNoCjk(def.id + ".title", entry.title);
      expect(entry.title.length).toBeLessThanOrEqual(ACH_TITLE_MAX);
      expect(entry.hint.trim().length, def.id + " empty hint").toBeGreaterThan(0);
      expectNoCjk(def.id + ".hint", entry.hint);
      expect(entry.hint.length).toBeLessThanOrEqual(ACH_HINT_MAX);
    }
  });
});

describe("localizeEvent", () => {
  it("returns the Chinese original for zh", () => {
    for (const def of EVENTS) {
      const out = localizeEvent("zh", def);
      expect(out.text).toBe(def.text);
      expect(out.sub).toBe(def.sub);
    }
  });

  it("returns English for en", () => {
    for (const def of EVENTS) {
      const out = localizeEvent("en", def);
      expect(out.text).toBe(EN_EVENTS[def.id]?.text);
      expect(out.text.length).toBeGreaterThan(0);
      expectNoCjk(def.id, out.text);
      if (EN_EVENTS[def.id]?.sub !== undefined) {
        expect(out.sub).toBe(EN_EVENTS[def.id]?.sub);
      }
    }
  });

  it("falls back to Chinese for an unknown id", () => {
    const def: GameEventDef = { id: "no-such-card", text: "中文兜底", sub: "中文副文案" };
    const zh = localizeEvent("zh", def);
    expect(zh.text).toBe("中文兜底");
    expect(zh.sub).toBe("中文副文案");
    const en = localizeEvent("en", def);
    expect(en.text).toBe("中文兜底");
    expect(en.sub).toBe("中文副文案");
  });

  it("never returns an empty text even when the source is empty", () => {
    const def: GameEventDef = { id: "empty-card", text: "" };
    const en = localizeEvent("en", def);
    expect(typeof en.text).toBe("string");
    expect(en.text.trim().length).toBeGreaterThan(0);
    expect(en.sub).toBeUndefined();
  });
});

describe("localizeTier", () => {
  it("returns the Chinese original for zh", () => {
    for (const def of TIERS) {
      const out = localizeTier("zh", def);
      expect(out.name).toBe(def.name);
      expect(out.headline).toBe(def.headline);
      expect(out.subline).toBe(def.subline);
    }
  });

  it("returns English for en", () => {
    for (const def of TIERS) {
      const out = localizeTier("en", def);
      expect(out.name).toBe(EN_TIERS[def.id]?.name);
      expect(out.headline).toBe(EN_TIERS[def.id]?.headline);
      expect(out.subline).toBe(EN_TIERS[def.id]?.subline);
      expectNoCjk(def.id, out.name + out.headline + out.subline);
    }
  });

  it("falls back for an unknown id", () => {
    const def: TierDef = {
      id: "tier-unknown",
      name: "未知档",
      minPresses: 999,
      headline: "中文标题",
      subline: "中文副标题",
      noise: 0,
    };
    expect(localizeTier("en", def)).toEqual({
      name: "未知档",
      headline: "中文标题",
      subline: "中文副标题",
    });
  });
});

describe("localizeEnding", () => {
  it("returns the Chinese original for zh", () => {
    for (const def of ENDINGS) {
      const out = localizeEnding("zh", def);
      expect(out.title).toBe(def.title);
      expect(out.blurb).toBe(def.blurb);
    }
  });

  it("returns English for en", () => {
    for (const def of ENDINGS) {
      const out = localizeEnding("en", def);
      expect(out.title).toBe(EN_ENDINGS[def.id]?.title);
      expect(out.blurb).toBe(EN_ENDINGS[def.id]?.blurb);
      expectNoCjk(def.id, out.title + out.blurb);
    }
  });

  it("falls back for an unknown id", () => {
    const def: EndingDef = {
      id: "ending-unknown",
      title: "未知结局",
      blurb: "中文结局文案",
      rarity: "common",
      condition: () => false,
    };
    expect(localizeEnding("en", def)).toEqual({
      title: "未知结局",
      blurb: "中文结局文案",
    });
  });
});

describe("localizeAchievement", () => {
  it("returns the Chinese original for zh", () => {
    for (const def of ACHIEVEMENTS) {
      const out = localizeAchievement("zh", def);
      expect(out.title).toBe(def.title);
      expect(out.hint).toBe(def.hint);
    }
  });

  it("returns English for en", () => {
    for (const def of ACHIEVEMENTS) {
      const out = localizeAchievement("en", def);
      expect(out.title).toBe(EN_ACHIEVEMENTS[def.id]?.title);
      expect(out.hint).toBe(EN_ACHIEVEMENTS[def.id]?.hint);
      expectNoCjk(def.id, out.title + out.hint);
    }
  });

  it("falls back for an unknown id", () => {
    const def: AchievementDef = {
      id: "ach-unknown",
      title: "未知成就",
      hint: "中文提示",
      condition: () => false,
    };
    expect(localizeAchievement("en", def)).toEqual({
      title: "未知成就",
      hint: "中文提示",
    });
  });
});
