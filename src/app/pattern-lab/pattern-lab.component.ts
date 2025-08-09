import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-pattern-lab',
  templateUrl: './pattern-lab.component.html',
  styleUrls: ['./pattern-lab.component.css']
})
export class PatternLabComponent implements OnInit {
  stitch = 'moss';
  gauge = 8; // base pixel size
  color = '#d53f8c';
  patternUrl = '';
  private canvas!: HTMLCanvasElement;

  constructor(private settings: SettingsService) {}

  ngOnInit(): void {
    const reduce = this.settings.prefersReducedMotion();
    // currently no animations but read once per conventions
    this.canvas = document.createElement('canvas');
    this.updatePattern();
  }

  updatePattern(): void {
    const size = this.gauge * 4;
    const ctx = this.canvas.getContext('2d')!;
    this.canvas.width = this.canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, size, size);

    switch (this.stitch) {
      case 'rib':
        ctx.fillStyle = this.shade(this.color, -20);
        for (let x = 0; x < size; x += this.gauge * 2) {
          ctx.fillRect(x, 0, this.gauge, size);
        }
        break;
      case 'cable':
        ctx.strokeStyle = this.shade(this.color, -30);
        ctx.lineWidth = this.gauge / 2;
        for (let x = 0; x < size; x += this.gauge * 2) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.bezierCurveTo(x + this.gauge, size / 2, x + this.gauge, size / 2, x + this.gauge * 2, size);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + this.gauge, 0);
          ctx.bezierCurveTo(x, size / 2, x, size / 2, x + this.gauge * 2, size);
          ctx.stroke();
        }
        break;
      default: // moss
        for (let y = 0; y < size; y += this.gauge) {
          for (let x = 0; x < size; x += this.gauge) {
            ctx.fillStyle = (x / this.gauge + y / this.gauge) % 2 === 0
              ? this.shade(this.color, -15)
              : this.shade(this.color, 15);
            ctx.fillRect(x, y, this.gauge, this.gauge);
          }
        }
    }

    this.patternUrl = this.canvas.toDataURL();
  }

  private shade(color: string, percent: number): string {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }
}
