import { Directive, ElementRef, Input, OnInit } from '@angular/core';

/**
 * Directive to reveal elements as they enter the viewport. When the host
 * element is at least 10% visible, the specified animation class is
 * applied, which can trigger CSS animations defined elsewhere. Once an
 * element is revealed it will not be observed again.
 */
@Directive({
  selector: '[appScrollReveal]'
})
export class ScrollRevealDirective implements OnInit {
  /**
   * The CSS class to add when the element becomes visible. Defaults to
   * `animate-fade-up` if not provided.
   */
  @Input('appScrollReveal') animationClass = 'animate-fade-up';

  private observer!: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add(this.animationClass);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    this.observer.observe(this.el.nativeElement);
  }
}