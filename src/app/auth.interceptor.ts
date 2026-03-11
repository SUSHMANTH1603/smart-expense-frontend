import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from './services/auth'; // Make sure this path matches!

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // 1. THE REQUEST INTERCEPTOR (Outgoing)
  // Grab the JWT token from our signal (or localStorage)
  const token = authService.currentUserSignal().token;

  let modifiedReq = req;

  // If we have a token, clone the request and securely attach it to the headers
  if (token) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. THE RESPONSE INTERCEPTOR (Incoming)
  // We pass the modified request to the next handler, but we use RxJS 'catchError' 
  // to inspect any errors coming BACK from the server before the component sees them.
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // If the backend says our token is expired or invalid (401 Unauthorized)
      if (error.status === 401) {
        console.warn('Security Alert: JWT Expired or Invalid. Logging out.');

        // Force the user out and wipe the bad token
        authService.logout();
        router.navigate(['/login']);
      }

      // Pass the error along so the component can still show a wobble animation if needed
      return throwError(() => error);
    })
  );
};