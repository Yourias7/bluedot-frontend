// Global application providers: routing, HTTP client, PrimeNG theme, and error listeners
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { authInterceptor } from './shared/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])), // attaches JWT token to every outgoing request
    providePrimeNG({
      theme: {
        preset: Aura // Aura is the default PrimeNG design token preset
      }
    }),
    provideBrowserGlobalErrorListeners(), // forwards uncaught errors to Angular's error handler
    provideRouter(routes)
  ]
};
