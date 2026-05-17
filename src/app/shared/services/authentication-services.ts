import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { UserRole } from '../domain/user-role';
import { User } from '../domain/user'; // Your UserDto equivalent

// DTO Interfaces (these should match your C# DTOs)
export interface LoginDto { email: string; password: string; }
export interface RegisterPatientDto { firstName: string; lastName: string; email: string; pass: string; phone: string; birthDate: string; gender: string; }
export interface RegisterDoctorDto { firstName: string; lastName: string; email: string; pass: string; phone: string; birthDate: string; gender: string; specialization: number[]; }

@Injectable({
  providedIn: 'root',
})
export class AuthenticationServices {
  private isUserLoggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserRole = new BehaviorSubject<UserRole>('guest');
  private currentUserName = new BehaviorSubject<string>('');
  private baseUrl = environment.apiUrl; 


  constructor(private http: HttpClient) {
    // Here you would ideally decode the JWT token on startup to set role and name
  }
  /**
   * Logs the user in, retrieves the UserDto, and stores the JWT.
   */
  login(credentials: LoginDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/account/login`, credentials).pipe(
      tap(response => {
        // Assuming your backend returns { token: "eyJ..." }
        if (response && response.token) {
          localStorage.setItem('jwt_token', response.token);
          this.isUserLoggedIn.next(true);
          // Set role/name based on token payload later
        }
      })
    );
  }

  registerPatient(data: RegisterPatientDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/register/patient`, data);
  }

  registerDoctor(data: RegisterDoctorDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/register/doctor`, data);
  }

  logout() {
    localStorage.removeItem('jwt_token');
    this.isUserLoggedIn.next(false);
    this.currentUserRole.next('guest');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return this.isUserLoggedIn.value;
  }

  getCurrentUserRole(): UserRole {
    if (!this.isUserLoggedIn.value) {
      return 'guest';
    }

    return this.currentUserRole.value;
  }

  getCurrentUserName(): string {
    return this.currentUserName.value;
  }
}

