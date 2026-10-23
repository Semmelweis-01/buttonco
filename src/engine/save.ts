/**
 * 存档：localStorage JSON，版本号 + 坏档容错。
 * 本模块只接受 Storage 接口参数，绝不直接引用 localStorage / DOM。
 */
import type { GameState, SaveData } from "./types";

export const SAVE_KEY = "buttonco.save.v1";
export const SAVE_VERSION = 1 as const;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** 把当前状态压成可持久化的存档。 */
export function serializeSave(state: GameState): SaveData {
  return {
    version: SAVE_VERSION,
    totalPresses: state.totalPresses,
    unlockedEndings: [...state.unlockedEndings],
    unlockedAchievements: [...state.unlockedAchievements],
    muted: state.muted,
    seed: state.seed,
  };
}

/** 解析存档；坏 JSON / 版本不符 / 字段类型错 -> null，绝不抛异常。 */
export function parseSave(raw: string | null): SaveData | null {
  if (typeof raw !== "string" || raw.length === 0) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;

  const record = parsed as Record<string, unknown>;
  if (record.version !== SAVE_VERSION) return null;
  if (!isFiniteNumber(record.totalPresses) || record.totalPresses < 0) return null;
  if (!isStringArray(record.unlockedEndings)) return null;
  if (!isStringArray(record.unlockedAchievements)) return null;
  if (typeof record.muted !== "boolean") return null;
  if (!isFiniteNumber(record.seed)) return null;

  return {
    version: SAVE_VERSION,
    totalPresses: Math.round(record.totalPresses),
    unlockedEndings: [...record.unlockedEndings],
    unlockedAchievements: [...record.unlockedAchievements],
    muted: record.muted,
    seed: record.seed >>> 0,
  };
}

/** 读存档；storage 为 null 或读取失败 -> null。 */
export function loadSave(storage: Storage | null): SaveData | null {
  if (!storage) return null;
  let raw: string | null;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
  return parseSave(raw);
}

/** 写存档；storage 为 null 或写入失败（配额/隐私模式）-> false，绝不抛异常。 */
export function writeSave(storage: Storage | null, state: GameState): boolean {
  if (!storage) return false;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(serializeSave(state)));
    return true;
  } catch {
    return false;
  }
}
