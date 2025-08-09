import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({ selector: '[appMagnetic]' })
export class MagneticDirective {
  private rect!: DOMRect;
  constructor(private el: ElementRef, private r: Renderer2) {
    r.setStyle(el.nativeElement, 'transition', 'transform .25s cubic-bezier(.2,.8,.2,1)');
    r.setStyle(el.nativeElement, 'will-change', 'transform');
  }
  @HostListener('mouseenter') onEnter() { this.rect = this.el.nativeElement.getBoundingClientRect(); }
  @HostListener('mousemove', ['$event']) onMove(e: MouseEvent) {
    const x = (e.clientX - this.rect.left) / this.rect.width - .5;
    const y = (e.clientY - this.rect.top) / this.rect.height - .5;
    this.r.setStyle(this.el.nativeElement, 'transform', `translate(${x*10}px, ${y*10}px) scale(1.02)`);
  }
  @HostListener('mouseleave') onLeave() {
    this.r.setStyle(this.el.nativeElement, 'transform', `translate(0,0) scale(1)`);
  }
}
