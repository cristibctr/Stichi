import { Injectable, NgZone } from '@angular/core';
import Lenis from 'lenis';

@Injectable({ providedIn: 'root' })
export class LenisService {
  private lenis: Lenis | null = null;

  constructor(private zone: NgZone) {
    if (typeof window === 'undefined') return;

    this.zone.runOutsideAngular(() => {
      this.lenis = new Lenis({
        smoothWheel: true,
        lerp: 0.1
      });
      const raf = (time: number) => {
        this.lenis?.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    });
  }

  get instance(): Lenis | null {
    return this.lenis;
  }
}

