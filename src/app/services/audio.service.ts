import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

type SfxName = 'ping' | 'snip' | 'pull';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx?: AudioContext;
  private gain?: GainNode;
  private buffers = new Map<SfxName, AudioBuffer>();
  private readonly gainLevel: number;

  constructor(private settings: SettingsService) {
    this.gainLevel = this.settings.prefersReducedMotion() ? 0.5 : 1;
  }

  private async load(name: SfxName): Promise<AudioBuffer | undefined> {
    if (!this.ctx) return undefined;
    if (this.buffers.has(name)) return this.buffers.get(name);
    try {
      const res = await fetch(`assets/sfx/${name}.wav`);
      const arr = await res.arrayBuffer();
      const buf = await this.ctx.decodeAudioData(arr);
      this.buffers.set(name, buf);
      return buf;
    } catch {
      return undefined;
    }
  }

  async play(name: SfxName) {
    if (this.settings.value.mute) return;
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = this.gainLevel;
      this.gain.connect(this.ctx.destination);
    }
    await this.ctx.resume();
    const buffer = await this.load(name);
    if (!buffer || !this.ctx || !this.gain) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.gain);
    src.start();
  }
}
