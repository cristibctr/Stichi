import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

/**
 * Displays a gallery of handmade garments. In a real application the
 * products would be loaded from a backend API, but here we stub the
 * data using remote Unsplash images to illustrate the design. Users
 * can add items to a cart via the API service.
 */
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
  products: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    // Predefined list of products with remote placeholder images
    this.products = [
      {
        id: 1,
        name: 'Pastel Sweater',
        description: 'Soft pastel handmade sweater',
        price: 80,
        image: 'https://picsum.photos/seed/pastel-sweater/400/400'
      },
      {
        id: 2,
        name: 'Knitted Scarf',
        description: 'Warm knitted scarf',
        price: 35,
        image: 'https://picsum.photos/seed/handmade-scarf/400/400'
      },
      {
        id: 3,
        name: 'Vintage Dress',
        description: 'Bohemian style dress',
        price: 120,
        image: 'https://picsum.photos/seed/boho-dress/400/400'
      },
      {
        id: 4,
        name: 'Crochet Top',
        description: 'Lace crochet top',
        price: 60,
        image: 'https://picsum.photos/seed/crochet-top/400/400'
      }
    ];
  }

  /**
   * Adds a product to the shopping cart by delegating to the API service.
   * For demonstration purposes this simply alerts the user.
   */
  addToCart(product: any): void {
    this.api.addToCart(product.id).subscribe({
      next: () => {
        alert(`${product.name} added to cart!`);
      },
      error: () => {
        alert('Unable to add to cart at this time.');
      }
    });
  }
}