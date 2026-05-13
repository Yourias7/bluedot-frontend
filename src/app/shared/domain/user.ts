import { BaseModel } from './base-model';

export interface User extends BaseModel {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
}

export enum UserRole {
    Admin = 'Admin',
    Doctor = 'Doctor',
    Patient = 'Patient'
}
