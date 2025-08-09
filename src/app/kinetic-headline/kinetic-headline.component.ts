import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import gsap from 'gsap';

@Component({
    selector: 'app-kinetic-headline',
    template: `<h1 class="text-5xl md:text-7xl font-display tracking-tight glow-text inline-block">
        <span #wrap></span>
    </h1>`
})
export class KineticHeadlineComponent implements AfterViewInit {
    @Input() text = 'Stichi';
    @ViewChild('wrap', {static: false}) wrapRef!: ElementRef<HTMLSpanElement>;

    constructor(private el: ElementRef) {
    }

    ngAfterViewInit(): void {
        const wrap = this.wrapRef.nativeElement;
        wrap.innerHTML = this.text
            .split('')
            .map(ch => `<span class="inline-block will-change-transform">${ch === ' ' ? '&nbsp;' : ch}</span>`)
            .join('');
        const letters = wrap.querySelectorAll('span');
        gsap.fromTo(letters, {yPercent: 130, rotate: 8, opacity: 0}, {
            yPercent: 0, rotate: 0, opacity: 1, ease: 'expo.out', duration: 1, stagger: 0.035
        });
    }
}
