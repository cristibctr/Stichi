import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../services/settings.service';
import { JourneyService } from '../services/journey.service';

interface Mend {
  id: number;
  x: number;
  y: number;
  title: string;
  story: string;
}

@Component({
  selector: 'app-mend-stories',
  templateUrl: './mend-stories.component.html',
  styleUrls: ['./mend-stories.component.css']
})
export class MendStoriesComponent implements AfterViewInit {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;

  mends: Mend[] = [];
  active?: Mend;
  reduce = false;

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private journey: JourneyService
  ) {}

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;
    this.journey.registerSection(el);
    this.reduce = this.settings.prefersReducedMotion();

    this.http.get<Mend[]>('assets/mends/mends.json').subscribe((data) => {
      this.mends = data;
    });
  }

  open(m: Mend) {
    this.active = m;
  }

  close() {
    this.active = undefined;
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    this.close();
  }
}
