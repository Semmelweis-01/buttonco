/**
 * 合成音效总线。零素材文件：所有声音都由 Web Audio 现场合成。
 * 宿主没有 window / AudioContext 时（Node 测试环境）全部方法静默且绝不抛异常。
 */

type AudioContextCtor = new () => AudioContext;

interface AudioHost {
  AudioContext?: AudioContextCtor;
  webkitAudioContext?: AudioContextCtor;
}

function resolveCtor(): AudioContextCtor | null {
  const host = globalThis as unknown as AudioHost;
  const ctor = host.AudioContext ?? host.webkitAudioContext;
  return typeof ctor === "function" ? ctor : null;
}

export class AudioBus {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private mutedFlag = false;

  constructor() {
    // 故意不在构造函数里创建 AudioContext：浏览器只允许在用户手势内创建/恢复。
  }

  /** 必须在用户手势内首次调用，否则浏览器会挂起音频上下文。 */
  unlock(): void {
    this.guard(() => {
      const ctx = this.ensureContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        const resumed = ctx.resume();
        if (resumed && typeof resumed.catch === "function") {
          resumed.catch(() => undefined);
        }
      }
    });
  }

  setMuted(muted: boolean): void {
    this.mutedFlag = muted;
    this.guard(() => {
      if (this.master && this.ctx) {
        this.master.gain.setTargetAtTime(muted ? 0 : 0.5, this.ctx.currentTime, 0.02);
      }
    });
  }

  get muted(): boolean {
    return this.mutedFlag;
  }

  /** 按下音：音高随 presses 递增升高，超过 60 次开始跑调。 */
  press(presses: number): void {
    this.guard(() => {
      const ctx = this.playable();
      if (!ctx) return;
      const safe = Math.max(0, Math.round(presses));
      const semitones = Math.min(safe, 60) / 3.5;
      const base = 220 * Math.pow(2, semitones / 12);
      const detuneCents = safe > 60 ? Math.min(160, (safe - 60) * 9) : 0;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(base, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, base * 0.82), t + 0.09);
      osc.detune.setValueAtTime(detuneCents, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
      osc.connect(gain).connect(this.master as GainNode);
      osc.start(t);
      osc.stop(t + 0.19);
    });
  }

  /** 档位跃迁音：三音上行，越高档越亮。 */
  tierUp(tierIndex: number): void {
    this.guard(() => {
      const ctx = this.playable();
      if (!ctx) return;
      const index = Math.max(0, Math.round(tierIndex));
      const root = 196 * Math.pow(2, Math.min(index, 4) / 12);
      const t0 = ctx.currentTime;
      for (let i = 0; i < 3; i += 1) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const at = t0 + i * 0.075;
        osc.type = "sine";
        osc.frequency.setValueAtTime(root * Math.pow(2, (i * 4) / 12), at);
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.26, at + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.26);
        osc.connect(gain).connect(this.master as GainNode);
        osc.start(at);
        osc.stop(at + 0.28);
      }
    });
  }

  /** 结局音：一段下沉的滑音，两把振荡器错开五度。 */
  ending(): void {
    this.guard(() => {
      const ctx = this.playable();
      if (!ctx) return;
      const t = ctx.currentTime;
      const specs: Array<{ from: number; to: number; type: OscillatorType; level: number }> = [
        { from: 220, to: 55, type: "sawtooth", level: 0.18 },
        { from: 146.83, to: 36.7, type: "triangle", level: 0.22 },
      ];
      for (const spec of specs) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1800, t);
        filter.frequency.exponentialRampToValueAtTime(220, t + 1.5);
        osc.type = spec.type;
        osc.frequency.setValueAtTime(spec.from, t);
        osc.frequency.exponentialRampToValueAtTime(spec.to, t + 1.5);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(spec.level, t + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.7);
        osc.connect(filter).connect(gain).connect(this.master as GainNode);
        osc.start(t);
        osc.stop(t + 1.75);
      }
    });
  }

  /** 成就解锁音：两声清脆的铃。 */
  achievement(): void {
    this.guard(() => {
      const ctx = this.playable();
      if (!ctx) return;
      const t0 = ctx.currentTime;
      const notes = [880, 1318.5];
      for (let i = 0; i < notes.length; i += 1) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const at = t0 + i * 0.09;
        osc.type = "sine";
        osc.frequency.setValueAtTime(notes[i], at);
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.24, at + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.4);
        osc.connect(gain).connect(this.master as GainNode);
        osc.start(at);
        osc.stop(at + 0.42);
      }
    });
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = resolveCtor();
    if (!Ctor) return null;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = this.mutedFlag ? 0 : 0.5;
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    return ctx;
  }

  /** 只有在已经解锁、未静音且上下文可用时才发声。 */
  private playable(): AudioContext | null {
    if (this.mutedFlag) return null;
    const ctx = this.ctx;
    if (!ctx || !this.master) return null;
    if (ctx.state === "closed") return null;
    return ctx;
  }

  private guard(fn: () => void): void {
    try {
      fn();
    } catch {
      // 音频是装饰层：任何宿主差异都不允许影响游戏。
    }
  }
}
