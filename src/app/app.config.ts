import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor'; // Import it here!

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // THE FIX: We tell Angular's HttpClient to route all traffic through our new interceptor
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};