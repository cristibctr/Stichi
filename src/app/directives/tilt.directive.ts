import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

/**
 * A directive that applies a subtle 3D tilt effect to an element based on
 * the position of the mouse cursor. Moving the mouse over the element will
 * rotate it along the X and Y axes, creating an interactive experience. When
 * the mouse leaves the element, it smoothly resets back to its neutral state.
 */
@Directive({
  selector: '[appTilt]'
})
export class TiltDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -(y - centerY) / 20;
    const rotateY = (x - centerX) / 20;
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    );
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'transform 0.3s ease'
    );
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      'perspective(800px) rotateX(0deg) rotateY(0deg)'
    );
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    // Remove transition so movement feels smooth when the user enters
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'none');
  }
}