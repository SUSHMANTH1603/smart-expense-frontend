import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
// 1. Import the HTTP provider
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  // 2. Add provideHttpClient() to the providers array
  providers: [provideRouter(routes), provideHttpClient()]
};