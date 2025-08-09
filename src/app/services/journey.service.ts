import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JourneyService {
  private sections: HTMLElement[] = [];
  private observers: IntersectionObserver[] = [];

  private _index = new BehaviorSubject<number>(0);
  readonly index$ = this._index.asObservable();

  registerSection(el: HTMLElement) {
    if (!el) return;
    this.sections.push(el);
    this.setupObservers();
  }

  totalSections(): number {
    return this.sections.length;
  }

  private setupObservers() {
    this.observers.forEach((o) => o.disconnect());
    this.observers = [];
    this.sections.forEach((el, idx) => {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              this._index.next(idx);
            }
          });
        },
        { threshold: 0.5 }
      );
      obs.observe(el);
      this.observers.push(obs);
    });
  }
}

