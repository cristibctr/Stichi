import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-cursor-thread',
  template: `<canvas #cv class="pointer-events-none fixed inset-0 z-[60]"></canvas>`,
})
export class CursorThreadComponent implements OnInit, OnDestroy {
  @ViewChild('cv', { static: true }) cv!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private points: {x:number,y:number}[] = [];
  private raf = 0;

  ngOnInit(): void {
    const c = this.cv.nativeElement;
    this.ctx = c.getContext('2d');
    const resize = () => { c.width = innerWidth; c.height = innerHeight; };
    addEventListener('resize', resize); resize();
    addEventListener('pointermove', (e) => {
      this.points.push({ x: e.clientX, y: e.clientY });
      if (this.points.length > 60) this.points.shift();
    });
    const draw = () => {
      if (!this.ctx) return;
      this.ctx.clearRect(0,0,c.width,c.height);
      if (this.points.length > 1) {
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'rgba(229,152,155,.9)';
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i=1;i<this.points.length;i++) {
          const p = this.points[i];
          this.ctx.lineTo(p.x, p.y);
        }
        this.ctx.stroke();
      }
      this.raf = requestAnimationFrame(draw);
    };
    draw();
  }
  ngOnDestroy(): void { cancelAnimationFrame(this.raf); }
}
