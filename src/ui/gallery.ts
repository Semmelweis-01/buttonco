/**
 * 成就 / 结局画廊：侧边抽屉。
 * 未解锁显示锁定态与 hint；secret 未解锁时只显示 ???。
 */
import { localizeAchievement, localizeEnding } from "../content/i18n";
import type { Lang } from "../content/i18n";
import type { AchievementDef, EndingDef } from "../engine";

export interface GalleryOptions {
  root: HTMLElement;
  achievements: AchievementDef[];
  endings: EndingDef[];
  unlockedAchievements: string[];
  unlockedEndings: string[];
  lang: () => Lang;
}

export class Gallery {
  private readonly achievements: AchievementDef[];
  private readonly endings: EndingDef[];
  private readonly lang: () => Lang;
  private readonly drawer: HTMLElement;
  private readonly achList: HTMLElement;
  private readonly endingList: HTMLElement;
  private readonly achCount: HTMLElement;
  private readonly endingCount: HTMLElement;
  private unlockedAchievements: string[];
  private unlockedEndings: string[];
  private openState = false;

  constructor(opts: GalleryOptions) {
    this.achievements = [...opts.achievements];
    this.endings = [...opts.endings];
    this.lang = opts.lang;
    this.unlockedAchievements = [...opts.unlockedAchievements];
    this.unlockedEndings = [...opts.unlockedEndings];

    const doc = opts.root.ownerDocument;
    const drawerRoot = doc.createElement("div");
    drawerRoot.className = "gallery";
    drawerRoot.setAttribute("aria-hidden", "true");

    const scrim = doc.createElement("div");
    scrim.className = "gallery__scrim";

    const drawer = doc.createElement("aside");
    drawer.className = "gallery__drawer";
    drawer.setAttribute("role", "dialog");

    const head = doc.createElement("div");
    head.className = "gallery__head";
    const title = doc.createElement("h2");
    title.className = "gallery__title";
    title.textContent = "ACHIEVEMENTS & ENDINGS";
    const closeBtn = doc.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "gallery__close";
    closeBtn.textContent = "CLOSE";
    head.append(title, closeBtn);

    const body = doc.createElement("div");
    body.className = "gallery__body";

    const achSection = doc.createElement("section");
    achSection.className = "gallery__section";
    const achHead = doc.createElement("div");
    achHead.className = "gallery__section-head";
    const achTitle = doc.createElement("h3");
    achTitle.className = "gallery__section-title";
    achTitle.textContent = "ACHIEVEMENTS";
    const achCount = doc.createElement("span");
    achCount.className = "gallery__count";
    achHead.append(achTitle, achCount);
    const achList = doc.createElement("ul");
    achList.className = "gallery__list";
    achSection.append(achHead, achList);

    const endingSection = doc.createElement("section");
    endingSection.className = "gallery__section";
    const endingHead = doc.createElement("div");
    endingHead.className = "gallery__section-head";
    const endingTitle = doc.createElement("h3");
    endingTitle.className = "gallery__section-title";
    endingTitle.textContent = "ENDINGS";
    const endingCount = doc.createElement("span");
    endingCount.className = "gallery__count";
    endingHead.append(endingTitle, endingCount);
    const endingList = doc.createElement("ul");
    endingList.className = "gallery__list";
    endingSection.append(endingHead, endingList);

    body.append(achSection, endingSection);
    drawer.append(head, body);
    drawerRoot.append(scrim, drawer);
    opts.root.appendChild(drawerRoot);

    this.drawer = drawerRoot;
    this.achList = achList;
    this.endingList = endingList;
    this.achCount = achCount;
    this.endingCount = endingCount;

    closeBtn.addEventListener("click", this.handleClose);
    scrim.addEventListener("click", this.handleClose);

    this.renderLists();
  }

  open(): void {
    this.openState = true;
    this.drawer.classList.add("is-open");
    this.drawer.setAttribute("aria-hidden", "false");
  }

  close(): void {
    this.openState = false;
    this.drawer.classList.remove("is-open");
    this.drawer.setAttribute("aria-hidden", "true");
  }

  isOpen(): boolean {
    return this.openState;
  }

  refresh(unlockedAchievements: string[], unlockedEndings: string[]): void {
    this.unlockedAchievements = [...unlockedAchievements];
    this.unlockedEndings = [...unlockedEndings];
    this.renderLists();
  }

  private readonly handleClose = (): void => {
    this.close();
  };

  private renderLists(): void {
    const lang = this.lang();
    const achSet = new Set(this.unlockedAchievements);
    const endingSet = new Set(this.unlockedEndings);

    const achFrag = this.achList.ownerDocument.createDocumentFragment();
    let achUnlocked = 0;
    for (const def of this.achievements) {
      const unlocked = achSet.has(def.id);
      if (unlocked) achUnlocked += 1;
      const text = localizeAchievement(lang, def);
      const hidden = def.secret === true && !unlocked;
      achFrag.appendChild(
        this.buildItem({
          title: hidden ? "???" : text.title,
          hint: hidden ? "Locked · 未解锁" : text.hint,
          badge: unlocked ? "unlocked" : "locked",
          unlocked,
          secret: def.secret === true,
        }),
      );
    }
    this.achList.replaceChildren(achFrag);
    this.achCount.textContent = `${achUnlocked}/${this.achievements.length}`;

    const endingFrag = this.endingList.ownerDocument.createDocumentFragment();
    let endingUnlocked = 0;
    for (const def of this.endings) {
      const unlocked = endingSet.has(def.id);
      if (unlocked) endingUnlocked += 1;
      const text = localizeEnding(lang, def);
      const hidden = def.rarity === "secret" && !unlocked;
      endingFrag.appendChild(
        this.buildItem({
          title: hidden ? "???" : text.title,
          hint: hidden ? "Secret · 隐藏结局" : text.blurb,
          badge: unlocked ? "seen" : def.rarity,
          unlocked,
          secret: def.rarity === "secret",
        }),
      );
    }
    this.endingList.replaceChildren(endingFrag);
    this.endingCount.textContent = `${endingUnlocked}/${this.endings.length}`;
  }

  private buildItem(item: {
    title: string;
    hint: string;
    badge: string;
    unlocked: boolean;
    secret: boolean;
  }): HTMLElement {
    const doc = this.achList.ownerDocument;
    const li = doc.createElement("li");
    li.className = "gallery__item";
    li.classList.toggle("is-unlocked", item.unlocked);
    li.classList.toggle("is-locked", !item.unlocked);
    li.classList.toggle("is-secret", item.secret);

    const top = doc.createElement("div");
    top.className = "gallery__item-top";
    const title = doc.createElement("span");
    title.className = "gallery__item-title";
    title.textContent = item.title;
    const badge = doc.createElement("span");
    badge.className = "gallery__badge";
    badge.textContent = item.badge;
    top.append(title, badge);

    const hint = doc.createElement("p");
    hint.className = "gallery__item-hint";
    hint.textContent = item.hint;

    li.append(top, hint);
    return li;
  }
}
