// doctor model used across the app
// comprehends with returned Dto from backend
import { User } from './user';
import { Specialty } from './specialty';

export interface Doctor extends User {
    bio: string;
    clinicAddress: string;
    phoneNumber: string;
    yearsOfExperience: number;
    specialty?: Specialty;
    specialties?: Specialty[];
    latitude?: number;
    longitude?: number;
    averageRating?: number;
    reviewCount?: number;
}