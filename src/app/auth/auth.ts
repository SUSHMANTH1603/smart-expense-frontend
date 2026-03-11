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
  private authService = inject(Auth);
  private router = inject(Router);

  isLoginMode = signal<boolean>(true);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // NEW: State for the eye icon!
  showPassword = signal(false);

  authForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  toggleMode() {
    this.isLoginMode.set(!this.isLoginMode());
    this.errorMessage.set(null);
  }

  // NEW: Toggle function for the eye icon
  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit() {
    if (this.authForm.invalid) return;

    const credentials = this.authForm.value;

    // 1. Start the crazy spinner
    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (this.isLoginMode()) {
      this.authService.login(credentials).subscribe({
        next: () => {
          this.isLoading.set(false); // FIX: Stop spinner on success
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading.set(false); // FIX: Stop spinner on error!
          // FIX: Actually grab the error text so the wobble triggers!
          this.errorMessage.set(err.error?.error || err.message || 'Invalid email or password');
        }
      });
    } else {
      this.authService.register(credentials).subscribe({
        next: () => {
          this.isLoading.set(false); // FIX: Stop spinner
          this.isLoginMode.set(true);
          this.errorMessage.set('Registration successful! Please log in.');
        },
        error: (err) => {
          this.isLoading.set(false); // FIX: Stop spinner
          this.errorMessage.set(err.error?.error || err.message || 'Registration failed');
        }
      });
    }
  }
}