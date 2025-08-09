import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Minimal ApiService stub to support HomeComponent demo interactions.
 * In a real application this would call a backend via HttpClient.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private reduce = false;

  constructor(private settings: SettingsService) {
    this.reduce = this.settings.prefersReducedMotion();
  }
  /**
   * Simulates adding a product to the cart.
   * @param productId The product identifier
   * @returns Observable that completes after a short delay
   */
  addToCart(productId: number): Observable<void> {
    if (productId == null) {
      return throwError(() => new Error('Invalid product id'));
    }
    if (!this.reduce) {
      navigator.vibrate?.(12);
    }
    return of(void 0).pipe(delay(250));
  }
}
