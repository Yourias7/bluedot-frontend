import { Injectable, inject, Type } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { UserRole } from '../domain/user-role';
import { User } from '../domain/user';

export interface LoginDto { email: string; password: string; }
export interface RegisterPatientDto { firstName: string; lastName: string; email: string; pass: string; phone: string; birthDate: string; gender: string; }
export interface RegisterDoctorDto { firstName: string; lastName: string; email: string; pass: string; phone: string; birthDate: string; gender: string; specialization: number[]; }

@Injectable({
  providedIn: 'root',
})

export class AuthenticationServices {
  private isUserLoggedIn = false;
  private currentUserRole: UserRole = 'guest';
  private currentUserName = 'Doctor1';
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl; 

 
  /**
   * Logs the user in, retrieves the UserDto, and stores the JWT.
   */
  login(model: LoginDto): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/account/login`, model).pipe(
      tap((response: User) => {
        // When the backend returns a successful response, save the token and role
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          // Assuming your User domain model has a role property based on FR-1/FR-2
          localStorage.setItem('role', response.role || 'Patient'); 
        }
      })
    );
  }

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

