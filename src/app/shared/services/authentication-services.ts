import { Injectable } from '@angular/core';
import { UserRole } from '../domain/user-role';
import { User } from '../domain/user';

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

  setCurrentUserRole(role:UserRole):void{
    this.currentUserRole = role;
  }

  setCurrentUserName(_name:string):void{
    this.currentUserName = _name;
  }

  logIn(user:User):void{
    this.setCurrentUserName(user.firstName + user.lastName);
    //this.setCurrentUserRole(user.role);
  }
}

