import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-fabric-microscope',
  templateUrl: './fabric-microscope.component.html',
  styleUrls: ['./fabric-microscope.component.css']
})
export class FabricMicroscopeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lens', { static: true }) lens!: ElementRef<HTMLDivElement>;

  private active = false;
  private pos = { x: innerWidth / 2, y: innerHeight / 2 };
  private target = { ...this.pos };
  private raf = 0;
  private readonly reduce: boolean;

  private readonly move = (e: PointerEvent) => {
    this.target.x = e.clientX;
    this.target.y = e.clientY;
  };

  private readonly down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    this.active = true;
    this.lens.nativeElement.classList.remove('hidden');
  };

  private readonly up = () => {
    this.active = false;
    this.lens.nativeElement.classList.add('hidden');
  };

  private readonly keydown = (e: KeyboardEvent) => {
    if (e.key !== 'Shift') return;
    this.active = true;
    this.lens.nativeElement.classList.remove('hidden');
  };

  private readonly keyup = (e: KeyboardEvent) => {
    if (e.key !== 'Shift') return;
    this.active = false;
    this.lens.nativeElement.classList.add('hidden');
  };

  constructor(private settings: SettingsService) {
    this.reduce = this.settings.prefersReducedMotion();
  }

  ngAfterViewInit(): void {
    addEventListener('pointermove', this.move);
    addEventListener('pointerdown', this.down);
    addEventListener('pointerup', this.up);
    addEventListener('keydown', this.keydown);
    addEventListener('keyup', this.keyup);
    this.animate();
  }

  private animate = () => {
    if (this.active) {
      if (this.reduce) {
        this.pos.x = this.target.x;
        this.pos.y = this.target.y;
      } else {
        this.pos.x += (this.target.x - this.pos.x) * 0.15;
        this.pos.y += (this.target.y - this.pos.y) * 0.15;
      }
      const el = this.lens.nativeElement;
      el.style.left = `${this.pos.x}px`;
      el.style.top = `${this.pos.y}px`;
    }
    this.raf = requestAnimationFrame(this.animate);
  };

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    removeEventListener('pointermove', this.move);
    removeEventListener('pointerdown', this.down);
    removeEventListener('pointerup', this.up);
    removeEventListener('keydown', this.keydown);
    removeEventListener('keyup', this.keyup);
  }
}

