import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { JourneyService } from '../services/journey.service';

@Component({
  selector: 'app-row-counter',
  templateUrl: './row-counter.component.html',
  styleUrls: ['./row-counter.component.css']
})
export class RowCounterComponent implements AfterViewInit, OnDestroy {
  index = 1;
  total = 0;
  private sub?: Subscription;

  constructor(private journey: JourneyService) {}

  ngAfterViewInit(): void {
    // ensure sections have registered before reading
    setTimeout(() => (this.total = this.journey.totalSections()));
    this.sub = this.journey.index$.subscribe((i) => {
      this.index = i + 1;
      // keep total in sync in case sections change dynamically
      this.total = this.journey.totalSections();
    });
  }

  get label(): string {
    return `Section ${this.index} of ${this.total}`;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

