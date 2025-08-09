import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

/**
 * The home component serves as the landing page for the application.
 * It features a prominent hero section with the brand name, tagline,
 * and a call‑to‑action button using a custom 3D tilt directive. The
 * decorative blurred circles in the background hint at the star motifs
 * present in the Stichi logo and evoke a dreamy, cosmic feel.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  /**
   * A subset of products displayed on the home page carousel. In a real
   * application this would be loaded from a backend API; here we define
   * it statically to illustrate the layout.
   */
  featured: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    // Define a few sample products for the horizontal carousel. You may
    // replace these with a call to this.api.getProducts() when a backend
    // becomes available.
    this.featured = [
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
   * @param product The selected product
   */
  addToCart = (product: any): void => {
    this.api.addToCart(product.id).subscribe({
      next: () => {
        alert(`${product.name} added to cart!`);
      },
      error: () => {
        alert('Unable to add to cart at this time.');
      }
    });
  };

  /**
   * Smoothly scrolls to a section within the home page. The sections have
   * explicit identifiers that correspond to their IDs in the template.
   * @param id The ID of the target section element
   */
  scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}