import { Component, inject } from '@angular/core';
// THE FIX: We added RouterLink so your navbar buttons actually work again!
import { RouterOutlet, RouterLink, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { LoadingService } from './shared/components/loading';
import { Auth } from './core/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  // If RouterLink is missing here, your navigation buttons die.
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  // 1. Core Services
  loadingService = inject(LoadingService);
  authService = inject(Auth);
  private router = inject(Router);

  constructor() {
    // 2. The Global Router Listener for the Loading Bar
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => this.loadingService.hide(), 500); // 500ms artificial delay
      }
    });
  }

  // 3. The Authentication Flow
  logout() {
    this.authService.logout(); // Clears your local storage / JWT
    this.router.navigate(['/login']); // Redirects to the login screen
  }
}