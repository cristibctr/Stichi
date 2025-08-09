import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { JourneyService } from '../services/journey.service';

interface Spool {
  hue: number;
  angle: number;
}

@Component({
  selector: 'app-palette-spools',
  templateUrl: './palette-spools.component.html',
  styleUrls: ['./palette-spools.component.css']
})
export class PaletteSpoolsComponent implements AfterViewInit {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;
  @Output() select = new EventEmitter<string>();

  spools: Spool[] = [
    { hue: 0, angle: 0 },
    { hue: 120, angle: 0 },
    { hue: 240, angle: 0 }
  ];

  reduce = false;
  private active?: Spool;
  private startX = 0;

  constructor(private settings: SettingsService, private journey: JourneyService) {}

  ngAfterViewInit(): void {
    this.journey.registerSection(this.host.nativeElement);
    this.reduce = this.settings.prefersReducedMotion();
  }

  onPointerDown(sp: Spool, e: PointerEvent) {
    this.active = sp;
    this.startX = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  onPointerMove(e: PointerEvent) {
    if (!this.active) return;
    const delta = e.clientX - this.startX;
    this.active.angle = this.reduce ? delta * 0.2 : delta;
  }

  onPointerUp(e: PointerEvent) {
    if (!this.active) return;
    const hue = (this.active.hue + this.active.angle) % 360;
    const hex = this.hslToHex(hue, 70, 50);
    this.select.emit(hex);
    this.active.angle = 0;
    this.active = undefined;
  }

  getGradient(hue: number) {
    return `linear-gradient(90deg, hsl(${hue},70%,50%), hsl(${(hue + 60) % 360},70%,50%))`;
  }

  private hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;
    let r: number, g: number, b: number;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
