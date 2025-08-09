import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ReduceMotionSetting = 'auto' | 'on' | 'off';

export interface Settings {
  reduceMotion: ReduceMotionSetting;
  mute: boolean;
  showNativeCursorOnKeyboard: boolean;
}

const STORAGE_KEY = 'stichi-settings';
const DEFAULT_SETTINGS: Settings = {
  reduceMotion: 'auto',
  mute: true,
  showNativeCursorOnKeyboard: true
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _settings = new BehaviorSubject<Settings>(DEFAULT_SETTINGS);
  readonly settings$ = this._settings.asObservable();

  constructor() {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        this._settings.next({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        // ignore malformed
      }
    }

    this.settings$.subscribe((s) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      }
    });
  }

  update(partial: Partial<Settings>) {
    this._settings.next({ ...this._settings.value, ...partial });
  }

  get value(): Settings {
    return this._settings.value;
  }

  /** Convenience getter that resolves reduce motion preference. */
  prefersReducedMotion(): boolean {
    const setting = this._settings.value.reduceMotion;
    if (setting === 'on') return true;
    if (setting === 'off') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

