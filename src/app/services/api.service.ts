import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Minimal ApiService stub to support HomeComponent demo interactions.
 * In a real application this would call a backend via HttpClient.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  /**
   * Simulates adding a product to the cart.
   * @param productId The product identifier
   * @returns Observable that completes after a short delay
   */
  addToCart(productId: number): Observable<void> {
    if (productId == null) {
      return throwError(() => new Error('Invalid product id'));
    }
    return of(void 0).pipe(delay(250));
  }
}
