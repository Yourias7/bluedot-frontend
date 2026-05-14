import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorFakeDataService } from '../services/doctor-fake-data';
import { AuthenticationServices } from '../services/authentication-services';

export const doctorOnlyGuard = () => {
  const fakeAuthService = inject(AuthenticationServices);
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