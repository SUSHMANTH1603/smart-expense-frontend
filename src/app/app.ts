import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  // NEW: We must import RouterLink to create navigation buttons in Angular
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  // Inject the Keymaster and the Router
  authService = inject(Auth);
  private router = inject(Router);

  logout() {
    this.authService.logout(); // Deletes the token
    this.router.navigate(['/login']); // Kicks them back to the login screen
  }
}