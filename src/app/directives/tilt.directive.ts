import { Directive, ElementRef, HostBinding, HostListener } from '@angular/core';

/**
 * Lightweight 3D tilt effect for interactive elements.
 * Applies a subtle parallax-like tilt based on cursor position.
 * Respects prefers-reduced-motion by disabling rotation and using a gentle scale.
 */
@Directive({
  selector: '[appTilt]'
})
export class TiltDirective {
  private prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  @HostBinding('style.transform') transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  @HostBinding('style.transition') transition = 'transform 200ms ease';
  @HostBinding('style.willChange') willChange = 'transform';
  @HostBinding('style.transformStyle') transformStyle = 'preserve-3d';

  constructor(private host: ElementRef<HTMLElement>) {}

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    const el = this.host.nativeElement;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;

    if (this.prefersReducedMotion) {
      this.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1.02)';
      return;
    }

    // Max rotation angles
    const maxRot = 8; // degrees
    const rotY = ((x - midX) / midX) * maxRot; // left/right
    const rotX = -((y - midY) / midY) * maxRot; // up/down (invert for natural feel)

    this.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.03)`;
  }

  @HostListener('mouseleave')
  onLeave(): void {
    this.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  }

  @HostListener('mousedown')
  onDown(): void {
    this.transition = 'transform 80ms ease';
    this.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(0.98)';
  }

  @HostListener('mouseup')
  onUp(): void {
    this.transition = 'transform 200ms ease';
    this.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  }
}
