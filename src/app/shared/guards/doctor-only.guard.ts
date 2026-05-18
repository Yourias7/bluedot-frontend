import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationServices } from '../services/authentication-services';

export const doctorOnlyGuard = () => {
  const authService = inject(AuthenticationServices);
  const router = inject(Router);

  // Synchronously grab the current role from our BehaviorSubject
  const currentUserRole = authService.getCurrentUserRole();

  // If they are not a doctor (which includes being a 'guest' or 'patient'), kick them out
  if (currentUserRole !== 'doctor') {
    return router.createUrlTree(['/landing-page']);
  }

  // If they are a doctor, allow the route to load
  return true;
};