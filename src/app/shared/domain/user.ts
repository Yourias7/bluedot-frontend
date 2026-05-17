import { BaseModel } from './base-model';

export interface User extends BaseModel {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    token?: string; // Optional: Store the JWT token here after login
}

export enum UserRole {
    Admin = 'Admin',
    Doctor = 'Doctor',
    Patient = 'Patient'
}
