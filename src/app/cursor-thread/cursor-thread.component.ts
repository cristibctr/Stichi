import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SettingsService } from '../services/settings.service';

interface Point {
  x: number;
  y: number;
  oldx: number;
  oldy: number;
}

@Component({
  selector: 'app-cursor-thread',
  template: `<canvas #cv class="pointer-events-none fixed inset-0 z-[60]"></canvas>`
})
export class CursorThreadComponent implements OnInit, OnDestroy {
  @ViewChild('cv', { static: true }) cv!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private points: Point[] = [];
  private raf = 0;
  private readonly reduce: boolean;

  private readonly mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  private readonly segment = 12;
  private readonly snag = { x: 0, y: 0, until: 0 };

  private resize = () => {
    const c = this.cv.nativeElement;
    c.width = innerWidth;
    c.height = innerHeight;
  };

  private pointer = (e: PointerEvent) => {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  };

  constructor(private settings: SettingsService) {
    this.reduce = this.settings.prefersReducedMotion();
  }

  ngOnInit(): void {
    const c = this.cv.nativeElement;
    this.ctx = c.getContext('2d');
    addEventListener('resize', this.resize);
    this.resize();
    addEventListener('pointermove', this.pointer);
    this.initPoints();
    addEventListener('pointerenter', this.onEnter, true);
    this.animate();
  }

  private initPoints() {
    this.points = [];
    for (let i = 0; i < 20; i++) {
      this.points.push({ x: this.mouse.x, y: this.mouse.y, oldx: this.mouse.x, oldy: this.mouse.y });
    }
  }

  private onEnter = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target || !target.matches('a,button,[role=button]')) return;
    const rect = target.getBoundingClientRect();
    let x = Math.max(rect.left, Math.min(this.mouse.x, rect.right));
    let y = Math.max(rect.top, Math.min(this.mouse.y, rect.bottom));
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const nx = x - cx;
    const ny = y - cy;
    const len = Math.sqrt(nx * nx + ny * ny) || 1;
    x += (nx / len) * 10;
    y += (ny / len) * 10;
    this.snag.x = x;
    this.snag.y = y;
    this.snag.until = performance.now() + 250;
  };

  private animate = () => {
    this.update();
    this.draw();
    this.raf = requestAnimationFrame(this.animate);
  };

  private update() {
    const head = this.points[0];
    head.x = this.mouse.x;
    head.y = this.mouse.y;

    for (let i = 1; i < this.points.length; i++) {
      const p = this.points[i];
      const vx = p.x - p.oldx;
      const vy = p.y - p.oldy;
      p.oldx = p.x;
      p.oldy = p.y;
      p.x += vx * (this.reduce ? 0.5 : 0.95);
      p.y += vy * (this.reduce ? 0.5 : 0.95);
    }

    const iter = this.reduce ? 1 : 5;
    for (let k = 0; k < iter; k++) {
      for (let i = 0; i < this.points.length - 1; i++) {
        const p1 = this.points[i];
        const p2 = this.points[i + 1];
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const diff = this.segment - dist;
        const offsetX = (dx / dist) * diff * 0.5;
        const offsetY = (dy / dist) * diff * 0.5;
        if (i !== 0) {
          p1.x -= offsetX;
          p1.y -= offsetY;
        }
        p2.x += offsetX;
        p2.y += offsetY;
      }
      if (this.snag.until > performance.now()) {
        const tail = this.points[this.points.length - 1];
        tail.x = this.snag.x;
        tail.y = this.snag.y;
        tail.oldx = tail.x;
        tail.oldy = tail.y;
      }
    }
  }

  private draw() {
    if (!this.ctx) return;
    const c = this.cv.nativeElement;
    this.ctx.clearRect(0, 0, c.width, c.height);
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'rgba(229,152,155,.9)';
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      const p = this.points[i];
      this.ctx.lineTo(p.x, p.y);
    }
    this.ctx.stroke();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    removeEventListener('pointerenter', this.onEnter, true);
    removeEventListener('resize', this.resize);
    removeEventListener('pointermove', this.pointer);
  }
}
