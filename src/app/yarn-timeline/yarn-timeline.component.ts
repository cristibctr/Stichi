import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { LenisService } from '../services/lenis.service';
import { SettingsService } from '../services/settings.service';
import { JourneyService } from '../services/journey.service';

interface Milestone {
  offset: number; // 0-1 along path
  title: string;
  copy: string;
  image?: string;
  x?: number;
  y?: number;
  open?: boolean;
}

@Component({
  selector: 'app-yarn-timeline',
  templateUrl: './yarn-timeline.component.html',
  styleUrls: ['./yarn-timeline.component.css']
})
export class YarnTimelineComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLElement>;
  @ViewChild('path', { static: true }) path!: ElementRef<SVGPathElement>;

  dasharray = 0;
  dashoffset = 0;
  reduce = false;
  private offScroll?: () => void;

  milestones: Milestone[] = [
    { offset: 0.2, title: 'Sketch', copy: 'Ideas take shape.' },
    { offset: 0.5, title: 'Spin', copy: 'Fibers become yarn.' },
    { offset: 0.8, title: 'Weave', copy: 'Cloth comes alive.' }
  ];

  constructor(
    private lenis: LenisService,
    private settings: SettingsService,
    private journey: JourneyService
  ) {}

  ngAfterViewInit(): void {
    const host = this.container.nativeElement;
    this.journey.registerSection(host);
    this.reduce = this.settings.prefersReducedMotion();

    const pathEl = this.path.nativeElement;
    this.dasharray = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = `${this.dasharray}`;

    // place milestones
    this.milestones.forEach(m => {
      const pt = pathEl.getPointAtLength(this.dasharray * m.offset);
      m.x = pt.x;
      m.y = pt.y;
      m.open = false;
    });

    if (this.reduce) {
      this.dashoffset = 0;
      return;
    }

    const lenisInstance = this.lenis.instance;
    if (!lenisInstance) return;
    const update = ({ scroll }: any) => {
      const rect = host.getBoundingClientRect();
      const total = host.offsetHeight - window.innerHeight;
      const top = -rect.top;
      const progress = Math.min(Math.max(top / total, 0), 1);
      this.dashoffset = this.dasharray * (1 - progress);
    };
    lenisInstance.on('scroll', update);
    this.offScroll = () => lenisInstance.off('scroll', update);
  }

  toggle(ms: Milestone) {
    ms.open = !ms.open;
  }

  ngOnDestroy(): void {
    this.offScroll?.();
  }
}
