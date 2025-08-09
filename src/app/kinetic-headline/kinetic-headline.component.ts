import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'app-kinetic-headline',
  template: `<h1 class="text-5xl md:text-7xl font-display tracking-tight glow-text inline-block">
    <span #wrap></span>
  </h1>`
})
export class KineticHeadlineComponent implements AfterViewInit {
  @Input() text = 'Stichi';
  constructor(private el: ElementRef) {}
  ngAfterViewInit(): void {
    const wrap: HTMLElement = this.el.nativeElement.querySelector('[#wrap]') ?? this.el.nativeElement.querySelector('span');
    // split to spans
    wrap!.innerHTML = this.text.split('').map(ch => `<span class="inline-block will-change-transform">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
    const letters = wrap!.querySelectorAll('span');
    gsap.fromTo(letters, { yPercent: 130, rotate: 8, opacity: 0 }, {
      yPercent: 0, rotate: 0, opacity: 1, ease: 'expo.out', duration: 1, stagger: 0.035
    });
  }
}
