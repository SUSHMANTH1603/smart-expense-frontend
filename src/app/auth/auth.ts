import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {
  // Inject our tools
  private authService = inject(Auth);
  private router = inject(Router);

  // State to toggle between Login and Register
  isLoginMode = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // The Secure Form Contract
  authForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  toggleMode() {
    this.isLoginMode.set(!this.isLoginMode());
    this.errorMessage.set(null); // Clear errors when switching modes
  }

  onSubmit() {
    if (this.authForm.invalid) return;

    const credentials = this.authForm.value;

    if (this.isLoginMode()) {
      // Execute Login Flow
      this.authService.login(credentials).subscribe({
        next: () => {
          // If successful, navigate to the dashboard!
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage.set(err.error.error || 'Login failed');
        }
      });
    } else {
      // Execute Register Flow
      this.authService.register(credentials).subscribe({
        next: () => {
          // If successful, switch to login mode so they can log in
          this.isLoginMode.set(true);
          this.errorMessage.set('Registration successful! Please log in.');
        },
        error: (err) => {
          this.errorMessage.set(err.error.error || 'Registration failed');
        }
      });
    }
  }
}