import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { UserRole } from '../domain/user-role';
import { User } from '../domain/user';

export type LoginDto = {
  email: string;
  password: string;
};

export type RegisterPatientDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type RegisterDoctorDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  phoneNumber: string;
  clinicAddress: string;
  specialtyIds: number[];
};

type LoginResponseDto = {
  emailAddress: string;
  token: string;
  role: string;
  lastLogin?: string;
  gender?: string;
  dateOfBirth?: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthenticationServices {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private isUserLoggedIn = localStorage.getItem('token') !== null;
  private currentUserRole: UserRole = this.getStoredRole();
  private currentUserName = localStorage.getItem('userName') ?? '';

  login(model: LoginDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/account/login`, model).pipe(
      tap((response: LoginResponseDto) => {
        if (!response || !response.token) {
          return;
        }

        localStorage.setItem('token', response.token);

        const role = this.normalizeRole(response.role);
        localStorage.setItem('role', role);

        const displayName = response.emailAddress;
        localStorage.setItem('userName', displayName);

        this.isUserLoggedIn = true;
        this.currentUserRole = role;
        this.currentUserName = displayName;
      })
    );
  }

  registerPatient(model: RegisterPatientDto): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/account/register/patient`, model);
  }

  registerDoctor(model: RegisterDoctorDto): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/account/register/doctor`, model);
  }

  isLoggedIn(): boolean {
    return this.isUserLoggedIn || localStorage.getItem('token') !== null;
  }

  getCurrentUserRole(): UserRole {
    if (!this.isLoggedIn()) {
      return 'guest';
    }

    return this.getStoredRole();
  }

  getCurrentUserName(): string {
    return localStorage.getItem('userName') ?? this.currentUserName;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setCurrentUserRole(role: UserRole): void {
    this.currentUserRole = role;
    this.isUserLoggedIn = role !== 'guest';

    if (role === 'guest') {
      localStorage.removeItem('role');
      return;
    }

    localStorage.setItem('role', role);
  }

  setCurrentUserName(name: string): void {
    this.currentUserName = name;
    localStorage.setItem('userName', name);
  }

  logIn(user: User): void {
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

    this.setCurrentUserName(fullName);

    if (user.role) {
      this.setCurrentUserRole(this.normalizeRole(user.role));
    }

    this.isUserLoggedIn = true;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');

    this.isUserLoggedIn = false;
    this.currentUserRole = 'guest';
    this.currentUserName = '';
  }

  private getStoredRole(): UserRole {
    const storedRole = localStorage.getItem('role');

    return this.normalizeRole(storedRole);
  }

  private normalizeRole(role: string | null | undefined): UserRole {
    if (!role) {
      return 'guest';
    }

    const normalizedRole = role.toLowerCase();

    if (normalizedRole === 'doctor') {
      return 'doctor';
    }

    if (normalizedRole === 'patient') {
      return 'patient';
    }

    if (normalizedRole === 'manager' || normalizedRole === 'admin') {
      return 'manager';
    }

    return 'guest';
  }
}