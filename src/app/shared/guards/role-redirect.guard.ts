// Redirects doctors and managers to their dedicated dashboards;
// guests and patients fall through and reach the intended route
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationServices } from '../services/authentication-services';

export const roleRedirectGuard = () => {
  const authService = inject(AuthenticationServices);
  const router = inject(Router);

  const currentUserRole = authService.getCurrentUserRole();

  if (currentUserRole === 'doctor') {
    return router.createUrlTree(['/doctor']);
  }

  if (currentUserRole === 'manager') {
    return router.createUrlTree(['/manager']);
  }

  return true; // guest or patient — allow access to the route
};