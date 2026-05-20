// guard to protect doctor-only routes
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationServices } from '../services/authentication-services';

export const doctorOnlyGuard = () => {
  const authService = inject(AuthenticationServices);
  const router = inject(Router);

  const currentUserRole = authService.getCurrentUserRole();

  if (currentUserRole === 'doctor') {
    return true;
  }

  if (currentUserRole === 'guest') {
    return router.createUrlTree(['/landing-page']);
  }

  return router.createUrlTree(['/403']);
};