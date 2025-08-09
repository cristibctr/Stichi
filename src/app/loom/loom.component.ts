import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { LenisService } from '../services/lenis.service';
import { SettingsService } from '../services/settings.service';
import { JourneyService } from '../services/journey.service';

@Component({
  selector: 'app-loom',
  templateUrl: './loom.component.html',
  styleUrls: ['./loom.component.css']
})
export class LoomComponent implements AfterViewInit, OnDestroy {
  @ViewChild('root', { static: true }) root!: ElementRef<HTMLElement>;

  panels = [
    { title: 'Craft', copy: 'Each thread placed with care.' },
    { title: 'Community', copy: 'Woven stories and friends.' },
    { title: 'Future', copy: 'Designs that last.' }
  ];

  progress = 0;
  private reduce = false;
  private offScroll?: () => void;

  constructor(
    private lenis: LenisService,
    private settings: SettingsService,
    private journey: JourneyService
  ) {}

  ngAfterViewInit(): void {
    const host = this.root.nativeElement;
    this.journey.registerSection(host);
    this.reduce = this.settings.prefersReducedMotion();

    if (this.reduce) {
      this.progress = 1;
      return;
    }

    const lenisInstance = this.lenis.instance;
    if (!lenisInstance) return;
    const update = ({ scroll }: any) => {
      const rect = host.getBoundingClientRect();
      const total = host.offsetHeight - window.innerHeight;
      const top = -rect.top;
      this.progress = Math.min(Math.max(top / total, 0), 1);
    };
    lenisInstance.on('scroll', update);
    this.offScroll = () => lenisInstance.off('scroll', update);
  }

  xFor(i: number) {
    const count = this.panels.length - 1;
    const target = i / count;
    const shift = (target - this.progress) * 100;
    return `translateX(${shift}%)`;
  }

  ngOnDestroy(): void {
    this.offScroll?.();
  }
}
