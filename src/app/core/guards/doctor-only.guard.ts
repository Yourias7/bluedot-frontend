import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { FakeAuthService } from '../services/fake-auth';

export const doctorOnlyGuard = () => {
  const fakeAuthService = inject(FakeAuthService);
  const router = inject(Router);

  /*
    TEMPORARY FRONTEND-ONLY LOGIC.

    Later this should use JWT role claims, for example:
    - AuthService.isLoggedIn()
    - AuthService.getCurrentUserRole()
    - check if role === 'doctor'
  */
  const isLoggedIn = fakeAuthService.isLoggedIn();
  const currentUserRole = fakeAuthService.getCurrentUserRole();

  if (!isLoggedIn) {
    return router.createUrlTree(['/landing-page']);
  }

  if (currentUserRole !== 'doctor') {
    return router.createUrlTree(['/landing-page']);
  }

  return true;
};