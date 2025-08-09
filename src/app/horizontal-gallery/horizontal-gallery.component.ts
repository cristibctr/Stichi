import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-horizontal-gallery',
  template: `
  <div class="sticky top-24">
    <div #track class="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-4 px-2"
         (wheel)="onWheel($event)">
      <div *ngFor="let p of items" class="snap-start min-w-[75vw] sm:min-w-[420px] bg-white rounded-2xl shadow-lg overflow-hidden">
        <img [src]="p.image" [alt]="p.name" class="w-full h-[55vh] object-cover" />
        <div class="p-5 flex items-center justify-between">
          <div>
            <h4 class="font-semibold">{{ p.name }}</h4>
            <p class="text-gray-600 text-sm">{{ p.price | currency:'EUR' }}</p>
          </div>
          <button class="px-4 py-2 rounded-full bg-primary text-white" (click)="add?.(p)">Add</button>
        </div>
      </div>
    </div>
  </div>` ,
  styles: [':host{display:block}']
})
export class HorizontalGalleryComponent {
  @Input() items: any[] = [];
  @Input() add?: (p:any)=>void;
  onWheel(e: WheelEvent) {
    const el = (e.target as HTMLElement).closest('.overflow-x-auto') as HTMLElement;
    if (!el) return;
    el.scrollLeft += e.deltaY;
  }
}
