export type UserRole = 'guest' | 'patient' | 'doctor' | 'manager';

export class FakeAuthService {
  /*
    TEMPORARY FRONTEND-ONLY AUTH STATE.

    Later this should NOT be hardcoded.
    Later this service can be replaced with a real AuthService that:
    - reads the JWT from localStorage/sessionStorage
    - decodes the JWT
    - checks if the token is expired
    - reads the role claim from the token
  */

  private isUserLoggedIn = true;
  private currentUserRole: UserRole = 'doctor';
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