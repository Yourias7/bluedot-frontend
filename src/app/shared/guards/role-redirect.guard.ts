import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationServices } from '../services/authentication-services';

export const roleRedirectGuard = () => {
  const authService = inject(AuthenticationServices);
  const router = inject(Router);

  // Check the current role synchronously from the BehaviorSubject
  const currentUserRole = authService.getCurrentUserRole();

  if (currentUserRole === 'doctor') {
    return router.createUrlTree(['/doctor']);
  }

  if (currentUserRole === 'manager') {
    return router.createUrlTree(['/manager']);
  }

  // If the user is a patient or a guest, allow them to stay on the current route
  return true;
};