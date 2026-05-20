// Route guard that allows only managers to proceed;
// guests are sent to the landing page, all other roles receive a 403
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationServices } from '../services/authentication-services';

export const managerOnlyGuard = () => {
  const authService = inject(AuthenticationServices);
  const router = inject(Router);

  const currentUserRole = authService.getCurrentUserRole();

  if (currentUserRole === 'manager') {
    return true;
  }

  if (currentUserRole === 'guest') {
    return router.createUrlTree(['/landing-page']); // not logged in — redirect to login
  }

  return router.createUrlTree(['/403']); // authenticated but wrong role
};