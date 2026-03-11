import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './services/auth'; // Make sure this path is correct!

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // 1. Check the Signal for a valid token
  const hasToken = !!authService.currentUserSignal().token;

  if (hasToken) {
    // 2. Access Granted: Let them route to the dashboard
    return true;
  }

  // 3. Access Denied: Kick them back to the Login page
  console.warn('Security Alert: Unauthorized access attempt blocked.');
  router.navigate(['/login']);
  return false;
};