import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { LenisService } from '../services/lenis.service';
import { SettingsService } from '../services/settings.service';
import { JourneyService } from '../services/journey.service';

@Component({
  selector: 'app-stitch-story',
  templateUrl: './stitch-story.component.html',
  styleUrls: ['./stitch-story.component.css']
})
export class StitchStoryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;

  frames: string[] = [];
  current = 0;
  currentReduce = 0;
  reduce = false;
  private offScroll?: () => void;

  constructor(
    private lenis: LenisService,
    private settings: SettingsService,
    private journey: JourneyService
  ) {}

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;
    this.journey.registerSection(el);
    this.reduce = this.settings.prefersReducedMotion();

    const total = 10;
    for (let i = 1; i <= total; i++) {
      const src = `assets/story/sequence_${i.toString().padStart(4, '0')}.jpg`;
      this.frames.push(src);
      const img = new Image();
      img.src = src;
    }

    const lenisInstance = this.lenis.instance;
    if (!lenisInstance) return;
    const update = ({ scroll }: any) => {
      const rect = el.getBoundingClientRect();
      const totalScroll = el.offsetHeight - window.innerHeight;
      const top = -rect.top;
      const progress = Math.min(Math.max(top / totalScroll, 0), 1);
      if (this.reduce) {
        this.currentReduce = Math.round(progress * 2);
      } else {
        this.current = Math.round(progress * (this.frames.length - 1));
      }
    };
    lenisInstance.on('scroll', update);
    this.offScroll = () => lenisInstance.off('scroll', update);
  }

  ngOnDestroy(): void {
    this.offScroll?.();
  }
}
