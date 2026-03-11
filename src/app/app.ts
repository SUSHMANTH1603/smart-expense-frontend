import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { LoadingService } from './services/loading';
import { Auth } from './services/auth'; // Ensure this path is correct!

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  // 1. New Loading Bar logic
  loadingService = inject(LoadingService);

  // 2. RESTORED: Authentication logic so your HTML doesn't crash!
  authService = inject(Auth);
  private router = inject(Router);

  constructor() {
    // The Loading Bar Router Listener
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => this.loadingService.hide(), 500);
      }
    });
  }

  // RESTORED: The logout function your button is looking for
  logout() {
    this.authService.logout(); // Call your auth service's logout method
    this.router.navigate(['/login']); // Send them back to the login page
  }
}