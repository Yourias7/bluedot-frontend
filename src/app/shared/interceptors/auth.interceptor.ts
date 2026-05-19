import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthenticationServices } from '../services/authentication-services';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthenticationServices);
  const router = inject(Router);

  const token = authService.getToken();

  const authenticatedRequest = token
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : request;

  return next(authenticatedRequest).pipe(
    catchError(error => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/landing-page']);
      }

      if (error.status === 403) {
        router.navigate(['/403']);
      }

      if (error.status === 500) {
        router.navigate(['/500']);
      }

      return throwError(() => error);
    })
  );
};