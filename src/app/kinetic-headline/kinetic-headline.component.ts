import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import gsap from 'gsap';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-kinetic-headline',
  template: `
    <h1 class="relative inline-block text-5xl md:text-7xl font-display tracking-tight glow-text">
      <span #filled class="block opacity-0">{{ text }}</span>
      <svg #svg class="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
        <text #strokeText x="0" y="0" dominant-baseline="hanging" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" style="font: inherit;">
          {{ text }}
        </text>
      </svg>
    </h1>
  `
})
export class KineticHeadlineComponent implements AfterViewInit {
  @Input() text = 'Stichi';
  @ViewChild('strokeText', { static: false }) strokeRef!: ElementRef<SVGTextElement>;
  @ViewChild('filled', { static: false }) filledRef!: ElementRef<HTMLSpanElement>;

  constructor(private settings: SettingsService) {}

  ngAfterViewInit(): void {
    const reduce = this.settings.prefersReducedMotion();
    const strokeEl = this.strokeRef.nativeElement;
    const filled = this.filledRef.nativeElement;

    const length = strokeEl.getComputedTextLength();
    strokeEl.style.strokeDasharray = '6 14';
    strokeEl.style.strokeDashoffset = String(length);

    if (reduce) {
      strokeEl.style.display = 'none';
      filled.style.opacity = '1';
      return;
    }

    const tl = gsap.timeline();
    tl.to(strokeEl, {
      strokeDashoffset: 0,
      duration: 2,
      ease: 'power2.out'
    });
    tl.to(filled, { opacity: 1, duration: 0.5 }, '-=0.4');
    tl.to(strokeEl, { opacity: 0, duration: 0.5 }, '<');
  }
}
