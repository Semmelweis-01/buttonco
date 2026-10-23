/**
 * 确定性随机数生成器（mulberry32）。
 * 引擎不得使用 Math.random / Date.now；所有随机性都来自这里。
 */
import type { Rng } from "./types";

/** randomSeed 的兜底熵计数器（模块级，仅在没有 Web Crypto 时使用）。 */
let seedCounter = 0x2545f491;

/** 生成 [0,1) 的确定性随机数生成器；同一 seed 永远给出同一序列。 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 生成一个新的 seed（供"新开一局"使用）。
 * 这是整个引擎里唯一允许读取外部熵的地方，Engine 本身永不调用它。
 */
export function randomSeed(): number {
  const host = globalThis as {
    crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array };
    performance?: { now: () => number };
  };
  if (host.crypto && typeof host.crypto.getRandomValues === "function") {
    return host.crypto.getRandomValues(new Uint32Array(1))[0] >>> 0;
  }
  // 兜底：没有 Web Crypto 的宿主，用单调时钟 + 自增计数器搅出熵。
  // 注意这里读的是"环境熵"，不是游戏时间；引擎本身永远不调用 randomSeed。
  seedCounter = (seedCounter + 0x9e3779b9) >>> 0;
  const ticks = host.performance ? Math.floor(host.performance.now() * 1000) : 0;
  let mixed = (seedCounter ^ (ticks >>> 0)) >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x85ebca6b) >>> 0;
  return (mixed ^ (mixed >>> 13)) >>> 0;
}
