import { Injectable, inject, Type } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
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
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
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

export type AccountMeDto = {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailAddress?: string;
  phoneNumber?: string;
  dateOfBirth?: string | null;
  gender?: string;
  role?: string;
  clinicAddress?: string;
  yearsOfExperience?: number;
  bio?: string;
  specialty?: { id: number; name: string };
  specialties?: { id: number; name: string }[];
};

export type UpdateAccountMeDto = Partial<AccountMeDto> & {
  password?: string;
};

@Injectable({
  providedIn: 'root',
})

export class AuthenticationServices {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private currentUserRoleSubject = new BehaviorSubject<UserRole>(this.getRoleFromStorage());
  public currentUserRole$ = this.currentUserRoleSubject.asObservable();

  private currentUserNameSubject = new BehaviorSubject<string>(this.getNameFromStorage());
  public currentUserName$ = this.currentUserNameSubject.asObservable();

  constructor(private router: Router) { }

  login(model: LoginDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/account/login`, model).pipe(
      tap((response: LoginResponseDto) => {
        if (!response || !response.token) {
          this.setLoggedInUser(response);
        }

        localStorage.setItem('token', response.token);

        const role = this.normalizeRole(response.role);
        localStorage.setItem('role', role);

        const displayName = response.emailAddress;
        localStorage.setItem('userName', displayName);

        this.currentUserRoleSubject.next(role);
        this.currentUserNameSubject.next(displayName);
      })
    );
  }

  registerPatient(model: RegisterPatientDto): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/account/register/patient`, model);
  }

  registerDoctor(model: RegisterDoctorDto): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/account/register/doctor`, model);
  }

  getMe(): Observable<AccountMeDto> {
    return this.http.get<AccountMeDto>(`${this.baseUrl}/account/me`);
  }

  updateMe(model: UpdateAccountMeDto): Observable<AccountMeDto> {
    return this.http.patch<AccountMeDto>(`${this.baseUrl}/account/me`, model);
  }

  deleteMe(): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/account/me`).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('role');
        localStorage.removeItem('userName');

        // Broadcast that nobody is logged in anymore
        this.currentUserRoleSubject.next('guest');
        this.currentUserNameSubject.next('');
      })
    );
  }

  public getCurrentUserRole(): UserRole {
    return this.currentUserRoleSubject.value;
  }

  private getRoleFromStorage(): UserRole {
    // A previous version of login() stored the whole user dto under 'currentUser'.
    // The current login() stores the role under its own 'role' key, so we read
    // from there first and fall back to 'currentUser' for backwards compatibility.
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      return this.normalizeRole(storedRole);
    }

    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson) as LoginResponseDto;
      return this.normalizeRole(user.role);
    }
    return 'guest';
  }

  private getNameFromStorage(): string {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      return storedName;
    }

    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson) as LoginResponseDto;
      return user.emailAddress; // Matches what we set in setLoggedInUser
    }
    return '';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  public setLoggedInUser(userDto: any): void {
    localStorage.setItem('token', userDto.token);
    localStorage.setItem('currentUser', JSON.stringify(userDto));

    // Broadcast the new state to anyone listening (like the Header!)
    this.currentUserRoleSubject.next(userDto.role);
    this.currentUserNameSubject.next(`${userDto.firstName} ${userDto.lastName}`);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');

    // Broadcast that nobody is logged in anymore
    this.currentUserRoleSubject.next('guest');
    this.currentUserNameSubject.next('');

    // Navigate to the landing page
    this.router.navigate(['/landing-page']);
  }

  private getStoredRole(): UserRole {
    const storedRole = localStorage.getItem('role');

    return this.normalizeRole(storedRole);
  }

  private normalizeRole(role: string | null | undefined): UserRole {
    if (!role) return 'guest';

    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'doctor') return 'doctor';
    if (normalizedRole === 'patient') return 'patient';
    if (normalizedRole === 'manager' || normalizedRole === 'admin') return 'manager';

    return 'guest';
  }
}