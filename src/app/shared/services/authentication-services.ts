import { Injectable } from '@angular/core';
import { UserRole } from '../domain/user-role';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationServices {
  private isUserLoggedIn = true;
  private currentUserRole: UserRole = 'patient';
  private currentUserName = 'Doctor1';

  isLoggedIn(): boolean {
    return this.isUserLoggedIn;
  }

  getCurrentUserRole(): UserRole {
    if (!this.isUserLoggedIn) {
      return 'guest';
    }

    return this.currentUserRole;
  }

  getCurrentUserName(): string {
    return this.currentUserName;
  }
}

