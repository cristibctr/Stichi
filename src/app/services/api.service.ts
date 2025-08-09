import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

/**
 * ApiService centralises all HTTP requests made by the application. It
 * defines methods for fetching products, manipulating the shopping cart,
 * and performing checkout. The actual server implementation is not
 * included in this project; these methods simply define the expected
 * endpoints and return observables for future integration.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /**
   * Base URL for the backend API. In a real deployment this should be
   * configured in the environment files.
   */
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Retrieves the list of products.
   */
  getProducts(): Observable<any> {
    return this.http.get(`${this.base}/products`);
  }

  /**
   * Adds a product to the shopping cart.
   * @param productId The identifier of the product to add
   */
  addToCart(productId: number): Observable<any> {
    return this.http.post(`${this.base}/cart`, { productId });
  }

  /**
   * Fetches the current state of the shopping cart.
   */
  getCart(): Observable<any> {
    return this.http.get(`${this.base}/cart`);
  }

  /**
   * Sends the cart data to the backend for checkout.
   * @param cart The shopping cart object
   */
  checkout(cart: any): Observable<any> {
    return this.http.post(`${this.base}/checkout`, cart);
  }
}