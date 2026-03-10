import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from './auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Inject our Keymaster
  const authService = inject(Auth);
  const token = authService.getToken();

  // 2. If we have a token, clone the request and attach the token to the headers
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // 3. Send the modified request to the backend
    return next(clonedRequest);
  }

  // 4. If no token, just send the original request (like when they are trying to log in!)
  return next(req);
};