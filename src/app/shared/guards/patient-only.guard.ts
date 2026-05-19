import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationServices } from '../services/authentication-services';

export const patientOnlyGuard = () => {
  const authService = inject(AuthenticationServices);
  const router = inject(Router);

  const currentUserRole = authService.getCurrentUserRole();

  if (currentUserRole === 'patient') {
    return true;
  }

  if (currentUserRole === 'guest') {
    return router.createUrlTree(['/landing-page']);
  }

  return router.createUrlTree(['/403']);
};