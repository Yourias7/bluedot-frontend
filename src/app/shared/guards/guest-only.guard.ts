import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationServices } from '../services/authentication-services';

export const guestOnlyGuard = () => {
  const authService = inject(AuthenticationServices);
  const router = inject(Router);

  const currentUserRole = authService.getCurrentUserRole();

  if (currentUserRole === 'guest') {
    return true;
  }

  if (currentUserRole === 'doctor') {
    return router.createUrlTree(['/doctor']);
  }

  if (currentUserRole === 'manager') {
    return router.createUrlTree(['/manager']);
  }

  if (currentUserRole === 'patient') {
    return router.createUrlTree(['/landing-page']);
  }

  return router.createUrlTree(['/landing-page']);
};