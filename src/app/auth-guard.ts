import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from './services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // If the user has a token in memory, let them pass!
  if (authService.currentUserSignal().token) {
    return true;
  }

  // If they don't have a token, kick them back to the login screen
  router.navigate(['/login']);
  return false;
};