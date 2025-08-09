import { Injectable, NgZone } from '@angular/core';
import Lenis from 'lenis';

@Injectable({ providedIn: 'root' })
export class LenisService {
  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor(private zone: NgZone) {
    if (typeof window === 'undefined') return;

    this.zone.runOutsideAngular(() => {
      this.lenis = new Lenis({
        smoothWheel: true,
        lerp: 0.1
      });
      // ensure Lenis is running and drive it via rAF
      this.lenis.start();
      const raf = (time: number) => {
        this.lenis?.raf(time);
        this.rafId = requestAnimationFrame(raf);
      };
      this.rafId = requestAnimationFrame(raf);
    });
  }

  get instance(): Lenis | null {
    return this.lenis;
  }

  stop() {
    this.zone.runOutsideAngular(() => {
      this.lenis?.stop();
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    });
  }
}

