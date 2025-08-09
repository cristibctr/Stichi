import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  /**
   * Controls the visibility of the mobile navigation menu.
   */
  isMenuOpen = false;
  currentYear = new Date().getFullYear();
}