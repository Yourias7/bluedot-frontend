import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationServices } from '../services/authentication-services';


export const roleRedirectGuard = () => {
  const fakeAuthService = inject(AuthenticationServices);
  const router = inject(Router);

  /*
    TEMPORARY FRONTEND-ONLY LOGIC.

    Later, FakeAuthService can become a real AuthService that gets
    this role from the JWT claims instead of hardcoded fake data.
  */
  const currentUserRole = fakeAuthService.getCurrentUserRole();

  if (currentUserRole === 'doctor') {
    return router.createUrlTree(['/doctor']);
  }

  if (currentUserRole === 'manager') {
    return router.createUrlTree(['/manager']);
  }

  return true;
};