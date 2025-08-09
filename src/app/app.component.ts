import { Component, HostListener } from '@angular/core';
import { SettingsService, Settings } from './services/settings.service';
import { LenisService } from './services/lenis.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  showSettings = false;
  settings$!: Observable<Settings>;

  constructor(public settings: SettingsService, private _lenis: LenisService) {
    this.settings$ = this.settings.settings$;
  }

  ngOnInit() {
    this.settings.settings$.subscribe((s) => {
      if (!s.showNativeCursorOnKeyboard) {
        document.body.classList.remove('show-native-cursor');
      }
    });
  }

  toggleSettings() {
    this.showSettings = !this.showSettings;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(ev: KeyboardEvent) {
    if (ev.key === 'Tab' && this.settings.value.showNativeCursorOnKeyboard) {
      document.body.classList.add('show-native-cursor');
    }
  }

  @HostListener('document:mousedown')
  handlePointer() {
    document.body.classList.remove('show-native-cursor');
  }
}